/*
=== CONFIDENCE SCORE V2 (0–100) ===
Four data-quality dimensions, each scaled 0–25:
Volume & Recency (0–25):    min(20, workouts_12wk × 0.7 + workouts_14d × 1.0) × 1.25
Discipline Balance (0–25):  [4/discipline (≥10 workouts) + 8 × (1 - imbalance × 1.5)] × 1.25
Threshold Quality (0–25):   [FTP(0–8) + CSS(0–7) + RunPace(0–5)] × 1.25 w/ recency decay
Data Completeness (0–25):   [Sum of binary checks for HR, weight, power, brick, conditions] × 1.25

Training Load (CTL/ATL/TSB) intentionally excluded — athlete readiness is displayed
separately via RaceReadinessCard and does not affect data-quality confidence.
*/

import type { Workout, ManualLog } from '@/lib/types/database'
import type { TargetRace } from '@/lib/types/target-race'

export interface ConfidenceBreakdown {
  volume: number
  discipline: number
  thresholds: number
  completeness: number
}

export type ConfidenceTier = 'Low' | 'Fair' | 'Moderate' | 'Good' | 'Excellent'

export interface ConfidenceResult {
  total: number
  breakdown: ConfidenceBreakdown
  tier: ConfidenceTier
  tierColor: string
}

function daysAgo(dateStr: string): number {
  return (Date.now() - new Date(dateStr).getTime()) / 86400000
}

function weeksAgo(dateStr: string): number {
  return daysAgo(dateStr) / 7
}

// ---------------------------------------------------------------------------
// 2.1 Data Volume & Recency (0–20)
// ---------------------------------------------------------------------------
function scoreVolume(workouts: Workout[]): number {
  const qualifyingWorkouts = workouts.filter(
    (w) => daysAgo(w.date) <= 84 && (w.duration_seconds || 0) >= 1200
  ).length
  const volumePoints = Math.min(14, qualifyingWorkouts * 0.7)

  const recentWorkouts = workouts.filter(
    (w) => daysAgo(w.date) <= 14 && (w.duration_seconds || 0) >= 1200
  ).length
  const recencyBonus = Math.min(6, recentWorkouts * 1.0)

  return Math.min(20, Math.round(volumePoints + recencyBonus))
}

// ---------------------------------------------------------------------------
// 2.2 Discipline Coverage & Balance (0–20)
// ---------------------------------------------------------------------------
function scoreDiscipline(workouts: Workout[]): number {
  const recent8wk = workouts.filter((w) => weeksAgo(w.date) <= 8)

  const swimCount = recent8wk.filter((w) => w.sport === 'swim').length
  const bikeCount = recent8wk.filter((w) => w.sport === 'bike').length
  const runCount = recent8wk.filter((w) => w.sport === 'run').length
  const total = recent8wk.length

  // Presence: 4 pts per discipline with ≥10 workouts
  let presenceScore = 0
  if (swimCount >= 10) presenceScore += 4
  if (bikeCount >= 10) presenceScore += 4
  if (runCount >= 10) presenceScore += 4

  // Balance: 0-8 pts
  let balanceScore = 0
  if (total > 0) {
    const idealShare = 1 / 3
    const swimShare = swimCount / total
    const bikeShare = bikeCount / total
    const runShare = runCount / total
    const imbalance =
      Math.abs(swimShare - idealShare) +
      Math.abs(bikeShare - idealShare) +
      Math.abs(runShare - idealShare)
    balanceScore = Math.round(8 * Math.max(0, 1 - imbalance * 1.5))
  }

  return Math.min(20, presenceScore + balanceScore)
}

// ---------------------------------------------------------------------------
// 2.3 Threshold Data Quality (0–20)
// ---------------------------------------------------------------------------
function scoreThresholds(workouts: Workout[]): number {
  // FTP sub-score (0-8)
  let ftpScore = 0
  const bikeWithNP = workouts
    .filter((w) => w.sport === 'bike' && w.normalized_power && (w.duration_seconds || 0) >= 1200)
    .sort((a, b) => b.date.localeCompare(a.date))

  if (bikeWithNP.length > 0) {
    ftpScore = 5 // base
    const ageWeeks = weeksAgo(bikeWithNP[0].date)
    if (ageWeeks <= 6) ftpScore += 3 // recency bonus
    if (ageWeeks > 12) ftpScore -= 2 // recency penalty
    ftpScore = Math.max(0, Math.min(8, ftpScore))
  }

  // CSS sub-score (0-7)
  let cssScore = 0
  const swims = workouts
    .filter(
      (w) => w.sport === 'swim' && w.distance_meters && w.duration_seconds && (w.duration_seconds || 0) >= 600
    )
    .sort((a, b) => b.date.localeCompare(a.date))

  if (swims.length > 0) {
    cssScore = 4 // base
    const ageWeeks = weeksAgo(swims[0].date)
    if (ageWeeks <= 6) cssScore += 3
    if (ageWeeks > 12) cssScore -= 2
    cssScore = Math.max(0, Math.min(7, cssScore))
  }

  // Run pace sub-score (0-5)
  let runScore = 0
  const qualifyingRuns = workouts.filter(
    (w) =>
      w.sport === 'run' &&
      w.avg_pace_sec_per_km &&
      (w.duration_seconds || 0) >= 1200 &&
      weeksAgo(w.date) <= 8
  ).length

  if (qualifyingRuns >= 5) runScore = 5
  else if (qualifyingRuns >= 3) runScore = 3

  return Math.min(20, ftpScore + cssScore + runScore)
}

