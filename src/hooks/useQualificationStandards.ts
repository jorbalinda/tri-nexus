'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { QualificationStandard } from '@/lib/types/race-plan'

export function useQualificationStandards() {
  const [standards, setStandards] = useState<QualificationStandard[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('qualification_standards')
      .select('*')
      .order('championship', { ascending: true })

    setStandards((data as QualificationStandard[]) || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { standards, loading, refetch: fetch }
}
