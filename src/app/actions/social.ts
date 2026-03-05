'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { projectFinishTime } from '@/lib/social/race-projection'
import { computePercentiles } from '@/lib/social/percentile'
import { refreshFitnessSnapshot } from '@/lib/social/snapshot'
import { estimateCSSFromWorkouts, estimateFTPFromWorkouts } from '@/lib/analytics/race-pacing'
import type { LeaderboardEntry, FeedItem, FitnessPercentiles, FitnessSnapshotRow } from '@/lib/types/social'

/** Follow a user — auto-accepted if their account is public, pending if private */
export async function followUser(targetUserId: string): Promise<{ error?: string; status?: 'accepted' | 'pending' }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check if target account is public (service client to read their profile)
  const service = createServiceClient()
  const { data: targetProfile } = await service
    .from('profiles')
    .select('profile_public')
    .eq('id', targetUserId)
    .single()

  const status = targetProfile?.profile_public !== false ? 'accepted' : 'pending'

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: targetUserId, status })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/social')
  return { status }
}

/** Unfollow or cancel a follow request */
export async function unfollowUser(targetUserId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/social')
  return {}
}

/** Check if the current user follows a target (returns status) */
export async function isFollowing(targetUserId: string): Promise<'accepted' | 'pending' | false> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('follows')
    .select('status')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  return (data?.status as 'accepted' | 'pending') || false
}

/** Get incoming pending follow requests for the current user */
export async function getPendingFollowRequests(): Promise<{ follower_id: string; display_name: string; username: string | null; avatar_url: string | null; created_at: string }[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: pending } = await supabase
    .from('follows')
    .select('follower_id, created_at')
    .eq('following_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (!pending || pending.length === 0) return []

  const service = createServiceClient()
  const { data: profiles } = await service
    .from('profiles')
    .select('id, display_name, username, avatar_url')
    .in('id', pending.map((p) => p.follower_id))

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  return pending.map((p) => ({
    follower_id: p.follower_id,
    display_name: profileMap[p.follower_id]?.display_name ?? 'Athlete',
    username: profileMap[p.follower_id]?.username ?? null,
    avatar_url: profileMap[p.follower_id]?.avatar_url ?? null,
    created_at: p.created_at,
  }))
}

/** Accept a pending follow request */
export async function acceptFollowRequest(followerId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('follows')
    .update({ status: 'accepted' })
    .eq('follower_id', followerId)
    .eq('following_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/social')
  return {}
}

/** Reject (delete) a pending follow request */
export async function rejectFollowRequest(followerId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/social')
  return {}
}

/** Get the social activity feed for the current user (own + followed) */
export async function getSocialFeed(limit = 20): Promise<FeedItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Fetch feed rows the user is allowed to see (via RLS)
  const { data: feedRows } = await supabase
    .from('activity_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!feedRows || feedRows.length === 0) return []

  // Fetch only display_name + avatar_url for feed authors via service client
  // (only safe public fields — no sensitive data sent to browser)
  const service = createServiceClient()
  const authorIds = [...new Set(feedRows.map((r) => r.user_id))]
  const { data: profiles } = await service
    .from('profiles')
    .select('id, display_name, username, avatar_url')
    .in('id', authorIds)

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  return feedRows.map((row) => ({
    ...row,
    profile: {
      display_name: profileMap[row.user_id]?.display_name ?? null,
      username: profileMap[row.user_id]?.username ?? null,
      avatar_url: profileMap[row.user_id]?.avatar_url ?? null,
    },
  })) as FeedItem[]
}

