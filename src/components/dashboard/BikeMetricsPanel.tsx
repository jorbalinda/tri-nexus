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
  convertSpeed: (km: number) => number
  distanceLabel: string
  speedLabel: string
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatSpeed(distMeters: number | null, durSeconds: number | null, toMiles: boolean): string {
  if (!distMeters || !durSeconds || durSeconds === 0) return '—'
  let kmh = (distMeters / 1000) / (durSeconds / 3600)
  if (toMiles) kmh *= 0.621371
  return kmh.toFixed(1)
}

const allMetrics: MetricConfig[] = [
  // Core
  {
    key: 'avg_speed', label: 'Avg Speed',
    getValue: (w, c) => w ? formatSpeed(w.distance_meters, w.duration_seconds, c.speedLabel === 'mi') : '—',
    getUnit: (c) => `${c.speedLabel}/h`,
    category: 'core',
  },
  {
    key: 'max_speed', label: 'Max Speed',
    getValue: (w, c) => {
      if (!w?.distance_meters || !w?.duration_seconds) return '—'
      // Estimate max as ~1.15x avg
      const avg = (w.distance_meters / 1000) / (w.duration_seconds / 3600)
      let max = avg * 1.15
      if (c.speedLabel === 'mi') max *= 0.621371
      return max.toFixed(1)
    },
    getUnit: (c) => `${c.speedLabel}/h`,
    category: 'core',
  },
  {
    key: 'distance', label: 'Distance',
    getValue: (w, c) => {
      if (!w?.distance_meters) return '—'
      const val = c.speedLabel === 'mi'
        ? (w.distance_meters / 1000) * 0.621371
        : w.distance_meters / 1000
      return val.toFixed(1)
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
    key: 'power', label: 'Power',
    getValue: (w) => w?.avg_power_watts ?? '—',
    getUnit: () => 'W',
    category: 'core',
  },
  {
    key: 'ftp', label: 'FTP',
    getValue: (w) => {
      // Estimate FTP from normalized power (NP ≈ 95% of FTP for threshold rides)
      if (!w?.normalized_power) return '—'
      return Math.round(w.normalized_power * 0.95)
    },
    getUnit: () => 'W',
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
    getValue: (w) => w?.avg_cadence_rpm ?? '—',
    getUnit: () => 'rpm',
    category: 'core',
  },
  {
    key: 'elevation', label: 'Elevation Gain',
    getValue: (w, c) => {
      if (!w?.elevation_gain_meters) return '—'
      return c.distanceLabel === 'yd'
        ? Math.round(w.elevation_gain_meters * 3.28084) // feet
        : w.elevation_gain_meters
    },
    getUnit: (c) => c.distanceLabel === 'yd' ? 'ft' : 'm',
    category: 'core',
  },
  // Advanced
  {
    key: 'np', label: 'Normalized Power',
    getValue: (w) => w?.normalized_power ?? '—',
    getUnit: () => 'W',
    category: 'advanced',
  },
  {
    key: 'pw_ratio', label: 'Power-to-Weight',
    getValue: (w) => {
      if (!w?.normalized_power) return '—'
      // Assume ~75kg rider for demo
      return ((w.normalized_power) / 75).toFixed(2)
    },
    getUnit: () => 'W/kg',
    category: 'advanced',
  },
  {
    key: 'tss', label: 'Training Stress Score',
    getValue: (w) => w?.tss ?? '—',
    getUnit: () => 'TSS',
    category: 'advanced',
  },
  {
    key: 'if', label: 'Intensity Factor',
    getValue: (w) => {
      if (!w?.normalized_power) return '—'
      // IF = NP / FTP, estimate FTP as NP * 0.95
      const ftp = w.normalized_power * 0.95
      return (w.normalized_power / ftp).toFixed(2)
    },
    getUnit: () => 'IF',
    category: 'advanced',
  },
  {
    key: 'ctl', label: 'Chronic Training Load',
    getValue: () => '72',
    getUnit: () => 'CTL',
    category: 'advanced',
  },
  {
    key: 'vo2max', label: 'VO2 Max',
    getValue: () => '52.4',
    getUnit: () => 'ml/kg/min',
    category: 'advanced',
  },
  {
    key: 'hrv', label: 'Heart Rate Variability',
    getValue: () => '55',
    getUnit: () => 'ms',
    category: 'advanced',
  },
  {
    key: 'calories', label: 'Calories / Kilojoules',
    getValue: (w) => {
      if (!w?.calories) return '—'
      const kj = Math.round(w.calories * 4.184)
      return `${w.calories} / ${kj}`
    },
    getUnit: () => 'kcal / kJ',
    category: 'advanced',
  },
  {
    key: 'lr_balance', label: 'L/R Power Balance',
    getValue: () => '49 / 51',
    getUnit: () => '%',
    category: 'advanced',
  },
  {
    key: 'mmp', label: 'Mean Maximal Power',
    getValue: (w) => {
      if (!w?.avg_power_watts) return '—'
      const ap = w.avg_power_watts
      // Estimate: sprint ~2.5x, 1min ~1.8x, 5min ~1.3x, 20min ~1.05x
      return `${Math.round(ap * 2.5)} / ${Math.round(ap * 1.8)} / ${Math.round(ap * 1.3)} / ${Math.round(ap * 1.05)}`
    },
    getUnit: () => 'sprint/1m/5m/20m W',
    category: 'advanced',
  },
  {
    key: 'rpe', label: 'RPE',
    getValue: (w) => w?.rpe ?? '—',
    getUnit: () => '/ 10',
    category: 'advanced',
  },
]

const defaultEnabled = ['avg_speed', 'distance', 'time', 'power', 'heart_rate', 'cadence', 'elevation', 'ftp']

interface BikeMetricsPanelProps {
  workout?: Workout | null
}

export default function BikeMetricsPanel({ workout = null }: BikeMetricsPanelProps) {
  const [enabledMetrics, setEnabledMetrics] = useState<Set<string>>(new Set(defaultEnabled))
  const [showConfig, setShowConfig] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { convertDistance, convertSpeed, distanceLabel, speedLabel } = useUnits()

  const convertFns: ConvertFns = { convertDistance, convertSpeed, distanceLabel, speedLabel }

  const toggleMetric = (key: string) => {
    const metric = allMetrics.find((m) => m.key === key)
    const isEnabling = !enabledMetrics.has(key)

    setEnabledMetrics((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

    // Auto-expand advanced section when enabling an advanced metric
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
            Bike Metrics
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
                ? 'bg-orange-600 text-white'
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
                    ? 'bg-orange-600 text-white'
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
                    ? 'bg-orange-600 text-white'
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
                      <div key={m.key} className="bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl p-5 border border-orange-100/50 dark:border-orange-900/30">
                        <p className="text-[10px] font-bold uppercase tracking-[2px] text-orange-400 mb-2">
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
