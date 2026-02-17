import type { Workout } from '@/lib/types/database'
import type { ManualLog } from '@/lib/types/database'

/**
 * Lactate Threshold Estimator (Beta)
 *
 * Uses the Karvonen / Heart Rate Reserve method to estimate LT1 and LT2:
 * - HRR = maxHR - restingHR
 * - LT1 ≈ restingHR + 0.75 × HRR (aerobic threshold, ~2 mmol/L)
 * - LT2 ≈ restingHR + 0.85 × HRR (anaerobic threshold, ~4 mmol/L)
 */

export interface HRZone {
  zone: number
  name: string
  minHR: number
  maxHR: number
  color: string
  description: string
}

export interface LTEstimate {
  lt1: number
  lt2: number
  zones: HRZone[]
}

export function estimateLT(maxHR: number, restingHR: number): LTEstimate {
  const hrr = maxHR - restingHR

  const lt1 = Math.round(restingHR + 0.75 * hrr)
  const lt2 = Math.round(restingHR + 0.85 * hrr)

  const z1Ceil = Math.round(restingHR + 0.60 * hrr)
  const z4Ceil = Math.round(restingHR + 0.92 * hrr)

  const zones: HRZone[] = [
    {
      zone: 1,
      name: 'Recovery',
      minHR: restingHR,
      maxHR: z1Ceil,
      color: '#22c55e',
      description: 'Easy effort, active recovery',
    },
    {
      zone: 2,
      name: 'Aerobic Base',
      minHR: z1Ceil + 1,
      maxHR: lt1,
      color: '#3b82f6',
      description: 'Endurance building, fat oxidation',
    },
    {
      zone: 3,
      name: 'Tempo',
      minHR: lt1 + 1,
      maxHR: lt2,
      color: '#f59e0b',
      description: 'Between thresholds, moderate intensity',
    },
    {
      zone: 4,
      name: 'Threshold',
      minHR: lt2 + 1,
      maxHR: z4Ceil,
      color: '#f97316',
      description: 'Above LT2, sustained hard effort',
    },
    {
      zone: 5,
      name: 'VO2max',
      minHR: z4Ceil + 1,
      maxHR: maxHR,
      color: '#ef4444',
      description: 'Max effort, short intervals',
    },
  ]

  return { lt1, lt2, zones }
}

/**
 * Derive max HR from workout history — highest observed max_hr
 */
export function deriveMaxHR(workouts: Workout[]): number | null {
  const maxHRs = workouts
    .map((w) => w.max_hr)
    .filter((hr): hr is number => hr !== null && hr > 0)

  if (maxHRs.length === 0) return null
  return Math.max(...maxHRs)
}

/**
 * Derive resting HR from manual logs — most recent resting_hr entry
 */
export function deriveRestingHR(logs: ManualLog[]): number | null {
  const restingLogs = logs
    .filter((l) => l.log_type === 'resting_hr')
    .sort((a, b) => b.date.localeCompare(a.date))

  if (restingLogs.length === 0) return null
  return restingLogs[0].value
}

/**
 * Estimate max HR by age using the classic formula
 */
export function estimateMaxHRByAge(age: number): number {
  return 220 - age
}

/**
 * Validate HR inputs — returns error message or null if valid
 */
export function validateInputs(maxHR: number, restingHR: number): string | null {
  if (!maxHR || !restingHR) return 'Both max HR and resting HR are required'
  if (maxHR < 100 || maxHR > 250) return 'Max HR should be between 100 and 250 bpm'
  if (restingHR < 25 || restingHR > 120) return 'Resting HR should be between 25 and 120 bpm'
  if (restingHR >= maxHR) return 'Resting HR must be lower than max HR'
  if (maxHR - restingHR < 20) return 'Heart rate reserve too small — check your values'
  return null
}
