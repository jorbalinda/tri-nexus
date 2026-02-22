'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TargetRace } from '@/lib/types/target-race'

export function useTargetRaces() {
  const [races, setRaces] = useState<TargetRace[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('target_races')
      .select('*')
      .order('race_date', { ascending: true })
      .limit(50)

    setRaces((data as TargetRace[]) || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetch()
  }, [fetch])

  const create = useCallback(
    async (race: Omit<TargetRace, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('target_races')
        .insert({ ...race, user_id: user?.id })
        .select()
        .single()

      if (error) throw error
      setRaces((prev) => [...prev, data as TargetRace].sort((a, b) => a.race_date.localeCompare(b.race_date)))
      return data as TargetRace
    },
    [supabase]
  )

  const update = useCallback(
    async (id: string, updates: Partial<TargetRace>) => {
      const { data, error } = await supabase
        .from('target_races')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setRaces((prev) => prev.map((r) => (r.id === id ? (data as TargetRace) : r)))
      return data as TargetRace
    },
    [supabase]
  )

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('target_races').delete().eq('id', id)
      if (error) throw error
      setRaces((prev) => prev.filter((r) => r.id !== id))
    },
    [supabase]
  )

  return { races, loading, refetch: fetch, create, update, remove }
}
