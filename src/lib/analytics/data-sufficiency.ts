/**
 * Data Sufficiency Engine
 *
 * Evaluates whether the user has enough training data for reliable predictions.
 * Produces a tier (0–3) that gates what the UI shows, discipline-level pass/fail
 * gates, and a prioritized list of next actions to improve data quality.
 *
 * This is a **display-layer concern** — the projection engine always produces
 * results; this module determines how much the UI should reveal.
 *
 * Tier | Label           | Confidence | Per-Discipline Gate          | Band Profile
 * -----|-----------------|-----------|------------------------------|------------------
 *  0   | No Prediction   | < 20      | < 2 disciplines pass         | — (nothing shown)
 *  1   | Rough Estimate  | 20–44     | ≥ 2 disciplines pass         | wide: ×0.90/×1.15
 *  2   | Standard        | 45–69     | all 3 pass                   | standard: ×0.96/×1.06
 *  3   | Refined         | ≥ 70      | all 3 pass + thresholds set  | tight: ×0.97/×1.03
 */

import type { Workout, ManualLog } from '@/lib/types/database'
import type { TargetRace } from '@/lib/types/target-race'
import { computeConfidenceV2, type ConfidenceBreakdown } from './confidence-score-v2'
import { calculateCTL, calculateTSB } from './training-stress'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DisciplineGate {
  sport: 'swim' | 'bike' | 'run'
  passed: boolean
  workoutCount: number
  required: number
  minDuration: number // seconds
  hasThreshold: boolean
}

export type SufficiencyTier = 0 | 1 | 2 | 3
export type SufficiencyTierLabel =
  | 'No Prediction'
  | 'Rough Estimate'
  | 'Standard'
  | 'Refined'

export interface SufficiencyResult {
  tier: SufficiencyTier
  tierLabel: SufficiencyTierLabel
  confidenceScore: number
  gates: DisciplineGate[]
  passingDisciplines: number
  bandProfile: { low: number; high: number } | null
  nextActions: NextAction[]
  previousTier: number | null
}

