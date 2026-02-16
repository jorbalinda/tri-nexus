import type { Workout } from '@/lib/types/database'
import type { ManualLog } from '@/lib/types/database'

/**
 * CNS Fatigue Detection
 *
 * Flags when RPE ≥ 7 but HR stays in Zone 1-2 (RPE-HR dissociation).
 * This indicates central nervous system fatigue — the brain perceives
 * high effort but the cardiovascular system isn't stressed.
 *
 * Zone 1-2 typically < 75% of max HR. We estimate max HR as 220 - age,
 * defaulting to max HR 185 if unknown.
 */

interface CNSResult {
  status: 'optimal' | 'warning' | 'fatigued'
  label: string
  description: string
  flaggedWorkouts: Workout[]
}

export function detectCNSFatigue(
  workouts: Workout[],
  maxHrEstimate: number = 185
): CNSResult {
  const zone2Ceiling = maxHrEstimate * 0.75

  // Look at recent workouts (last 7 days)
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const recentWorkouts = workouts.filter(
    (w) => new Date(w.date) >= sevenDaysAgo
  )

  // Flag workouts with high RPE but low HR
  const flagged = recentWorkouts.filter((w) => {
    if (!w.rpe || !w.avg_hr) return false
    return w.rpe >= 7 && w.avg_hr < zone2Ceiling
  })

  if (flagged.length >= 3) {
    return {
      status: 'fatigued',
      label: 'CNS Fatigued',
      description: `${flagged.length} sessions with high RPE / low HR in 7 days`,
      flaggedWorkouts: flagged,
    }
  }

  if (flagged.length >= 1) {
    return {
      status: 'warning',
      label: 'Monitor CNS',
      description: `${flagged.length} session(s) showing RPE-HR dissociation`,
      flaggedWorkouts: flagged,
    }
  }

  return {
    status: 'optimal',
    label: 'Optimal',
    description: 'Recovery on track',
    flaggedWorkouts: [],
  }
}

/**
 * Check if life stress is compounding CNS fatigue
 */
export function lifeStressImpact(logs: ManualLog[]): number | null {
  const stressLogs = logs.filter((l) => l.log_type === 'life_stress')
  if (stressLogs.length === 0) return null

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recent = stressLogs.filter((l) => new Date(l.date) >= sevenDaysAgo)

  if (recent.length === 0) return null
  return Number(
    (recent.reduce((sum, l) => sum + l.value, 0) / recent.length).toFixed(1)
  )
}
