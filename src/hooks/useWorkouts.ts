'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Workout } from '@/lib/types/database'

export function useWorkouts(sport?: string, initialData?: Workout[]) {
  const [workouts, setWorkouts] = useState<Workout[]>(initialData ?? [])
  const [loading, setLoading] = useState(initialData === undefined)
  const supabaseRef = useRef(createClient())
  const hasInitialData = useRef(initialData !== undefined)

  const fetchWorkouts = useCallback(async () => {
    setLoading(true)
    let query = supabaseRef.current
      .from('workouts')
      .select('*')
      .is('deleted_at', null)
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
    if (hasInitialData.current) {
      // Skip the initial fetch — use SSR data. Reset so sport changes still trigger refetch.
      hasInitialData.current = false
      return
    }
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
