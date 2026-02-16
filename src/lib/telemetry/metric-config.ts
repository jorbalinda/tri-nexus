// Pure TypeScript config — no React dependencies

import type { Workout } from '@/lib/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Time-series metrics come from session_metrics rows (one per timestamp). */
export type TimeSeriesKey = 'heart_rate' | 'power_watts' | 'pace_sec_per_km' | 'cadence' | 'speed_mps'

/** Aggregate metrics are single values from the Workout object. */
export type AggregateKey =
  | 'avg_hr' | 'max_hr'
  | 'avg_power_watts' | 'normalized_power' | 'tss'
  | 'avg_pace_sec_per_km' | 'avg_cadence'
  | 'elevation_gain_meters' | 'swolf'
  | 'calories' | 'rpe' | 'distance_meters'

export type MetricKey = TimeSeriesKey | AggregateKey

export type MetricType = 'timeseries' | 'aggregate'

export type Sport = 'swim' | 'bike' | 'run'

export interface UnitContext {
  sport: Sport
  distanceUnit: 'meters' | 'yards'
  speedUnit: 'km' | 'miles'
  convertPace: (secPerKm: number) => number
  convertDistance: (meters: number) => number
  poolLabel: string
  paceLabel: string
  distanceLabel: string
  speedLabel: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert seconds to m:ss format */
export function secToMinSec(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = Math.round(totalSec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Sport-contextual display label (e.g. cadence → "Stroke Rate" for swim) */
export function getMetricLabel(key: MetricKey, sport: Sport): string {
  if (key === 'cadence' && sport === 'swim') return 'Stroke Rate'
  if (key === 'avg_cadence' && sport === 'swim') return 'Avg Stroke Rate'
  if (key === 'avg_cadence' && sport === 'bike') return 'Avg Cadence (rpm)'
  if (key === 'avg_cadence' && sport === 'run') return 'Avg Cadence (spm)'
  return METRIC_CONFIGS[key].label
}

// ---------------------------------------------------------------------------
// Metric configs
// ---------------------------------------------------------------------------

export interface MetricConfig {
  key: MetricKey
  label: string
  shortLabel: string
  color: string
  type: MetricType
  unitLabel: (ctx: UnitContext) => string
  formatValue: (v: number, ctx: UnitContext) => string
  formatTick: (v: number, ctx: UnitContext) => string
}

export const METRIC_CONFIGS: Record<MetricKey, MetricConfig> = {
  // ── Time-series ──────────────────────────────────────────────────────
  heart_rate: {
    key: 'heart_rate',
    label: 'Heart Rate',
    shortLabel: 'HR',
    color: '#EF4444',
    type: 'timeseries',
    unitLabel: () => 'HR (bpm)',
    formatValue: (v) => `${Math.round(v)} bpm`,
    formatTick: (v) => `${Math.round(v)}`,
  },
  power_watts: {
    key: 'power_watts',
    label: 'Power',
    shortLabel: 'Power',
    color: '#F59E0B',
    type: 'timeseries',
    unitLabel: () => 'Power (W)',
    formatValue: (v) => `${Math.round(v)} W`,
    formatTick: (v) => `${Math.round(v)}`,
  },
  pace_sec_per_km: {
    key: 'pace_sec_per_km',
    label: 'Pace',
    shortLabel: 'Pace',
    color: '#3B82F6',
    type: 'timeseries',
    unitLabel: (ctx) => ctx.sport === 'swim' ? `Pace (${ctx.poolLabel})` : `Pace (${ctx.paceLabel})`,
    formatValue: (v, ctx) => {
      if (ctx.sport === 'swim') return `${secToMinSec(v)} ${ctx.poolLabel}`
      const converted = ctx.convertPace(v)
      return `${secToMinSec(converted)} ${ctx.paceLabel}`
    },
    formatTick: (v, ctx) => {
      if (ctx.sport === 'swim') return secToMinSec(v)
      return secToMinSec(ctx.convertPace(v))
    },
  },
  cadence: {
    key: 'cadence',
    label: 'Cadence',
    shortLabel: 'Cadence',
    color: '#8B5CF6',
    type: 'timeseries',
    unitLabel: (ctx) => ctx.sport === 'bike' ? 'Cadence (rpm)' : 'Cadence (spm)',
    formatValue: (v, ctx) => `${Math.round(v)} ${ctx.sport === 'bike' ? 'rpm' : 'spm'}`,
    formatTick: (v) => `${Math.round(v)}`,
  },
  speed_mps: {
    key: 'speed_mps',
    label: 'Speed',
    shortLabel: 'Speed',
    color: '#10B981',
    type: 'timeseries',
    unitLabel: (ctx) => ctx.speedUnit === 'miles' ? 'Speed (mph)' : 'Speed (km/h)',
    formatValue: (v, ctx) => {
      const kmh = v * 3.6
      if (ctx.speedUnit === 'miles') return `${(kmh * 0.621371).toFixed(1)} mph`
      return `${kmh.toFixed(1)} km/h`
    },
    formatTick: (v, ctx) => {
      const kmh = v * 3.6
      if (ctx.speedUnit === 'miles') return `${(kmh * 0.621371).toFixed(1)}`
      return `${kmh.toFixed(1)}`
    },
  },

  // ── Workout aggregates ───────────────────────────────────────────────
  avg_hr: {
    key: 'avg_hr',
    label: 'Avg Heart Rate',
    shortLabel: 'Avg HR',
    color: '#DC2626',
    type: 'aggregate',
    unitLabel: () => 'Avg HR (bpm)',
    formatValue: (v) => `${Math.round(v)} bpm`,
    formatTick: (v) => `${Math.round(v)}`,
  },
  max_hr: {
    key: 'max_hr',
    label: 'Max Heart Rate',
    shortLabel: 'Max HR',
    color: '#B91C1C',
    type: 'aggregate',
    unitLabel: () => 'Max HR (bpm)',
    formatValue: (v) => `${Math.round(v)} bpm`,
    formatTick: (v) => `${Math.round(v)}`,
  },
  avg_power_watts: {
    key: 'avg_power_watts',
    label: 'Avg Power',
    shortLabel: 'Avg Power',
    color: '#D97706',
    type: 'aggregate',
    unitLabel: () => 'Avg Power (W)',
    formatValue: (v) => `${Math.round(v)} W`,
    formatTick: (v) => `${Math.round(v)}`,
  },
  normalized_power: {
    key: 'normalized_power',
    label: 'Normalized Power',
    shortLabel: 'NP',
    color: '#B45309',
    type: 'aggregate',
    unitLabel: () => 'NP (W)',
    formatValue: (v) => `${Math.round(v)} W`,
    formatTick: (v) => `${Math.round(v)}`,
  },
  tss: {
    key: 'tss',
    label: 'Training Stress',
    shortLabel: 'TSS',
    color: '#92400E',
    type: 'aggregate',
    unitLabel: () => 'TSS',
    formatValue: (v) => `${Math.round(v)}`,
    formatTick: (v) => `${Math.round(v)}`,
  },
  avg_pace_sec_per_km: {
    key: 'avg_pace_sec_per_km',
    label: 'Avg Pace',
    shortLabel: 'Avg Pace',
    color: '#2563EB',
    type: 'aggregate',
    unitLabel: (ctx) => ctx.sport === 'swim' ? `Avg Pace (${ctx.poolLabel})` : `Avg Pace (${ctx.paceLabel})`,
    formatValue: (v, ctx) => {
      if (ctx.sport === 'swim') return `${secToMinSec(v / 10)} ${ctx.poolLabel}`
      return `${secToMinSec(ctx.convertPace(v))} ${ctx.paceLabel}`
    },
    formatTick: (v, ctx) => {
      if (ctx.sport === 'swim') return secToMinSec(v / 10)
      return secToMinSec(ctx.convertPace(v))
    },
  },
  avg_cadence: {
    key: 'avg_cadence',
    label: 'Avg Cadence',
    shortLabel: 'Avg Cad',
    color: '#6D28D9',
    type: 'aggregate',
    unitLabel: (ctx) => ctx.sport === 'bike' ? 'Avg Cadence (rpm)' : 'Avg Cadence (spm)',
    formatValue: (v, ctx) => `${Math.round(v)} ${ctx.sport === 'bike' ? 'rpm' : 'spm'}`,
    formatTick: (v) => `${Math.round(v)}`,
  },
  elevation_gain_meters: {
    key: 'elevation_gain_meters',
    label: 'Elevation Gain',
    shortLabel: 'Elev',
    color: '#059669',
    type: 'aggregate',
    unitLabel: (ctx) => ctx.distanceUnit === 'yards' ? 'Elevation (ft)' : 'Elevation (m)',
    formatValue: (v, ctx) => {
      if (ctx.distanceUnit === 'yards') return `${Math.round(v * 3.28084)} ft`
      return `${Math.round(v)} m`
    },
    formatTick: (v, ctx) => {
      if (ctx.distanceUnit === 'yards') return `${Math.round(v * 3.28084)}`
      return `${Math.round(v)}`
    },
  },
  swolf: {
    key: 'swolf',
    label: 'SWOLF',
    shortLabel: 'SWOLF',
    color: '#7C3AED',
    type: 'aggregate',
    unitLabel: () => 'SWOLF',
    formatValue: (v) => `${Math.round(v)}`,
    formatTick: (v) => `${Math.round(v)}`,
  },
  calories: {
    key: 'calories',
    label: 'Calories',
    shortLabel: 'Cal',
    color: '#EC4899',
    type: 'aggregate',
    unitLabel: () => 'Calories (kcal)',
    formatValue: (v) => `${Math.round(v)} kcal`,
    formatTick: (v) => `${Math.round(v)}`,
  },
  rpe: {
    key: 'rpe',
    label: 'RPE',
    shortLabel: 'RPE',
    color: '#F97316',
    type: 'aggregate',
    unitLabel: () => 'RPE (1–10)',
    formatValue: (v) => `${v}`,
    formatTick: (v) => `${v}`,
  },
  distance_meters: {
    key: 'distance_meters',
    label: 'Distance',
    shortLabel: 'Dist',
    color: '#06B6D4',
    type: 'aggregate',
    unitLabel: (ctx) => {
      if (ctx.sport === 'swim') return `Distance (${ctx.distanceLabel})`
      return `Distance (${ctx.speedLabel})`
    },
    formatValue: (v, ctx) => {
      if (ctx.sport === 'swim') return `${ctx.convertDistance(v)} ${ctx.distanceLabel}`
      const km = v / 1000
      if (ctx.speedUnit === 'miles') return `${(km * 0.621371).toFixed(1)} mi`
      return `${km.toFixed(1)} km`
    },
    formatTick: (v, ctx) => {
      if (ctx.sport === 'swim') return `${ctx.convertDistance(v)}`
      const km = v / 1000
      if (ctx.speedUnit === 'miles') return `${(km * 0.621371).toFixed(1)}`
      return `${km.toFixed(1)}`
    },
  },
}

// ---------------------------------------------------------------------------
// Metric lists
// ---------------------------------------------------------------------------

export const TIMESERIES_METRICS: TimeSeriesKey[] = [
  'heart_rate', 'power_watts', 'pace_sec_per_km', 'cadence', 'speed_mps',
]

export const AGGREGATE_METRICS: AggregateKey[] = [
  'avg_hr', 'max_hr',
  'avg_power_watts', 'normalized_power', 'tss',
  'avg_pace_sec_per_km', 'avg_cadence',
  'elevation_gain_meters', 'swolf',
  'calories', 'rpe', 'distance_meters',
]

export const ALL_METRICS: MetricKey[] = [...TIMESERIES_METRICS, ...AGGREGATE_METRICS]

// ---------------------------------------------------------------------------
// Sport defaults (only controls initial selection, NOT available list)
// ---------------------------------------------------------------------------

export interface SportDefaults {
  left: MetricKey
  right: MetricKey
}

export const SPORT_DEFAULTS: Record<Sport, SportDefaults> = {
  swim: { left: 'heart_rate', right: 'pace_sec_per_km' },
  bike: { left: 'heart_rate', right: 'power_watts' },
  run:  { left: 'heart_rate', right: 'pace_sec_per_km' },
}

// ---------------------------------------------------------------------------
// Aggregate value resolver
// ---------------------------------------------------------------------------

export function getAggregateValue(key: MetricKey, workout: Workout, sport: Sport): number | null {
  switch (key) {
    case 'avg_hr':               return workout.avg_hr
    case 'max_hr':               return workout.max_hr
    case 'avg_power_watts':      return workout.avg_power_watts
    case 'normalized_power':     return workout.normalized_power
    case 'tss':                  return workout.tss
    case 'elevation_gain_meters': return workout.elevation_gain_meters
    case 'swolf':                return workout.swolf
    case 'calories':             return workout.calories
    case 'rpe':                  return workout.rpe
    case 'distance_meters':      return workout.distance_meters
    case 'avg_pace_sec_per_km':  return workout.avg_pace_sec_per_km
    case 'avg_cadence':          return sport === 'bike' ? workout.avg_cadence_rpm : workout.avg_cadence_spm
    default:                     return null // time-series keys have no aggregate
  }
}
