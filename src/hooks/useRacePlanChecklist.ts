'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RacePlanChecklist } from '@/lib/types/race-plan'

export function useRacePlanChecklist(racePlanId: string | null) {
  const [items, setItems] = useState<RacePlanChecklist[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!racePlanId) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('race_plan_checklist')
      .select('*')
      .eq('race_plan_id', racePlanId)
      .order('created_at', { ascending: true })

    setItems((data as RacePlanChecklist[]) || [])
    setLoading(false)
  }, [supabase, racePlanId])

  useEffect(() => {
    fetch()
  }, [fetch])

  const initializeChecklist = useCallback(
    async (planId: string, checklistItems: { name: string; category: string }[]) => {
      const rows = checklistItems.map((item) => ({
        race_plan_id: planId,
        item_name: item.name,
        category: item.category,
        is_checked: false,
      }))

      const { data, error } = await supabase
        .from('race_plan_checklist')
        .insert(rows)
        .select()

      if (error) throw error
      setItems((data as RacePlanChecklist[]) || [])
    },
    [supabase]
  )

  const toggle = useCallback(
    async (itemId: string, checked: boolean) => {
      const { error } = await supabase
        .from('race_plan_checklist')
        .update({ is_checked: checked })
        .eq('id', itemId)

      if (error) throw error
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, is_checked: checked } : i))
      )
    },
    [supabase]
  )

  return { items, loading, refetch: fetch, initializeChecklist, toggle }
}
