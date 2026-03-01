import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateRequest } from '@/lib/api/utils'
import { fetchRaceWeather } from '@/lib/weather/client'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ raceId: string }> }
) {
  try {
    const { raceId } = await params

    // Require authenticated user
    const { user, supabase, error: authError } = await authenticateRequest()
    if (authError) return authError

    // Verify the race belongs to the authenticated user before doing anything
    const { data: race, error: raceError } = await supabase
      .from('target_races')
      .select('id, race_date, race_course_id, race_courses(location_city, location_country)')
      .eq('id', raceId)
      .eq('user_id', user!.id)
      .single()

    if (raceError || !race) {
      return NextResponse.json({ error: 'Race not found' }, { status: 404 })
    }

    // Check if fresh weather exists (< 1 hour old)
    const { data: existing } = await adminSupabase
      .from('race_weather')
      .select('*')
      .eq('target_race_id', raceId)
      .single()

    if (existing) {
      const age = Date.now() - new Date(existing.fetched_at).getTime()
      if (age < 60 * 60 * 1000) {
        return NextResponse.json(existing)
      }
    }

    if (!race.race_course_id) {
      return NextResponse.json({ error: 'No linked course' }, { status: 404 })
    }

    const course = race.race_courses as unknown as {
      location_city: string
      location_country: string
    }

    // Check if race is within 15-day forecast window
    const daysOut = Math.ceil(
      (new Date(race.race_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    if (daysOut > 15) {
      return NextResponse.json({ error: 'Race is more than 15 days out' }, { status: 422 })
    }

    const location = `${course.location_city}, ${course.location_country}`
    const weather = await fetchRaceWeather(location, race.race_date)

    if (!weather) {
      return NextResponse.json({ error: 'Weather fetch failed' }, { status: 502 })
    }

    const row = {
      target_race_id: raceId,
      temp_low_f: Math.round(weather.temp_low_f),
      temp_high_f: Math.round(weather.temp_high_f),
      humidity_pct: Math.round(weather.humidity_pct),
      wind_speed_mph: weather.wind_speed_mph,
      wind_direction_deg: weather.wind_direction_deg,
      description: weather.description,
      fetched_at: new Date().toISOString(),
    }

    const { data, error } = await adminSupabase
      .from('race_weather')
      .upsert(row, { onConflict: 'target_race_id' })
      .select()
      .single()

    if (error) {
      console.error('Weather upsert error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Weather route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
