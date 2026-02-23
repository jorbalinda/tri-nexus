import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchRaceWeather } from '@/lib/weather/client'

export async function GET(request: NextRequest) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find races within the next 15 days that have a linked course
  const today = new Date().toISOString().split('T')[0]
  const fifteenDaysOut = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const { data: races, error: racesError } = await supabase
    .from('target_races')
    .select('id, race_date, race_course_id, race_courses(location_city, location_country)')
    .gte('race_date', today)
    .lte('race_date', fifteenDaysOut)
    .not('race_course_id', 'is', null)

  if (racesError) {
    return NextResponse.json({ error: racesError.message }, { status: 500 })
  }

  if (!races || races.length === 0) {
    return NextResponse.json({ message: 'No races within 7 days', updated: 0 })
  }

  let updated = 0

  for (const race of races) {
    const course = race.race_courses as unknown as {
      location_city: string
      location_country: string
    } | null

    if (!course) continue

    const location = `${course.location_city}, ${course.location_country}`
    const weather = await fetchRaceWeather(location, race.race_date)

    if (!weather) continue

    const { error: upsertError } = await supabase
      .from('race_weather')
      .upsert(
        {
          target_race_id: race.id,
          temp_low_f: Math.round(weather.temp_low_f),
          temp_high_f: Math.round(weather.temp_high_f),
          humidity_pct: Math.round(weather.humidity_pct),
          wind_speed_mph: weather.wind_speed_mph,
          wind_direction_deg: weather.wind_direction_deg,
          description: weather.description,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: 'target_race_id' }
      )

    if (!upsertError) updated++
  }

  return NextResponse.json({ message: `Weather updated for ${updated} races`, updated })
}