// ---------------------------------------------------------------------------
// 2.5 Data Completeness Bonus (0–20)
// ---------------------------------------------------------------------------
function scoreCompleteness(
  workouts: Workout[],
  logs: ManualLog[],
  race: TargetRace
): number {
  let score = 0

  // Max HR available (from workouts): 3 pts
  const hasMaxHR = workouts.some((w) => w.max_hr && w.max_hr > 0)
  if (hasMaxHR) score += 3

  // Resting HR logged (≤ 30 days): 2 pts
  const hasRestingHR = logs.some(
    (l) => l.log_type === 'resting_hr' && daysAgo(l.date) <= 30
  )
  if (hasRestingHR) score += 2

  // Body weight logged (≤ 30 days): 2 pts
  const hasWeight = logs.some(
    (l) => l.log_type === 'body_weight_kg' && daysAgo(l.date) <= 30
  )
  if (hasWeight) score += 2

  // LTHR available (any sport): 3 pts
  const hasLTHR = workouts.some(
    (w) => w.avg_hr && (w.rpe || 0) >= 7 && (w.duration_seconds || 0) >= 1200
  )
  if (hasLTHR) score += 3

  // HR data on ≥50% of workouts: 3 pts
  const workoutsWithHR = workouts.filter((w) => w.avg_hr && w.avg_hr > 0).length
  if (workouts.length > 0 && workoutsWithHR / workouts.length >= 0.5) score += 3

  // Power data on ≥50% of bike workouts: 3 pts
  const bikeWorkouts = workouts.filter((w) => w.sport === 'bike')
  const bikeWithPower = bikeWorkouts.filter(
    (w) => w.avg_power_watts || w.normalized_power
  ).length
  if (bikeWorkouts.length > 0 && bikeWithPower / bikeWorkouts.length >= 0.5) score += 3

  // Race conditions entered: 2 pts
  if (race.expected_temp_f || race.altitude_ft) score += 2

  // Has ≥1 brick workout (bike+run same day in last 8 weeks): 2 pts
  const recentDates = new Map<string, Set<string>>()
  workouts
    .filter((w) => weeksAgo(w.date) <= 8)
    .forEach((w) => {
      const sports = recentDates.get(w.date) || new Set()
      sports.add(w.sport)
      recentDates.set(w.date, sports)
    })
  const hasBrick = Array.from(recentDates.values()).some(
    (sports) => sports.has('bike') && sports.has('run')
  )
  if (hasBrick) score += 2

  return Math.min(20, score)
}

// ---------------------------------------------------------------------------
// Tier mapping
// ---------------------------------------------------------------------------
function getTier(score: number): { tier: ConfidenceTier; color: string } {
  if (score >= 85) return { tier: 'Excellent', color: 'text-green-600' }
  if (score >= 70) return { tier: 'Good', color: 'text-green-500' }
  if (score >= 50) return { tier: 'Moderate', color: 'text-yellow-600' }
  if (score >= 30) return { tier: 'Fair', color: 'text-orange-500' }
  return { tier: 'Low', color: 'text-red-500' }
}

export function tierBarColor(score: number): string {
  if (score >= 85) return 'bg-green-500'
  if (score >= 70) return 'bg-green-400'
  if (score >= 50) return 'bg-yellow-500'
  if (score >= 30) return 'bg-orange-500'
  return 'bg-red-400'
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------
export function computeConfidenceV2(
  workouts: Workout[],
  logs: ManualLog[],
  race: TargetRace,
): ConfidenceResult {
  // Each internal function returns 0–20; scale to 0–25 so 4 dimensions sum to 0–100
  const volume = Math.round(scoreVolume(workouts) * 1.25)
  const discipline = Math.round(scoreDiscipline(workouts) * 1.25)
  const thresholds = Math.round(scoreThresholds(workouts) * 1.25)
  const completeness = Math.round(scoreCompleteness(workouts, logs, race) * 1.25)

  const total = Math.min(100, volume + discipline + thresholds + completeness)
  const { tier, color: tierColor } = getTier(total)

  return {
    total,
    breakdown: { volume, discipline, thresholds, completeness },
    tier,
    tierColor,
  }
}
