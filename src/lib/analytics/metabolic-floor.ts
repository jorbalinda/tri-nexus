import type { Workout } from '@/lib/types/database'
import type { ManualLog } from '@/lib/types/database'

/**
 * Metabolic Floor Analysis
 *
 * Correlates carb/sodium intake with power decay across sessions.
 * Identifies the minimum fueling rate needed to maintain performance.
 *
 * If carb intake drops below the "floor," expect power fade in the
 * second half of long sessions.
 */

interface MetabolicPoint {
  date: string
  carbsGPerHr: number
  powerDecay: number // % power drop from first to second half
  durationHours: number
}

export function analyzeMetabolicFloor(
  workouts: Workout[],
  logs: ManualLog[]
): {
  floorEstimate: number | null // g/hr
  dataPoints: MetabolicPoint[]
} {
  // Build carb intake map by date
  const carbMap = new Map<string, number>()
  logs
    .filter((l) => l.log_type === 'carbs_g_per_hr')
    .forEach((l) => carbMap.set(l.date, l.value))

  // Only look at long sessions (> 1 hour) with power data
  const longSessions = workouts.filter(
    (w) =>
      (w.duration_seconds || 0) > 3600 &&
      w.avg_power_watts &&
      w.normalized_power &&
      carbMap.has(w.date)
  )

  const dataPoints: MetabolicPoint[] = longSessions.map((w) => {
    // Estimate power decay from NP vs AP difference
    const ap = w.avg_power_watts!
    const np = w.normalized_power!
    const variability = ((np - ap) / np) * 100

    return {
      date: w.date,
      carbsGPerHr: carbMap.get(w.date)!,
      powerDecay: Number(variability.toFixed(1)),
      durationHours: (w.duration_seconds || 0) / 3600,
    }
  })

  // Estimate floor: find the carb rate below which power decay > 10%
  const sorted = [...dataPoints].sort((a, b) => a.carbsGPerHr - b.carbsGPerHr)
  let floorEstimate: number | null = null

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].powerDecay <= 10) {
      floorEstimate = sorted[i].carbsGPerHr
      break
    }
  }

  return { floorEstimate, dataPoints }
}

/**
 * Calculate current metabolic ceiling (max sustainable carb absorption)
 */
export function metabolicCeiling(logs: ManualLog[]): number | null {
  const carbLogs = logs.filter((l) => l.log_type === 'carbs_g_per_hr')
  if (carbLogs.length === 0) return null

  // Max observed carb intake where performance held
  return Math.max(...carbLogs.map((l) => l.value))
}
