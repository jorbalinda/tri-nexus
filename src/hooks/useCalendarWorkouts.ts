'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Workout } from '@/lib/types/database'

export function useCalendarWorkouts(startDate: string, endDate: string) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const fetchWorkouts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabaseRef.current
      .from('workouts')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')

    setWorkouts((data as Workout[]) || [])
    setLoading(false)
  }, [startDate, endDate])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  // Refetch when window regains focus (e.g. after saving on log page)
  useEffect(() => {
    const handleFocus = () => fetchWorkouts()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchWorkouts])

  return { workouts, loading, refetch: fetchWorkouts }
}
