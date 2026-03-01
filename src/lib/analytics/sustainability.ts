import type { Workout } from '@/lib/types/database'

export interface SustainabilityResult {
  sport: 'swim' | 'bike' | 'run'
  raceEffortHR: number | null
  longestSustainedMinutes: number | null
  projectedRaceMinutes: number
  ratio: number | null
  rating: 'proven' | 'likely' | 'questionable' | 'unproven' | 'insufficient'
}

// Race-distance intensity factors (fraction of LTHR) per sport
// Midpoint of the range is used for the target HR
const INTENSITY_FACTORS: Record<string, Record<string, [number, number]>> = {
  bike: {
    sprint: [0.95, 1.05],
    olympic: [0.85, 0.95],
    '70.3': [0.75, 0.85],
    '140.6': [0.68, 0.78],
  },
  run: {
    sprint: [0.95, 1.0],
    olympic: [0.90, 0.95],
    '70.3': [0.85, 0.90],
    '140.6': [0.78, 0.85],
  },
  swim: {
    sprint: [0.85, 0.95],
    olympic: [0.80, 0.90],
    '70.3': [0.75, 0.85],
    '140.6': [0.70, 0.80],
  },
}

function pacingBucket(raceDistance: string): string {
  switch (raceDistance) {
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

export function assessSustainability(
  workouts: Workout[],
  sport: 'swim' | 'bike' | 'run',
  lthr: number | null,
  projectedSplitSeconds: number,
  raceDistance: string
): SustainabilityResult {
  const projectedRaceMinutes = Math.round(projectedSplitSeconds / 60)

  if (!lthr) {
    return {
      sport,
      raceEffortHR: null,
      longestSustainedMinutes: null,
      projectedRaceMinutes,
      ratio: null,
      rating: 'insufficient',
    }
  }

  const bucket = pacingBucket(raceDistance)
  const factors = INTENSITY_FACTORS[sport]?.[bucket] || [0.80, 0.90]
  const midpoint = (factors[0] + factors[1]) / 2
  const raceEffortHR = Math.round(lthr * midpoint)
  const threshold = raceEffortHR * 0.90

  // Find workouts where avg_hr >= 90% of race-effort midpoint HR
  const qualifying = workouts.filter(
    (w) =>
      w.sport === sport &&
      w.avg_hr &&
      w.avg_hr >= threshold &&
      (w.duration_seconds || 0) > 0
  )

  if (qualifying.length < 2) {
    return {
      sport,
      raceEffortHR,
      longestSustainedMinutes: null,
      projectedRaceMinutes,
      ratio: null,
      rating: 'insufficient',
    }
  }

  // Find longest sustained workout
  const longestSeconds = Math.max(
    ...qualifying.map((w) => w.duration_seconds || 0)
  )
  const longestSustainedMinutes = Math.round(longestSeconds / 60)

  const ratio = projectedRaceMinutes > 0
    ? Number((longestSustainedMinutes / projectedRaceMinutes).toFixed(2))
    : null

  let rating: SustainabilityResult['rating']
  if (ratio === null) rating = 'insufficient'
  else if (ratio >= 1.0) rating = 'proven'
  else if (ratio >= 0.75) rating = 'likely'
  else if (ratio >= 0.50) rating = 'questionable'
  else rating = 'unproven'

  return { sport, raceEffortHR, longestSustainedMinutes, projectedRaceMinutes, ratio, rating }
}
