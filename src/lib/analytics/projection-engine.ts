/*
=== PROJECTION ENGINE V2 ===
Delegates to modular projection files in ./projections/
Kept as the single entry point consumed by useProjection hook.

=== CONFIDENCE SCORE V2 (0–100) ===
Volume & Recency (0–20):   min(20, workouts_12wk × 0.7 + workouts_14d × 1.0)
Discipline Balance (0–20):  4/discipline (≥3 workouts) + 8 × (1 - imbalance × 1.5)
Threshold Quality (0–20):   FTP(0–8) + CSS(0–7) + RunPace(0–5) w/ recency decay
Training Load (0–20):       CTL(0–10) + TSB(0–6) + Consistency(0–4)
Completeness (0–20):        Sum of binary checks for HR, weight, power, brick, conditions

=== SWIM PACE ===
pace/100m = CSS + degradation[distance] + openWaterPenalty(+3) - wetsuitBonus(−2)

=== BIKE SPEED ===
targetPower = FTP × IF[distance]
speed: prefer empirical (flat rides, power-adjusted) → fallback: v ≈ 2.4 × P^0.36
adjust: courseProfile, heat(+3%/5°F>75), altitude(+2%/1000ft>3000)

=== RUN PACE ===
basePace = recency-weighted average (half-life 21d) of runs ≥20min, RPE≥4
racePace = basePace × fatigue[distance] × noBrickPenalty(+4%) × env
env: heat(+4.5%/5°F>75), altitude(+3%/1000ft>3000), hilly(+5%)
band: widen to ±7–10% if pace CV > 0.15

=== TRAINING STRESS ===
TSS: use intensity_factor directly if available, else RPE→IF mapping
CTL: 42-day EWMA of daily TSS
ATL: 7-day EWMA of daily TSS
TSB: CTL − ATL (race-ready: +10 to +25)
*/

import type { Workout, ManualLog, SessionMetric } from '@/lib/types/database'
import type { TargetRace } from '@/lib/types/target-race'
import type { RaceProjection } from '@/lib/types/projection'
import { generateProjectionV2 } from './projections/assembler'

/**
 * Generate a race projection from training data (V2).
 * Uses modular per-discipline projections with environmental adjustments,
 * recency-weighted pacing, and the 5-dimension confidence score.
 *
 * @param bandProfile Optional tier-based band multipliers. When provided,
 *   overrides the per-discipline hardcoded optimistic/conservative bands.
 * @param sessionMetrics Optional per-workout HR time-series for cardiac drift analysis
 * @param profileLTHR Optional per-sport LTHR from user profile
 */
export function generateProjection(
  race: TargetRace,
  workouts: Workout[],
  logs: ManualLog[],
  bandProfile?: { low: number; high: number },
  sessionMetrics?: Map<string, SessionMetric[]>,
  profileLTHR?: { swim: number | null; bike: number | null; run: number | null }
): Omit<RaceProjection, 'id' | 'user_id' | 'created_at' | 'projected_at'> {
  return generateProjectionV2(race, workouts, logs, bandProfile, sessionMetrics, profileLTHR)
}
