'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Workout } from '@/lib/types/database'

export function useWorkouts(sport?: string) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase
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
  }, [supabase, sport])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { workouts, loading, refetch: fetch }
}
