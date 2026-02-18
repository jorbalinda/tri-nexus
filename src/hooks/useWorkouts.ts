'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Workout } from '@/lib/types/database'

export function useWorkouts(sport?: string) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const fetchWorkouts = useCallback(async () => {
    setLoading(true)
    let query = supabaseRef.current
      .from('workouts')
      .select('*')
      .order('date', { ascending: false })
      .limit(100)

    if (sport) {
      query = query.eq('sport', sport)
    }

    const { data } = await query
    setWorkouts((data as Workout[]) || [])
    setLoading(false)
  }, [sport])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  // Refetch when window regains focus (e.g. after uploading workouts)
  useEffect(() => {
    const handleFocus = () => fetchWorkouts()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchWorkouts])

  return { workouts, loading, refetch: fetchWorkouts }
}
