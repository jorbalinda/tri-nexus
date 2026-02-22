'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NutritionPlan, FuelingTimelineEntry } from '@/lib/types/database'

export function useNutritionPlan(raceId: string) {
  const [plans, setPlans] = useState<NutritionPlan[]>([])
  const [timeline, setTimeline] = useState<FuelingTimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data: planData } = await supabaseRef.current
      .from('nutrition_plans')
      .select('*')
      .eq('race_id', raceId)

    const nutritionPlans = (planData as NutritionPlan[]) || []
    setPlans(nutritionPlans)

    if (nutritionPlans.length > 0) {
      const planIds = nutritionPlans.map((p) => p.id)
      const { data: timelineData } = await supabaseRef.current
        .from('fueling_timeline')
        .select('*')
        .in('nutrition_plan_id', planIds)
        .order('time_offset_minutes')

      setTimeline((timelineData as FuelingTimelineEntry[]) || [])
    }

    setLoading(false)
  }, [raceId])

  useEffect(() => {
    if (raceId) fetch()
  }, [raceId, fetch])

  const savePlan = useCallback(
    async (segment: 'bike' | 'run', data: Partial<Omit<NutritionPlan, 'id' | 'race_id' | 'segment' | 'created_at'>>) => {
      const existing = plans.find((p) => p.segment === segment)

      if (existing) {
        const { data: updated, error } = await supabaseRef.current
          .from('nutrition_plans')
          .update(data)
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        setPlans((prev) => prev.map((p) => (p.id === existing.id ? (updated as NutritionPlan) : p)))
        return updated as NutritionPlan
      } else {
        const { data: created, error } = await supabaseRef.current
          .from('nutrition_plans')
          .insert({ ...data, race_id: raceId, segment })
          .select()
          .single()

        if (error) throw error
        setPlans((prev) => [...prev, created as NutritionPlan])
        return created as NutritionPlan
      }
    },
    [raceId, plans]
  )

  const addTimelineEntry = useCallback(
    async (nutritionPlanId: string, entry: { time_offset_minutes: number; instruction: string }) => {
      const { data, error } = await supabaseRef.current
        .from('fueling_timeline')
        .insert({ ...entry, nutrition_plan_id: nutritionPlanId })
        .select()
        .single()

      if (error) throw error
      setTimeline((prev) => [...prev, data as FuelingTimelineEntry].sort((a, b) => a.time_offset_minutes - b.time_offset_minutes))
      return data as FuelingTimelineEntry
    },
    []
  )

  const removeTimelineEntry = useCallback(
    async (id: string) => {
      const { error } = await supabaseRef.current
        .from('fueling_timeline')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTimeline((prev) => prev.filter((e) => e.id !== id))
    },
    []
  )

  return { plans, timeline, loading, savePlan, addTimelineEntry, removeTimelineEntry, refetch: fetch }
}
