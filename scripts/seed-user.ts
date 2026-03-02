/**
 * Seed script — populates a realistic triathlete profile for a given user.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/seed-user.ts
 */

import { createClient } from '@supabase/supabase-js'

const TARGET_EMAIL = 'scoresbysydnee@gmail.com'
const RACE_DATE = '2026-04-05' // IRONMAN New Zealand — upcoming

// ─── Supabase admin client (bypasses RLS) ────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function jitter(base: number, pct = 0.08): number {
  return Math.round(base * (1 + (Math.random() - 0.5) * 2 * pct))
}

/** Gaussian-ish random via Box-Muller */
function gauss(mean: number, stddev: number): number {
  const u = 1 - Math.random()
  const v = Math.random()
  return mean + stddev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// ─── Profile data ─────────────────────────────────────────────────────────────
// Sydnee — 28 y/o female, competitive age-grouper, NZ timezone

const PROFILE = {
  display_name: 'Sydnee S.',
  gender: 'female',
  date_of_birth: '1997-05-15',
  weight_kg: 58.4,
  height_cm: 165,
  timezone: 'Pacific/Auckland',
  unit_system: 'metric',
  onboarding_completed: true,
  subscription_tier: 'free',
  // Thresholds
  ftp_watts: 195,
  threshold_pace_swim: 100,   // 1:40/100m CSS
  threshold_pace_run: 310,    // 5:10/km
  resting_heart_rate: 46,
  max_heart_rate: 183,
  max_hr_source: 'manual',
  lthr_swim: 158,
  lthr_bike: 155,
  lthr_run: 162,
}

// ─── Workout generator ────────────────────────────────────────────────────────

type Sport = 'swim' | 'bike' | 'run'

interface WorkoutTemplate {
  sport: Sport
  label: string
  durationRange: [number, number]   // seconds
  distanceRange: [number, number]   // meters
  tssRange: [number, number]
  ifRange: [number, number]
  avgHrRange: [number, number]
  indoorChance: number              // 0-1
  titles: string[]
}

const SWIM_EASY: WorkoutTemplate = {
  sport: 'swim',
  label: 'easy',
  durationRange: [2400, 3000],
  distanceRange: [2000, 2600],
  tssRange: [38, 52],
  ifRange: [0.70, 0.78],
  avgHrRange: [128, 138],
  indoorChance: 1,
  titles: ['Easy swim', 'Recovery swim', 'Aerobic swim', 'Easy aerobic swim'],
}

const SWIM_QUALITY: WorkoutTemplate = {
  sport: 'swim',
  label: 'quality',
  durationRange: [3000, 4200],
  distanceRange: [2800, 3600],
  tssRange: [60, 90],
  ifRange: [0.82, 0.95],
  avgHrRange: [142, 158],
  indoorChance: 1,
  titles: ['CSS intervals', 'Threshold swim', 'Pace work', '100s & 200s set', 'Swim fitness test'],
}

const SWIM_LONG: WorkoutTemplate = {
  sport: 'swim',
  label: 'long',
  durationRange: [3600, 5400],
  distanceRange: [3200, 4500],
  tssRange: [70, 100],
  ifRange: [0.75, 0.83],
  avgHrRange: [133, 145],
  indoorChance: 1,
  titles: ['Long swim', 'Endurance swim', 'OWS simulation', 'Long aerobic swim'],
}

const BIKE_INTERVALS: WorkoutTemplate = {
  sport: 'bike',
  label: 'intervals',
  durationRange: [3600, 5400],
  distanceRange: [40000, 65000],
  tssRange: [75, 115],
  ifRange: [0.84, 0.97],
  avgHrRange: [148, 163],
  indoorChance: 0.7,
  titles: ['FTP intervals', 'Sweet spot', 'VO2max work', 'Threshold bike', '2x20 FTP', 'Over-unders'],
}

const BIKE_ENDURANCE: WorkoutTemplate = {
  sport: 'bike',
  label: 'endurance',
  durationRange: [5400, 7200],
  distanceRange: [70000, 100000],
  tssRange: [80, 120],
  ifRange: [0.72, 0.80],
  avgHrRange: [130, 145],
  indoorChance: 0.3,
  titles: ['Endurance ride', 'Z2 bike', 'Aerobic ride', 'Base miles', 'Easy endurance ride'],
}

const BIKE_LONG: WorkoutTemplate = {
  sport: 'bike',
  label: 'long',
  durationRange: [10800, 18000],
  distanceRange: [130000, 220000],
  tssRange: [160, 260],
  ifRange: [0.68, 0.76],
  avgHrRange: [125, 140],
  indoorChance: 0.05,
  titles: ['Long ride', 'Big day on the bike', 'Race sim ride', 'Century ride', 'Long endurance ride'],
}

const RUN_EASY: WorkoutTemplate = {
  sport: 'run',
  label: 'easy',
  durationRange: [1800, 3000],
  distanceRange: [5000, 9000],
  tssRange: [28, 48],
  ifRange: [0.68, 0.76],
  avgHrRange: [125, 138],
  indoorChance: 0.0,
  titles: ['Easy run', 'Recovery run', 'Easy jog', 'Short easy run'],
}

const RUN_TEMPO: WorkoutTemplate = {
  sport: 'run',
  label: 'tempo',
  durationRange: [2700, 4500],
  distanceRange: [8000, 14000],
  tssRange: [52, 82],
  ifRange: [0.82, 0.92],
  avgHrRange: [152, 166],
  indoorChance: 0.0,
  titles: ['Tempo run', 'Threshold run', '10km pace run', 'Race-pace run', 'Lactate threshold'],
}

const RUN_LONG: WorkoutTemplate = {
  sport: 'run',
  label: 'long',
  durationRange: [3600, 7200],
  distanceRange: [13000, 25000],
  tssRange: [85, 145],
  ifRange: [0.72, 0.80],
  avgHrRange: [133, 148],
  indoorChance: 0.0,
  titles: ['Long run', 'Easy long run', 'Aerobic long run', 'Race sim long run'],
}

function makeWorkout(
  userId: string,
  template: WorkoutTemplate,
  daysBack: number,
  volumeScale = 1.0,
) {
  const duration = Math.round(
    gauss(
      (template.durationRange[0] + template.durationRange[1]) / 2,
      (template.durationRange[1] - template.durationRange[0]) / 6,
    ) * volumeScale,
  )
  const clampedDuration = clamp(
    duration,
    template.durationRange[0] * 0.85,
    template.durationRange[1] * 1.15,
  )

  const distanceRatio = (clampedDuration - template.durationRange[0]) /
    (template.durationRange[1] - template.durationRange[0] + 1)
  const distance = Math.round(
    template.distanceRange[0] + distanceRatio *
    (template.distanceRange[1] - template.distanceRange[0]),
  )

  const tss = Math.round(
    gauss(
      (template.tssRange[0] + template.tssRange[1]) / 2,
      (template.tssRange[1] - template.tssRange[0]) / 5,
    ) * volumeScale,
  )
  const clampedTss = clamp(tss, template.tssRange[0] * 0.8, template.tssRange[1] * 1.2)

  const ifVal = +(
    gauss(
      (template.ifRange[0] + template.ifRange[1]) / 2,
      (template.ifRange[1] - template.ifRange[0]) / 5,
    )
  ).toFixed(2)
  const clampedIf = clamp(ifVal, template.ifRange[0] - 0.03, template.ifRange[1] + 0.03)

  const avgHr = Math.round(
    gauss(
      (template.avgHrRange[0] + template.avgHrRange[1]) / 2,
      (template.avgHrRange[1] - template.avgHrRange[0]) / 5,
    ),
  )
  const clampedHr = clamp(avgHr, template.avgHrRange[0] - 3, template.avgHrRange[1] + 5)

  const title = template.titles[Math.floor(Math.random() * template.titles.length)]
  const isIndoor = Math.random() < template.indoorChance

  const base: Record<string, unknown> = {
    user_id: userId,
    sport: template.sport,
    title,
    date: daysAgo(daysBack),
    duration_seconds: clampedDuration,
    distance_meters: distance,
    tss: clampedTss,
    intensity_factor: clampedIf,
    avg_hr: clampedHr,
    max_hr: clampedHr + jitter(22, 0.25),
    rpe: Math.round(clampedIf * 10),
    source: 'manual',
    is_indoor: isIndoor,
  }

  // Sport-specific fields
  if (template.sport === 'bike') {
    base.avg_power_watts = Math.round(195 * clampedIf * jitter(1, 0.04))
    base.normalized_power = Math.round((base.avg_power_watts as number) * jitter(1.04, 0.02))
    base.avg_cadence_rpm = jitter(87, 0.05)
    base.elevation_gain_meters = isIndoor ? 0 : Math.round((clampedDuration / 3600) * jitter(380, 0.3))
  }
  if (template.sport === 'run') {
    base.avg_pace_sec_per_km = Math.round((clampedDuration / (distance / 1000)))
    base.avg_cadence_spm = jitter(174, 0.04)
  }
  if (template.sport === 'swim') {
    base.pool_length_meters = 50
    base.stroke_type = 'freestyle'
    base.avg_pace_sec_per_km = Math.round(clampedDuration / (distance / 100)) // sec per 100m
  }

  return base
}

// ─── 20-week training plan schedule ──────────────────────────────────────────
// Each entry: [daysBack, template, volumeScale]
// Today = daysBack 0. Race is April 5 = ~35 days ahead (ignored, not in past workouts)
// 20 weeks back = 140 days

type ScheduleEntry = [number, WorkoutTemplate, number]

function buildSchedule(): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = []

  // volumeScale ramps from 0.70 (week 20) → 1.05 (week 2) → 0.55 (taper week 0)
  // week 0 = this week (taper), week 19 = 19 weeks ago
  for (let week = 19; week >= 0; week--) {
    const isTaper = week <= 1
    const isPeak = week >= 2 && week <= 4
    const isBuild = week >= 5 && week <= 11
    // base = weeks 12-19

    let scale: number
    if (isTaper) {
      scale = week === 1 ? 0.65 : 0.45
    } else if (isPeak) {
      scale = 1.05 + (4 - week) * 0.02
    } else if (isBuild) {
      scale = 0.85 + (11 - week) * 0.025
    } else {
      scale = 0.70 + (19 - week) * 0.02
    }

    const baseDay = week * 7 // Monday of this week (days ago)

    // Monday — easy run
    schedule.push([baseDay + 6, RUN_EASY, scale * 0.85])
    // Tuesday — bike intervals
    schedule.push([baseDay + 5, BIKE_INTERVALS, scale])
    // Wednesday — swim quality + tempo run (brick-ish)
    schedule.push([baseDay + 4, SWIM_QUALITY, scale * 0.9])
    if (week > 1) schedule.push([baseDay + 4, RUN_TEMPO, scale * 0.75])
    // Thursday — endurance bike
    schedule.push([baseDay + 3, BIKE_ENDURANCE, scale])
    // Friday — swim easy
    schedule.push([baseDay + 2, SWIM_EASY, scale * 0.9])
    // Saturday — long ride + short brick run
    schedule.push([baseDay + 1, BIKE_LONG, scale])
    if (!isTaper && week > 0) {
      schedule.push([baseDay + 1, RUN_EASY, scale * 0.45]) // brick run
    }
    // Sunday — long swim + long run
    schedule.push([baseDay, SWIM_LONG, scale * 0.95])
    if (week > 0) {
      schedule.push([baseDay, RUN_LONG, scale])
    }
  }

  // Sprinkle in rest days — skip ~15% of entries randomly
  return schedule.filter(() => Math.random() > 0.12)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nSeeding data for ${TARGET_EMAIL}...\n`)

  // 1. Find auth user by email
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (listErr) throw listErr

  const authUser = users.find(u => u.email === TARGET_EMAIL)
  if (!authUser) {
    console.error(`User ${TARGET_EMAIL} not found in auth.users.`)
    console.error('They need to sign up / log in with Google at least once first.')
    process.exit(1)
  }

  const userId = authUser.id
  console.log(`Found user: ${userId}`)

  // 2. Upsert profile
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...PROFILE }, { onConflict: 'id' })
  if (profileErr) throw profileErr
  console.log('Profile upserted.')

  // 3. Find IRONMAN New Zealand course ID
  const { data: courses, error: courseErr } = await supabase
    .from('race_courses')
    .select('id, name')
    .ilike('name', '%ironman new zealand%')
    .limit(1)
  if (courseErr) throw courseErr

  const courseId = courses?.[0]?.id ?? null
  console.log(`Race course: ${courses?.[0]?.name ?? 'not found'} (${courseId})`)

  // 4. Delete existing workouts for a clean slate
  const { error: delErr } = await supabase
    .from('workouts')
    .delete()
    .eq('user_id', userId)
  if (delErr) throw delErr
  console.log('Cleared existing workouts.')

  // 5. Insert workouts
  const schedule = buildSchedule()
  const workouts = schedule.map(([daysBack, template, scale]) =>
    makeWorkout(userId, template, daysBack, scale),
  )

  // Batch insert in chunks of 100
  let inserted = 0
  for (let i = 0; i < workouts.length; i += 100) {
    const chunk = workouts.slice(i, i + 100)
    const { error } = await supabase.from('workouts').insert(chunk)
    if (error) throw error
    inserted += chunk.length
  }
  console.log(`Inserted ${inserted} workouts.`)

  // 6. Upsert target race (IRONMAN New Zealand)
  const { data: existingRaces } = await supabase
    .from('target_races')
    .select('id')
    .eq('user_id', userId)

  if (existingRaces && existingRaces.length > 0) {
    await supabase.from('target_races').delete().eq('user_id', userId)
  }

  const { error: raceErr } = await supabase.from('target_races').insert({
    user_id: userId,
    race_name: 'IRONMAN New Zealand',
    race_date: RACE_DATE,
    race_distance: '140.6',
    race_course_id: courseId,
    priority: 'a',
    status: 'upcoming',
    race_type: 'triathlon',
    water_type: 'lake',
    wetsuit: true,
    expected_temp_f: 64,
    gun_start_time: `${RACE_DATE}T07:00:00+13:00`,
    goal_time_seconds: 37800, // 10:30:00 goal
    notes: 'A-race. Full build from November. Stay patient on the bike.',
  })
  if (raceErr) throw raceErr
  console.log(`Target race created: IRONMAN New Zealand — ${RACE_DATE}`)

  console.log('\nDone! Sydnee\'s profile is ready.\n')
  console.log('Summary:')
  console.log(`  • ${inserted} workouts over ~20 weeks`)
  console.log('  • Profile: 28 y/o female, FTP 195W, CSS 1:40/100m, run threshold 5:10/km')
  console.log('  • A-race: IRONMAN New Zealand, April 5 2026, goal 10:30')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
