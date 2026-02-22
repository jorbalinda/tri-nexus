'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { EquipmentProfile } from '@/lib/types/database'

export function useEquipmentProfile(raceId: string) {
  const [profile, setProfile] = useState<EquipmentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabaseRef.current
      .from('equipment_profiles')
      .select('*')
      .eq('race_id', raceId)
      .maybeSingle()

    setProfile(data as EquipmentProfile | null)
    setLoading(false)
  }, [raceId])

  useEffect(() => {
    if (raceId) fetch()
  }, [raceId, fetch])

  const save = useCallback(
    async (updates: Partial<Omit<EquipmentProfile, 'id' | 'race_id' | 'created_at'>>) => {
      if (profile) {
        const { data, error } = await supabaseRef.current
          .from('equipment_profiles')
          .update(updates)
          .eq('id', profile.id)
          .select()
          .single()

        if (error) throw error
        setProfile(data as EquipmentProfile)
        return data as EquipmentProfile
      } else {
        const { data, error } = await supabaseRef.current
          .from('equipment_profiles')
          .insert({ ...updates, race_id: raceId })
          .select()
          .single()

        if (error) throw error
        setProfile(data as EquipmentProfile)
        return data as EquipmentProfile
      }
    },
    [raceId, profile]
  )

  return { profile, loading, save, refetch: fetch }
}
