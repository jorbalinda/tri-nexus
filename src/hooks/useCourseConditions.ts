'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RaceCourse, RaceWeather } from '@/lib/types/race-plan'

interface CourseConditionsResult {
  course: RaceCourse | null
  weather: RaceWeather | null
  loading: boolean
}

export function useCourseConditions(
  raceCourseId: string | null,
  raceId: string,
  initialCourse?: RaceCourse | null,
  initialWeather?: RaceWeather | null,
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
      // Still trigger on-demand weather fetch if weather wasn't in DB.
      if (!initialWeather) {
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
