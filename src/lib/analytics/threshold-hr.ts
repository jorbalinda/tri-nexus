import type { Workout } from '@/lib/types/database'
import { estimateLTHR } from './race-pacing'

export interface ThresholdHRAssessment {
  sport: 'swim' | 'bike' | 'run'
  lthr: number
  lthrSource: 'profile' | 'derived'
  recentAvgHR: number | null
  ratio: number | null
  assessment: 'well_below' | 'below' | 'at' | 'above' | 'well_above' | 'insufficient'
}

const EIGHT_WEEKS_MS = 8 * 7 * 86_400_000

export function assessThresholdHR(
  workouts: Workout[],
  sport: 'swim' | 'bike' | 'run',
  profileLTHR: number | null
): ThresholdHRAssessment {
  // Determine LTHR source
  let lthr: number | null = profileLTHR
  let lthrSource: 'profile' | 'derived' = 'profile'

  if (!lthr) {
    lthr = estimateLTHR(workouts, sport)
    lthrSource = 'derived'
  }

  if (!lthr) {
    return {
      sport,
      lthr: 0,
      lthrSource: 'derived',
      recentAvgHR: null,
      ratio: null,
      assessment: 'insufficient',
    }
  }

  // Filter qualifying workouts: same sport, last 8 weeks, min duration, has avg_hr
  const cutoff = Date.now() - EIGHT_WEEKS_MS
  const minDuration = sport === 'swim' ? 600 : 1200 // 10min swim, 20min bike/run

  const qualifying = workouts.filter(
    (w) =>
      w.sport === sport &&
      w.avg_hr &&
      (w.duration_seconds || 0) >= minDuration &&
      new Date(w.date).getTime() >= cutoff
  )

  if (qualifying.length < 3) {
    return {
      sport,
      lthr,
      lthrSource,
      recentAvgHR: null,
      ratio: null,
      assessment: 'insufficient',
    }
  }

  // Compute mean avg_hr
  const sum = qualifying.reduce((s, w) => s + (w.avg_hr || 0), 0)
  const recentAvgHR = Math.round(sum / qualifying.length)
  const ratio = Number((recentAvgHR / lthr).toFixed(3))

  // Assessment bands
  let assessment: ThresholdHRAssessment['assessment']
  if (ratio < 0.80) assessment = 'well_below'
  else if (ratio <= 0.87) assessment = 'below'
  else if (ratio <= 0.95) assessment = 'at'
  else if (ratio <= 1.02) assessment = 'above'
  else assessment = 'well_above'

  return { sport, lthr, lthrSource, recentAvgHR, ratio, assessment }
}
