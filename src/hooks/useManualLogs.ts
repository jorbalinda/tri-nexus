'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ManualLog } from '@/lib/types/database'

export function useManualLogs(category?: string) {
  const [logs, setLogs] = useState<ManualLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('manual_logs')
      .select('*')
      .order('date', { ascending: false })
      .limit(200)

    if (category) {
      query = query.eq('category', category)
    }

    const { data } = await query
    setLogs((data as ManualLog[]) || [])
    setLoading(false)
  }, [supabase, category])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { logs, loading, refetch: fetch }
}
