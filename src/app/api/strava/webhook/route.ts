import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getActivity, mapStravaActivity, mapStravaLaps, refreshAccessToken } from '@/lib/strava/client'

/**
 * GET — Strava webhook subscription verification challenge.
 * Strava sends hub.mode, hub.verify_token, hub.challenge.
 * We echo back hub.challenge if the verify token matches.
 */
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.json({ 'hub.challenge': challenge })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

/**
 * POST — Strava activity event.
 * Payload is minimal: { object_type, object_id, aspect_type, owner_id, ... }
 * We fetch the full activity and upsert into workouts + workout_laps.
 */
export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    // Only handle activity creates — ignore updates, deletes, and non-activity events
    if (event.object_type !== 'activity' || event.aspect_type !== 'create') {
      return NextResponse.json({ status: 'ignored' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Look up user by Strava athlete ID (stored as external_user_id)
    const { data: connection } = await supabase
      .from('device_connections')
      .select('user_id, access_token, refresh_token, token_expires_at')
      .eq('provider', 'strava')
      .eq('external_user_id', event.owner_id.toString())
      .maybeSingle()

    if (!connection) {
      return NextResponse.json({ status: 'ok' })
    }

    // Refresh access token if expired
    let accessToken = connection.access_token
    if (new Date(connection.token_expires_at) <= new Date()) {
      const refreshed = await refreshAccessToken(connection.refresh_token)
      accessToken = refreshed.access_token
      await supabase
        .from('device_connections')
        .update({
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          token_expires_at: new Date(refreshed.expires_at * 1000).toISOString(),
        })
        .eq('user_id', connection.user_id)
        .eq('provider', 'strava')
    }

    // Fetch full activity detail (includes laps, pool_length, suffer_score)
    const activity = await getActivity(accessToken, event.object_id)
    if (!activity) {
      return NextResponse.json({ status: 'ok' })
    }

    // Map to our schema
    const mapped = mapStravaActivity(activity)
    if (!mapped) {
      return NextResponse.json({ status: 'ok' })
    }

    // Deduplicate
    const { data: existing } = await supabase
      .from('workouts')
      .select('id')
      .eq('external_id', mapped.external_id)
      .eq('user_id', connection.user_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ status: 'ok' })
    }

    // Insert workout
    const { data: workout, error } = await supabase
      .from('workouts')
      .insert({
        user_id: connection.user_id,
        sport: mapped.sport,
        title: mapped.title,
        date: mapped.date,
        duration_seconds: mapped.duration_seconds,
        moving_time_seconds: mapped.moving_time_seconds,
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
      })
      .select()
      .single()

    if (error) {
      console.error('Strava webhook workout insert error:', error)
      return NextResponse.json({ status: 'ok' })
    }

    // Insert laps if present
    if (workout && activity.laps && activity.laps.length > 0) {
      const lapRows = mapStravaLaps(workout.id, activity.laps, activity.start_date)
      await supabase.from('workout_laps').insert(lapRows)
    }

    // Update last sync time
    await supabase
      .from('device_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', connection.user_id)
      .eq('provider', 'strava')

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Strava webhook error:', error)
    // Always return 200 to Strava — non-200 causes retries
    return NextResponse.json({ status: 'ok' })
  }
}
