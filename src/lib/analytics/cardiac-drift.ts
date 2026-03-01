import type { Workout, SessionMetric } from '@/lib/types/database'

export interface CardiacDriftResult {
  sport: 'swim' | 'bike' | 'run'
  driftPct: number | null
  sampleSize: number
  rating: 'low' | 'moderate' | 'high' | 'insufficient'
}

const EIGHT_WEEKS_MS = 8 * 7 * 86_400_000

export function analyzeCardiacDrift(
  workouts: Workout[],
  sessionMetrics: Map<string, SessionMetric[]>,
  sport: 'swim' | 'bike' | 'run'
): CardiacDriftResult {
  const cutoff = Date.now() - EIGHT_WEEKS_MS
  const minDuration = sport === 'swim' ? 1800 : 2700 // 30min swim, 45min bike/run

  // Filter long workouts in the sport within 8 weeks
  const qualifying = workouts.filter(
    (w) =>
      w.sport === sport &&
      (w.duration_seconds || 0) >= minDuration &&
      new Date(w.date).getTime() >= cutoff
  )

  const drifts: number[] = []

  for (const workout of qualifying) {
    const metrics = sessionMetrics.get(workout.id)
    if (!metrics || metrics.length < 4) continue

    // Sort by timestamp offset
    const sorted = [...metrics]
      .filter((m) => m.heart_rate != null && m.heart_rate > 0)
      .sort((a, b) => a.timestamp_offset_seconds - b.timestamp_offset_seconds)

    if (sorted.length < 4) continue

    const mid = Math.floor(sorted.length / 2)
    const firstHalf = sorted.slice(0, mid)
    const secondHalf = sorted.slice(mid)

    const firstAvg = firstHalf.reduce((s, m) => s + m.heart_rate!, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((s, m) => s + m.heart_rate!, 0) / secondHalf.length

    if (firstAvg > 0) {
      const drift = ((secondAvg - firstAvg) / firstAvg) * 100
      drifts.push(drift)
    }
  }

  if (drifts.length < 2) {
    return { sport, driftPct: null, sampleSize: drifts.length, rating: 'insufficient' }
  }

  const avgDrift = Number((drifts.reduce((s, d) => s + d, 0) / drifts.length).toFixed(1))

  let rating: CardiacDriftResult['rating']
  if (avgDrift < 3) rating = 'low'
  else if (avgDrift <= 6) rating = 'moderate'
  else rating = 'high'

  return { sport, driftPct: avgDrift, sampleSize: drifts.length, rating }
}
