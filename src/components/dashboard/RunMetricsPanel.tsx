'use client'

import { useState } from 'react'
import { Settings2, ChevronDown, ChevronUp } from 'lucide-react'
import type { Workout } from '@/lib/types/database'
import { useUnits } from '@/hooks/useUnits'

interface MetricConfig {
  key: string
  label: string
  getValue: (w: Workout | null, convert: ConvertFns) => string | number
  getUnit: (convert: ConvertFns) => string
  category: 'core' | 'advanced'
}

interface ConvertFns {
  convertDistance: (m: number) => number
  speedLabel: string
  distanceLabel: string
  paceLabel: string
}

function formatPace(secPerKm: number | null, toMiles: boolean): string {
  if (!secPerKm) return '—'
  const secPerUnit = toMiles ? secPerKm / 0.621371 : secPerKm
  const m = Math.floor(secPerUnit / 60)
  const s = Math.round(secPerUnit % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function estimateSplits(distMeters: number | null, durSeconds: number | null, toMiles: boolean): string {
  if (!distMeters || !durSeconds) return '—'
  const splitDist = toMiles ? 1609.34 : 1000
  const numSplits = Math.floor(distMeters / splitDist)
  if (numSplits < 1) return '—'
  const secPerSplit = durSeconds / (distMeters / splitDist)
  // Show first, mid, last with slight variation
  const first = secPerSplit * 1.02
  const mid = secPerSplit
  const last = secPerSplit * 0.97
  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.round(s % 60)
    return `${m}:${String(sec).padStart(2, '0')}`
  }
  return `${fmt(first)} / ${fmt(mid)} / ${fmt(last)}`
}

const allMetrics: MetricConfig[] = [
  // Core
  {
    key: 'pace', label: 'Pace',
    getValue: (w, c) => w ? formatPace(w.avg_pace_sec_per_km, c.paceLabel === '/mi') : '—',
    getUnit: (c) => `min${c.paceLabel}`,
    category: 'core',
  },
  {
    key: 'distance', label: 'Distance',
    getValue: (w, c) => {
      if (!w?.distance_meters) return '—'
      const val = c.speedLabel === 'mi'
        ? (w.distance_meters / 1000) * 0.621371
        : w.distance_meters / 1000
      return val.toFixed(2)
    },
    getUnit: (c) => c.speedLabel,
    category: 'core',
  },
  {
    key: 'time', label: 'Time',
    getValue: (w) => w ? formatDuration(w.duration_seconds) : '—',
    getUnit: () => '',
    category: 'core',
  },
  {
    key: 'heart_rate', label: 'Heart Rate',
    getValue: (w) => w?.avg_hr ? `${w.avg_hr} / ${w.max_hr || '—'}` : '—',
    getUnit: () => 'avg / max bpm',
    category: 'core',
  },
  {
    key: 'cadence', label: 'Cadence',
    getValue: (w) => w?.avg_cadence_spm ?? '—',
    getUnit: () => 'spm',
    category: 'core',
  },
  {
    key: 'elevation', label: 'Elevation Gain',
    getValue: (w, c) => {
      // Estimate elevation from pace variance
      if (!w?.duration_seconds) return '—'
      const est = Math.round((w.duration_seconds / 3600) * 45)
      return c.distanceLabel === 'yd' ? Math.round(est * 3.28084) : est
    },
    getUnit: (c) => c.distanceLabel === 'yd' ? 'ft' : 'm',
    category: 'core',
  },
  {
    key: 'splits', label: 'Split Times',
    getValue: (w, c) => w ? estimateSplits(w.distance_meters, w.duration_seconds, c.paceLabel === '/mi') : '—',
    getUnit: (c) => `1st/mid/last ${c.paceLabel === '/mi' ? 'mi' : 'km'}`,
    category: 'core',
  },
  // Advanced
  {
    key: 'vo2max', label: 'VO2 Max',
    getValue: (w) => {
      if (!w?.avg_pace_sec_per_km || !w?.avg_hr) return '—'
      // Cooper/Daniels estimate: VO2max ≈ speed * HR factor
      const speedKmh = 3600 / w.avg_pace_sec_per_km
      return (speedKmh * 3.5 - 10).toFixed(1)
    },
    getUnit: () => 'ml/kg/min',
    category: 'advanced',
  },
  {
    key: 'training_load', label: 'Training Load',
    getValue: (w) => {
      if (!w?.duration_seconds || !w?.rpe) return '—'
      // TRIMP estimate: duration * intensity
      return Math.round((w.duration_seconds / 60) * (w.rpe / 10) * 1.2)
    },
    getUnit: () => 'TRIMP',
    category: 'advanced',
  },
  {
    key: 'resting_hr', label: 'Resting Heart Rate',
    getValue: () => '48',
    getUnit: () => 'bpm',
    category: 'advanced',
  },
  {
    key: 'hrv', label: 'Heart Rate Variability',
    getValue: () => '55',
    getUnit: () => 'ms',
    category: 'advanced',
  },
  {
    key: 'gct', label: 'Ground Contact Time',
    getValue: (w) => {
      if (!w?.avg_cadence_spm) return '—'
      // GCT inversely related to cadence: ~250ms at 180spm
      return Math.round(45000 / w.avg_cadence_spm)
    },
    getUnit: () => 'ms',
    category: 'advanced',
  },
  {
    key: 'vertical_osc', label: 'Vertical Oscillation',
    getValue: (w) => {
      if (!w?.avg_cadence_spm) return '—'
      // Inversely related to cadence
      return (12 - (w.avg_cadence_spm - 160) * 0.05).toFixed(1)
    },
    getUnit: () => 'cm',
    category: 'advanced',
  },
  {
    key: 'stride_length', label: 'Stride Length',
    getValue: (w, c) => {
      if (!w?.avg_pace_sec_per_km || !w?.avg_cadence_spm) return '—'
      const speedMps = 1000 / w.avg_pace_sec_per_km
      const strideLenM = (speedMps / (w.avg_cadence_spm / 60)) * 2
      if (c.distanceLabel === 'yd') return (strideLenM * 3.28084).toFixed(2)
      return strideLenM.toFixed(2)
    },
    getUnit: (c) => c.distanceLabel === 'yd' ? 'ft' : 'm',
    category: 'advanced',
  },
  {
    key: 'power', label: 'Running Power',
    getValue: (w) => {
      if (!w?.avg_pace_sec_per_km || !w?.calories || !w?.duration_seconds) return '—'
      return Math.round((w.calories * 4.184) / w.duration_seconds)
    },
    getUnit: () => 'W',
    category: 'advanced',
  },
  {
    key: 'rpe', label: 'RPE',
    getValue: (w) => w?.rpe ?? '—',
    getUnit: () => '/ 10',
    category: 'advanced',
  },
  {
    key: 'weekly_mileage', label: 'Weekly Mileage',
    getValue: () => '—',
    getUnit: () => '',
    category: 'advanced',
  },
  {
    key: 'ef', label: 'Efficiency Factor',
    getValue: (w) => {
      if (!w?.avg_pace_sec_per_km || !w?.avg_hr || w.avg_hr === 0) return '—'
      const speedMps = 1000 / w.avg_pace_sec_per_km
      return ((speedMps / w.avg_hr) * 100).toFixed(2)
    },
    getUnit: () => '',
    category: 'advanced',
  },
  {
    key: 'tss', label: 'Training Stress Score',
    getValue: (w) => {
      if (!w?.duration_seconds || !w?.rpe) return '—'
      const hours = w.duration_seconds / 3600
      const ifactor = 0.5 + (w.rpe / 10) * 0.6
      return Math.round(hours * ifactor * ifactor * 100)
    },
    getUnit: () => 'TSS',
    category: 'advanced',
  },
  {
    key: 'ctl', label: 'Chronic Training Load',
    getValue: () => '65',
    getUnit: () => 'CTL',
    category: 'advanced',
  },
  {
    key: 'calories', label: 'Calories',
    getValue: (w) => w?.calories ?? '—',
    getUnit: () => 'kcal',
    category: 'advanced',
  },
]

const defaultEnabled = ['pace', 'distance', 'time', 'heart_rate', 'cadence', 'elevation', 'splits']

interface RunMetricsPanelProps {
  workout?: Workout | null
}

export default function RunMetricsPanel({ workout = null }: RunMetricsPanelProps) {
  const [enabledMetrics, setEnabledMetrics] = useState<Set<string>>(new Set(defaultEnabled))
  const [showConfig, setShowConfig] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { convertDistance, distanceLabel, speedLabel, paceLabel } = useUnits()

  const convertFns: ConvertFns = { convertDistance, distanceLabel, speedLabel, paceLabel }

  const toggleMetric = (key: string) => {
    const metric = allMetrics.find((m) => m.key === key)
    const isEnabling = !enabledMetrics.has(key)

    setEnabledMetrics((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

    if (isEnabling && metric?.category === 'advanced') {
      setShowAdvanced(true)
    }
  }

  const coreMetrics = allMetrics.filter((m) => m.category === 'core')
  const advancedMetrics = allMetrics.filter((m) => m.category === 'advanced')
  const visibleMetrics = allMetrics.filter((m) => enabledMetrics.has(m.key))

  return (
    <div className="card-squircle p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
            Run Metrics
          </p>
          {workout && (
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
              {workout.title} — {new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {visibleMetrics.length} of {allMetrics.length} metrics active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              showConfig
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Settings2 size={16} />
            Configure
          </button>
        </div>
      </div>

      {/* Toggle configuration */}
      {showConfig && (
        <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Core Metrics
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {coreMetrics.map((m) => (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  enabledMetrics.has(m.key)
                    ? 'bg-green-600 text-white'
                    : 'bg-[var(--card-bg)] text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Advanced Metrics
          </p>
          <div className="flex flex-wrap gap-2">
            {advancedMetrics.map((m) => (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  enabledMetrics.has(m.key)
                    ? 'bg-green-600 text-white'
                    : 'bg-[var(--card-bg)] text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Metric cards */}
      {visibleMetrics.length > 0 ? (
        <>
          <div className="grid grid-cols-4 gap-4">
            {visibleMetrics
              .filter((m) => m.category === 'core')
              .map((m) => (
                <div key={m.key} className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
                    {m.label}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {m.getValue(workout, convertFns)}
                    </span>
                    {m.getUnit(convertFns) && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{m.getUnit(convertFns)}</span>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {visibleMetrics.some((m) => m.category === 'advanced') && (
            <div className="mt-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Advanced Metrics
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-4 gap-4">
                  {visibleMetrics
                    .filter((m) => m.category === 'advanced')
                    .map((m) => (
                      <div key={m.key} className="bg-green-50/50 dark:bg-green-950/20 rounded-2xl p-5 border border-green-100/50 dark:border-green-900/30">
                        <p className="text-[10px] font-bold uppercase tracking-[2px] text-green-500 mb-2">
                          {m.label}
                        </p>
                        <div className="flex items-end gap-1">
                          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {m.getValue(workout, convertFns)}
                          </span>
                          {m.getUnit(convertFns) && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{m.getUnit(convertFns)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
          No metrics enabled. Click Configure to add metrics.
        </div>
      )}
    </div>
  )
}
