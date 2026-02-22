/**
 * Weather API client using Visual Crossing.
 * Fetches 7-day forecast for race location.
 */

import type { RaceConditions } from '@/lib/types/race-plan'

interface WeatherForecast {
  temp_low_f: number
  temp_high_f: number
  humidity_pct: number
  wind_speed_mph: number
  description: string
}

/**
 * Fetch weather forecast for a location on a specific date.
 * Uses Visual Crossing Weather API.
 */
export async function fetchRaceWeather(
  location: string,
  raceDate: string
): Promise<WeatherForecast | null> {
  const apiKey = process.env.WEATHER_API_KEY
  if (!apiKey || !location) return null

  try {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}/${raceDate}?unitGroup=us&key=${apiKey}&include=days`

    const response = await fetch(url, { next: { revalidate: 3600 } })
    if (!response.ok) return null

    const data = await response.json()
    const day = data.days?.[0]
    if (!day) return null

    return {
      temp_low_f: day.tempmin,
      temp_high_f: day.tempmax,
      humidity_pct: day.humidity,
      wind_speed_mph: day.windspeed,
      description: day.conditions || '',
    }
  } catch {
    return null
  }
}

/**
 * Map weather forecast to RaceConditions format.
 */
export function weatherToConditions(
  weather: WeatherForecast,
  existingConditions?: Partial<RaceConditions>
): RaceConditions {
  const windCondition = weather.wind_speed_mph < 5
    ? 'calm' as const
    : weather.wind_speed_mph < 12
    ? 'light' as const
    : weather.wind_speed_mph < 20
    ? 'moderate' as const
    : 'strong' as const

  return {
    temp_low_f: weather.temp_low_f,
    temp_high_f: weather.temp_high_f,
    humidity_pct: weather.humidity_pct,
    altitude_ft: existingConditions?.altitude_ft ?? null,
    course_profile: existingConditions?.course_profile ?? 'rolling',
    water_temp_f: existingConditions?.water_temp_f ?? null,
    water_type: existingConditions?.water_type ?? 'ocean',
    wetsuit_legal: existingConditions?.wetsuit_legal ?? null,
    wind: windCondition,
    course_type: existingConditions?.course_type ?? 'loop',
  }
}
