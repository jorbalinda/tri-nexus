import type { Workout, SessionMetric } from '@/lib/types/database'
import { assessThresholdHR, type ThresholdHRAssessment } from './threshold-hr'
import { analyzeCardiacDrift, type CardiacDriftResult } from './cardiac-drift'
import { efTrendBySport } from './efficiency-factor'
import { assessSustainability, type SustainabilityResult } from './sustainability'

export interface HRFactorDetail {
  factor: 'threshold_hr' | 'cardiac_drift' | 'efficiency_factor' | 'sustainability'
  weight: number
  value: number
  adjustment: number
  status: string
}

export interface HRAdjustmentResult {
  swim: { multiplier: number; factors: HRFactorDetail[] }
  bike: { multiplier: number; factors: HRFactorDetail[] }
  run: { multiplier: number; factors: HRFactorDetail[] }
  overallConfidence: 'high' | 'moderate' | 'low' | 'none'
}

// Factor weights
const WEIGHTS = {
  threshold_hr: 0.30,
  cardiac_drift: 0.25,
  efficiency_factor: 0.25,
  sustainability: 0.20,
} as const

type FactorKey = keyof typeof WEIGHTS

function computeThresholdAdjustment(assessment: ThresholdHRAssessment): { value: number; adjustment: number; status: string; available: boolean } {
  if (assessment.assessment === 'insufficient' || assessment.ratio === null) {
    return { value: 0, adjustment: 0, status: 'Insufficient HR data', available: false }
  }

  // Below LTHR → faster (negative adjustment), above → slower (positive)
  // Range: ±3%
  const ratio = assessment.ratio
  let adjustment: number
  if (ratio < 0.80) adjustment = -0.03
  else if (ratio <= 0.87) adjustment = -0.02
  else if (ratio <= 0.92) adjustment = -0.01
  else if (ratio <= 0.95) adjustment = 0
  else if (ratio <= 1.02) adjustment = 0.01
  else adjustment = 0.03

  const labels: Record<string, string> = {
    well_below: 'Well below LTHR — strong aerobic base',
    below: 'Below LTHR — good headroom',
    at: 'At LTHR — training at threshold',
    above: 'Above LTHR — pushing limits',
    well_above: 'Well above LTHR — high cardiac stress',
  }

  return { value: ratio, adjustment, status: labels[assessment.assessment] || assessment.assessment, available: true }
}

function computeDriftAdjustment(drift: CardiacDriftResult): { value: number; adjustment: number; status: string; available: boolean } {
  if (drift.rating === 'insufficient' || drift.driftPct === null) {
    return { value: 0, adjustment: 0, status: 'Insufficient session data', available: false }
  }

  // Higher drift → slower (always penalizes), range: +0% to +5%
  let adjustment: number
  if (drift.driftPct < 3) adjustment = 0
  else if (drift.driftPct <= 4) adjustment = 0.02
  else if (drift.driftPct <= 6) adjustment = 0.03
  else adjustment = 0.05

  const labels: Record<string, string> = {
    low: 'Low cardiac drift — strong endurance',
    moderate: 'Moderate drift — some fatigue expected',
    high: 'High drift — risk of fading late',
  }

  return { value: drift.driftPct, adjustment, status: labels[drift.rating], available: true }
}

function computeEFAdjustment(efResult: { trendPct: number | null; rating: string }): { value: number; adjustment: number; status: string; available: boolean } {
  if (efResult.rating === 'insufficient' || efResult.trendPct === null) {
    return { value: 0, adjustment: 0, status: 'Insufficient EF data', available: false }
  }

  // Improving → faster (negative), declining → slower (positive), range: ±2%
  let adjustment: number
  if (efResult.trendPct > 5) adjustment = -0.02
  else if (efResult.trendPct > 3) adjustment = -0.01
  else if (efResult.trendPct >= -3) adjustment = 0
  else if (efResult.trendPct >= -5) adjustment = 0.01
  else adjustment = 0.02

  const labels: Record<string, string> = {
    improving: 'Improving — aerobic fitness trending up',
    stable: 'Stable — consistent efficiency',
    declining: 'Declining — aerobic efficiency dropping',
  }

  return { value: efResult.trendPct, adjustment, status: labels[efResult.rating] || efResult.rating, available: true }
}

function computeSustainabilityAdjustment(result: SustainabilityResult): { value: number; adjustment: number; status: string; available: boolean } {
  if (result.rating === 'insufficient' || result.ratio === null) {
    return { value: 0, adjustment: 0, status: 'Insufficient endurance data', available: false }
  }

  // Unproven → slower (always penalizes), range: +0% to +4%
  let adjustment: number
  if (result.ratio >= 1.0) adjustment = 0
  else if (result.ratio >= 0.75) adjustment = 0.01
  else if (result.ratio >= 0.50) adjustment = 0.025
  else adjustment = 0.04

  const labels: Record<string, string> = {
    proven: 'Proven — has sustained race effort duration',
    likely: 'Likely sustainable — close to race duration',
    questionable: 'Questionable — needs more long efforts',
    unproven: 'Unproven — no evidence of race-duration endurance',
  }

  return { value: result.ratio, adjustment, status: labels[result.rating], available: true }
}