export interface NextAction {
  priority: number
  action: string
  impact: string
  category: 'workout' | 'threshold' | 'data'
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EIGHT_WEEKS_MS = 8 * 7 * 86_400_000

const DISCIPLINE_REQUIREMENTS: Record<
  'swim' | 'bike' | 'run',
  { required: number; minDuration: number }
> = {
  swim: { required: 10, minDuration: 600 }, // 10 min
  bike: { required: 10, minDuration: 1200 }, // 20 min
  run: { required: 10, minDuration: 1200 }, // 20 min
}

const BAND_PROFILES: Record<1 | 2 | 3, { low: number; high: number }> = {
  1: { low: 0.9, high: 1.15 },
  2: { low: 0.96, high: 1.06 },
  3: { low: 0.97, high: 1.03 },
}

const TIER_LABELS: Record<SufficiencyTier, SufficiencyTierLabel> = {
  0: 'No Prediction',
  1: 'Rough Estimate',
  2: 'Standard',
  3: 'Refined',
}

// ---------------------------------------------------------------------------
// Discipline Gate Evaluation
// ---------------------------------------------------------------------------

function evaluateGate(
  sport: 'swim' | 'bike' | 'run',
  workouts: Workout[],
  cutoffMs: number
): DisciplineGate {
  const { required, minDuration } = DISCIPLINE_REQUIREMENTS[sport]

  const qualifying = workouts.filter(
    (w) =>
      w.sport === sport &&
      (w.duration_seconds || 0) >= minDuration &&
      new Date(w.date).getTime() >= cutoffMs
  )

  // Threshold detection per sport
  let hasThreshold = false
  if (sport === 'bike') {
    hasThreshold = workouts.some(
      (w) =>
        w.sport === 'bike' &&
        w.normalized_power &&
        (w.duration_seconds || 0) >= 1200
    )
  } else if (sport === 'swim') {
    hasThreshold = workouts.some(
      (w) =>
        w.sport === 'swim' &&
        w.distance_meters &&
        w.duration_seconds &&
        (w.duration_seconds || 0) >= 600
    )
  } else if (sport === 'run') {
    hasThreshold = workouts.some(
      (w) =>
        w.sport === 'run' &&
        w.avg_pace_sec_per_km &&
        (w.duration_seconds || 0) >= 1200
    )
  }

  return {
    sport,
    passed: qualifying.length >= required,
    workoutCount: qualifying.length,
    required,
    minDuration,
    hasThreshold,
  }
}

// ---------------------------------------------------------------------------
// Tier Determination
// ---------------------------------------------------------------------------

function determineTier(
  confidenceScore: number,
  gates: DisciplineGate[]
): SufficiencyTier {
  const passing = gates.filter((g) => g.passed).length
  const allThresholds = gates.every((g) => g.hasThreshold)

  // Tier 3: ≥ 70 confidence, all 3 pass, all thresholds set
  if (confidenceScore >= 70 && passing === 3 && allThresholds) return 3

  // Tier 2: 45–69 confidence, all 3 pass
  if (confidenceScore >= 45 && passing === 3) return 2

  // Tier 1: 20–44 confidence, ≥ 2 disciplines pass
  if (confidenceScore >= 20 && passing >= 2) return 1

  // Tier 0: everything else
  return 0
}

// ---------------------------------------------------------------------------
// Next Actions Generator
// ---------------------------------------------------------------------------

function generateNextActions(
  gates: DisciplineGate[],
  breakdown: ConfidenceBreakdown,
  workouts?: Workout[]
): NextAction[] {
  const actions: NextAction[] = []

  // 1. Failing discipline gates
  for (const gate of gates) {
    if (!gate.passed) {
      const remaining = gate.required - gate.workoutCount
      const minMinutes = Math.round(gate.minDuration / 60)
      actions.push({
        priority: 1,
        action: `Log ${remaining} more ${gate.sport} workout${remaining > 1 ? 's' : ''} (${minMinutes}+ min each)`,
        impact: `Unlocks ${gate.sport} predictions`,
        category: 'workout',
      })
    }
  }

  // 2. Missing thresholds
  for (const gate of gates) {
    if (gate.passed && !gate.hasThreshold) {
      if (gate.sport === 'bike') {
        actions.push({
          priority: 2,
          action: 'Complete a bike workout with a power meter (20+ min)',
          impact: 'Enables FTP-based bike pacing',
          category: 'threshold',
        })
      } else if (gate.sport === 'swim') {
        actions.push({
          priority: 2,
          action: 'Log a timed swim with distance (10+ min)',
          impact: 'Enables CSS-based swim pacing',
          category: 'threshold',
        })
      } else if (gate.sport === 'run') {
        actions.push({
          priority: 2,
          action: 'Log a run with pace data (20+ min)',
          impact: 'Enables pace-based run predictions',
          category: 'threshold',
        })
      }
    }
  }

  // 3. HR-related nudges
  if (actions.length < 3 && workouts) {
    const workoutsWithHR = workouts.filter((w) => w.avg_hr != null).length
    const totalWorkouts = workouts.length

    if (totalWorkouts > 0 && workoutsWithHR / totalWorkouts < 0.3) {
      actions.push({
        priority: 3,
        action: 'Wear your HR monitor during workouts to unlock HR-enhanced predictions',
        impact: 'Enables cardiac drift and threshold analysis',
        category: 'data',
      })
    }
  }

  // 4. Weakest confidence dimension (if we still have room)
  if (actions.length < 3) {
    const dimensions: { key: keyof ConfidenceBreakdown; score: number }[] = [
      { key: 'volume', score: breakdown.volume },
      { key: 'discipline', score: breakdown.discipline },
      { key: 'thresholds', score: breakdown.thresholds },
      { key: 'trainingLoad', score: breakdown.trainingLoad },
      { key: 'completeness', score: breakdown.completeness },
    ]
    dimensions.sort((a, b) => a.score - b.score)

    const weakest = dimensions[0]
    // Only suggest if the dimension is actually low (< 10/20)
    if (weakest.score < 10) {
      const suggestion = getDimensionSuggestion(weakest.key)
      if (suggestion) {
        actions.push({ ...suggestion, priority: 4 })
      }
    }
  }

  // Sort by priority and cap at 3
  return actions.sort((a, b) => a.priority - b.priority).slice(0, 3)
}

function getDimensionSuggestion(
  dimension: keyof ConfidenceBreakdown
): Omit<NextAction, 'priority'> | null {
  switch (dimension) {
    case 'volume':
      return {
        action: 'Increase training frequency — aim for 3+ workouts per week',
        impact: 'Improves data volume score',
        category: 'workout',
      }
    case 'discipline':
      return {
        action: 'Train all three disciplines — swim, bike, and run each week',
        impact: 'Improves discipline balance score',
        category: 'workout',
      }
    case 'thresholds':
      return {
        action: 'Complete threshold tests for FTP, CSS, or run pace',
        impact: 'Improves threshold data quality',
        category: 'threshold',
      }
    case 'trainingLoad':
      return {
        action: 'Maintain consistent weekly training to build fitness',
        impact: 'Improves training load readiness',
        category: 'workout',
      }
    case 'completeness':
      return {
        action: 'Log resting HR and body weight for better accuracy',
        impact: 'Improves data completeness',
        category: 'data',
      }
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Main Entry Point
// ---------------------------------------------------------------------------

export function evaluateSufficiency(
  workouts: Workout[],
  logs: ManualLog[],
  race: TargetRace,
  ctl: number,
  tsb: number
): SufficiencyResult {
  const cutoffMs = Date.now() - EIGHT_WEEKS_MS

  // Evaluate per-discipline gates
  const gates: DisciplineGate[] = [
    evaluateGate('swim', workouts, cutoffMs),
    evaluateGate('bike', workouts, cutoffMs),
    evaluateGate('run', workouts, cutoffMs),
  ]
  const passingDisciplines = gates.filter((g) => g.passed).length

  // Reuse existing confidence score (no duplication)
  const confidenceResult = computeConfidenceV2(workouts, logs, race, ctl, tsb)

  // Determine tier
  const tier = determineTier(confidenceResult.total, gates)
  const tierLabel = TIER_LABELS[tier]

  // Band profile
  const bandProfile = tier >= 1 ? BAND_PROFILES[tier as 1 | 2 | 3] : null

  // Next actions
  const nextActions = generateNextActions(gates, confidenceResult.breakdown, workouts)

  return {
    tier,
    tierLabel,
    confidenceScore: confidenceResult.total,
    gates,
    passingDisciplines,
    bandProfile,
    nextActions,
    previousTier: null, // Set by the hook from localStorage
  }
}

/**
 * Convenience wrapper that computes CTL/TSB internally.
 * Use when you don't already have training load metrics.
 */
export function evaluateSufficiencyFromWorkouts(
  workouts: Workout[],
  logs: ManualLog[],
  race: TargetRace
): SufficiencyResult {
  const ctl = calculateCTL(workouts)
  const tsb = calculateTSB(workouts)
  return evaluateSufficiency(workouts, logs, race, ctl, tsb)
}
