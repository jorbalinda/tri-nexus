'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SessionMetric } from '@/lib/types/database'

export function useSessionMetrics(workoutId: string | null) {
  const [metrics, setMetrics] = useState<SessionMetric[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!workoutId) return
    setLoading(true)
    const { data } = await supabase
      .from('session_metrics')
      .select('*')
      .eq('workout_id', workoutId)
      .order('timestamp_offset_seconds', { ascending: true })

    setMetrics((data as SessionMetric[]) || [])
    setLoading(false)
  }, [supabase, workoutId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { metrics, loading }
}
