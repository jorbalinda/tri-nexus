import type { Workout } from '@/lib/types/database'
import type { ManualLog } from '@/lib/types/database'
import { calculateTSB } from './training-stress'
import { detectCNSFatigue, lifeStressImpact } from './cns-fatigue'

/**
 * Daily Readiness Score (0-100)
 *
 * Weighted composite:
 * - TSB (Training Stress Balance): 30%
 * - HRV: 25%
 * - Sleep Quality: 20%
 * - Life Stress: 15%
 * - CNS Status: 10%
 */
export function calculateReadiness(
  workouts: Workout[],
  logs: ManualLog[]
): {
  score: number
  breakdown: {
    tsb: number
    hrv: number
    sleep: number
    stress: number
    cns: number
  }
} {
  // TSB component (30%)
  const tsb = calculateTSB(workouts)
  // Map TSB range [-30, +30] to [0, 100]
  const tsbScore = Math.max(0, Math.min(100, ((tsb + 30) / 60) * 100))

  // HRV component (25%)
  const hrvLogs = logs
    .filter((l) => l.log_type === 'morning_hrv')
    .sort((a, b) => b.date.localeCompare(a.date))
  let hrvScore = 70 // default
  if (hrvLogs.length >= 2) {
    const recent = hrvLogs[0].value
    const baseline = hrvLogs.slice(0, 7).reduce((s, l) => s + l.value, 0) / Math.min(hrvLogs.length, 7)
    // If recent HRV is above baseline, good
    hrvScore = Math.max(0, Math.min(100, (recent / baseline) * 70))
  }

  // Sleep component (20%)
  const sleepLogs = logs
    .filter((l) => l.log_type === 'sleep_quality')
    .sort((a, b) => b.date.localeCompare(a.date))
  const sleepScore = sleepLogs.length > 0
    ? Math.min(100, sleepLogs[0].value * 10)
    : 70

  // Life Stress component (15%) — inverted, lower stress = better
  const stressAvg = lifeStressImpact(logs)
  const stressScore = stressAvg !== null
    ? Math.max(0, 100 - stressAvg * 10)
    : 60

  // CNS component (10%)
  const cns = detectCNSFatigue(workouts)
  const cnsScore = cns.status === 'optimal' ? 100 : cns.status === 'warning' ? 50 : 20

  const score = Math.round(
    tsbScore * 0.3 +
    hrvScore * 0.25 +
    sleepScore * 0.2 +
    stressScore * 0.15 +
    cnsScore * 0.1
  )

  return {
    score: Math.max(0, Math.min(100, score)),
    breakdown: {
      tsb: Math.round(tsbScore),
      hrv: Math.round(hrvScore),
      sleep: Math.round(sleepScore),
      stress: Math.round(stressScore),
      cns: Math.round(cnsScore),
    },
  }
}

export function readinessLabel(score: number): string {
  if (score >= 80) return 'Ready to perform'
  if (score >= 60) return 'Moderate — train normally'
  if (score >= 40) return 'Low — easy day recommended'
  return 'Rest day recommended'
}

export function readinessColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}
