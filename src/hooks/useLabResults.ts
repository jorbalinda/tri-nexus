'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LabResultWithMarkers } from '@/lib/types/database'

export function useLabResults(testId?: string) {
  const [results, setResults] = useState<LabResultWithMarkers[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('lab_results')
      .select('*, lab_result_markers(*)')
      .order('date', { ascending: false })
      .limit(50)

    if (testId) {
      query = query.eq('test_id', testId)
    }

    const { data } = await query
    setResults((data as LabResultWithMarkers[]) || [])
    setLoading(false)
  }, [supabase, testId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { results, loading, refetch: fetch }
}
