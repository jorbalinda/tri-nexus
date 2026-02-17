'use client'

import { useMemo } from 'react'
import { useWorkouts } from './useWorkouts'
import { useManualLogs } from './useManualLogs'
import { calculateReadiness, readinessLabel } from '@/lib/analytics/readiness'
import { detectCNSFatigue } from '@/lib/analytics/cns-fatigue'

export function useReadiness() {
  const { workouts, loading: workoutsLoading } = useWorkouts()
  const { logs: physioLogs, loading: physioLoading } = useManualLogs('physiological')
  const { logs: envLogs, loading: envLoading } = useManualLogs('environmental')

  const loading = workoutsLoading || physioLoading || envLoading

  const result = useMemo(() => {
    if (loading) return null

    const allLogs = [...physioLogs, ...envLogs]
    const readiness = calculateReadiness(workouts, allLogs)
    const cns = detectCNSFatigue(workouts)

    return {
      score: readiness.score,
      breakdown: readiness.breakdown,
      label: readinessLabel(readiness.score),
      cns,
    }
  }, [loading, workouts, physioLogs, envLogs])

  return {
    loading,
    score: result?.score ?? null,
    breakdown: result?.breakdown ?? null,
    label: result?.label ?? null,
    cns: result?.cns ?? null,
  }
}
