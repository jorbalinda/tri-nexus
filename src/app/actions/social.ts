'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { projectFinishTime } from '@/lib/social/race-projection'
import { computePercentiles } from '@/lib/social/percentile'
import { refreshFitnessSnapshot } from '@/lib/social/snapshot'
import { estimateCSSFromWorkouts, estimateFTPFromWorkouts } from '@/lib/analytics/race-pacing'
import type { LeaderboardEntry, FeedItem, FitnessPercentiles, FitnessSnapshotRow } from '@/lib/types/social'
import { newFollowerEmail } from '@/lib/email/templates'

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

  // Notify the target user — fire and forget, never block the follow
  ;(async () => {
    try {
      const [{ data: followerProfile }, { data: targetAuthUser }] = await Promise.all([
        service.from('profiles').select('display_name').eq('id', user.id).single(),
        service.auth.admin.getUserById(targetUserId),
      ])
      const targetEmail = targetAuthUser.user?.email
      if (!targetEmail) return
      const followerName = followerProfile?.display_name ?? 'Someone'
      const { data: targetProfile } = await service
        .from('profiles')
        .select('display_name')
        .eq('id', targetUserId)
        .single()
      const recipientName = targetProfile?.display_name ?? 'Athlete'
      const template = newFollowerEmail(recipientName, followerName, status === 'pending')
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({ from: 'Tri Race Day <noreply@triraceday.com>', to: targetEmail, subject: template.subject, html: template.html })
    } catch {
      // Non-critical — swallow errors so the follow itself is unaffected
    }
  })()

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

/** Search for users by display name, username, or email fragment — public profiles only */
export async function searchUsers(query: string): Promise<{ user_id: string; display_name: string; username: string | null; avatar_url: string | null; follow_status: 'accepted' | 'pending' | false }[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || query.trim().length < 2) return []

  const cleaned = query.trim().replace(/^@/, '').toLowerCase()
  const service = createServiceClient()

  // Search profiles by display_name or username (public profiles only)
  const { data: profileMatches } = await service
    .from('profiles')
    .select('id, display_name, username, avatar_url, profile_public')
    .or(`username.ilike.%${cleaned}%,display_name.ilike.%${cleaned}%`)
    .eq('profile_public', true)
    .neq('id', user.id)
    .limit(10)

  // Search auth users by email fragment — service admin only, email never returned to client
  const { data: { users: authUsers } } = await service.auth.admin.listUsers({ perPage: 1000 })
  const emailMatchIds = (authUsers ?? [])
    .filter((u) => u.email?.toLowerCase().includes(cleaned) && u.id !== user.id)
    .map((u) => u.id)

  // Fetch profiles for email matches not already found above
  const existingIds = new Set((profileMatches ?? []).map((p) => p.id))
  const newEmailIds = emailMatchIds.filter((id) => !existingIds.has(id))

  let emailProfiles: typeof profileMatches = []
  if (newEmailIds.length > 0) {
    const { data } = await service
      .from('profiles')
      .select('id, display_name, username, avatar_url, profile_public')
      .in('id', newEmailIds)
      .eq('profile_public', true)
      .neq('id', user.id)
    emailProfiles = data ?? []
  }

  const allResults = [...(profileMatches ?? []), ...emailProfiles].slice(0, 10)
  if (allResults.length === 0) return []

  // Check follow status for each result
  const { data: followingRows } = await supabase
    .from('follows')
    .select('following_id, status')
    .eq('follower_id', user.id)
    .in('following_id', allResults.map((r) => r.id))

  const followMap = Object.fromEntries((followingRows ?? []).map((f) => [f.following_id, f.status]))

  return allResults.map((r) => ({
    user_id: r.id,
    display_name: r.display_name ?? 'Athlete',
    username: r.username ?? null,
    avatar_url: r.avatar_url ?? null,
    follow_status: (followMap[r.id] as 'accepted' | 'pending') || false,
  }))
}

/** Compact race projections for the social page — my races + friends' projected times */
export type FriendRaceProjection = {
  raceId: string
  raceName: string
  raceDate: string
  raceDistance: string
  myProjected: number | null
  friends: { user_id: string; display_name: string; avatar_url: string | null; projected: number | null }[]
}

