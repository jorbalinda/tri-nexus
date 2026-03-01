'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RaceProjection } from '@/lib/types/projection'
import type { TargetRace } from '@/lib/types/target-race'
import { isProjectionStale, isRevealEligible } from '@/lib/analytics/projection-scheduler'
import { generateProjection } from '@/lib/analytics/projection-engine'
import { evaluateSufficiencyFromWorkouts, type SufficiencyResult } from '@/lib/analytics/data-sufficiency'
import type { Workout, ManualLog, SessionMetric } from '@/lib/types/database'

export interface TierTransition {
  from: number
  to: number
  direction: 'up' | 'down'
}

function getTierStorageKey(raceId: string): string {
  return `sufficiency-tier-${raceId}`
}

function getTierDismissKey(raceId: string, from: number, to: number): string {
  return `tier-transition-dismissed-${raceId}-${from}-${to}`
}

export function useProjection(raceId: string) {
  const [projection, setProjection] = useState<RaceProjection | null>(null)
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [sufficiency, setSufficiency] = useState<SufficiencyResult | null>(null)
  const [tierTransition, setTierTransition] = useState<TierTransition | null>(null)
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

    // Fetch workouts, logs, and profile LTHR
    const [{ data: workouts }, { data: logs }, { data: profileData }] = await Promise.all([
      supabase.from('workouts').select('*').is('deleted_at', null).order('date'),
      supabase.from('manual_logs').select('*'),
      supabase.from('profiles').select('lthr_swim, lthr_bike, lthr_run').single(),
    ])

    const typedWorkouts = (workouts as Workout[]) || []
    const typedLogs = (logs as ManualLog[]) || []

    // Build profile LTHR
    const profileLTHR = {
      swim: (profileData as Record<string, number | null> | null)?.lthr_swim ?? null,
      bike: (profileData as Record<string, number | null> | null)?.lthr_bike ?? null,
      run: (profileData as Record<string, number | null> | null)?.lthr_run ?? null,
    }

    // Fetch session metrics for recent long workouts (last 8 weeks)
    const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 86_400_000).toISOString().split('T')[0]
    const longWorkoutIds = typedWorkouts
      .filter((w) =>
        (w.sport === 'swim' || w.sport === 'bike' || w.sport === 'run') &&
        (w.duration_seconds || 0) >= 1800 &&
        w.date >= eightWeeksAgo
      )
      .map((w) => w.id)

    const sessionMetrics = new Map<string, SessionMetric[]>()
    if (longWorkoutIds.length > 0) {
      const { data: metrics } = await supabase
        .from('session_metrics')
        .select('*')
        .in('workout_id', longWorkoutIds)
        .order('timestamp_offset_seconds')

      if (metrics) {
        for (const m of metrics as SessionMetric[]) {
          const existing = sessionMetrics.get(m.workout_id) || []
          existing.push(m)
          sessionMetrics.set(m.workout_id, existing)
        }
      }
    }

    // Evaluate sufficiency from the same data
    const suff = evaluateSufficiencyFromWorkouts(typedWorkouts, typedLogs, race)

    // Detect tier transition
    const previousTierStr = typeof window !== 'undefined'
      ? localStorage.getItem(getTierStorageKey(raceId))
      : null
    const previousTier = previousTierStr != null ? Number(previousTierStr) : null
    suff.previousTier = previousTier

    if (previousTier != null && previousTier !== suff.tier) {
      const direction = suff.tier > previousTier ? 'up' : 'down'
      const dismissKey = getTierDismissKey(raceId, previousTier, suff.tier)
      const dismissed = typeof window !== 'undefined'
        ? localStorage.getItem(dismissKey)
        : null

      if (!dismissed) {
        setTierTransition({ from: previousTier, to: suff.tier, direction })
      }
    }

    // Save current tier
    if (typeof window !== 'undefined') {
      localStorage.setItem(getTierStorageKey(raceId), String(suff.tier))
    }

    setSufficiency(suff)

    // Generate projection with tier-appropriate band profile + HR data
    const projectionData = generateProjection(
      race,
      typedWorkouts,
      typedLogs,
      suff.bandProfile ?? undefined,
      sessionMetrics,
      profileLTHR
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
  }, [raceId, supabase])

  const dismissTierTransition = useCallback(() => {
    if (tierTransition && typeof window !== 'undefined') {
      const dismissKey = getTierDismissKey(
        raceId,
        tierTransition.from,
        tierTransition.to
      )
      localStorage.setItem(dismissKey, 'true')
    }
    setTierTransition(null)
  }, [raceId, tierTransition])

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
      } else if (race) {
        // Even if projection isn't stale, evaluate sufficiency for display
        const [{ data: workouts }, { data: logs }] = await Promise.all([
          supabase.from('workouts').select('*').is('deleted_at', null).order('date'),
          supabase.from('manual_logs').select('*'),
        ])

        const typedWorkouts = (workouts as Workout[]) || []
        const typedLogs = (logs as ManualLog[]) || []
        const suff = evaluateSufficiencyFromWorkouts(typedWorkouts, typedLogs, race as TargetRace)

        // Load previous tier and detect transitions
        const previousTierStr = typeof window !== 'undefined'
          ? localStorage.getItem(getTierStorageKey(raceId))
          : null
        const previousTier = previousTierStr != null ? Number(previousTierStr) : null
        suff.previousTier = previousTier

        if (previousTier != null && previousTier !== suff.tier) {
          const direction = suff.tier > previousTier ? 'up' : 'down'
          const dismissKey = getTierDismissKey(raceId, previousTier, suff.tier)
          const dismissed = typeof window !== 'undefined'
            ? localStorage.getItem(dismissKey)
            : null

          if (!dismissed) {
            setTierTransition({ from: previousTier, to: suff.tier, direction })
          }
        }

        // Save current tier
        if (typeof window !== 'undefined') {
          localStorage.setItem(getTierStorageKey(raceId), String(suff.tier))
        }

        setSufficiency(suff)
      }

      setLoading(false)
    }

    if (raceId) init()
  }, [raceId, fetchLatestProjection, recalculate, supabase])

  return {
    projection,
    loading,
    recalculating,
    isRevealed: projection?.is_revealed ?? false,
    recalculate,
    sufficiency,
    tierTransition,
    dismissTierTransition,
  }
}
