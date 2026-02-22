/**
 * Transform Garmin activity data into Workout records.
 * Deduplication via external_id.
 */

import { createClient } from '@supabase/supabase-js'

interface GarminActivity {
  activityId: number
  activityType: string
  startTimeLocal: string
  durationInSeconds: number
  distanceInMeters: number
  averageHeartRateInBeatsPerMinute?: number
  maxHeartRateInBeatsPerMinute?: number
  averagePowerInWatts?: number
  normalizedPowerInWatts?: number
  averageRunCadenceInStepsPerMinute?: number
  averageBikeCadenceInRoundsPerMinute?: number
  averagePaceInMinutesPerKilometer?: number
  elevationGainInMeters?: number
  calories?: number
  activeTrainingStressScore?: number
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

    await supabase.from('workouts').insert({
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
    })

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