/** Get leaderboard for a race — everyone registered for that race with projections */
export async function getRaceLeaderboard(raceId: string): Promise<LeaderboardEntry[]> {
  const supabase = await createClient()

  // Get all participants registered for this race
  const { data: registrations } = await supabase
    .from('user_target_races')
    .select('user_id, goal_finish_sec, profiles(display_name, avatar_url)')
    .eq('race_id', raceId)

  if (!registrations || registrations.length === 0) return []

  // Get the race details for projection
  const { data: race } = await supabase
    .from('races_catalogue')
    .select('*')
    .eq('id', raceId)
    .single()

  if (!race) return []

  // Build leaderboard entries
  const entries: LeaderboardEntry[] = []

  for (const reg of registrations) {
    const profile = Array.isArray(reg.profiles)
      ? (reg.profiles[0] ?? null)
      : (reg.profiles ?? null)

    // Get latest fitness snapshot for this user
    const { data: snapshot } = await supabase
      .from('fitness_snapshots')
      .select('*')
      .eq('user_id', reg.user_id)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    const projected = snapshot ? projectFinishTime(race, snapshot) : null

    entries.push({
      user_id: reg.user_id,
      display_name: profile?.display_name ?? 'Athlete',
      username: (profile as { username?: string | null })?.username ?? null,
      avatar_url: profile?.avatar_url ?? null,
      projected_finish_sec: projected,
      goal_finish_sec: reg.goal_finish_sec ?? null,
      snapshot: snapshot ?? null,
    })
  }

  // Sort by projected finish time (fastest first), nulls last
  return entries.sort((a, b) => {
    if (a.projected_finish_sec == null) return 1
    if (b.projected_finish_sec == null) return -1
    return a.projected_finish_sec - b.projected_finish_sec
  })
}

/** Get fitness percentiles for the current user, computed directly from workouts + profile */
export async function getMyFitnessPercentiles(): Promise<FitnessPercentiles | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('gender, date_of_birth, ftp_watts, threshold_pace_run, max_heart_rate')
    .eq('id', user.id)
    .single()

  // Fetch recent 90 days of workouts
  const since = new Date()
  since.setDate(since.getDate() - 90)
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: false })

  if (!workouts || workouts.length === 0) return null

  // ── Compute metrics directly from workouts ──────────────────────────────────
  const css = estimateCSSFromWorkouts(workouts, profile?.max_heart_rate ?? null)

  const ftp = profile?.ftp_watts ?? estimateFTPFromWorkouts(workouts)

  const recentRuns = workouts
    .filter((w) => w.sport === 'run' && w.avg_pace_sec_per_km)
    .slice(0, 5)
  const runPace = recentRuns.length
    ? recentRuns.reduce((s, w) => s + (w.avg_pace_sec_per_km as number), 0) / recentRuns.length
    : (profile?.threshold_pace_run ?? null)

  // Need at least one metric to show the chart
  if (!css && !ftp && !runPace) return null

  // Build a synthetic snapshot row for percentile computation
  const syntheticSnapshot: FitnessSnapshotRow = {
    id: '',
    user_id: user.id,
    snapshot_date: new Date().toISOString().split('T')[0],
    css_sec_per_100m: css,
    ftp_watts: ftp,
    run_pace_sec_per_km: runPace,
    ctl: null,
    atl: null,
    tsb: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Also upsert to snapshot table in background for leaderboard use
  refreshFitnessSnapshot(user.id).catch(console.error)

  return computePercentiles(
    syntheticSnapshot,
    profile?.gender ?? null,
    profile?.date_of_birth ?? null
  )
}

/** Search for users by @username */
export async function searchUsers(query: string): Promise<{ user_id: string; display_name: string; username: string | null; avatar_url: string | null; follow_status: 'accepted' | 'pending' | false }[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || query.trim().length < 2) return []

  // Strip leading @ if user typed it
  const cleaned = query.trim().replace(/^@/, '')

  // Use service client to search by username — only safe public fields returned
  const service = createServiceClient()
  const { data: results } = await service
    .from('profiles')
    .select('id, display_name, username, avatar_url')
    .ilike('username', `%${cleaned}%`)
    .neq('id', user.id)
    .limit(10)

  if (!results || results.length === 0) return []

  // Check follow status for each result
  const { data: followingRows } = await supabase
    .from('follows')
    .select('following_id, status')
    .eq('follower_id', user.id)
    .in('following_id', results.map((r) => r.id))

  const followMap = Object.fromEntries((followingRows ?? []).map((f) => [f.following_id, f.status]))

  return results.map((r) => ({
    user_id: r.id,
    display_name: r.display_name ?? 'Athlete',
    username: r.username ?? null,
    avatar_url: r.avatar_url ?? null,
    follow_status: (followMap[r.id] as 'accepted' | 'pending') || false,
  }))
}

/** Register current user for a race in the catalogue */
export async function registerForRace(
  raceId: string,
  goalFinishSec?: number
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_target_races')
    .upsert(
      { user_id: user.id, race_id: raceId, goal_finish_sec: goalFinishSec ?? null },
      { onConflict: 'user_id,race_id' }
    )

  if (error) return { error: error.message }
  revalidatePath('/dashboard/social/races')
  return {}
}
