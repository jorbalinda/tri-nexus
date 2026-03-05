export type FollowRow = {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export type ActivityFeedRow = {
  id: string
  user_id: string
  activity_type: 'swim' | 'bike' | 'run' | 'brick' | 'race_registered' | 'pr'
  workout_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type FitnessSnapshotRow = {
  id: string
  user_id: string
  snapshot_date: string
  css_sec_per_100m: number | null
  ftp_watts: number | null
  run_pace_sec_per_km: number | null
  ctl: number | null
  atl: number | null
  tsb: number | null
  created_at: string
  updated_at: string
}

export type AgeGroupBenchmarkRow = {
  id: string
  gender: 'male' | 'female' | 'other'
  age_group: string
  discipline: 'swim' | 'bike' | 'run'
  p25: number | null
  p50: number | null
  p75: number | null
  p90: number | null
  unit: string
  updated_at: string
}

export type RacesCatalogueRow = {
  id: string
  name: string
  location: string | null
  country_code: string | null
  race_date: string | null
  distance: 'sprint' | 'olympic' | 'half' | 'full'
  swim_m: number | null
  bike_km: number | null
  run_km: number | null
  website_url: string | null
  created_at: string
}

export type UserTargetRaceRow = {
  id: string
  user_id: string
  race_id: string
  goal_finish_sec: number | null
  registered_at: string
}

/** Computed percentile scores for radar chart (0–100 each) */
export type FitnessPercentiles = {
  swim: number | null
  bike: number | null
  run: number | null
}

/** Leaderboard entry for a race */
export type LeaderboardEntry = {
  user_id: string
  display_name: string
  username: string | null
  avatar_url: string | null
  projected_finish_sec: number | null
  goal_finish_sec: number | null
  snapshot: FitnessSnapshotRow | null
}

/** Activity feed item enriched with profile data */
export type FeedItem = ActivityFeedRow & {
  profile: {
    display_name: string | null
    username: string | null
    avatar_url: string | null
  }
}
