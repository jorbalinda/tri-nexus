/**
 * Backfill 90 days of historical Strava activities on first connection.
 */

import { createClient } from '@supabase/supabase-js'
import { getActivities, mapStravaActivity } from './client'

export async function backfillStravaActivities(userId: string, accessToken: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const after = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000)
  const activities = await getActivities(accessToken, after)

  if (!Array.isArray(activities) || activities.length === 0) {
    return { synced: 0, skipped: 0 }
  }

  const results = { synced: 0, skipped: 0 }

  for (const activity of activities) {
    const mapped = mapStravaActivity(activity)
    if (!mapped) {
      results.skipped++
      continue
    }

    // Deduplicate on external_id
    const { data: existing } = await supabase
      .from('workouts')
      .select('id')
      .eq('external_id', mapped.external_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      results.skipped++
      continue
    }

    const { error } = await supabase.from('workouts').insert({
      user_id: userId,
      sport: mapped.sport,
      title: mapped.title,
      date: mapped.date,
      duration_seconds: mapped.duration_seconds,
      distance_meters: mapped.distance_meters,
      avg_hr: mapped.avg_hr,
      max_hr: mapped.max_hr,
      avg_power_watts: mapped.avg_power_watts,
      normalized_power: mapped.normalized_power,
      max_power_watts: mapped.max_power_watts,
      avg_cadence_rpm: mapped.avg_cadence_rpm,
      avg_speed_mps: mapped.avg_speed_mps,
      max_speed_mps: mapped.max_speed_mps,
      elevation_gain_meters: mapped.elevation_gain_meters,
      calories: mapped.calories,
      suffer_score: mapped.suffer_score,
      pool_length_meters: mapped.pool_length_meters,
      is_indoor: mapped.is_indoor,
      source: 'strava',
      external_id: mapped.external_id,
      external_url: mapped.external_url,
      started_at: mapped.started_at,
      moving_time_seconds: mapped.moving_time_seconds,
    })

    if (!error) {
      results.synced++
    } else {
      console.error('Strava backfill insert error:', error)
    }
  }

  // Update last sync time
  await supabase
    .from('device_connections')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('provider', 'strava')

  return results
}
