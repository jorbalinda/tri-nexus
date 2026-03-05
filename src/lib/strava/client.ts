/**
 * Strava API Client
 * Uses OAuth 2.0 (authorization code flow) for authentication.
 */

const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'
const STRAVA_ACTIVITIES_URL = 'https://www.strava.com/api/v3/athlete/activities'

export interface StravaTokenResponse {
  access_token: string
  refresh_token: string
  expires_at: number
  athlete: {
    id: number
    firstname: string
    lastname: string
    username: string
  }
}

export interface StravaLap {
  lap_index: number
  elapsed_time: number
  moving_time: number
  distance: number
  average_heartrate?: number
  max_heartrate?: number
  average_watts?: number
  average_cadence?: number
  average_speed?: number
  total_elevation_gain?: number
  start_date: string
}

export interface StravaActivity {
  id: number
  name: string
  type: string
  sport_type: string
  start_date: string
  start_date_local: string
  elapsed_time: number
  moving_time: number
  distance: number
  average_heartrate?: number
  max_heartrate?: number
  average_watts?: number
  weighted_average_watts?: number
  max_watts?: number
  kilojoules?: number
  average_cadence?: number
  average_speed?: number
  max_speed?: number
  total_elevation_gain?: number
  calories?: number
  suffer_score?: number
  trainer: boolean
  // Detail-only fields (not present on list endpoint)
  pool_length?: number
  laps?: StravaLap[]
}

/**
 * Exchange an authorization code for access + refresh tokens.
 */
export async function exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Strava token exchange failed: ${text}`)
  }

  return response.json()
}

/**
 * Refresh an expired access token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<StravaTokenResponse> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Strava token refresh failed: ${text}`)
  }

  return response.json()
}

/**
 * Fetch a single detailed activity by ID (includes laps, pool_length).
 */
export async function getActivity(
  accessToken: string,
  activityId: number
): Promise<StravaActivity | null> {
  const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) return null
  return response.json()
}

/**
 * Fetch activities from Strava after a given Unix timestamp, paginated.
 */
export async function getActivities(
  accessToken: string,
  afterTimestamp: number
): Promise<StravaActivity[]> {
  const all: StravaActivity[] = []
  let page = 1

  while (true) {
    const url = `${STRAVA_ACTIVITIES_URL}?after=${afterTimestamp}&per_page=100&page=${page}`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) break

    const batch: StravaActivity[] = await response.json()
    if (!Array.isArray(batch) || batch.length === 0) break

    all.push(...batch)
    if (batch.length < 100) break
    page++
  }

  return all
}

/**
 * Map a Strava activity to our internal workout shape.
 */
export function mapStravaActivity(activity: StravaActivity): {
  sport: 'swim' | 'bike' | 'run' | null
  title: string
  date: string
  duration_seconds: number
  moving_time_seconds: number
  distance_meters: number
  avg_hr: number | null
  max_hr: number | null
  avg_power_watts: number | null
  normalized_power: number | null
  max_power_watts: number | null
  avg_cadence_rpm: number | null
  avg_speed_mps: number | null
  max_speed_mps: number | null
  elevation_gain_meters: number | null
  calories: number | null
  suffer_score: number | null
  pool_length_meters: number | null
  is_indoor: boolean
  external_id: string
  external_url: string
  source: 'strava'
  started_at: string
} | null {
  const sport = mapSport(activity.type || activity.sport_type)
  if (!sport) return null

  const date = activity.start_date_local.split('T')[0]

  return {
    sport,
    title: activity.name || `${sport.charAt(0).toUpperCase() + sport.slice(1)} Workout`,
    date,
    duration_seconds: activity.elapsed_time,
    moving_time_seconds: activity.moving_time,
    distance_meters: Math.round(activity.distance),
    avg_hr: activity.average_heartrate ? Math.round(activity.average_heartrate) : null,
    max_hr: activity.max_heartrate ? Math.round(activity.max_heartrate) : null,
    avg_power_watts: activity.average_watts ? Math.round(activity.average_watts) : null,
    normalized_power: activity.weighted_average_watts
      ? Math.round(activity.weighted_average_watts)
      : null,
    max_power_watts: activity.max_watts ? Math.round(activity.max_watts) : null,
    avg_cadence_rpm: activity.average_cadence ? Math.round(activity.average_cadence) : null,
    avg_speed_mps: activity.average_speed ?? null,
    max_speed_mps: activity.max_speed ?? null,
    elevation_gain_meters: activity.total_elevation_gain ?? null,
    calories: activity.calories ? Math.round(activity.calories) : null,
    suffer_score: activity.suffer_score ?? null,
    pool_length_meters: activity.pool_length ?? null,
    is_indoor: activity.trainer ?? false,
    external_id: activity.id.toString(),
    external_url: `https://www.strava.com/activities/${activity.id}`,
    source: 'strava',
    started_at: activity.start_date,
  }
}

/**
 * Map Strava laps to our workout_laps shape.
 */
export function mapStravaLaps(
  workoutId: string,
  laps: StravaLap[],
  activityStartDate: string
): object[] {
  const startMs = new Date(activityStartDate).getTime()

  return laps.map((lap) => ({
    workout_id: workoutId,
    lap_number: lap.lap_index + 1,
    start_offset_seconds: Math.round((new Date(lap.start_date).getTime() - startMs) / 1000),
    duration_seconds: lap.elapsed_time,
    distance_meters: Math.round(lap.distance),
    avg_hr: lap.average_heartrate ? Math.round(lap.average_heartrate) : null,
    max_hr: lap.max_heartrate ? Math.round(lap.max_heartrate) : null,
    avg_power_watts: lap.average_watts ? Math.round(lap.average_watts) : null,
    avg_pace_sec_per_km:
      lap.average_speed && lap.average_speed > 0
        ? Math.round(1000 / lap.average_speed)
        : null,
    avg_cadence: lap.average_cadence ? Math.round(lap.average_cadence) : null,
    elevation_gain_meters: lap.total_elevation_gain ?? null,
  }))
}

function mapSport(type: string): 'swim' | 'bike' | 'run' | null {
  const t = type.toLowerCase()
  if (t.includes('swim') || t.includes('pool') || t.includes('openwater')) return 'swim'
  if (
    t.includes('ride') ||
    t.includes('cycling') ||
    t.includes('bike') ||
    t.includes('velomobile') ||
    t.includes('handcycle')
  )
    return 'bike'
  if (
    t.includes('run') ||
    t.includes('trail') ||
    t.includes('jog') ||
    t.includes('treadmill') ||
    t.includes('hike') ||
    t.includes('walk')
  )
    return 'run'
  return null
}
