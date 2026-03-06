import type { Workout } from '@/lib/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AthleteThresholds {
  ftp_watts?: number | null
  threshold_pace_swim?: number | null  // sec per 100m (CSS)
  threshold_pace_run?: number | null   // sec per km
  resting_heart_rate?: number | null
  max_heart_rate?: number | null
}

export type TssSource = 'device' | 'power' | 'pace' | 'hr' | 'rpe'

export interface TssResult {
  tss: number
  intensity_factor: number
  source: TssSource
}

export interface DailyStressPoint {
  date: string
  value: number
}

export interface DisciplineSeries {
  ctl: DailyStressPoint[]
  atl: DailyStressPoint[]
  tsb: DailyStressPoint[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RPE_TO_IF: Record<number, number> = {
  1: 0.50, 2: 0.56, 3: 0.62, 4: 0.68, 5: 0.75,
  6: 0.82, 7: 0.89, 8: 0.95, 9: 1.02, 10: 1.10,
}

const MIN_DURATION_SEC = 300 // 5 minutes
const IF_MIN = 0.40
const IF_MAX = 1.15
const TSS_MAX = 600

// ---------------------------------------------------------------------------
// Core TSS Calculation
// ---------------------------------------------------------------------------

function clampIF(ifVal: number): number {
  return Math.min(IF_MAX, Math.max(IF_MIN, ifVal))
}

function tssFromIF(ifVal: number, durationSeconds: number): number {
  const durationHours = durationSeconds / 3600
  return Math.min(TSS_MAX, Math.max(0, Math.round(durationHours * ifVal * ifVal * 100)))
}

/**
 * Full TSS calculation with sport-specific priority waterfall.
 *
 * Priority:
 * 1. Device TSS — explicit workout.tss
 * 2. Sport-specific IF (power for bike, pace for swim/run)
 * 3. HR-based IF
 * 4. RPE lookup table
 * 5. Existing workout.intensity_factor fallback
 */
export function calculateTSS(workout: Workout, thresholds?: AthleteThresholds | null): TssResult {
  const duration = workout.duration_seconds || 0

  // 1. Device TSS — trust explicit values
  if (workout.tss && workout.tss > 0) {
    const ifFromTss = duration > 0 ? Math.sqrt(workout.tss / ((duration / 3600) * 100)) : 0.75
    return { tss: Math.min(TSS_MAX, workout.tss), intensity_factor: clampIF(ifFromTss), source: 'device' }
  }

  // Need minimum duration for calculated TSS
  if (duration < MIN_DURATION_SEC) {
    return { tss: 0, intensity_factor: 0.5, source: 'rpe' }
  }

  // 2. Sport-specific IF from power or pace
  const sportIF = calculateSportSpecificIF(workout, thresholds)
  if (sportIF !== null) {
    const clamped = clampIF(sportIF.ifValue)
    return { tss: tssFromIF(clamped, duration), intensity_factor: clamped, source: sportIF.source }
  }

  // 3. HR-based IF
  const hrIF = calculateHRBasedIF(workout, thresholds)
  if (hrIF !== null) {
    const clamped = clampIF(hrIF)
    return { tss: tssFromIF(clamped, duration), intensity_factor: clamped, source: 'hr' }
  }

  // 4. RPE lookup
  if (workout.rpe && workout.rpe >= 1 && workout.rpe <= 10) {
    const rpeRounded = Math.round(workout.rpe)
    const ifVal = RPE_TO_IF[rpeRounded] || 0.75
    return { tss: tssFromIF(ifVal, duration), intensity_factor: ifVal, source: 'rpe' }
  }

  // 5. Existing intensity_factor from file import
  if (workout.intensity_factor && workout.intensity_factor > 0) {
    const clamped = clampIF(workout.intensity_factor)
    return { tss: tssFromIF(clamped, duration), intensity_factor: clamped, source: 'power' }
  }

  // Final fallback: moderate effort
  const defaultIF = 0.75
  return { tss: tssFromIF(defaultIF, duration), intensity_factor: defaultIF, source: 'rpe' }
}

function calculateSportSpecificIF(
  workout: Workout,
  thresholds?: AthleteThresholds | null
): { ifValue: number; source: TssSource } | null {
  if (!thresholds) return null

  switch (workout.sport) {
    case 'bike': {
      const np = workout.normalized_power || workout.avg_power_watts
      if (np && thresholds.ftp_watts && thresholds.ftp_watts > 0) {
        return { ifValue: np / thresholds.ftp_watts, source: 'power' }
      }
      return null
    }

    case 'swim': {
      if (!thresholds.threshold_pace_swim || thresholds.threshold_pace_swim <= 0) return null
      const actualPace = getSwimPacePer100m(workout)
      if (actualPace === null || actualPace <= 0) return null
      // Faster pace = higher IF (threshold / actual)
      return { ifValue: thresholds.threshold_pace_swim / actualPace, source: 'pace' }
    }

    case 'run': {
      if (!thresholds.threshold_pace_run || thresholds.threshold_pace_run <= 0) return null
      const runPace = workout.avg_pace_sec_per_km
      if (!runPace || runPace <= 0) return null
      // Faster pace = higher IF (threshold / actual)
      return { ifValue: thresholds.threshold_pace_run / runPace, source: 'pace' }
    }

    case 'brick':
      // Brick workouts skip to HR/RPE
      return null

    default:
      return null
  }
}

function getSwimPacePer100m(workout: Workout): number | null {
  // If we have avg_pace_sec_per_km, convert to per 100m
  if (workout.avg_pace_sec_per_km && workout.avg_pace_sec_per_km > 0) {
    return workout.avg_pace_sec_per_km / 10
  }
  // Derive from duration and distance
  if (workout.duration_seconds && workout.distance_meters && workout.distance_meters > 0) {
    return (workout.duration_seconds / workout.distance_meters) * 100
  }
  return null
}

function calculateHRBasedIF(
  workout: Workout,
  thresholds?: AthleteThresholds | null
): number | null {
  if (!thresholds) return null
  if (!workout.avg_hr || workout.avg_hr <= 0) return null
  if (!thresholds.resting_heart_rate || !thresholds.max_heart_rate) return null
  if (thresholds.max_heart_rate <= thresholds.resting_heart_rate) return null

  const rhr = thresholds.resting_heart_rate
  const maxHR = thresholds.max_heart_rate
  // LTHR estimate: 85% of heart rate reserve + resting
  const lthr = 0.85 * (maxHR - rhr) + rhr
  if (lthr <= rhr) return null

  return (workout.avg_hr - rhr) / (lthr - rhr)
}

// ---------------------------------------------------------------------------
// Backward-compatible wrapper
// ---------------------------------------------------------------------------

/**
 * Estimate TSS for a workout. Backward-compatible — returns just the number.
 */
export function estimateTSS(workout: Workout, thresholds?: AthleteThresholds | null): number {
  return calculateTSS(workout, thresholds).tss
}

// ---------------------------------------------------------------------------
// Single-value stress metrics
// ---------------------------------------------------------------------------

/** Chronic Training Load (CTL) — 42-day EWMA of daily TSS. Represents fitness. */
export function calculateCTL(workouts: Workout[], thresholds?: AthleteThresholds | null): number {
  return calculateEWMA(workouts, 42, thresholds)
}

/** Acute Training Load (ATL) — 7-day EWMA of daily TSS. Represents fatigue. */
export function calculateATL(workouts: Workout[], thresholds?: AthleteThresholds | null): number {
  return calculateEWMA(workouts, 7, thresholds)
}

/** Training Stress Balance (TSB) = CTL - ATL. Positive = fresh, negative = fatigued. */
export function calculateTSB(workouts: Workout[], thresholds?: AthleteThresholds | null): number {
  return Math.round(calculateCTL(workouts, thresholds) - calculateATL(workouts, thresholds))
}

// ---------------------------------------------------------------------------
// Series variants — daily intermediate values
// ---------------------------------------------------------------------------

/** CTL series (42-day EWMA) — daily values */
export function calculateCTLSeries(workouts: Workout[], thresholds?: AthleteThresholds | null): DailyStressPoint[] {
  return calculateEWMASeries(workouts, 42, thresholds)
}

/** ATL series (7-day EWMA) — daily values */
export function calculateATLSeries(workouts: Workout[], thresholds?: AthleteThresholds | null): DailyStressPoint[] {
  return calculateEWMASeries(workouts, 7, thresholds)
}

/** TSB series = CTL - ATL per day */
export function calculateTSBSeries(workouts: Workout[], thresholds?: AthleteThresholds | null): DailyStressPoint[] {
  const ctl = calculateCTLSeries(workouts, thresholds)
  const atl = calculateATLSeries(workouts, thresholds)
  const atlMap = new Map(atl.map((p) => [p.date, p.value]))
  return ctl.map((p) => ({
    date: p.date,
    value: Math.round(p.value - (atlMap.get(p.date) || 0)),
  }))
}

// ---------------------------------------------------------------------------
// Discipline-specific series
// ---------------------------------------------------------------------------

/**
 * Calculate per-discipline CTL/ATL/TSB alongside overall.
 * Each sport gets its own independent EWMA calculation.
 */
export function calculateDisciplineSeries(
  workouts: Workout[],
  thresholds?: AthleteThresholds | null
): { overall: DisciplineSeries; swim: DisciplineSeries; bike: DisciplineSeries; run: DisciplineSeries } {
  const swimWorkouts = workouts.filter((w) => w.sport === 'swim')
  const bikeWorkouts = workouts.filter((w) => w.sport === 'bike')
  const runWorkouts = workouts.filter((w) => w.sport === 'run')

  return {
    overall: buildDisciplineSeries(workouts, thresholds),
    swim: buildDisciplineSeries(swimWorkouts, thresholds),
    bike: buildDisciplineSeries(bikeWorkouts, thresholds),
    run: buildDisciplineSeries(runWorkouts, thresholds),
  }
}

function buildDisciplineSeries(workouts: Workout[], thresholds?: AthleteThresholds | null): DisciplineSeries {
  const ctl = calculateCTLSeries(workouts, thresholds)
  const atl = calculateATLSeries(workouts, thresholds)
  const atlMap = new Map(atl.map((p) => [p.date, p.value]))
  const tsb = ctl.map((p) => ({
    date: p.date,
    value: Math.round(p.value - (atlMap.get(p.date) || 0)),
  }))
  return { ctl, atl, tsb }
}

// ---------------------------------------------------------------------------
// Race day projection
// ---------------------------------------------------------------------------

/**
 * Project training load forward to a target date.
 * Uses average daily TSS from last 28 days and assumes same load continues.
 */
export function projectTrainingLoad(
  workouts: Workout[],
  targetDate: string,
  thresholds?: AthleteThresholds | null
): DailyStressPoint[] {
  const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date))
  const dailyTSS = buildDailyTSS(sorted, thresholds)
  if (dailyTSS.size === 0) return []

