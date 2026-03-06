import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { projectFinishTime, formatFinishTime } from '@/lib/social/race-projection'
import { estimateCSSFromWorkouts, estimateFTPFromWorkouts } from '@/lib/analytics/race-pacing'
import type { FitnessSnapshotRow } from '@/lib/types/social'
import type { TargetRace } from '@/lib/types/target-race'

export const metadata = { title: 'Race Projections | Race Day' }

const DISTANCE_LABEL: Record<string, string> = {
  sprint:  'Sprint',
  olympic: 'Olympic',
  '70.3':  'Half (70.3)',
  '140.6': 'Full (Ironman)',
  custom:  'Custom',
}

// Map target_races distance to projection engine format
function toProjectionDistance(d: string): 'sprint' | 'olympic' | 'half' | 'full' {
  if (d === '70.3')  return 'half'
  if (d === '140.6') return 'full'
  if (d === 'sprint' || d === 'olympic') return d
  return 'olympic'
}

export default async function RacesLeaderboardPage() {
  const supabase = await createClient()
  const service = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const today = new Date().toISOString().split('T')[0]

  // Fetch user's own upcoming races from target_races
  const { data: myRaces } = await supabase
    .from('target_races')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'upcoming')
    .gte('race_date', today)
    .order('race_date', { ascending: true })

  // Fetch fitness metrics to project finish times
  const since = new Date()
  since.setDate(since.getDate() - 90)

  const [{ data: workouts }, { data: profile }] = await Promise.all([
    supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .gte('date', since.toISOString().split('T')[0]),
    // Own profile — use regular client (RLS: user reads own row)
    supabase
      .from('profiles')
      .select('ftp_watts, threshold_pace_run, max_heart_rate, display_name, avatar_url')
      .eq('id', user.id)
      .single(),
  ])

  // Build fitness snapshot inline
  const css  = estimateCSSFromWorkouts(workouts ?? [], profile?.max_heart_rate ?? null)
  const ftp  = profile?.ftp_watts ?? estimateFTPFromWorkouts(workouts ?? [])
  const recentRuns = (workouts ?? []).filter((w) => w.sport === 'run' && w.avg_pace_sec_per_km).slice(0, 5)
  const runPace = recentRuns.length
    ? recentRuns.reduce((s: number, w) => s + (w.avg_pace_sec_per_km as number), 0) / recentRuns.length
    : (profile?.threshold_pace_run ?? null)

  const snapshot: FitnessSnapshotRow = {
    id: '', user_id: user.id,
    snapshot_date: today,
    css_sec_per_100m: css,
    ftp_watts: ftp,
    run_pace_sec_per_km: runPace,
    ctl: null, atl: null, tsb: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Fetch followed users who have the same races (by race_name match)
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followedIds = (follows ?? []).map((f) => f.following_id)

  // For each of my races, find followed users with same race name
  type RaceWithFriends = {
    race: TargetRace
    projected: number | null
    friends: { user_id: string; display_name: string; avatar_url: string | null; projected: number | null }[]
  }

  const racesWithProjections: RaceWithFriends[] = await Promise.all(
    (myRaces ?? []).map(async (race: TargetRace) => {
      const projRace = {
        distance: toProjectionDistance(race.race_distance),
        swim_m: race.custom_swim_distance_m ?? null,
        bike_km: race.custom_bike_distance_km ?? null,
        run_km: race.custom_run_distance_km ?? null,
      }
      const projected = projectFinishTime(projRace, snapshot)

      // Find friends racing the same event — use service client to read
      // cross-user data server-side (display_name, snapshots).
      // No sensitive fields (biometrics, thresholds) are sent to the browser.
      const friends: RaceWithFriends['friends'] = []
      if (followedIds.length > 0) {
        const { data: friendRaces } = await service
          .from('target_races')
          .select('user_id')
          .in('user_id', followedIds)
          .ilike('race_name', race.race_name)
          .eq('race_date', race.race_date)

        for (const fr of friendRaces ?? []) {
          // Fetch only the two display fields — nothing sensitive
          const { data: fp } = await service
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', fr.user_id)
            .single()

          const { data: friendSnap } = await service
            .from('fitness_snapshots')
            .select('*')
            .eq('user_id', fr.user_id)
            .order('snapshot_date', { ascending: false })
            .limit(1)
            .maybeSingle()

          const friendProjected = friendSnap ? projectFinishTime(projRace, friendSnap) : null
          friends.push({
            user_id: fr.user_id,
            display_name: fp?.display_name ?? 'Athlete',
            avatar_url: fp?.avatar_url ?? null,
            projected: friendProjected,
          })
        }
      }

      return { race, projected, friends }
    })
  )

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Race Projections</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Projected finish times for your upcoming races
        </p>
      </div>

      {racesWithProjections.length === 0 ? (
        <div className="card-squircle p-6 text-center space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No upcoming races</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Add races on the{' '}
            <a href="/dashboard/races" className="text-blue-500 hover:underline">Races page</a>
            {' '}and your projected finish times will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {racesWithProjections.map(({ race, projected, friends }) => {
            // Build leaderboard: me + friends, sorted by projected time
            const entries = [
              {
                user_id: user.id,
                display_name: profile?.display_name ?? 'You',
                avatar_url: profile?.avatar_url ?? null,
                projected,
                goal: race.goal_time_seconds ?? null,
                isMe: true,
              },
              ...friends.map((f) => ({
                user_id: f.user_id,
                display_name: f.display_name,
                avatar_url: f.avatar_url,
                projected: f.projected,
                goal: null,
                isMe: false,
              })),
            ].sort((a, b) => {
              if (a.projected == null) return 1
              if (b.projected == null) return -1
              return a.projected - b.projected
            })

            return (
              <div key={race.id} className="card-squircle p-4 sm:p-6 space-y-4">
                {/* Race header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {race.race_name}
                      </h3>
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                        {DISTANCE_LABEL[race.race_distance] ?? race.race_distance}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Date(race.race_date + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Leaderboard entries */}
                <div className="space-y-2">
                  {entries.map((entry, idx) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        entry.isMe
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/50'
                          : 'bg-gray-50/50 dark:bg-gray-800/30'
                      }`}
                    >
                      <span className={`w-5 text-center text-xs font-bold ${
                        idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-gray-400'
                      }`}>{idx + 1}</span>

                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-blue-600 dark:text-blue-400 overflow-hidden">
                        {entry.avatar_url
                          ? <Image src={entry.avatar_url} alt={entry.display_name} width={32} height={32} className="w-full h-full object-cover" unoptimized />
                          : entry.display_name.charAt(0).toUpperCase()
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${entry.isMe ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                          {entry.display_name}{entry.isMe && <span className="ml-1 text-xs text-blue-400">(you)</span>}
                        </p>
                      </div>

                      <div className="text-right">
                        {entry.projected ? (
                          <>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                              {formatFinishTime(entry.projected)}
                            </p>
                            <p className="text-[10px] text-gray-400">projected</p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-400">No data</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {friends.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Follow athletes racing this event to compare projected times.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
