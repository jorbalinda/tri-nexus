/*
=== RUN PACE ===
basePace = recency-weighted average (half-life 21d) of runs ≥20min, RPE≥4
racePace = basePace × fatigue[distance] × noBrickPenalty(+4%) × env
env: heat(+4.5%/5°F>75), altitude(+3%/1000ft>3000), hilly(+5%)
band: widen to ±7–10% if pace CV > 0.15
*/

import type { Workout } from '@/lib/types/database'
import type { RaceDistance } from '@/lib/types/race-plan'

export interface SplitProjection {
  realistic: number
  optimistic: number
  conservative: number
}

export interface RunProjectionResult extends SplitProjection {
  targetPaceSecPerKm: number
  paceCV: number
}

interface RunConditions {
  tempHighF?: number | null
  altitudeFt?: number | null
  courseProfile?: 'flat' | 'rolling' | 'hilly' | 'mountainous' | null
}

const FATIGUE_MULTIPLIER: Record<string, number> = {
  super_sprint: 0.96,
  sprint: 0.97,
  wt_sprint: 0.97,
  olympic: 1.02,
  wt_standard: 1.02,
  '70.3': 1.10,
  '140.6': 1.22,
  custom: 1.10,
}

const DEFAULT_RUN_PACE = 330 // 5:30/km age grouper default

export function projectRunSplit(
  recentRuns: Workout[],
  raceDistance: RaceDistance,
  runDistanceKm: number,
  conditions: RunConditions | null,
  hasBrickWorkout: boolean
): RunProjectionResult {
  // Filter qualifying runs: ≥20 min, RPE ≥ 4 (exclude recovery jogs)
  // Prefer moving_time_seconds (excludes stops) over duration_seconds for more accurate pacing
  const qualifyingRuns = recentRuns
    .filter(
      (r) =>
        r.avg_pace_sec_per_km != null &&
        ((r.moving_time_seconds || r.duration_seconds || 0) >= 1200) &&
        (r.rpe == null || r.rpe >= 4)
    )
    .slice(0, 8)

  if (qualifyingRuns.length === 0) {
    // Can't project — use default
    const defaultTime = Math.round(DEFAULT_RUN_PACE * (FATIGUE_MULTIPLIER[raceDistance] ?? 1.10) * runDistanceKm)
    return {
      targetPaceSecPerKm: DEFAULT_RUN_PACE,
      paceCV: 0,
      realistic: defaultTime,
      optimistic: Math.round(defaultTime * 0.93),
      conservative: Math.round(defaultTime * 1.10),
    }
  }

  // Recency-weighted average (exponential decay, half-life = 21 days)
  const now = Date.now()
  let weightedPaceSum = 0
  let weightSum = 0

  for (const run of qualifyingRuns) {
    const ageInDays = (now - new Date(run.date).getTime()) / 86400000
    const weight = Math.pow(0.5, ageInDays / 21)
    weightedPaceSum += run.avg_pace_sec_per_km! * weight
    weightSum += weight
  }

  let basePace = weightedPaceSum / weightSum

  // Pace consistency check
  const paces = qualifyingRuns.map((r) => r.avg_pace_sec_per_km!)
  const meanPace = paces.reduce((a, b) => a + b, 0) / paces.length
  const variance = paces.reduce((sum, p) => sum + (p - meanPace) ** 2, 0) / paces.length
  const cv = Math.sqrt(variance) / meanPace

  // Distance fatigue multiplier
  let racePace = basePace * (FATIGUE_MULTIPLIER[raceDistance] ?? 1.10)

  // Brick penalty: +4% if no brick workout and long-course
  if (raceDistance === '70.3' || raceDistance === '140.6') {
    if (!hasBrickWorkout) {
      racePace *= 1.04
    }
  }

  // Environmental adjustments
  let envMultiplier = 1.0

  if (conditions?.tempHighF != null && conditions.tempHighF > 75) {
    // Heat affects running MORE than cycling: +4.5% per 5°F above 75°F
    envMultiplier += 0.045 * Math.floor((conditions.tempHighF - 75) / 5)
  }

  if (conditions?.altitudeFt != null && conditions.altitudeFt > 3000) {
    // Altitude affects running MORE than cycling: +3% per 1000 ft above 3000 ft
    envMultiplier += 0.03 * Math.floor((conditions.altitudeFt - 3000) / 1000)
  }

  if (conditions?.courseProfile === 'hilly') {
    envMultiplier += 0.05
  } else if (conditions?.courseProfile === 'mountainous') {
    envMultiplier += 0.10
  }

  racePace *= envMultiplier

  const realisticSeconds = Math.round(racePace * runDistanceKm)

  // Widen band if pace variance is high
  const bandWidth = cv > 0.15 ? { opt: 0.93, cons: 1.10 } : { opt: 0.96, cons: 1.06 }

  return {
    targetPaceSecPerKm: Math.round(racePace),
    paceCV: Number(cv.toFixed(3)),
    realistic: realisticSeconds,
    optimistic: Math.round(realisticSeconds * bandWidth.opt),
    conservative: Math.round(realisticSeconds * bandWidth.cons),
  }
}

/**
 * Detect brick workouts: any day in the last 8 weeks where
 * the athlete has both a bike and run workout.
 */
export function detectBrickWorkouts(workouts: Workout[]): boolean {
  const eightWeeksMs = 8 * 7 * 86400000
  const cutoff = Date.now() - eightWeeksMs
  const recent = workouts.filter((w) => new Date(w.date).getTime() >= cutoff)

  const dayMap = new Map<string, Set<string>>()
  for (const w of recent) {
    const sports = dayMap.get(w.date) || new Set()
    sports.add(w.sport)
    dayMap.set(w.date, sports)
  }

  return Array.from(dayMap.values()).some(
    (sports) => sports.has('bike') && sports.has('run')
  )
}