  // Calculate average daily TSS over last 28 days
  const today = new Date()
  const lookbackStart = new Date(today)
  lookbackStart.setDate(lookbackStart.getDate() - 28)
  const lookbackStr = lookbackStart.toISOString().split('T')[0]

  let totalTSS = 0
  let dayCount = 0
  for (const [date, tss] of dailyTSS) {
    if (date >= lookbackStr) {
      totalTSS += tss
      dayCount++
    }
  }
  // Average over full 28 days (not just days with workouts)
  const avgDailyTSS = totalTSS / 28

  // Run EWMA from start through today using actual data, then project forward
  const dates = Array.from(dailyTSS.keys()).sort()
  const startDate = new Date(dates[0])
  const endDate = new Date(targetDate)

  const ctlAlpha = 1 / 42
  const atlAlpha = 1 / 7
  let ctlEwma = 0
  let atlEwma = 0
  const projectedTSB: DailyStressPoint[] = []

  const todayStr = today.toISOString().split('T')[0]
  const current = new Date(startDate)

  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0]
    // Use actual TSS up to today, projected average after
    const tss = dateStr <= todayStr ? (dailyTSS.get(dateStr) || 0) : avgDailyTSS

    ctlEwma = ctlAlpha * tss + (1 - ctlAlpha) * ctlEwma
    atlEwma = atlAlpha * tss + (1 - atlAlpha) * atlEwma

    // Only include projected dates (after today)
    if (dateStr > todayStr) {
      projectedTSB.push({
        date: dateStr,
        value: Math.round(ctlEwma - atlEwma),
      })
    }

    current.setDate(current.getDate() + 1)
  }

  return projectedTSB
}

