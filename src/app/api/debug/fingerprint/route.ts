import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api/utils'
import { estimateCSSFromWorkouts, estimateFTPFromWorkouts } from '@/lib/analytics/race-pacing'
import { computePercentiles } from '@/lib/social/percentile'
import type { FitnessSnapshotRow } from '@/lib/types/social'

export async function GET() {
  const { user, supabase, error: authError } = await authenticateRequest()
  if (authError) return authError

  const since = new Date()
  since.setDate(since.getDate() - 90)

  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user!.id)
    .is('deleted_at', null)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('ftp_watts, threshold_pace_run, max_heart_rate, gender, date_of_birth')
    .eq('id', user!.id)
    .single()

  const swims = (workouts ?? []).filter(w => w.sport === 'swim')
  const bikes = (workouts ?? []).filter(w => w.sport === 'bike')
  const runs  = (workouts ?? []).filter(w => w.sport === 'run')

  const css    = estimateCSSFromWorkouts(workouts ?? [], profile?.max_heart_rate ?? null)
  const ftp    = profile?.ftp_watts ?? estimateFTPFromWorkouts(workouts ?? [])
  const recentRuns = runs.filter(w => w.avg_pace_sec_per_km).slice(0, 5)
  const runPace = recentRuns.length
    ? recentRuns.reduce((s: number, w) => s + w.avg_pace_sec_per_km, 0) / recentRuns.length
    : (profile?.threshold_pace_run ?? null)

  // Compute age group
  const dob = profile?.date_of_birth ?? null
  let age: number | null = null
  let ageGroup: string | null = null
  if (dob) {
    const today = new Date()
    const born  = new Date(dob)
    age = today.getFullYear() - born.getFullYear()
    if (today.getMonth() < born.getMonth() || (today.getMonth() === born.getMonth() && today.getDate() < born.getDate())) age--
    if (age >= 18 && age <= 79) {
      const low = Math.min(Math.floor(age / 5) * 5, 55)
      ageGroup = `${low}-${low + 4}`
    }
  }

  // Compute percentiles
  const syntheticSnapshot: FitnessSnapshotRow = {
    id: '', user_id: user!.id,
    snapshot_date: new Date().toISOString().split('T')[0],
    css_sec_per_100m: css, ftp_watts: ftp, run_pace_sec_per_km: runPace,
    ctl: null, atl: null, tsb: null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }
  const percentiles = (css || ftp || runPace)
    ? await computePercentiles(syntheticSnapshot, profile?.gender ?? null, dob)
    : null

  return NextResponse.json({
    total_workouts: workouts?.length ?? 0,
    sport_counts: { swims: swims.length, bikes: bikes.length, runs: runs.length },
    profile: {
      ftp_watts: profile?.ftp_watts,
      max_heart_rate: profile?.max_heart_rate,
      threshold_pace_run: profile?.threshold_pace_run,
      gender: profile?.gender,
      date_of_birth: profile?.date_of_birth,
    },
    computed_metrics: { css, ftp, runPace },
    age_calculation: { dob, age, ageGroup, fallback_used: ageGroup === null ? '35-39' : null },
    percentiles,
    will_show_fingerprint: !!(percentiles && (percentiles.swim || percentiles.bike || percentiles.run)),
  })
}
