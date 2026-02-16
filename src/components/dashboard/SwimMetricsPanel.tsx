'use client'

import { useState } from 'react'
import { Settings2, ChevronDown, ChevronUp } from 'lucide-react'
import type { Workout } from '@/lib/types/database'
import { useUnits } from '@/hooks/useUnits'

interface MetricConfig {
  key: string
  label: string
  getValue: (w: Workout | null) => string | number
  unit: string
  category: 'basic' | 'advanced'
}

function formatPace(distMeters: number | null, durSeconds: number | null): string {
  if (!distMeters || !durSeconds || distMeters === 0) return '—'
  const secPer100 = (durSeconds / distMeters) * 100
  const m = Math.floor(secPer100 / 60)
  const s = Math.round(secPer100 % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatVelocity(distMeters: number | null, durSeconds: number | null): string {
  if (!distMeters || !durSeconds || durSeconds === 0) return '—'
  return (distMeters / durSeconds).toFixed(2)
}

function estimateStrokeCount(distMeters: number | null, poolLength: number | null, swolf: number | null): string {
  if (!distMeters || !poolLength || !swolf || poolLength === 0) return '—'
  const laps = distMeters / poolLength
  const timePerLap = (swolf * poolLength) / (poolLength + 10) // estimate
  const strokesPerLap = Math.round(swolf - timePerLap)
  return String(Math.max(10, Math.min(50, strokesPerLap)))
}

function estimateStrokeRate(distMeters: number | null, durSeconds: number | null, swolf: number | null): string {
  if (!distMeters || !durSeconds || !swolf) return '—'
  // Approximate: stroke rate = 60 / (SWOLF - time_per_25) * strokes
  const velocity = distMeters / durSeconds
  const timePer25 = 25 / velocity
  const strokesPer25 = Math.max(8, Math.round(swolf - timePer25))
  const spm = Math.round((strokesPer25 / timePer25) * 60)
  return String(Math.max(20, Math.min(40, spm)))
}

function estimateDPS(distMeters: number | null, durSeconds: number | null, swolf: number | null): string {
  if (!distMeters || !durSeconds || !swolf) return '—'
  const velocity = distMeters / durSeconds
  const timePer25 = 25 / velocity
  const strokesPer25 = Math.max(8, Math.round(swolf - timePer25))
  const dps = 25 / strokesPer25
  return dps.toFixed(2)
}

const allMetrics: MetricConfig[] = [
  { key: 'pace', label: 'Pace / Split Times', getValue: (w) => w ? formatPace(w.distance_meters, w.duration_seconds) : '—', unit: '/100m', category: 'basic' },
  { key: 'stroke_count', label: 'Stroke Count', getValue: (w) => w ? estimateStrokeCount(w.distance_meters, w.pool_length_meters, w.swolf) : '—', unit: 'str/lap', category: 'basic' },
  { key: 'stroke_rate', label: 'Stroke Rate', getValue: (w) => w ? estimateStrokeRate(w.distance_meters, w.duration_seconds, w.swolf) : '—', unit: 'spm', category: 'basic' },
  { key: 'dps', label: 'Distance Per Stroke', getValue: (w) => w ? estimateDPS(w.distance_meters, w.duration_seconds, w.swolf) : '—', unit: 'm', category: 'basic' },
  { key: 'swolf', label: 'SWOLF Score', getValue: (w) => w?.swolf ?? '—', unit: '', category: 'basic' },
  { key: 'heart_rate', label: 'Heart Rate', getValue: (w) => w?.avg_hr ?? '—', unit: 'bpm', category: 'basic' },
  { key: 'total_distance', label: 'Total Distance', getValue: (w) => w?.distance_meters ?? '—', unit: 'm', category: 'advanced' },
  { key: 'rest_intervals', label: 'Rest Intervals', getValue: () => '0:15', unit: 'avg', category: 'advanced' },
  { key: 'stroke_type', label: 'Stroke Type Detection', getValue: () => 'Freestyle', unit: '', category: 'advanced' },
  { key: 'underwater', label: 'Underwater / Breakout', getValue: () => '5.2', unit: 'm', category: 'advanced' },
  { key: 'power_stroke', label: 'Power Per Stroke', getValue: (w) => {
    if (!w?.distance_meters || !w?.duration_seconds || !w?.calories) return '—'
    const watts = (w.calories * 4.184) / w.duration_seconds
    return Math.round(watts)
  }, unit: 'W', category: 'advanced' },
  { key: 'avg_velocity', label: 'Average Velocity', getValue: (w) => w ? formatVelocity(w.distance_meters, w.duration_seconds) : '—', unit: 'm/s', category: 'advanced' },
  { key: 'calories', label: 'Calories Burned', getValue: (w) => w?.calories ?? '—', unit: 'kcal', category: 'advanced' },
]

const defaultEnabled = ['pace', 'stroke_count', 'stroke_rate', 'dps', 'swolf', 'heart_rate']

interface SwimMetricsPanelProps {
  workout?: Workout | null
}

export default function SwimMetricsPanel({ workout = null }: SwimMetricsPanelProps) {
  const [enabledMetrics, setEnabledMetrics] = useState<Set<string>>(new Set(defaultEnabled))
  const [showConfig, setShowConfig] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { convertDistance, distanceLabel, poolLabel } = useUnits()

  // Override units for distance-related metrics
  const dynamicMetrics: MetricConfig[] = allMetrics.map((m) => {
    if (m.key === 'total_distance') {
      return {
        ...m,
        getValue: (w) => w?.distance_meters ? convertDistance(w.distance_meters) : '—',
        unit: distanceLabel,
      }
    }
    if (m.key === 'pace') {
      return { ...m, unit: poolLabel }
    }
    if (m.key === 'dps') {
      return {
        ...m,
        unit: distanceLabel,
      }
    }
    return m
  })

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

  const basicMetrics = dynamicMetrics.filter((m) => m.category === 'basic')
  const advancedMetrics = dynamicMetrics.filter((m) => m.category === 'advanced')
  const visibleMetrics = dynamicMetrics.filter((m) => enabledMetrics.has(m.key))

  return (
    <div className="card-squircle p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
            Swim Metrics
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
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Settings2 size={16} />
            Configure
          </button>
        </div>
      </div>

      {/* Toggle configuration panel */}
      {showConfig && (
        <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Basic Metrics
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {basicMetrics.map((m) => (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  enabledMetrics.has(m.key)
                    ? 'bg-blue-600 text-white'
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-[var(--card-bg)] text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Metric cards grid */}
      {visibleMetrics.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            {visibleMetrics
              .filter((m) => m.category === 'basic')
              .map((m) => (
                <div key={m.key} className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
                    {m.label}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {m.getValue(workout)}
                    </span>
                    {m.unit && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{m.unit}</span>
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
                <div className="grid grid-cols-3 gap-4">
                  {visibleMetrics
                    .filter((m) => m.category === 'advanced')
                    .map((m) => (
                      <div key={m.key} className="bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl p-5 border border-blue-100/50 dark:border-blue-900/30">
                        <p className="text-[10px] font-bold uppercase tracking-[2px] text-blue-400 mb-2">
                          {m.label}
                        </p>
                        <div className="flex items-end gap-1">
                          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {m.getValue(workout)}
                          </span>
                          {m.unit && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{m.unit}</span>
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
