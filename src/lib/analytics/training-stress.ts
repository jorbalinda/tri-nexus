import type { Workout } from '@/lib/types/database'

/**
 * Training Stress Score (TSS)
 * If workout has explicit TSS, use it.
 * Otherwise estimate: TSS ≈ (duration_hours * IF^2 * 100)
 * where IF = NP/FTP (we use RPE as proxy)
 */
export function estimateTSS(workout: Workout): number {
  if (workout.tss) return workout.tss

  const durationHours = (workout.duration_seconds || 0) / 3600
  const rpe = workout.rpe || 5
  // Map RPE 1-10 to IF 0.5-1.1
  const ifactor = 0.5 + (rpe / 10) * 0.6
  return Math.round(durationHours * ifactor * ifactor * 100)
}

/**
 * Chronic Training Load (CTL) — 42-day exponential moving average of TSS
 * Represents fitness
 */
export function calculateCTL(workouts: Workout[]): number {
  return calculateEWMA(workouts, 42)
}

/**
 * Acute Training Load (ATL) — 7-day exponential moving average of TSS
 * Represents fatigue
 */
export function calculateATL(workouts: Workout[]): number {
  return calculateEWMA(workouts, 7)
}

/**
 * Training Stress Balance (TSB) = CTL - ATL
 * Positive = fresh, negative = fatigued
 * Optimal race readiness: TSB between +10 and +25
 */
export function calculateTSB(workouts: Workout[]): number {
  return Math.round(calculateCTL(workouts) - calculateATL(workouts))
}

// ---------------------------------------------------------------------------
// Series variants — expose daily intermediate values
// ---------------------------------------------------------------------------

export interface DailyStressPoint {
  date: string
  value: number
}

/** CTL series (42-day EWMA) — daily values */
export function calculateCTLSeries(workouts: Workout[]): DailyStressPoint[] {
  return calculateEWMASeries(workouts, 42)
}

/** ATL series (7-day EWMA) — daily values */
export function calculateATLSeries(workouts: Workout[]): DailyStressPoint[] {
  return calculateEWMASeries(workouts, 7)
}

/** TSB series = CTL - ATL per day */
export function calculateTSBSeries(workouts: Workout[]): DailyStressPoint[] {
  const ctl = calculateCTLSeries(workouts)
  const atl = calculateATLSeries(workouts)
  const atlMap = new Map(atl.map((p) => [p.date, p.value]))
  return ctl.map((p) => ({
    date: p.date,
    value: Math.round(p.value - (atlMap.get(p.date) || 0)),
  }))
}

function calculateEWMASeries(workouts: Workout[], period: number): DailyStressPoint[] {
  const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date))
  const dailyTSS = buildDailyTSS(sorted)
  if (dailyTSS.size === 0) return []

  const dates = Array.from(dailyTSS.keys()).sort()
  const startDate = new Date(dates[0])
  const endDate = new Date(dates[dates.length - 1])

  const alpha = 2 / (period + 1)
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

function buildDailyTSS(sorted: Workout[]): Map<string, number> {
  const dailyTSS = new Map<string, number>()
  sorted.forEach((w) => {
    const existing = dailyTSS.get(w.date) || 0
    dailyTSS.set(w.date, existing + estimateTSS(w))
  })
  return dailyTSS
}

function calculateEWMA(workouts: Workout[], period: number): number {
  const series = calculateEWMASeries(workouts, period)
  if (series.length === 0) return 0
  return series[series.length - 1].value
}

/**
 * Calculate weekly training volume in hours
 */
export function weeklyVolume(workouts: Workout[]): { week: string; hours: number }[] {
  const weekMap = new Map<string, number>()

  workouts.forEach((w) => {
    const d = new Date(w.date)
    // Get Monday of the week
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