function computeDisciplineAdjustment(
  workouts: Workout[],
  sessionMetrics: Map<string, SessionMetric[]>,
  sport: 'swim' | 'bike' | 'run',
  profileLTHR: number | null,
  projectedSplitSeconds: number,
  raceDistance: string
): { multiplier: number; factors: HRFactorDetail[] } {
  // 1. Compute each factor
  const thrAssessment = assessThresholdHR(workouts, sport, profileLTHR)
  const driftResult = analyzeCardiacDrift(workouts, sessionMetrics, sport)
  const efResult = efTrendBySport(workouts, sport)
  const sustResult = assessSustainability(workouts, sport, profileLTHR || thrAssessment.lthr || null, projectedSplitSeconds, raceDistance)

  const thrAdj = computeThresholdAdjustment(thrAssessment)
  const driftAdj = computeDriftAdjustment(driftResult)
  const efAdj = computeEFAdjustment(efResult)
  const sustAdj = computeSustainabilityAdjustment(sustResult)

  const factorResults: Array<{ key: FactorKey; adj: typeof thrAdj }> = [
    { key: 'threshold_hr', adj: thrAdj },
    { key: 'cardiac_drift', adj: driftAdj },
    { key: 'efficiency_factor', adj: efAdj },
    { key: 'sustainability', adj: sustAdj },
  ]

  // 2. Redistribute weights from insufficient factors
  const available = factorResults.filter((f) => f.adj.available)
  const unavailable = factorResults.filter((f) => !f.adj.available)

  if (available.length === 0) {
    // All factors insufficient — multiplier = 1.0
    const factors: HRFactorDetail[] = factorResults.map((f) => ({
      factor: f.key,
      weight: WEIGHTS[f.key],
      value: f.adj.value,
      adjustment: 0,
      status: f.adj.status,
    }))
    return { multiplier: 1.0, factors }
  }

  const redistributedWeight = unavailable.reduce((s, f) => s + WEIGHTS[f.key], 0)
  const availableBaseWeight = available.reduce((s, f) => s + WEIGHTS[f.key], 0)

  // 3. Compute weighted sum of adjustments
  let weightedSum = 0
  const factors: HRFactorDetail[] = []

  for (const f of factorResults) {
    let effectiveWeight: number
    if (f.adj.available) {
      effectiveWeight = WEIGHTS[f.key] + (WEIGHTS[f.key] / availableBaseWeight) * redistributedWeight
    } else {
      effectiveWeight = 0
    }

    const contribution = f.adj.available ? f.adj.adjustment * effectiveWeight : 0
    weightedSum += contribution

    factors.push({
      factor: f.key,
      weight: Number(effectiveWeight.toFixed(3)),
      value: f.adj.value,
      adjustment: Number(contribution.toFixed(4)),
      status: f.adj.status,
    })
  }

  // 4. Compute multiplier with clamping
  const rawMultiplier = 1.0 + weightedSum
  const multiplier = Number(Math.max(0.92, Math.min(1.10, rawMultiplier)).toFixed(4))

  return { multiplier, factors }
}

export function computeHRAdjustment(
  workouts: Workout[],
  sessionMetrics: Map<string, SessionMetric[]>,
  profileLTHR: { swim: number | null; bike: number | null; run: number | null },
  projectedSplits: { swim: number; bike: number; run: number },
  raceDistance: string
): HRAdjustmentResult {
  const swim = computeDisciplineAdjustment(workouts, sessionMetrics, 'swim', profileLTHR.swim, projectedSplits.swim, raceDistance)
  const bike = computeDisciplineAdjustment(workouts, sessionMetrics, 'bike', profileLTHR.bike, projectedSplits.bike, raceDistance)
  const run = computeDisciplineAdjustment(workouts, sessionMetrics, 'run', profileLTHR.run, projectedSplits.run, raceDistance)

  // Overall confidence based on how many disciplines have available factors
  const countAvailable = (factors: HRFactorDetail[]) => factors.filter((f) => f.weight > 0).length
  const totalAvailable = Math.max(countAvailable(swim.factors), countAvailable(bike.factors), countAvailable(run.factors))

  let overallConfidence: HRAdjustmentResult['overallConfidence']
  if (totalAvailable >= 3) overallConfidence = 'high'
  else if (totalAvailable === 2) overallConfidence = 'moderate'
  else if (totalAvailable === 1) overallConfidence = 'low'
  else overallConfidence = 'none'

  return { swim, bike, run, overallConfidence }
}
