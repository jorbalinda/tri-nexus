import type { Workout, ManualLog, SessionMetric } from '@/lib/types/database'
import type { TargetRace } from '@/lib/types/target-race'
import type { RaceDistance, FitnessSnapshot } from '@/lib/types/race-plan'
import { STANDARD_DISTANCES } from '@/lib/types/race-plan'
import {
  estimateCSSFromWorkouts,
  estimateFTPFromWorkouts,
  estimateLTHR,
} from '../race-pacing'
import { deriveMaxHR, deriveRestingHR } from '../lactate-threshold'
import { weeklyVolume, calculateCTL, calculateTSB } from '../training-stress'
import { computeConfidenceV2 } from '../confidence-score-v2'
import { computeHRAdjustment } from '../hr-adjustment'
import { projectSwimSplit } from './swim'
import { projectBikeSplit } from './bike'
import { projectRunSplit, detectBrickWorkouts } from './run'
import type { RaceProjection } from '@/lib/types/projection'

interface ProjectedTime {
  swimSeconds: number
  t1Seconds: number
  bikeSeconds: number
  t2Seconds: number
  runSeconds: number
  totalSeconds: number
}

export interface ProjectionV2Result {
  realistic: ProjectedTime
  optimistic: ProjectedTime
  conservative: ProjectedTime
  confidence: number
  fitnessSnapshot: FitnessSnapshot
  dataPoints: number
}

const TRANSITION_DEFAULTS: Record<string, { t1: number; t2: number }> = {
  super_sprint: { t1: 75, t2: 45 },
  sprint: { t1: 90, t2: 60 },
  wt_sprint: { t1: 90, t2: 60 },
  olympic: { t1: 120, t2: 90 },
  wt_standard: { t1: 120, t2: 90 },
  '70.3': { t1: 180, t2: 150 },
  '140.6': { t1: 240, t2: 180 },
  custom: { t1: 180, t2: 150 },
}

function getDistances(
  raceDistance: RaceDistance,
  custom?: { swim?: number | null; bike?: number | null; run?: number | null }
) {
  if (raceDistance === 'custom') {
    return {
      swim_m: custom?.swim || 750,
      bike_km: custom?.bike || 20,
      run_km: custom?.run || 5,
    }
  }
  return STANDARD_DISTANCES[raceDistance]
}

function buildTime(
  swimSec: number,
  t1: number,
  bikeSec: number,
  t2: number,
  runSec: number
): ProjectedTime {
  return {
    swimSeconds: swimSec,
    t1Seconds: t1,
    bikeSeconds: bikeSec,
    t2Seconds: t2,
    runSeconds: runSec,
    totalSeconds: swimSec + t1 + bikeSec + t2 + runSec,
  }
}

/**
 * Generate a V2 race projection.
 * Returns the full projection data ready to be stored.
 *
 * @param bandProfile Optional tier-based band multipliers. When provided,
 *   overrides the per-discipline hardcoded optimistic/conservative bands
 *   with uniform multipliers (e.g. { low: 0.96, high: 1.06 }).
 * @param raceWeather Optional forecast data. When provided, wind_speed_mph
 *   is converted to kph and applied to the bike projection via the loop-course
 *   physics formula (headwind costs more than tailwind saves).
 */
