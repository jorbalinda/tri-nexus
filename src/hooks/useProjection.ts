'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RaceProjection } from '@/lib/types/projection'
import type { TargetRace } from '@/lib/types/target-race'
import { isProjectionStale, isRevealEligible } from '@/lib/analytics/projection-scheduler'
import { generateProjection } from '@/lib/analytics/projection-engine'
import type { Workout, ManualLog } from '@/lib/types/database'

export function useProjection(raceId: string) {
  const [projection, setProjection] = useState<RaceProjection | null>(null)
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const supabase = createClient()

  const fetchLatestProjection = useCallback(async () => {
    const { data } = await supabase
      .from('projections')
      .select('*')
      .eq('target_race_id', raceId)
      .order('projected_at', { ascending: false })
      .limit(1)
      .single()

    return (data as RaceProjection) || null
  }, [raceId, supabase])

  const recalculate = useCallback(async (race: TargetRace) => {
    setRecalculating(true)

    // Fetch workouts and logs
    const [{ data: workouts }, { data: logs }] = await Promise.all([
      supabase.from('workouts').select('*').order('date'),
      supabase.from('manual_logs').select('*'),
    ])

    const projectionData = generateProjection(
      race,
      (workouts as Workout[]) || [],
      (logs as ManualLog[]) || []
    )

    // Check if it should be revealed
    const revealed = isRevealEligible(race.race_date)

    const { data, error } = await supabase
      .from('projections')
      .insert({
        ...projectionData,
        is_revealed: revealed,
      })
      .select()
      .single()

    if (!error && data) {
      setProjection(data as RaceProjection)
    }

    setRecalculating(false)
    return data as RaceProjection | null
  }, [supabase])

  useEffect(() => {
    async function init() {
      setLoading(true)

      // Get latest projection
      const latest = await fetchLatestProjection()
      setProjection(latest)

      // Get the race to check staleness
      const { data: race } = await supabase
        .from('target_races')
        .select('*')
        .eq('id', raceId)
        .single()

      if (race && isProjectionStale(latest, race.race_date)) {
        await recalculate(race as TargetRace)
      }

      setLoading(false)
    }

    if (raceId) init()
  }, [raceId, fetchLatestProjection, recalculate, supabase])

  const daysUntilReveal = (() => {
    if (!projection) return null
    // Calculate from race
    return null // Will be set from race data externally
  })()

  return {
    projection,
    loading,
    recalculating,
    isRevealed: projection?.is_revealed ?? false,
    recalculate,
  }
}
