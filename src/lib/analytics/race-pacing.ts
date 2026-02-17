import type { Workout } from '@/lib/types/database'
import type {
  RaceDistance,
  RaceConditions,
  SwimPacing,
  BikePacing,
  RunPacing,
  TransitionTargets,
  RaceEstimate,
  PacingPlan,
  RaceDistances,
  QualificationPacingPlan,
  QualificationTarget,
  FitnessSnapshot,
  AthleteClassification,
} from '@/lib/types/race-plan'
import { STANDARD_DISTANCES, isDraftLegal } from '@/lib/types/race-plan'
import { generateQualificationPacing } from './race-qualification'

// ---------------------------------------------------------------------------
// Core fitness estimators
// ---------------------------------------------------------------------------

export function calculateCSS(time400s: number, time200s: number): number {
  return (time400s - time200s) / 2
}

export function estimateCSSFromWorkouts(workouts: Workout[], maxHR: number | null): number | null {
  const swims = workouts
    .filter((w) => w.sport === 'swim' && w.distance_meters && w.duration_seconds)
    .filter((w) => {
      if (!maxHR || !w.avg_hr) return true
      return w.avg_hr >= maxHR * 0.85 && (w.duration_seconds || 0) >= 600
    })
    .sort((a, b) => {
      const paceA = (a.duration_seconds || 0) / ((a.distance_meters || 1) / 100)
      const paceB = (b.duration_seconds || 0) / ((b.distance_meters || 1) / 100)
      return paceA - paceB
    })

  if (swims.length === 0) return null
  const best = swims[0]
  return (best.duration_seconds || 0) / ((best.distance_meters || 1) / 100)
}

export function calculateFTP(best20minPower: number): number {
  return Math.round(best20minPower * 0.95)
}

export function estimateFTPFromWorkouts(workouts: Workout[]): number | null {
  const bikeWithPower = workouts
    .filter((w) => w.sport === 'bike' && w.normalized_power && (w.duration_seconds || 0) >= 1200)
    .sort((a, b) => (b.normalized_power || 0) - (a.normalized_power || 0))

  if (bikeWithPower.length === 0) return null
  return calculateFTP(bikeWithPower[0].normalized_power!)
}

export function estimateLTHR(workouts: Workout[], sport: string): number | null {
  const hard = workouts
    .filter(
      (w) =>
        w.sport === sport &&
        w.avg_hr &&
        (w.duration_seconds || 0) >= 1200 &&
        (w.rpe || 0) >= 7
    )
    .sort((a, b) => (b.avg_hr || 0) - (a.avg_hr || 0))

  if (hard.length === 0) return null
  return hard[0].avg_hr!
}

// ---------------------------------------------------------------------------
// Adjustment factors
// ---------------------------------------------------------------------------

export function heatAdjustmentPct(conditions: RaceConditions | null): number {
  const tempF = conditions?.temp_high_f ?? null
  if (!tempF || tempF <= 75) return 0
  return Math.round(((tempF - 75) / 5) * 4)
}

export function altitudeAdjustmentPct(conditions: RaceConditions | null): number {
  const alt = conditions?.altitude_ft ?? null
  if (!alt || alt <= 3000) return 0
  return Math.round(((alt - 3000) / 1000) * 2)
}

// ---------------------------------------------------------------------------
// Distance helpers
// ---------------------------------------------------------------------------

function getDistances(
  raceDistance: RaceDistance,
  customSwim?: number | null,
  customBike?: number | null,
  customRun?: number | null
): RaceDistances {
  if (raceDistance === 'custom') {
    return { swim_m: customSwim || 750, bike_km: customBike || 20, run_km: customRun || 5 }
  }
  return STANDARD_DISTANCES[raceDistance]
}

// Map new distances to pacing buckets
function pacingBucket(rd: RaceDistance): string {
  switch (rd) {
    case 'super_sprint':
    case 'sprint':
    case 'wt_sprint':
      return 'sprint'
    case 'olympic':
    case 'wt_standard':
      return 'olympic'
    case '70.3':
      return '70.3'
    case '140.6':
      return '140.6'
    default:
      return 'olympic'
  }
}

// ---------------------------------------------------------------------------
// Sport pacing generators
// ---------------------------------------------------------------------------

