import type { RaceProjection } from '@/lib/types/projection'

/**
 * Check if a projection is stale and needs recalculation.
 * Stale if: >24h old, or >6h old during race week.
 */
export function isProjectionStale(
  projection: RaceProjection | null,
  raceDate: string
): boolean {
  if (!projection) return true

  const projectedAt = new Date(projection.projected_at)
  const now = new Date()
  const hoursSinceProjection = (now.getTime() - projectedAt.getTime()) / (1000 * 60 * 60)

  // During race week (7 days before), recalc more often
  const raceDateObj = new Date(raceDate)
  const daysUntilRace = (raceDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  const isRaceWeek = daysUntilRace >= 0 && daysUntilRace <= 7

  if (isRaceWeek) {
    return hoursSinceProjection > 6
  }

  return hoursSinceProjection > 24
}

/**
 * Check if race is within reveal window (7 days).
 */
export function isRevealEligible(raceDate: string): boolean {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const race = new Date(raceDate)
  race.setHours(0, 0, 0, 0)
  const daysUntil = (race.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return daysUntil >= 0 && daysUntil <= 7
}
