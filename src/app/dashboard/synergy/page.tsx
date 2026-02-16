'use client'

import { useMemo, useEffect, useState } from 'react'
import { useWorkouts } from '@/hooks/useWorkouts'
import { createClient } from '@/lib/supabase/client'
import type { SessionMetric } from '@/lib/types/database'
import { calculateTSB } from '@/lib/analytics/training-stress'
import { efTrend } from '@/lib/analytics/efficiency-factor'
import { decouplingLabel } from '@/lib/analytics/aerobic-decoupling'
import { buildSynergyData } from '@/lib/telemetry/synergy-config'
import SynergyChart from '@/components/dashboard/SynergyChart'
import ManualContextCard from '@/components/dashboard/ManualContextCard'
import StatCard from '@/components/ui/StatCard'

function tsbSublabel(tsb: number): string {
  if (tsb >= 25) return 'Very fresh — risk of detraining'
  if (tsb >= 10) return 'Fresh — ready to race'
  if (tsb >= 0) return 'Fresh — ready to train'
  if (tsb >= -10) return 'Moderate fatigue'
  return 'High fatigue — recovery needed'
}

export default function SynergyPage() {
  const { workouts, loading: workoutsLoading } = useWorkouts()
  const [sessionMetricsMap, setSessionMetricsMap] = useState<Map<string, SessionMetric[]>>(new Map())
  const [metricsLoading, setMetricsLoading] = useState(true)

  // Bulk-fetch session_metrics for all workout IDs
  useEffect(() => {
    if (workoutsLoading || workouts.length === 0) {
      setMetricsLoading(false)
      return
    }

    const supabase = createClient()
    const ids = workouts.map((w) => w.id)

    async function fetchMetrics() {
      setMetricsLoading(true)
      const { data } = await supabase
        .from('session_metrics')
        .select('*')
        .in('workout_id', ids)
        .order('timestamp_offset_seconds', { ascending: true })

      const map = new Map<string, SessionMetric[]>()
      if (data) {
        for (const row of data as SessionMetric[]) {
          const existing = map.get(row.workout_id) || []
          existing.push(row)
          map.set(row.workout_id, existing)
        }
      }
      setSessionMetricsMap(map)
      setMetricsLoading(false)
    }

    fetchMetrics()
  }, [workouts, workoutsLoading])

  const loading = workoutsLoading || metricsLoading

  // Build chart data
  const synergyData = useMemo(
    () => buildSynergyData(workouts, sessionMetricsMap),
    [workouts, sessionMetricsMap],
  )

  // Compute stat values from real data
  const tsb = useMemo(() => calculateTSB(workouts), [workouts])

  const latestDecoupling = useMemo(() => {
    for (let i = synergyData.length - 1; i >= 0; i--) {
      if (synergyData[i].decoupling !== null) return synergyData[i].decoupling
    }
    return null
  }, [synergyData])

  const latestSwimEF = useMemo(() => {
    for (let i = synergyData.length - 1; i >= 0; i--) {
      if (synergyData[i].swim_ef !== null) return synergyData[i].swim_ef
    }
    return null
  }, [synergyData])

  const latestBikeEF = useMemo(() => {
    for (let i = synergyData.length - 1; i >= 0; i--) {
      if (synergyData[i].bike_ef !== null) return synergyData[i].bike_ef
    }
    return null
  }, [synergyData])

  const latestRunEF = useMemo(() => {
    for (let i = synergyData.length - 1; i >= 0; i--) {
      if (synergyData[i].run_ef !== null) return synergyData[i].run_ef
    }
    return null
  }, [synergyData])

  // EF trends per sport
  const swimWorkouts = useMemo(() => workouts.filter((w) => w.sport === 'swim'), [workouts])
  const bikeWorkouts = useMemo(() => workouts.filter((w) => w.sport === 'bike'), [workouts])
  const runWorkouts = useMemo(() => workouts.filter((w) => w.sport === 'run'), [workouts])

  const swimTrend = useMemo(() => efTrend(swimWorkouts), [swimWorkouts])
  const bikeTrend = useMemo(() => efTrend(bikeWorkouts), [bikeWorkouts])
  const runTrend = useMemo(() => efTrend(runWorkouts), [runWorkouts])

  const trendSublabel = (trend: number | null) => {
    if (trend === null) return 'Not enough data'
    return `${trend > 0 ? '+' : ''}${trend}% trend`
  }

  const trendDirection = (trend: number | null): 'up' | 'down' | 'neutral' => {
    if (trend === null) return 'neutral'
    if (trend > 0) return 'up'
    if (trend < 0) return 'down'
    return 'neutral'
  }

  return (
    <div className="flex flex-col gap-6">
      <SynergyChart data={synergyData} loading={loading} />

      <div className="grid grid-cols-3 gap-6">
        <ManualContextCard />
        <StatCard
          label="Training Stress Balance"
          value={loading ? '—' : tsb}
          unit="TSB"
          sublabel={loading ? undefined : tsbSublabel(tsb)}
          trend={tsb >= 0 ? 'up' : 'down'}
        />
        <StatCard
          label="Aerobic Decoupling"
          value={loading || latestDecoupling === null ? '—' : latestDecoupling.toFixed(1)}
          unit="%"
          sublabel={latestDecoupling !== null ? decouplingLabel(latestDecoupling) : undefined}
          trend={latestDecoupling !== null ? (latestDecoupling < 5 ? 'up' : latestDecoupling < 10 ? 'neutral' : 'down') : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <StatCard
          label="Swim EF"
          value={loading || latestSwimEF === null ? '—' : latestSwimEF.toFixed(2)}
          sublabel={trendSublabel(swimTrend)}
          trend={trendDirection(swimTrend)}
        />
        <StatCard
          label="Bike EF"
          value={loading || latestBikeEF === null ? '—' : latestBikeEF.toFixed(2)}
          sublabel={trendSublabel(bikeTrend)}
          trend={trendDirection(bikeTrend)}
        />
        <StatCard
          label="Run EF"
          value={loading || latestRunEF === null ? '—' : latestRunEF.toFixed(2)}
          sublabel={trendSublabel(runTrend)}
          trend={trendDirection(runTrend)}
        />
      </div>
    </div>
  )
}
