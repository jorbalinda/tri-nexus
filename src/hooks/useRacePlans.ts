'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RacePlan } from '@/lib/types/race-plan'

export function useRacePlans() {
  const [plans, setPlans] = useState<RacePlan[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('race_plans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    setPlans((data as RacePlan[]) || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetch()
  }, [fetch])

  const create = useCallback(
    async (plan: Omit<RacePlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('race_plans')
        .insert({ ...plan, user_id: user?.id })
        .select()
        .single()

      if (error) throw error
      setPlans((prev) => [(data as RacePlan), ...prev])
      return data as RacePlan
    },
    [supabase]
  )

  const update = useCallback(
    async (id: string, updates: Partial<RacePlan>) => {
      const { data, error } = await supabase
        .from('race_plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setPlans((prev) => prev.map((p) => (p.id === id ? (data as RacePlan) : p)))
      return data as RacePlan
    },
    [supabase]
  )

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('race_plans').delete().eq('id', id)
      if (error) throw error
      setPlans((prev) => prev.filter((p) => p.id !== id))
    },
    [supabase]
  )

  return { plans, loading, refetch: fetch, create, update, remove }
}
