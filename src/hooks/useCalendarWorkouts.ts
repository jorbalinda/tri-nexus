'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Workout } from '@/lib/types/database'

export function useCalendarWorkouts(startDate: string, endDate: string) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')

    setWorkouts((data as Workout[]) || [])
    setLoading(false)
  }, [supabase, startDate, endDate])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { workouts, loading, refetch: fetch }
}