export function generateProjectionV2(
  race: TargetRace,
  workouts: Workout[],
  logs: ManualLog[],
  bandProfile?: { low: number; high: number },
  sessionMetrics?: Map<string, SessionMetric[]>,
  profileLTHR?: { swim: number | null; bike: number | null; run: number | null },
  raceWeather?: { wind_speed_mph: number | null } | null
): Omit<RaceProjection, 'id' | 'user_id' | 'created_at' | 'projected_at'> {
  const raceDistance = race.race_distance as RaceDistance
  const distances = getDistances(raceDistance, {
    swim: race.custom_swim_distance_m,
    bike: race.custom_bike_distance_km,
    run: race.custom_run_distance_km,
  })

  // Derive fitness metrics
  const maxHR = deriveMaxHR(workouts)
  const restingHR = deriveRestingHR(logs)
  const ftp = estimateFTPFromWorkouts(workouts)
  const css = estimateCSSFromWorkouts(workouts, maxHR)
  const lthrBike = estimateLTHR(workouts, 'bike')
  const lthrRun = estimateLTHR(workouts, 'run')

  const volumes = weeklyVolume(workouts)
  const recent8 = volumes.slice(-8)
  const avgHours =
    recent8.length > 0
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

  // Race conditions from the target race + forecast weather
  const windSpeedKph =
    raceWeather?.wind_speed_mph != null ? raceWeather.wind_speed_mph * 1.60934 : null

  const conditions = {
    tempHighF: race.expected_temp_f,
    altitudeFt: race.altitude_ft,
    courseProfile: race.course_profile as 'flat' | 'rolling' | 'hilly' | 'mountainous' | null,
    swimType: (race.swim_type || race.water_type) as 'pool' | 'lake' | 'river' | 'bay' | 'ocean' | null,
    wetsuitLegal: race.wetsuit ?? null,
    windSpeedKph,
  }

  // Recent bike workouts (last 8 weeks, sorted by date desc)
  const eightWeeksAgo = Date.now() - 8 * 7 * 86400000
  const recentBikeWorkouts = workouts
    .filter(
      (w) => w.sport === 'bike' && new Date(w.date).getTime() >= eightWeeksAgo
    )
    .sort((a, b) => b.date.localeCompare(a.date))

  // Recent run workouts (last 8 weeks, ≥20 min, sorted by date desc)
  const recentRuns = workouts
    .filter(
      (w) =>
        w.sport === 'run' &&
        (w.duration_seconds || 0) >= 1200 &&
        new Date(w.date).getTime() >= eightWeeksAgo
    )
    .sort((a, b) => b.date.localeCompare(a.date))

  const hasBrick = detectBrickWorkouts(workouts)

  // Generate per-discipline projections
  const swim = projectSwimSplit(css, raceDistance, distances.swim_m, conditions)
  const bike = projectBikeSplit(
    ftp,
    weight,
    raceDistance,
    distances.bike_km,
    conditions,
    recentBikeWorkouts
  )
  const run = projectRunSplit(recentRuns, raceDistance, distances.run_km, conditions, hasBrick)

  // Transitions
  const trans = TRANSITION_DEFAULTS[raceDistance] || TRANSITION_DEFAULTS.custom
  const t1 = trans.t1
  const t2 = trans.t2

  // HR adjustment (returns 1.0 multipliers when insufficient data)
  const hrAdj = computeHRAdjustment(
    workouts,
    sessionMetrics || new Map(),
    profileLTHR || { swim: null, bike: null, run: null },
    { swim: swim.realistic, bike: bike.realistic, run: run.realistic },
    raceDistance
  )

  const adjSwimRealistic = Math.round(swim.realistic * hrAdj.swim.multiplier)
  const adjBikeRealistic = Math.round(bike.realistic * hrAdj.bike.multiplier)
  const adjRunRealistic = Math.round(run.realistic * hrAdj.run.multiplier)

  // Assemble per-scenario times
  const realistic = buildTime(adjSwimRealistic, t1, adjBikeRealistic, t2, adjRunRealistic)

  let optimistic: ProjectedTime
  let conservative: ProjectedTime

  if (bandProfile) {
    // Override per-discipline bands with uniform tier-based multipliers
    // Band multipliers apply on top of HR-adjusted realistic times
    optimistic = buildTime(
      Math.round(adjSwimRealistic * bandProfile.low),
      t1,
      Math.round(adjBikeRealistic * bandProfile.low),
      t2,
      Math.round(adjRunRealistic * bandProfile.low)
    )
    conservative = buildTime(
      Math.round(adjSwimRealistic * bandProfile.high),
      t1,
      Math.round(adjBikeRealistic * bandProfile.high),
      t2,
      Math.round(adjRunRealistic * bandProfile.high)
    )
  } else {
    // Default: use per-discipline hardcoded bands
    optimistic = buildTime(swim.optimistic, t1, bike.optimistic, t2, run.optimistic)
    conservative = buildTime(swim.conservative, t1, bike.conservative, t2, run.conservative)
  }

  // Confidence score
  const ctl = calculateCTL(workouts)
  const tsb = calculateTSB(workouts)
  const confidenceResult = computeConfidenceV2(workouts, logs, race, ctl, tsb)

  return {
    target_race_id: race.id,
    swim_seconds: realistic.swimSeconds,
    t1_seconds: t1,
    bike_seconds: realistic.bikeSeconds,
    t2_seconds: t2,
    run_seconds: realistic.runSeconds,
    optimistic_seconds: optimistic.totalSeconds,
    realistic_seconds: realistic.totalSeconds,
    conservative_seconds: conservative.totalSeconds,
    confidence_score: confidenceResult.total,
    data_points_used: workouts.length,
    fitness_snapshot: fitnessSnapshot,
    weather_adjustment: bike.windAdjustmentSeconds > 0
      ? { wind_speed_kph: windSpeedKph, bike_wind_seconds: bike.windAdjustmentSeconds }
      : null,
    hr_adjustment: hrAdj.overallConfidence !== 'none' ? hrAdj : null,
    is_revealed: false,
  }
}