export async function getFriendsRaceProjections(): Promise<FriendRaceProjection[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const today = new Date().toISOString().split('T')[0]
  const since = new Date()
  since.setDate(since.getDate() - 90)
  const sinceStr = since.toISOString().split('T')[0]

  const [{ data: myRaces }, { data: workouts }, { data: profile }, { data: follows }] = await Promise.all([
    supabase.from('target_races').select('*').eq('user_id', user.id).eq('status', 'upcoming').gte('race_date', today).order('race_date', { ascending: true }).limit(5),
    supabase.from('workouts').select('*').eq('user_id', user.id).is('deleted_at', null).gte('date', sinceStr),
    supabase.from('profiles').select('ftp_watts, threshold_pace_run, max_heart_rate, display_name, avatar_url').eq('id', user.id).single(),
    supabase.from('follows').select('following_id').eq('follower_id', user.id).eq('status', 'accepted'),
  ])

  if (!myRaces || myRaces.length === 0) return []

  const { estimateCSSFromWorkouts: cssEst, estimateFTPFromWorkouts: ftpEst } = await import('@/lib/analytics/race-pacing')
  const { projectFinishTime } = await import('@/lib/social/race-projection')

  const css = cssEst(workouts ?? [], profile?.max_heart_rate ?? null)
  const ftp = profile?.ftp_watts ?? ftpEst(workouts ?? [])
  const recentRuns = (workouts ?? []).filter((w) => w.sport === 'run' && w.avg_pace_sec_per_km).slice(0, 5)
  const runPace = recentRuns.length
    ? recentRuns.reduce((s: number, w) => s + (w.avg_pace_sec_per_km as number), 0) / recentRuns.length
    : (profile?.threshold_pace_run ?? null)

  const mySnapshot = { id: '', user_id: user.id, snapshot_date: today, css_sec_per_100m: css, ftp_watts: ftp, run_pace_sec_per_km: runPace, ctl: null, atl: null, tsb: null, created_at: '', updated_at: '' }

  function toProjectionDistance(d: string): 'sprint' | 'olympic' | 'half' | 'full' {
    if (d === '70.3') return 'half'
    if (d === '140.6') return 'full'
    if (d === 'sprint' || d === 'olympic') return d
    return 'olympic'
  }

  const followedIds = (follows ?? []).map((f) => f.following_id)
  const service = createServiceClient()

  return Promise.all(
    myRaces.map(async (race) => {
      const projRace = { distance: toProjectionDistance(race.race_distance), swim_m: race.custom_swim_distance_m ?? null, bike_km: race.custom_bike_distance_km ?? null, run_km: race.custom_run_distance_km ?? null }
      const myProjected = projectFinishTime(projRace, mySnapshot)

      const friends: FriendRaceProjection['friends'] = []
      if (followedIds.length > 0) {
        const { data: friendRaces } = await service.from('target_races').select('user_id').in('user_id', followedIds).ilike('race_name', race.race_name).eq('race_date', race.race_date)
        for (const fr of friendRaces ?? []) {
          const [{ data: fp }, { data: snap }] = await Promise.all([
            service.from('profiles').select('display_name, avatar_url').eq('id', fr.user_id).single(),
            service.from('fitness_snapshots').select('*').eq('user_id', fr.user_id).order('snapshot_date', { ascending: false }).limit(1).maybeSingle(),
          ])
          friends.push({ user_id: fr.user_id, display_name: fp?.display_name ?? 'Athlete', avatar_url: fp?.avatar_url ?? null, projected: snap ? projectFinishTime(projRace, snap) : null })
        }
      }

      return { raceId: race.id, raceName: race.race_name, raceDate: race.race_date, raceDistance: race.race_distance, myProjected, friends }
    })
  )
}

/** Get the list of users the current user follows (accepted only) */
export async function getFollowingList(): Promise<{ user_id: string; display_name: string; username: string | null; avatar_url: string | null }[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)
    .eq('status', 'accepted')

  if (!follows || follows.length === 0) return []

  const service = createServiceClient()
  const { data: profiles } = await service
    .from('profiles')
    .select('id, display_name, username, avatar_url')
    .in('id', follows.map((f) => f.following_id))

  return (profiles ?? []).map((p) => ({
    user_id: p.id,
    display_name: p.display_name ?? 'Athlete',
    username: p.username ?? null,
    avatar_url: p.avatar_url ?? null,
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
