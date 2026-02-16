// Pure TypeScript config — no React dependencies

import type { Workout, SessionMetric } from '@/lib/types/database'
import {
  calculateCTLSeries,
  calculateATLSeries,
  calculateTSBSeries,
} from '@/lib/analytics/training-stress'
import { calculateEF, calculateRunEF, calculateSwimEF } from '@/lib/analytics/efficiency-factor'
import { calculateDecoupling } from '@/lib/analytics/aerobic-decoupling'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SynergyMetricKey =
  | 'tsb'
  | 'ctl'
  | 'atl'
  | 'swim_ef'
  | 'bike_ef'
  | 'run_ef'
  | 'decoupling'

export type SynergyDataType = 'daily' | 'sparse'

export interface SynergyMetricConfig {
  key: SynergyMetricKey
  label: string
  shortLabel: string
  color: string
  unitLabel: string
  dataType: SynergyDataType
  group: 'load' | 'efficiency'
  formatValue: (v: number) => string
  formatTick: (v: number) => string
}

export interface SynergyDataPoint {
  date: string
  tsb: number | null
  ctl: number | null
  atl: number | null
  swim_ef: number | null
  bike_ef: number | null
  run_ef: number | null
  decoupling: number | null
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export const SYNERGY_METRICS: SynergyMetricKey[] = [
  'tsb', 'ctl', 'atl', 'swim_ef', 'bike_ef', 'run_ef', 'decoupling',
]

export const SYNERGY_METRIC_CONFIGS: Record<SynergyMetricKey, SynergyMetricConfig> = {
  tsb: {
    key: 'tsb',
    label: 'Training Stress Balance',
    shortLabel: 'TSB',
    color: '#10B981',
    unitLabel: 'TSB',
    dataType: 'daily',
    group: 'load',
    formatValue: (v) => `${Math.round(v)} TSB`,
    formatTick: (v) => `${Math.round(v)}`,
  },
  ctl: {
    key: 'ctl',
    label: 'Fitness (CTL)',
    shortLabel: 'CTL',
    color: '#3B82F6',
    unitLabel: 'CTL',
    dataType: 'daily',
    group: 'load',
    formatValue: (v) => `${Math.round(v)} CTL`,
    formatTick: (v) => `${Math.round(v)}`,
  },
  atl: {
    key: 'atl',
    label: 'Fatigue (ATL)',
    shortLabel: 'ATL',
    color: '#EF4444',
    unitLabel: 'ATL',
    dataType: 'daily',
    group: 'load',
    formatValue: (v) => `${Math.round(v)} ATL`,
    formatTick: (v) => `${Math.round(v)}`,
  },
  swim_ef: {
    key: 'swim_ef',
    label: 'Swim EF',
    shortLabel: 'Swim EF',
    color: '#06B6D4',
    unitLabel: 'EF',
    dataType: 'sparse',
    group: 'efficiency',
    formatValue: (v) => v.toFixed(2),
    formatTick: (v) => v.toFixed(1),
  },
  bike_ef: {
    key: 'bike_ef',
    label: 'Bike EF',
    shortLabel: 'Bike EF',
    color: '#F59E0B',
    unitLabel: 'EF',
    dataType: 'sparse',
    group: 'efficiency',
    formatValue: (v) => v.toFixed(2),
    formatTick: (v) => v.toFixed(1),
  },
  run_ef: {
    key: 'run_ef',
    label: 'Run EF',
    shortLabel: 'Run EF',
    color: '#8B5CF6',
    unitLabel: 'EF',
    dataType: 'sparse',
    group: 'efficiency',
    formatValue: (v) => v.toFixed(2),
    formatTick: (v) => v.toFixed(1),
  },
  decoupling: {
    key: 'decoupling',
    label: 'Aerobic Decoupling',
    shortLabel: 'Decoupling',
    color: '#F43F5E',
    unitLabel: '%',
    dataType: 'sparse',
    group: 'efficiency',
    formatValue: (v) => `${v.toFixed(1)}%`,
    formatTick: (v) => `${v.toFixed(0)}%`,
  },
}

export const SYNERGY_DEFAULTS = { left: 'tsb' as SynergyMetricKey, right: 'bike_ef' as SynergyMetricKey }

// ---------------------------------------------------------------------------
// Data builder
// ---------------------------------------------------------------------------

export function buildSynergyData(
  workouts: Workout[],
  sessionMetricsMap: Map<string, SessionMetric[]>,
): SynergyDataPoint[] {
  if (workouts.length === 0) return []

  // Compute daily series
  const ctlSeries = calculateCTLSeries(workouts)
  const atlSeries = calculateATLSeries(workouts)
  const tsbSeries = calculateTSBSeries(workouts)

  // Build date-indexed map from daily series
  const dateMap = new Map<string, SynergyDataPoint>()

  for (const p of ctlSeries) {
    dateMap.set(p.date, {
      date: p.date,
      tsb: null,
      ctl: p.value,
      atl: null,
      swim_ef: null,
      bike_ef: null,
      run_ef: null,
      decoupling: null,
    })
  }

  for (const p of atlSeries) {
    const existing = dateMap.get(p.date)
    if (existing) existing.atl = p.value
  }

  for (const p of tsbSeries) {
    const existing = dateMap.get(p.date)
    if (existing) existing.tsb = p.value
  }

  // Compute per-workout sparse metrics
  for (const w of workouts) {
    const point = dateMap.get(w.date)
    if (!point) continue

    // EF by sport
    if (w.sport === 'swim') {
      const ef = calculateSwimEF(w)
      if (ef !== null) point.swim_ef = ef
    } else if (w.sport === 'bike') {
      const ef = calculateEF(w)
      if (ef !== null) point.bike_ef = ef
    } else if (w.sport === 'run') {
      const ef = calculateRunEF(w)
      if (ef !== null) point.run_ef = ef
    }

    // Decoupling from session metrics
    const metrics = sessionMetricsMap.get(w.id)
    if (metrics && metrics.length >= 10) {
      const dc = calculateDecoupling(metrics)
      if (dc !== null) point.decoupling = dc
    }
  }

  // Return sorted by date
  return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}
