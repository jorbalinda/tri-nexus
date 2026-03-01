/**
 * Transform Garmin activity data into Workout records.
 * Deduplication via external_id.
 */

import { createClient } from '@supabase/supabase-js'

interface GarminActivity {
  activityId: number
  activityType: string
  startTimeLocal: string
  startTimeGMT?: string
  durationInSeconds: number
  movingDurationInSeconds?: number
  distanceInMeters: number
  averageHeartRateInBeatsPerMinute?: number
  maxHeartRateInBeatsPerMinute?: number
  averagePowerInWatts?: number
  normalizedPowerInWatts?: number
  maxPowerInWatts?: number
  averageRunCadenceInStepsPerMinute?: number
  averageBikeCadenceInRoundsPerMinute?: number
  maxCadenceInRoundsPerMinute?: number
  averagePaceInMinutesPerKilometer?: number
  averageSpeedInMetersPerSecond?: number
  maxSpeedInMetersPerSecond?: number
  elevationGainInMeters?: number
  elevationLossInMeters?: number
  calories?: number
  activeTrainingStressScore?: number
  heartRateZones?: { zoneNumber: number; secsInZone: number; zoneLowBoundary: number; zoneHighBoundary?: number }[]
  laps?: { startTimeLocal: string; duration: number; distance: number; averageHR?: number; maxHR?: number; averagePower?: number; averageRunCadence?: number; averageBikeCadence?: number; elevationGain?: number; averageSpeed?: number }[]
}

function mapSport(activityType: string): 'swim' | 'bike' | 'run' | null {
  const type = activityType.toLowerCase()
  if (type.includes('swim') || type.includes('pool') || type.includes('open_water')) return 'swim'
  if (type.includes('cycling') || type.includes('bike') || type.includes('virtual_ride')) return 'bike'
  if (type.includes('running') || type.includes('trail') || type.includes('treadmill')) return 'run'
  return null
}

function garminConnectUrl(activityId: number): string {
  return `https://connect.garmin.com/modern/activity/${activityId}`
}

export async function syncGarminActivities(
  userId: string,
  activities: GarminActivity[]
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const results: { synced: number; skipped: number } = { synced: 0, skipped: 0 }

  for (const activity of activities) {
    const sport = mapSport(activity.activityType)
    if (!sport) {
      results.skipped++
      continue
    }

    // Check for existing (dedup)
    const { data: existing } = await supabase
      .from('workouts')
      .select('id')
      .eq('external_id', activity.activityId.toString())
      .eq('user_id', userId)
      .single()

    if (existing) {
      results.skipped++
      continue
    }

    const date = activity.startTimeLocal.split('T')[0]

    const { data: workout } = await supabase.from('workouts').insert({
      user_id: userId,
      sport,
      title: activity.activityType.replace(/_/g, ' '),
      date,
      duration_seconds: activity.durationInSeconds,
      distance_meters: Math.round(activity.distanceInMeters),
      avg_hr: activity.averageHeartRateInBeatsPerMinute || null,
      max_hr: activity.maxHeartRateInBeatsPerMinute || null,
      avg_power_watts: activity.averagePowerInWatts || null,
      normalized_power: activity.normalizedPowerInWatts || null,
      avg_cadence_rpm: activity.averageBikeCadenceInRoundsPerMinute || null,
      avg_cadence_spm: activity.averageRunCadenceInStepsPerMinute || null,
      avg_pace_sec_per_km: activity.averagePaceInMinutesPerKilometer
        ? Math.round(activity.averagePaceInMinutesPerKilometer * 60)
        : null,
      elevation_gain_meters: activity.elevationGainInMeters || null,
      calories: activity.calories || null,
      tss: activity.activeTrainingStressScore || null,
      source: 'garmin',
      external_id: activity.activityId.toString(),
      external_url: garminConnectUrl(activity.activityId),
      // New fields
      started_at: activity.startTimeGMT || activity.startTimeLocal,
      moving_time_seconds: activity.movingDurationInSeconds || null,
      max_power_watts: activity.maxPowerInWatts || null,
      avg_speed_mps: activity.averageSpeedInMetersPerSecond || null,
      max_speed_mps: activity.maxSpeedInMetersPerSecond || null,
      max_cadence: activity.maxCadenceInRoundsPerMinute || null,
      total_descent_meters: activity.elevationLossInMeters || null,
    }).select().single()

    // Insert HR zones if available
    if (workout && activity.heartRateZones && activity.heartRateZones.length > 0) {
      const totalSecs = activity.heartRateZones.reduce((s, z) => s + z.secsInZone, 0)
      const hrZones = activity.heartRateZones.slice(0, 5).map((z) => ({
        workout_id: workout.id,
        zone_number: z.zoneNumber,
        min_hr: z.zoneLowBoundary,
        max_hr: z.zoneHighBoundary || z.zoneLowBoundary + 20,
        time_in_zone_seconds: z.secsInZone,
        percent_of_total: totalSecs > 0 ? Number(((z.secsInZone / totalSecs) * 100).toFixed(1)) : 0,
      }))
      await supabase.from('workout_hr_zones').insert(hrZones)
    }

    // Insert laps if available
    if (workout && activity.laps && activity.laps.length > 0) {
      const lapStartTime = new Date(activity.laps[0].startTimeLocal).getTime()
      const lapRows = activity.laps.map((l, i) => ({
        workout_id: workout.id,
        lap_number: i + 1,
        start_offset_seconds: Math.round((new Date(l.startTimeLocal).getTime() - lapStartTime) / 1000),
        duration_seconds: Math.round(l.duration),
        distance_meters: Math.round(l.distance),
        avg_hr: l.averageHR || null,
        max_hr: l.maxHR || null,
        avg_power_watts: l.averagePower || null,
        avg_pace_sec_per_km: l.averageSpeed && l.averageSpeed > 0 ? Math.round(1000 / l.averageSpeed) : null,
        avg_cadence: l.averageRunCadence || l.averageBikeCadence || null,
        elevation_gain_meters: l.elevationGain || null,
      }))
      await supabase.from('workout_laps').insert(lapRows)
    }

    results.synced++
  }

  // Update last sync time
  await supabase
    .from('device_connections')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('provider', 'garmin')

  return results
}

/**
 * Sync sleep data from Garmin into manual_logs.
 */
export async function syncGarminSleep(
  userId: string,
  sleepData: { calendarDate: string; sleepTimeInSeconds?: number; deepSleepInSeconds?: number }
) {
  if (!sleepData.sleepTimeInSeconds) return

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const sleepHours = Number((sleepData.sleepTimeInSeconds / 3600).toFixed(1))

  // Check for existing
  const { data: existing } = await supabase
    .from('manual_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('date', sleepData.calendarDate)
    .eq('log_type', 'sleep_hours')
    .single()

  if (existing) return

  await supabase.from('manual_logs').insert({
    user_id: userId,
    date: sleepData.calendarDate,
    category: 'physiological',
    log_type: 'sleep_hours',
    value: sleepHours,
    unit: 'hours',
  })
}