// ---------------------------------------------------------------------------
// EWMA internals
// ---------------------------------------------------------------------------

function calculateEWMASeries(workouts: Workout[], period: number, thresholds?: AthleteThresholds | null): DailyStressPoint[] {
  const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date))
  const dailyTSS = buildDailyTSS(sorted, thresholds)
  if (dailyTSS.size === 0) return []

  const dates = Array.from(dailyTSS.keys()).sort()
  const startDate = new Date(dates[0])
  // Extend through today so ATL/CTL keep decaying during rest days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const lastWorkout = new Date(dates[dates.length - 1])
  const endDate = today > lastWorkout ? today : lastWorkout

  // Standard PMC decay: 1/period
  const alpha = 1 / period
  let ewma = 0
  const series: DailyStressPoint[] = []

  const current = new Date(startDate)
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0]
    const tss = dailyTSS.get(dateStr) || 0
    ewma = alpha * tss + (1 - alpha) * ewma
    series.push({ date: dateStr, value: Math.round(ewma) })
    current.setDate(current.getDate() + 1)
  }

  return series
}

function buildDailyTSS(sorted: Workout[], thresholds?: AthleteThresholds | null): Map<string, number> {
  const dailyTSS = new Map<string, number>()
  sorted.forEach((w) => {
    const existing = dailyTSS.get(w.date) || 0
    dailyTSS.set(w.date, existing + estimateTSS(w, thresholds))
  })
  return dailyTSS
}

function calculateEWMA(workouts: Workout[], period: number, thresholds?: AthleteThresholds | null): number {
  const series = calculateEWMASeries(workouts, period, thresholds)
  if (series.length === 0) return 0
  return series[series.length - 1].value
}

// ---------------------------------------------------------------------------
// Weekly volume (unchanged)
// ---------------------------------------------------------------------------

/** Calculate weekly training volume in hours */
export function weeklyVolume(workouts: Workout[]): { week: string; hours: number }[] {
  const weekMap = new Map<string, number>()

  workouts.forEach((w) => {
    const d = new Date(w.date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    const weekKey = monday.toISOString().split('T')[0]
    const hours = (w.duration_seconds || 0) / 3600
    weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + hours)
  })

  return Array.from(weekMap.entries())
    .map(([week, hours]) => ({ week, hours: Number(hours.toFixed(1)) }))
    .sort((a, b) => a.week.localeCompare(b.week))
}
