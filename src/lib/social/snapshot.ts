import { createClient } from '@/lib/supabase/server'
import { estimateCSSFromWorkouts, estimateFTPFromWorkouts } from '@/lib/analytics/race-pacing'

/** Refresh (upsert) the fitness snapshot for a user based on recent workouts */
export async function refreshFitnessSnapshot(userId: string): Promise<void> {
  const supabase = await createClient()

  // Fetch recent 90 days of workouts
  const since = new Date()
  since.setDate(since.getDate() - 90)

  const { data: workouts, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: false })

  if (error || !workouts || workouts.length === 0) return

  // Fetch profile for max HR + FTP + thresholds
  const { data: profile } = await supabase
    .from('profiles')
    .select('max_heart_rate, ftp_watts, threshold_pace_run')
    .eq('id', userId)
    .single()

  // ── CSS ─────────────────────────────────────────────────────────────────────
  const css = estimateCSSFromWorkouts(workouts, profile?.max_heart_rate ?? null)

  // ── FTP ─────────────────────────────────────────────────────────────────────
  // Prefer profile FTP (user-set), fall back to estimating from power workouts
  const ftpWatts = profile?.ftp_watts ?? estimateFTPFromWorkouts(workouts)

  // ── Run Pace ────────────────────────────────────────────────────────────────
  // Compute from recent run workouts avg pace
  const recentRuns = workouts
    .filter((w) => w.sport === 'run' && w.avg_pace_sec_per_km)
    .slice(0, 5)
  const runPace = recentRuns.length
    ? recentRuns.reduce((s: number, w: { avg_pace_sec_per_km: number }) => s + w.avg_pace_sec_per_km, 0) / recentRuns.length
    : (profile?.threshold_pace_run ?? null)

  // ── CTL / ATL / TSB ─────────────────────────────────────────────────────────
  // Pull latest training load from workouts TSS
  // Simple EWMA calculation
  const allWorkouts = await supabase
    .from('workouts')
    .select('date, tss')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .not('tss', 'is', null)
    .order('date', { ascending: true })

  let ctl = 0
  let atl = 0
  const ctlDecay = 1 - 1 / 42
  const atlDecay = 1 - 1 / 7

  if (allWorkouts.data) {
    // Build daily TSS map
    const dailyTss: Record<string, number> = {}
    for (const w of allWorkouts.data) {
      const d = w.date.split('T')[0]
      dailyTss[d] = (dailyTss[d] ?? 0) + (w.tss ?? 0)
    }

    // Walk through days and apply EWMA
    const dates = Object.keys(dailyTss).sort()
    for (const d of dates) {
      const tss = dailyTss[d] ?? 0
      ctl = ctl * ctlDecay + tss * (1 - ctlDecay)
      atl = atl * atlDecay + tss * (1 - atlDecay)
    }
  }

  const tsb = ctl - atl

  await supabase.from('fitness_snapshots').upsert(
    {
      user_id: userId,
      snapshot_date: new Date().toISOString().split('T')[0],
      css_sec_per_100m: css,
      ftp_watts: ftpWatts,
      run_pace_sec_per_km: runPace,
      ctl: Math.round(ctl * 10) / 10,
      atl: Math.round(atl * 10) / 10,
      tsb: Math.round(tsb * 10) / 10,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,snapshot_date' }
  )
}

/** Post a workout to the activity feed */
export async function postActivityToFeed(
  sport: string,
  workoutId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient()

  const validTypes = ['swim', 'bike', 'run', 'brick']
  if (!validTypes.includes(sport)) return

  await supabase.from('activity_feed').insert({
    user_id: userId,
    activity_type: sport,
    workout_id: workoutId,
    metadata: {},
  })
}