export function generateSwimPacing(
  raceDistance: RaceDistance,
  css: number | null,
  distances: RaceDistances,
  classification: AthleteClassification = 'age_grouper'
): SwimPacing {
  // Default CSS by classification when no training data available
  const effectiveCSS = css ?? (classification === 'professional' ? 75 : 105)

  const bucket = pacingBucket(raceDistance)
  const adjustments: Record<string, number> = { sprint: -3, olympic: 0, '70.3': 3, '140.6': 7 }
  const targetPace = effectiveCSS + (adjustments[bucket] ?? 0)
  const splitSeconds = Math.round((distances.swim_m / 100) * targetPace)

  const strategy =
    bucket === '140.6' || bucket === '70.3'
      ? 'Even pacing. Start conservatively — save energy for the bike and run.'
      : isDraftLegal(raceDistance)
        ? 'Position yourself to exit the swim near the front pack. The bike is draft-legal.'
        : 'Slight negative split. Settle into rhythm in the first 200m, then build pace.'

  const strokeRate =
    bucket === '140.6' ? '55-60 strokes/min — efficient, sustainable cadence' : '60-66 strokes/min — steady with controlled turnover'

  const sighting =
    distances.swim_m > 1500 ? 'Every 6-8 strokes in open water. Sight early and often at start.' : 'Every 8-10 strokes. Use buoy lines to navigate.'

  return { targetPacePer100m: Math.round(targetPace), estimatedSplitSeconds: splitSeconds, strategy, strokeRateTarget: strokeRate, sightingFrequency: sighting, dataAvailable: true }
}

// Default CSS/FTP/pace estimates by athlete classification
const DEFAULT_CSS: Record<AthleteClassification, number> = { professional: 75, age_grouper: 105 }
const DEFAULT_FTP: Record<AthleteClassification, number> = { professional: 300, age_grouper: 180 }
const DEFAULT_RUN_PACE: Record<AthleteClassification, number> = { professional: 255, age_grouper: 330 }

export function generateBikePacing(
  raceDistance: RaceDistance,
  ftp: number | null,
  lthr: number | null,
  conditions: RaceConditions | null,
  distances: RaceDistances,
  classification: AthleteClassification
): BikePacing {
  const heat = heatAdjustmentPct(conditions)
  const alt = altitudeAdjustmentPct(conditions)
  const totalAdj = heat + alt
  const draftLegal = isDraftLegal(raceDistance)
  const bucket = pacingBucket(raceDistance)

  const effectiveFtp = ftp ?? DEFAULT_FTP[classification]

  const intensityRange: Record<string, [number, number]> = {
    sprint: [0.95, 1.05], olympic: [0.85, 0.95], '70.3': [0.70, 0.80], '140.6': [0.65, 0.75],
  }
  const [lo, hi] = intensityRange[bucket] || [0.75, 0.85]
  const adjFactor = 1 - totalAdj / 100
  const loWatts = Math.round(effectiveFtp * lo * adjFactor)
  const hiWatts = Math.round(effectiveFtp * hi * adjFactor)
  const targetWatts = Math.round((loWatts + hiWatts) / 2)
  const estSpeedKph = targetWatts / 3.5 + 15
  const splitSeconds = Math.round((distances.bike_km / estSpeedKph) * 3600)

  let strategy: string
  if (draftLegal) {
    strategy = `Draft-legal racing: stay in the pack. Power will spike during surges (up to ${Math.round(effectiveFtp * 1.2)}W). Conserve between surges. Positioning is more important than steady-state power.`
  } else if (conditions?.course_profile === 'hilly' || conditions?.course_profile === 'mountainous') {
    strategy = `Steady power on flats (${loWatts}-${hiWatts}W). Cap power on climbs at ${Math.round(targetWatts * 1.1)}W. Recover on descents.`
  } else {
    strategy = `Even power throughout: ${loWatts}-${hiWatts}W. Resist surging early.`
  }

  if (classification === 'professional') {
    strategy += ' Pro pacing: focus on positioning in the first 30km, then settle into sustainable power.'
  }

  return {
    targetPowerWatts: targetWatts, targetPowerRange: [loWatts, hiWatts],
    targetHRZone: lthr ? getHRZoneLabel(raceDistance, 'bike', lthr) : 'Use power as primary metric — ride by feel if no power meter',
    estimatedSplitSeconds: splitSeconds, cadenceTarget: '85-95 rpm on flats, 70-80 rpm on climbs',
    strategy, heatAdjustment: heat, altitudeAdjustment: alt, dataAvailable: true, isDraftLegal: draftLegal,
  }
}

