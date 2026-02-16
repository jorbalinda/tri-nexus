import type { Workout } from '@/lib/types/database'

/**
 * Efficiency Factor = Normalized Power / Avg HR
 * Tracks aerobic engine growth over time.
 * Higher EF = more output per heartbeat = better aerobic fitness.
 */
export function calculateEF(workout: Workout): number | null {
  const power = workout.normalized_power || workout.avg_power_watts
  const hr = workout.avg_hr

  if (!power || !hr || hr === 0) return null
  return Number((power / hr).toFixed(2))
}

/**
 * For run: EF = speed (m/s) / Avg HR
 * Convert pace (sec/km) to speed (m/s)
 */
export function calculateRunEF(workout: Workout): number | null {
  const pace = workout.avg_pace_sec_per_km
  const hr = workout.avg_hr

  if (!pace || !hr || hr === 0 || pace === 0) return null
  const speedMps = 1000 / pace
  return Number((speedMps / hr * 100).toFixed(2))
}

/**
 * For swim: EF = speed (m/s) / Avg HR
 */
export function calculateSwimEF(workout: Workout): number | null {
  const distance = workout.distance_meters
  const duration = workout.duration_seconds
  const hr = workout.avg_hr

  if (!distance || !duration || !hr || hr === 0 || duration === 0) return null
  const speedMps = distance / duration
  return Number((speedMps / hr * 100).toFixed(2))
}

/**
 * Get EF for any workout based on sport type
 */
export function getEF(workout: Workout): number | null {
  switch (workout.sport) {
    case 'bike':
      return calculateEF(workout)
    case 'run':
      return calculateRunEF(workout)
    case 'swim':
      return calculateSwimEF(workout)
    default:
      return null
  }
}

/**
 * Calculate EF trend (% change) from an array of workouts
 * Compares latest 30 days vs previous 30 days
 */
export function efTrend(workouts: Workout[]): number | null {
  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date))
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const recent = sorted.filter((w) => new Date(w.date) >= thirtyDaysAgo)
  const previous = sorted.filter(
    (w) => new Date(w.date) >= sixtyDaysAgo && new Date(w.date) < thirtyDaysAgo
  )

  const recentEFs = recent.map(getEF).filter((ef): ef is number => ef !== null)
  const previousEFs = previous.map(getEF).filter((ef): ef is number => ef !== null)

  if (recentEFs.length === 0 || previousEFs.length === 0) return null

  const recentAvg = recentEFs.reduce((a, b) => a + b, 0) / recentEFs.length
  const previousAvg = previousEFs.reduce((a, b) => a + b, 0) / previousEFs.length

  if (previousAvg === 0) return null
  return Number((((recentAvg - previousAvg) / previousAvg) * 100).toFixed(1))
}
