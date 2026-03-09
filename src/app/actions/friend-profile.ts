'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { projectFinishTime } from '@/lib/social/race-projection'
import { computePercentiles } from '@/lib/social/percentile'
import type { FitnessSnapshotRow, FitnessPercentiles } from '@/lib/types/social'

export type FriendProfileData = {
  display_name: string
  username: string | null
  avatar_url: string | null
  percentiles: FitnessPercentiles | null
  races: {
    race_name: string
    race_date: string
    race_distance: string
    projected_sec: number | null
  }[]
  recentActivity: {
    id: string
    activity_type: string
    metadata: Record<string, unknown>
    created_at: string
  }[]
}

function toProjectionDistance(d: string): 'sprint' | 'olympic' | 'half' | 'full' {
  if (d === '70.3') return 'half'
  if (d === '140.6') return 'full'
  if (d === 'sprint' || d === 'olympic') return d as 'sprint' | 'olympic'
  return 'olympic'
}

export async function getFriendProfile(targetUserId: string): Promise<FriendProfileData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const service = createServiceClient()

  // Fetch the target's profile — gender/DOB used only server-side for percentile calc, never sent to client
  const { data: targetProfile } = await service
    .from('profiles')
    .select('display_name, username, avatar_url, profile_public, gender, date_of_birth')
    .eq('id', targetUserId)
    .single()

  if (!targetProfile) return null

  // Privacy gate: private profile requires an accepted follow from the viewer
  if (targetProfile.profile_public === false) {
    const { data: followRow } = await supabase
      .from('follows')
      .select('status')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle()

    if (followRow?.status !== 'accepted') return null
  }

  const today = new Date().toISOString().split('T')[0]

  const [{ data: races }, { data: snapshot }, { data: feedRows }] = await Promise.all([
    service
      .from('target_races')
      .select('race_name, race_date, race_distance, custom_swim_distance_m, custom_bike_distance_km, custom_run_distance_km')
      .eq('user_id', targetUserId)
      .eq('status', 'upcoming')
      .gte('race_date', today)
      .order('race_date', { ascending: true })
      .limit(5),
    service
      .from('fitness_snapshots')
      .select('*')
      .eq('user_id', targetUserId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .maybeSingle(),
    service
      .from('activity_feed')
      .select('id, activity_type, metadata, created_at')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  // Compute percentiles server-side — only the 0-100 scores reach the client, never raw thresholds
  const percentiles: FitnessPercentiles | null = snapshot
    ? await computePercentiles(
        snapshot as FitnessSnapshotRow,
        targetProfile.gender ?? null,
        targetProfile.date_of_birth ?? null
      )
    : null

  // Compute projected finish times server-side — raw snapshot never reaches client
  const projectedRaces = (races ?? []).map((race) => {
    let projected_sec: number | null = null
    if (snapshot) {
      const projRace = {
        distance: toProjectionDistance(race.race_distance),
        swim_m: (race as { custom_swim_distance_m?: number | null }).custom_swim_distance_m ?? null,
        bike_km: (race as { custom_bike_distance_km?: number | null }).custom_bike_distance_km ?? null,
        run_km: (race as { custom_run_distance_km?: number | null }).custom_run_distance_km ?? null,
      }
      projected_sec = projectFinishTime(projRace, snapshot as FitnessSnapshotRow)
    }
    return {
      race_name: race.race_name,
      race_date: race.race_date,
      race_distance: race.race_distance,
      projected_sec,
    }
  })

  return {
    display_name: targetProfile.display_name ?? 'Athlete',
    username: targetProfile.username ?? null,
    avatar_url: targetProfile.avatar_url ?? null,
    percentiles: percentiles && (percentiles.swim != null || percentiles.bike != null || percentiles.run != null)
      ? percentiles
      : null,
    races: projectedRaces,
    recentActivity: (feedRows ?? []).map((r) => ({
      id: r.id,
      activity_type: r.activity_type,
      metadata: r.metadata as Record<string, unknown>,
      created_at: r.created_at,
    })),
  }
}