export function generateRunPacing(
  raceDistance: RaceDistance,
  lthr: number | null,
  conditions: RaceConditions | null,
  distances: RaceDistances,
  workouts: Workout[],
  classification: AthleteClassification = 'age_grouper'
): RunPacing {
  const heat = heatAdjustmentPct(conditions)
  const alt = altitudeAdjustmentPct(conditions)
  const totalAdj = heat + alt
  const bucket = pacingBucket(raceDistance)

  const recentRuns = workouts
    .filter((w) => w.sport === 'run' && w.avg_pace_sec_per_km && (w.duration_seconds || 0) >= 1200)
    .sort((a, b) => b.date.localeCompare(a.date))

  let basePace: number | null = null
  if (recentRuns.length > 0) {
    const paces = recentRuns.slice(0, 5).map((w) => w.avg_pace_sec_per_km!)
    basePace = paces.reduce((a, b) => a + b, 0) / paces.length
  }

  const effectivePace = basePace ?? DEFAULT_RUN_PACE[classification]

  const paceMultiplier: Record<string, number> = { sprint: 0.95, olympic: 1.0, '70.3': 1.10, '140.6': 1.20 }
  const mult = paceMultiplier[bucket] || 1.05
  const adjFactor = 1 + totalAdj / 100
  const targetPace = Math.round(effectivePace * mult * adjFactor)
  const splitSeconds = Math.round(distances.run_km * targetPace)

  const walkBreak =
    bucket === '140.6'
      ? 'Consider 30-60s walk at each aid station to manage fatigue and take nutrition.'
      : bucket === '70.3'
        ? 'Walk through aid stations if needed for hydration.'
        : null

  const strategy =
    bucket === '140.6'
      ? 'Even effort with controlled first 10K. The marathon starts at mile 18 — save yourself.'
      : isDraftLegal(raceDistance)
        ? 'Off-the-bike run: transition is critical in draft-legal racing. The run decides the race.'
        : 'Slight negative split. First 1-2 km conservative off the bike, then settle into target pace.'

  return {
    targetPaceSecPerKm: targetPace,
    targetHRZone: lthr ? getHRZoneLabel(raceDistance, 'run', lthr) : 'Run by feel — keep effort conversational early',
    estimatedSplitSeconds: splitSeconds, strategy, walkBreakStrategy: walkBreak,
    brickFactorNote: 'First 1-2 km off the bike will feel 10-20 sec/km slower than standalone pace. This is normal — don\'t chase the pace.',
    dataAvailable: true,
  }
}

function getHRZoneLabel(raceDistance: RaceDistance, sport: 'bike' | 'run', lthr: number): string {
  const bucket = pacingBucket(raceDistance)
  const intensities: Record<string, Record<string, [number, number]>> = {
    bike: { sprint: [0.95, 1.05], olympic: [0.85, 0.95], '70.3': [0.75, 0.85], '140.6': [0.68, 0.78] },
    run: { sprint: [0.95, 1.0], olympic: [0.90, 0.95], '70.3': [0.85, 0.90], '140.6': [0.78, 0.85] },
  }
  const [lo, hi] = intensities[sport]?.[bucket] || [0.80, 0.90]
  return `${Math.round(lthr * lo)}-${Math.round(lthr * hi)} bpm (${Math.round(lo * 100)}-${Math.round(hi * 100)}% LTHR)`
}

function generateTransitions(raceDistance: RaceDistance): TransitionTargets {
  const bucket = pacingBucket(raceDistance)
  const isLong = bucket === '140.6' || bucket === '70.3'
  return {
    t1Seconds: isLong ? 180 : 120,
    t2Seconds: isLong ? 120 : 75,
    t1Checklist: [
      'Remove wetsuit (practice beforehand)',
      'Helmet on FIRST (before touching bike)',
      'Sunglasses on',
      'Shoes on (or use elastic laces)',
      'Grab bike and run to mount line',
      ...(isLong ? ['Apply sunscreen if needed', 'Check nutrition is staged on bike'] : []),
    ],
    t2Checklist: [
      'Rack bike', 'Helmet off', 'Swap to run shoes', 'Grab race belt with bib', 'Hat or visor on',
      ...(isLong ? ['Grab any additional nutrition/gels'] : []),
    ],
  }
}

// ---------------------------------------------------------------------------
// Full pacing plan
// ---------------------------------------------------------------------------

export function generatePacingPlan(
  raceDistance: RaceDistance,
  conditions: RaceConditions | null,
  workouts: Workout[],
  snapshot: { css: number | null; ftp: number | null; lthrBike: number | null; lthrRun: number | null },
  classification: AthleteClassification,
  qualificationTarget: QualificationTarget | null,
  fitnessSnapshot: FitnessSnapshot,
  customDistances?: { swim?: number | null; bike?: number | null; run?: number | null }
): PacingPlan {
  const distances = getDistances(raceDistance, customDistances?.swim, customDistances?.bike, customDistances?.run)

  const swim = generateSwimPacing(raceDistance, snapshot.css, distances, classification)
  const bike = generateBikePacing(raceDistance, snapshot.ftp, snapshot.lthrBike, conditions, distances, classification)
  const run = generateRunPacing(raceDistance, snapshot.lthrRun, conditions, distances, workouts, classification)
  const transitions = generateTransitions(raceDistance)

  const realisticSeconds =
    swim.estimatedSplitSeconds + transitions.t1Seconds + bike.estimatedSplitSeconds + transitions.t2Seconds + run.estimatedSplitSeconds

  const totalEstimate: RaceEstimate = {
    optimisticSeconds: Math.round(realisticSeconds * 0.95),
    realisticSeconds,
    conservativeSeconds: Math.round(realisticSeconds * 1.07),
  }

  // Qualification pacing (reverse-engineered from target)
  let qualificationPacing: QualificationPacingPlan | null = null
  if (qualificationTarget?.estimated_qualifying_time && realisticSeconds > 0) {
    qualificationPacing = generateQualificationPacing(
      qualificationTarget.estimated_qualifying_time,
      distances,
      fitnessSnapshot,
      realisticSeconds
    )
  }

  return { swim, bike, run, transitions, totalEstimate, qualificationPacing }
}
