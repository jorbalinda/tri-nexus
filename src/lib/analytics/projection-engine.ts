import type { Workout, ManualLog } from '@/lib/types/database'
import type { TargetRace } from '@/lib/types/target-race'
import type { RaceProjection } from '@/lib/types/projection'
import type { RaceDistance, FitnessSnapshot } from '@/lib/types/race-plan'
import { STANDARD_DISTANCES } from '@/lib/types/race-plan'
import {
  estimateCSSFromWorkouts,
  estimateFTPFromWorkouts,
  estimateLTHR,
  generatePacingPlan,
} from './race-pacing'
import { deriveMaxHR, deriveRestingHR } from './lactate-threshold'
import { weeklyVolume } from './training-stress'

/**
 * Generate a race projection from training data.
 * Reuses the existing race-pacing engine and wraps results into a RaceProjection shape.
 */
export function generateProjection(
  race: TargetRace,
  workouts: Workout[],
  logs: ManualLog[]
): Omit<RaceProjection, 'id' | 'user_id' | 'created_at' | 'projected_at'> {
  const maxHR = deriveMaxHR(workouts)
  const restingHR = deriveRestingHR(logs)
  const ftp = estimateFTPFromWorkouts(workouts)
  const css = estimateCSSFromWorkouts(workouts, maxHR)
  const lthrBike = estimateLTHR(workouts, 'bike')
  const lthrRun = estimateLTHR(workouts, 'run')

  const volumes = weeklyVolume(workouts)
  const recent8 = volumes.slice(-8)
  const avgHours = recent8.length > 0
    ? Number((recent8.reduce((s, v) => s + v.hours, 0) / recent8.length).toFixed(1))
    : null

  const weightLog = logs
    .filter((l) => l.log_type === 'body_weight_kg')
    .sort((a, b) => b.date.localeCompare(a.date))
  const weight = weightLog.length > 0 ? weightLog[0].value : null

  const fitnessSnapshot: FitnessSnapshot = {
    estimatedFTP: ftp,
    estimatedCSS: css ? Math.round(css) : null,
    estimatedLTHR: { swim: null, bike: lthrBike, run: lthrRun },
    maxHR,
    restingHR,
    weeklyVolumeHours: avgHours,
    recentRacePace: { swim: null, bike: null, run: null },
    weight_kg: weight,
    konaStandardMultiplier: null,
    ageGradedEstimate: null,
  }

  // Map target race distance to RaceDistance type
  const raceDistance = race.race_distance as RaceDistance

  // Generate pacing plan using existing engine
  const pacingPlan = generatePacingPlan(
    raceDistance,
    null, // conditions - will be added in Phase 6
    workouts,
    { css, ftp, lthrBike, lthrRun },
    'age_grouper',
    null,
    fitnessSnapshot,
    {
      swim: race.custom_swim_distance_m,
      bike: race.custom_bike_distance_km,
      run: race.custom_run_distance_km,
    }
  )

  // Calculate confidence score based on data volume
  const dataPoints = workouts.length
  const confidence = calculateConfidence(workouts, ftp, css)

  return {
    target_race_id: race.id,
    swim_seconds: pacingPlan.swim.estimatedSplitSeconds,
    t1_seconds: pacingPlan.transitions.t1Seconds,
    bike_seconds: pacingPlan.bike.estimatedSplitSeconds,
    t2_seconds: pacingPlan.transitions.t2Seconds,
    run_seconds: pacingPlan.run.estimatedSplitSeconds,
    optimistic_seconds: pacingPlan.totalEstimate.optimisticSeconds,
    realistic_seconds: pacingPlan.totalEstimate.realisticSeconds,
    conservative_seconds: pacingPlan.totalEstimate.conservativeSeconds,
    confidence_score: confidence,
    data_points_used: dataPoints,
    fitness_snapshot: fitnessSnapshot,
    weather_adjustment: null,
    is_revealed: false,
  }
}

/**
 * Calculate confidence score (0-100) based on data completeness.
 * Higher confidence = more data + key metrics available.
 */
function calculateConfidence(
  workouts: Workout[],
  ftp: number | null,
  css: number | null
): number {
  let score = 0

  // Workout volume (max 40 points)
  const count = workouts.length
  score += Math.min(40, count * 2)

  // FTP available (20 points)
  if (ftp) score += 20

  // CSS available (20 points)
  if (css) score += 20

  // Discipline coverage (max 20 points)
  const sports = new Set(workouts.map((w) => w.sport))
  if (sports.has('swim')) score += 7
  if (sports.has('bike')) score += 7
  if (sports.has('run')) score += 6

  return Math.min(100, score)
}
