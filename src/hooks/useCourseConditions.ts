'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RaceCourse, RaceWeather } from '@/lib/types/race-plan'

interface CourseConditionsResult {
  course: RaceCourse | null
  weather: RaceWeather | null
  loading: boolean
}

/** Returns the stale threshold in ms based on how many days until the race. */
function weatherStaleMs(raceDate: string): number | null {
  const daysOut = Math.ceil((new Date(raceDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysOut > 15) return null          // forecast window — don't bother
  if (daysOut > 7)  return 12 * 3600_000 // 12 hours
  if (daysOut > 3)  return  6 * 3600_000 // 6 hours
  return                     3 * 3600_000 // 3 hours within 3 days
}

export function useCourseConditions(
  raceCourseId: string | null,
  raceId: string,
  initialCourse?: RaceCourse | null,
  initialWeather?: RaceWeather | null,
  raceDate?: string,
): CourseConditionsResult {
  const [course, setCourse] = useState<RaceCourse | null>(initialCourse ?? null)
  const [weather, setWeather] = useState<RaceWeather | null>(initialWeather ?? null)
  const [loading, setLoading] = useState(initialCourse === undefined)
  const supabase = createClient()
  const hasInitialData = useRef(initialCourse !== undefined)

  useEffect(() => {
    if (!raceId) {
      setLoading(false)
      return
    }

    if (hasInitialData.current) {
      hasInitialData.current = false
      // SSR provided course data — skip DB fetch.
      // Trigger on-demand weather refresh if: no weather exists, or data is stale
      // relative to how close the race is.
      const staleMs = raceDate ? weatherStaleMs(raceDate) : null
      const isStale = initialWeather && staleMs !== null
        ? Date.now() - new Date(initialWeather.fetched_at).getTime() > staleMs
        : false

      if (!initialWeather || isStale) {
        fetch(`/api/weather/${raceId}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => { if (data && !data.error) setWeather(data as RaceWeather) })
          .catch(() => {})
      }
      return
    }

    async function fetchData() {
      setLoading(true)

      const [courseResult, weatherResult] = await Promise.all([
        raceCourseId
          ? supabase.from('race_courses').select('*').eq('id', raceCourseId).single()
          : Promise.resolve({ data: null }),
        supabase.from('race_weather').select('*').eq('target_race_id', raceId).single(),
      ])

      setCourse((courseResult.data as RaceCourse) ?? null)

      if (weatherResult.data) {
        setWeather((weatherResult.data as RaceWeather) ?? null)
        setLoading(false)
      } else {
        setLoading(false)
        // No weather in DB — trigger on-demand fetch
        try {
          const res = await fetch(`/api/weather/${raceId}`)
          if (res.ok) {
            const data = await res.json()
            if (data && !data.error) {
              setWeather(data as RaceWeather)
            }
          }
        } catch {
          // Silently fail — weather is optional
        }
      }
    }

    fetchData()
  }, [raceCourseId, raceId, supabase, initialWeather])

  return { course, weather, loading }
}
