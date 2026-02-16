'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChevronDown } from 'lucide-react'
import {
  SYNERGY_METRICS,
  SYNERGY_METRIC_CONFIGS,
  SYNERGY_DEFAULTS,
  type SynergyMetricKey,
  type SynergyDataPoint,
} from '@/lib/telemetry/synergy-config'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SynergyChartProps {
  data: SynergyDataPoint[]
  loading: boolean
}

// ---------------------------------------------------------------------------
// Inline metric selector
// ---------------------------------------------------------------------------

const LOAD_KEYS: SynergyMetricKey[] = ['tsb', 'ctl', 'atl']
const EFFICIENCY_KEYS: SynergyMetricKey[] = ['swim_ef', 'bike_ef', 'run_ef', 'decoupling']

function SynergyMetricSelector({
  value,
  onChange,
  disabledMetrics,
  otherSelected,
}: {
  value: SynergyMetricKey
  onChange: (key: SynergyMetricKey) => void
  disabledMetrics: Set<SynergyMetricKey>
  otherSelected: SynergyMetricKey
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const config = SYNERGY_METRIC_CONFIGS[value]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const renderGroup = (label: string, keys: SynergyMetricKey[], isLast: boolean) => {
    const available = keys.filter((k) => !disabledMetrics.has(k))
    if (available.length === 0) return null

    return (
      <>
        <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-gray-300 dark:text-gray-500 bg-gray-50/80 dark:bg-gray-900/80">
          {label}
        </div>
        {available.map((key, i) => {
          const mc = SYNERGY_METRIC_CONFIGS[key]
          const isSelected = key === value
          const isOther = key === otherSelected
          const isLastItem = isLast && i === available.length - 1

          return (
            <button
              key={key}
              disabled={isOther}
              onClick={() => { onChange(key); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-all ${
                isOther ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${!isLastItem ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
              style={isSelected ? { backgroundColor: `${mc.color}10` } : undefined}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: isOther ? '#d1d5db' : mc.color }} />
              <span className={`text-sm ${isSelected ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-700 dark:text-gray-300'}`}>
                {mc.label}
              </span>
              {isOther && <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">(other axis)</span>}
            </button>
          )
        })}
      </>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--card-bg)] border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer text-sm ${
          open ? 'ring-2 ring-gray-300/50 dark:ring-gray-600/50' : ''
        }`}
      >
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: config.color }} />
        <span className="font-medium text-gray-700 dark:text-gray-300">{config.label}</span>
        <ChevronDown size={14} className={`text-gray-400 dark:text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 min-w-[220px] bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {renderGroup('Training Load', LOAD_KEYS, false)}
          {renderGroup('Efficiency', EFFICIENCY_KEYS, true)}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Format date for X-axis
// ---------------------------------------------------------------------------

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ---------------------------------------------------------------------------
// Chart component
// ---------------------------------------------------------------------------

export default function SynergyChart({ data, loading }: SynergyChartProps) {
  const [leftMetric, setLeftMetric] = useState<SynergyMetricKey>(SYNERGY_DEFAULTS.left)
  const [rightMetric, setRightMetric] = useState<SynergyMetricKey>(SYNERGY_DEFAULTS.right)

  // Detect disabled metrics (all null)
  const disabledMetrics = useMemo(() => {
    const disabled = new Set<SynergyMetricKey>()
    for (const key of SYNERGY_METRICS) {
      const allNull = data.every((d) => d[key] === null)
      if (allNull) disabled.add(key)
    }
    return disabled
  }, [data])

  // Auto-fallback if selected metric has no data
  useEffect(() => {
    if (disabledMetrics.has(leftMetric)) {
      const fallback = SYNERGY_METRICS.find((k) => !disabledMetrics.has(k) && k !== rightMetric)
      if (fallback) setLeftMetric(fallback)
    }
    if (disabledMetrics.has(rightMetric)) {
      const fallback = SYNERGY_METRICS.find((k) => !disabledMetrics.has(k) && k !== leftMetric)
      if (fallback) setRightMetric(fallback)
    }
  }, [disabledMetrics, leftMetric, rightMetric])

  const leftConfig = SYNERGY_METRIC_CONFIGS[leftMetric]
  const rightConfig = SYNERGY_METRIC_CONFIGS[rightMetric]

  // Compute Y-axis domains
  const computeDomain = (key: SynergyMetricKey): [number, number] => {
    const values = data.map((d) => d[key]).filter((v): v is number => v !== null)
    if (values.length === 0) return [0, 100]
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = Math.max((max - min) * 0.15, 2)
    return [Math.floor(min - pad), Math.ceil(max + pad)]
  }

  const leftDomain = computeDomain(leftMetric)
  const rightDomain = computeDomain(rightMetric)

  // X-axis interval for ~8 labels
  const xInterval = data.length > 8 ? Math.floor(data.length / 8) : 0

  // Tooltip formatter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTooltipValue = (value: any, name: any) => {
    if (name === leftMetric) return [leftConfig.formatValue(value), leftConfig.label]
    if (name === rightMetric) return [rightConfig.formatValue(value), rightConfig.label]
    return [value, name]
  }

  const renderSeries = (key: SynergyMetricKey, axis: 'left' | 'right') => {
    const mc = SYNERGY_METRIC_CONFIGS[key]
    if (mc.dataType === 'daily') {
      return (
        <Area
          key={key}
          yAxisId={axis}
          type="monotone"
          dataKey={key}
          stroke={mc.color}
          fill={`url(#gradient-${key})`}
          strokeWidth={2}
          dot={false}
          connectNulls
        />
      )
    }
    return (
      <Line
        key={key}
        yAxisId={axis}
        type="monotone"
        dataKey={key}
        stroke={mc.color}
        strokeWidth={2}
        dot={{ r: 3, fill: mc.color, strokeWidth: 0 }}
        connectNulls
      />
    )
  }

  if (loading) {
    return (
      <div className="card-squircle p-8 chart-gradient">
        <div className="h-[360px] flex items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-squircle p-8 chart-gradient">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
            Cross-Sport Analytics
          </p>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-1">
            {leftConfig.shortLabel} vs {rightConfig.shortLabel}
          </p>
          {data.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">No workout data available</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <SynergyMetricSelector
            value={leftMetric}
            onChange={setLeftMetric}
            disabledMetrics={disabledMetrics}
            otherSelected={rightMetric}
          />
          <span className="text-gray-300 dark:text-gray-600 font-medium">vs</span>
          <SynergyMetricSelector
            value={rightMetric}
            onChange={setRightMetric}
            disabledMetrics={disabledMetrics}
            otherSelected={leftMetric}
          />
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              {SYNERGY_METRICS.filter((k) => SYNERGY_METRIC_CONFIGS[k].dataType === 'daily').map((key) => (
                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SYNERGY_METRIC_CONFIGS[key].color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={SYNERGY_METRIC_CONFIGS[key].color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval={xInterval}
              tickFormatter={formatDateLabel}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              domain={leftDomain}
              tickFormatter={(v: number) => leftConfig.formatTick(v)}
              label={{
                value: leftConfig.unitLabel,
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 10, fill: '#9ca3af' },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              domain={rightDomain}
              tickFormatter={(v: number) => rightConfig.formatTick(v)}
              label={{
                value: rightConfig.unitLabel,
                angle: 90,
                position: 'insideRight',
                style: { fontSize: 10, fill: '#9ca3af' },
              }}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                color: 'var(--foreground)',
              }}
              labelFormatter={(label) => formatDateLabel(String(label))}
              formatter={formatTooltipValue}
            />

            {renderSeries(leftMetric, 'left')}
            {renderSeries(rightMetric, 'right')}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
