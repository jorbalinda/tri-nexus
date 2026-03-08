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
 *  1   | Rough Estimate  | 20–44     | ≥ 2 disciplines pass         | wide: ×0.90/×1.40
 *  2   | Standard        | 45–69     | all 3 pass                   | standard: ×0.94/×1.18
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
  passed: boolean        // tier 1 gate
  tier2Passed: boolean   // tier 2 gate
  tier3Passed: boolean   // tier 3 gate
  workoutCount: number   // qualifying count at tier 1 minimum
  tier2WorkoutCount: number
  longWorkoutCount: number
  required: number
  minDuration: number          // tier 1 min duration
  tier2MinDuration: number
  tier3LongRequired: number
  tier3LongMinDuration: number
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
  {
    required: number
    tier1MinDuration: number  // Tier 1: base qualifying duration
    tier2MinDuration: number  // Tier 2: elevated qualifying duration
    tier3MinDuration: number  // Tier 3: same base as tier 2
    tier3LongRequired: number // Tier 3: number of additional long workouts
    tier3LongMinDuration: number // Tier 3: duration for long workouts
  }
> = {
  swim: {
    required: 2,
    tier1MinDuration: 600,        // 10 min
    tier2MinDuration: 1200,       // 20 min
    tier3MinDuration: 1200,       // 20 min
    tier3LongRequired: 2,
    tier3LongMinDuration: 1800,   // 30 min
  },
  bike: {
    required: 3,
    tier1MinDuration: 1200,       // 20 min
    tier2MinDuration: 1800,       // 30 min
    tier3MinDuration: 1800,       // 30 min
    tier3LongRequired: 2,
    tier3LongMinDuration: 3600,   // 60 min
  },
  run: {
    required: 3,
    tier1MinDuration: 1200,       // 20 min
    tier2MinDuration: 1800,       // 30 min
    tier3MinDuration: 1800,       // 30 min
    tier3LongRequired: 2,
    tier3LongMinDuration: 2700,   // 45 min
  },
}

const BAND_PROFILES: Record<1 | 2 | 3, { low: number; high: number }> = {
  1: { low: 0.9, high: 1.40 },
  2: { low: 0.94, high: 1.18 },
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
  const req = DISCIPLINE_REQUIREMENTS[sport]
  const recent = workouts.filter(
    (w) => w.sport === sport && new Date(w.date).getTime() >= cutoffMs
  )

  // Count qualifying workouts at each tier's minimum duration
  const tier1Count = recent.filter((w) => (w.duration_seconds || 0) >= req.tier1MinDuration).length
  const tier2Count = recent.filter((w) => (w.duration_seconds || 0) >= req.tier2MinDuration).length
  // Long workouts count toward the 5 qualifying AND toward the 2 long requirement
  const longCount = recent.filter((w) => (w.duration_seconds || 0) >= req.tier3LongMinDuration).length

  const tier1Passed = tier1Count >= req.required
  const tier2Passed = tier2Count >= req.required
  const tier3Passed = tier2Passed && longCount >= req.tier3LongRequired

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
    passed: tier1Passed,
    tier2Passed,
    tier3Passed,
    workoutCount: tier1Count,
    tier2WorkoutCount: tier2Count,
    longWorkoutCount: longCount,
    required: req.required,
    minDuration: req.tier1MinDuration,
    tier2MinDuration: req.tier2MinDuration,
    tier3LongRequired: req.tier3LongRequired,
    tier3LongMinDuration: req.tier3LongMinDuration,
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
  const tier1Passing = gates.filter((g) => g.passed).length
  const tier2Passing = gates.filter((g) => g.tier2Passed).length
  const tier3Passing = gates.filter((g) => g.tier3Passed).length
  const allThresholds = gates.every((g) => g.hasThreshold)

  // Tier 3: all 3 pass tier 3 gate, all thresholds set, confidence >= 70
  if (confidenceScore >= 70 && tier3Passing === 3 && allThresholds) return 3

  // Tier 2: all 3 pass tier 2 gate, confidence 45-69
  if (confidenceScore >= 45 && tier2Passing === 3) return 2

  // Tier 1: 2+ pass tier 1 gate, confidence 20-44
  if (confidenceScore >= 20 && tier1Passing >= 2) return 1

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

  // 1. Failing discipline gates — report the most actionable next step per sport
  for (const gate of gates) {
    if (!gate.tier3Passed) {
      if (!gate.passed) {
        // Not yet at Tier 1
        const remaining = gate.required - gate.workoutCount
        const minMinutes = Math.round(gate.minDuration / 60)
        actions.push({
          priority: 1,
          action: `Log ${remaining} more ${gate.sport} workout${remaining > 1 ? 's' : ''} (${minMinutes}+ min each)`,
          impact: `Unlocks ${gate.sport} predictions`,
          category: 'workout',
        })
      } else if (!gate.tier2Passed) {
        // At Tier 1, working toward Tier 2
        const remaining = gate.required - gate.tier2WorkoutCount
        const minMinutes = Math.round(gate.tier2MinDuration / 60)
        actions.push({
          priority: 2,
          action: `Log ${remaining} more ${gate.sport} workout${remaining > 1 ? 's' : ''} (${minMinutes}+ min each)`,
          impact: `Improves ${gate.sport} prediction accuracy`,
          category: 'workout',
        })
      } else {
        // At Tier 2, working toward Tier 3 long workouts
        const remaining = gate.tier3LongRequired - gate.longWorkoutCount
        const minMinutes = Math.round(gate.tier3LongMinDuration / 60)
        actions.push({
          priority: 2,
          action: `Log ${remaining} more ${gate.sport} workout${remaining > 1 ? 's' : ''} (${minMinutes}+ min each)`,
          impact: `Unlocks Refined ${gate.sport} prediction`,
          category: 'workout',
        })
      }
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
      { key: 'completeness', score: breakdown.completeness },
    ]
    dimensions.sort((a, b) => a.score - b.score)

    const weakest = dimensions[0]
    // Only suggest if the dimension is actually low (< 12.5/25)
    if (weakest.score < 12.5) {
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
        action: 'Increase training frequency. Aim for 3+ workouts per week.',
        impact: 'Improves data volume score',
        category: 'workout',
      }
    case 'discipline':
      return {
        action: 'Train all three disciplines. Swim, bike, and run each week.',
        impact: 'Improves discipline balance score',
        category: 'workout',
      }
    case 'thresholds':
      return {
        action: 'Complete threshold tests for FTP, CSS, or run pace',
        impact: 'Improves threshold data quality',
        category: 'threshold',
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
  const confidenceResult = computeConfidenceV2(workouts, logs, race)

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
