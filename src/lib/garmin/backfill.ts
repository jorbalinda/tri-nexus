/**
 * Backfill 90 days of historical Garmin activities on first connection.
 */

import { getActivities } from './client'
import { syncGarminActivities } from './sync'

export async function backfillGarminActivities(
  userId: string,
  accessToken: string,
  tokenSecret: string
) {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const activities = await getActivities(accessToken, tokenSecret, startDate, endDate)
  if (!Array.isArray(activities) || activities.length === 0) {
    return { synced: 0, skipped: 0 }
  }

  return syncGarminActivities(userId, activities)
}
