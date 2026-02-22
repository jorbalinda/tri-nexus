'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GearItem } from '@/lib/types/database'
import { generateGearList } from '@/lib/gear/generator'
import type { TargetRace } from '@/lib/types/target-race'

export function useGearItems(raceId: string, race?: TargetRace | null) {
  const [items, setItems] = useState<GearItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabaseRef.current
      .from('gear_items')
      .select('*')
      .eq('race_id', raceId)
      .order('category')
      .order('item_name')

    const gearItems = (data as GearItem[]) || []
    setItems(gearItems)
    setLoading(false)
    return gearItems
  }, [raceId])

  useEffect(() => {
    if (raceId) fetch()
  }, [raceId, fetch])

  const generateDefaults = useCallback(async () => {
    if (!race) return

    // Delete existing non-custom items
    await supabaseRef.current
      .from('gear_items')
      .delete()
      .eq('race_id', raceId)
      .eq('is_custom', false)

    const defaults = generateGearList({
      race_type: race.race_type || 'triathlon',
      race_distance: race.race_distance,
      water_type: race.water_type,
      wetsuit: race.wetsuit,
      expected_temp_f: race.expected_temp_f,
    })

    const rows = defaults.map((d) => ({
      race_id: raceId,
      item_name: d.item_name,
      category: d.category,
      is_required: d.is_required,
      is_packed: false,
      is_custom: false,
    }))

    const { data } = await supabaseRef.current
      .from('gear_items')
      .insert(rows)
      .select()

    await fetch()
    return data
  }, [raceId, race, fetch])

  const togglePacked = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return

    const { error } = await supabaseRef.current
      .from('gear_items')
      .update({ is_packed: !item.is_packed })
      .eq('id', id)

    if (!error) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_packed: !i.is_packed } : i)))
    }
  }, [items])

  const addCustomItem = useCallback(async (itemName: string, category: GearItem['category']) => {
    const { data, error } = await supabaseRef.current
      .from('gear_items')
      .insert({
        race_id: raceId,
        item_name: itemName,
        category,
        is_required: false,
        is_packed: false,
        is_custom: true,
      })
      .select()
      .single()

    if (!error && data) {
      setItems((prev) => [...prev, data as GearItem])
    }
  }, [raceId])

  const removeItem = useCallback(async (id: string) => {
    const { error } = await supabaseRef.current
      .from('gear_items')
      .delete()
      .eq('id', id)

    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== id))
    }
  }, [])

  const packedCount = items.filter((i) => i.is_packed).length
  const totalCount = items.length
  const requiredUnpacked = items.filter((i) => i.is_required && !i.is_packed).length

  return {
    items,
    loading,
    packedCount,
    totalCount,
    requiredUnpacked,
    togglePacked,
    addCustomItem,
    removeItem,
    generateDefaults,
    refetch: fetch,
  }
}
