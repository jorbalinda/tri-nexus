/**
 * Reveal Engine
 * Determines if a race projection should be revealed (race week = 7 days before).
 * Checks eligibility: minimum workouts, minimum confidence.
 */

import type { RaceProjection } from '@/lib/types/projection'
import type { TargetRace } from '@/lib/types/target-race'
import type { Workout } from '@/lib/types/database'

export interface RevealEligibility {
  eligible: boolean
  reason: string
  daysUntilRace: number
  isRaceWeek: boolean
  workoutCount8Weeks: number
  confidenceScore: number
}

/**
 * Check if a projection is eligible for reveal.
 * Requirements:
 * - Race within 7 days
 * - At least 20 workouts in the last 8 weeks
 * - Confidence score >= 40
 */
export function checkRevealEligibility(
  race: TargetRace,
  projection: RaceProjection | null,
  workouts: Workout[]
): RevealEligibility {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const raceDate = new Date(race.race_date)
  raceDate.setHours(0, 0, 0, 0)
  const daysUntilRace = Math.ceil((raceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isRaceWeek = daysUntilRace >= 0 && daysUntilRace <= 7

  // Count workouts in last 8 weeks
  const eightWeeksAgo = new Date()
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)
  const recentWorkouts = workouts.filter((w) => new Date(w.date) >= eightWeeksAgo)
  const workoutCount8Weeks = recentWorkouts.length

  const confidenceScore = projection?.confidence_score ?? 0

  if (!isRaceWeek) {
    return {
      eligible: false,
      reason: `Race week starts in ${Math.max(0, daysUntilRace - 7)} days`,
      daysUntilRace,
      isRaceWeek,
      workoutCount8Weeks,
      confidenceScore,
    }
  }

  if (workoutCount8Weeks < 20) {
    return {
      eligible: false,
      reason: `Need at least 20 workouts in 8 weeks (have ${workoutCount8Weeks})`,
      daysUntilRace,
      isRaceWeek,
      workoutCount8Weeks,
      confidenceScore,
    }
  }

  if (confidenceScore < 40) {
    return {
      eligible: false,
      reason: `Confidence too low (${confidenceScore}%, need 40%+)`,
      daysUntilRace,
      isRaceWeek,
      workoutCount8Weeks,
      confidenceScore,
    }
  }

  return {
    eligible: true,
    reason: 'Your projection is ready to reveal!',
    daysUntilRace,
    isRaceWeek,
    workoutCount8Weeks,
    confidenceScore,
  }
}
