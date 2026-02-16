'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { SessionMetric, Workout } from '@/lib/types/database'
import { useUnits } from '@/hooks/useUnits'
import {
  METRIC_CONFIGS,
  SPORT_DEFAULTS,
  TIMESERIES_METRICS,
  AGGREGATE_METRICS,
  ALL_METRICS,
  getAggregateValue,
  getMetricLabel,
  type MetricKey,
  type TimeSeriesKey,
  type Sport,
  type UnitContext,
} from '@/lib/telemetry/metric-config'
import MetricSelector from '@/components/ui/MetricSelector'

interface TelemetryChartProps {
  sport: 'swim' | 'bike' | 'run' | 'synergy'
  sessionMetrics?: SessionMetric[]
  workout?: Workout | null
  workoutTitle?: string
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  return `${m}:${String(seconds % 60 === 0 ? '00' : '30')}`
}

/** Extract raw metric value from a SessionMetric row */
function getRawValue(m: SessionMetric, key: TimeSeriesKey, sport: Sport, yardsFactor: number): number | null {
  switch (key) {
    case 'heart_rate': return m.heart_rate
    case 'power_watts': return m.power_watts
    case 'pace_sec_per_km': {
      if (m.pace_sec_per_km == null) return null
      if (sport === 'swim') return (m.pace_sec_per_km / 10) * yardsFactor
      return m.pace_sec_per_km
    }
    case 'cadence': return m.cadence
    case 'speed_mps': return m.speed_mps
  }
}

/** Generate placeholder value for a time-series metric */
function placeholderValue(key: TimeSeriesKey, i: number): number {
  switch (key) {
    case 'heart_rate': return Math.round(130 + Math.sin(i / 5) * 15 + Math.random() * 8)
    case 'power_watts': return Math.round(200 + Math.cos(i / 7) * 30 + Math.random() * 15)
    case 'pace_sec_per_km': return Math.round(88 + Math.cos(i / 7) * 8 + Math.random() * 4)
    case 'cadence': return Math.round(80 + Math.sin(i / 4) * 5)
    case 'speed_mps': return +(1.0 + Math.sin(i / 6) * 0.2).toFixed(2)
  }
}

export default function TelemetryChart({ sport, sessionMetrics, workout, workoutTitle }: TelemetryChartProps) {
  const units = useUnits()
  const effectiveSport: Sport = sport === 'synergy' ? 'bike' : sport
  const defaults = SPORT_DEFAULTS[effectiveSport]

  const [leftMetric, setLeftMetric] = useState<MetricKey>(defaults.left)
  const [rightMetric, setRightMetric] = useState<MetricKey>(defaults.right)

  const yardsFactor = units.distanceUnit === 'yards' ? 0.9144 : 1

  const unitCtx: UnitContext = useMemo(() => ({
    sport: effectiveSport,
    distanceUnit: units.distanceUnit,
    speedUnit: units.speedUnit,
    convertPace: units.convertPace,
    convertDistance: units.convertDistance,
    poolLabel: units.poolLabel,
    paceLabel: units.paceLabel,
    distanceLabel: units.distanceLabel,
    speedLabel: units.speedLabel,
  }), [effectiveSport, units.distanceUnit, units.speedUnit, units.convertPace, units.convertDistance, units.poolLabel, units.paceLabel, units.distanceLabel, units.speedLabel])

  const hasRealData = sessionMetrics && sessionMetrics.length > 0

  // Build base chart data with all 5 time-series fields
  const baseChartData = useMemo(() => {
    if (hasRealData) {
      return sessionMetrics.map((m) => {
        const row: Record<string, number | null | string> = {
          time: formatTime(m.timestamp_offset_seconds),
        }
        for (const key of TIMESERIES_METRICS) {
          row[key] = getRawValue(m, key, effectiveSport, yardsFactor)
        }
        return row
      })
    }
    return Array.from({ length: 60 }, (_, i) => {
      const row: Record<string, number | string> = {
        time: `${Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
      }
      for (const key of TIMESERIES_METRICS) {
        row[key] = placeholderValue(key, i)
      }
      return row
    })
  }, [hasRealData, sessionMetrics, effectiveSport, yardsFactor])

  // Detect disabled metrics
  const disabledMetrics = useMemo(() => {
    const disabled = new Set<MetricKey>()

    // Time-series: disabled if real data exists but all null
    if (hasRealData) {
      for (const key of TIMESERIES_METRICS) {
        const allNull = baseChartData.every((d) => d[key] == null)
        if (allNull) disabled.add(key)
      }
    }

    // Aggregates: disabled if no workout or field is null
    for (const key of AGGREGATE_METRICS) {
      if (!workout) {
        disabled.add(key)
      } else {
        const value = getAggregateValue(key, workout, effectiveSport)
        if (value == null) disabled.add(key)
      }
    }

    return disabled
  }, [hasRealData, baseChartData, workout, effectiveSport])

  // Auto-fallback if selected metric becomes unavailable
  useEffect(() => {
    if (disabledMetrics.has(leftMetric)) {
      const fallback = ALL_METRICS.find((k) => !disabledMetrics.has(k) && k !== rightMetric)
      if (fallback) setLeftMetric(fallback)
    }
    if (disabledMetrics.has(rightMetric)) {
      const fallback = ALL_METRICS.find((k) => !disabledMetrics.has(k) && k !== leftMetric)
      if (fallback) setRightMetric(fallback)
    }
  }, [disabledMetrics, leftMetric, rightMetric])

  // Reset to sport defaults when sport changes
  useEffect(() => {
    setLeftMetric(defaults.left)
    setRightMetric(defaults.right)
  }, [effectiveSport, defaults.left, defaults.right])

  const leftConfig = METRIC_CONFIGS[leftMetric]
  const rightConfig = METRIC_CONFIGS[rightMetric]
  const leftIsTimeSeries = leftConfig.type === 'timeseries'
  const rightIsTimeSeries = rightConfig.type === 'timeseries'

  // Resolve aggregate values
  const leftAggValue = !leftIsTimeSeries && workout
    ? getAggregateValue(leftMetric, workout, effectiveSport)
    : null
  const rightAggValue = !rightIsTimeSeries && workout
    ? getAggregateValue(rightMetric, workout, effectiveSport)
    : null

  // Final chart data: inject aggregate values as constants so Recharts has
  // actual data for every axis (ReferenceLine doesn't bind to axes properly)
  const chartData = useMemo(() => {
    if (leftIsTimeSeries && rightIsTimeSeries) return baseChartData
    return baseChartData.map((row) => {
      const newRow = { ...row }
      if (!leftIsTimeSeries && leftAggValue != null) {
        newRow[leftMetric] = leftAggValue
      }
      if (!rightIsTimeSeries && rightAggValue != null) {
        newRow[rightMetric] = rightAggValue
      }
      return newRow
    })
  }, [baseChartData, leftIsTimeSeries, rightIsTimeSeries, leftMetric, rightMetric, leftAggValue, rightAggValue])

  // Compute Y-axis domains
  const computeDomain = (metric: MetricKey, isTimeSeries: boolean, aggValue: number | null): [number, number] => {
    if (isTimeSeries) {
      const values = baseChartData.map((d) => d[metric] as number | null).filter((v): v is number => v != null)
      if (!values.length) return [0, 100]
      const min = Math.min(...values)
      const max = Math.max(...values)
      const pad = Math.max((max - min) * 0.1, 5)
      return [min - pad, max + pad]
    }
    if (aggValue != null) {
      const pad = Math.max(Math.abs(aggValue) * 0.15, 5)
      return [aggValue - pad, aggValue + pad]
    }
    return [0, 100]
  }

  const leftDomain = computeDomain(leftMetric, leftIsTimeSeries, leftAggValue)
  const rightDomain = computeDomain(rightMetric, rightIsTimeSeries, rightAggValue)

  // Tooltip formatter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTooltipValue = (value: any, name: any) => {
    if (name === leftMetric) return [leftConfig.formatValue(value, unitCtx), getMetricLabel(leftMetric, effectiveSport)]
    if (name === rightMetric) return [rightConfig.formatValue(value, unitCtx), getMetricLabel(rightMetric, effectiveSport)]
    return [value, name]
  }

  return (
    <div className="card-squircle p-8 chart-gradient">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
            Session Telemetry
          </p>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-1">
            {workoutTitle || `${leftConfig.shortLabel} vs ${rightConfig.shortLabel}`}
          </p>
          {!hasRealData && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Showing sample data</p>
          )}
        </div>
        {sport !== 'synergy' && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MetricSelector
              value={leftMetric}
              onChange={setLeftMetric}
              disabledMetrics={disabledMetrics}
              otherSelected={rightMetric}
              sport={effectiveSport}
              unitCtx={unitCtx}
            />
            <span className="text-gray-300 dark:text-gray-600 font-medium">vs</span>
            <MetricSelector
              value={rightMetric}
              onChange={setRightMetric}
              disabledMetrics={disabledMetrics}
              otherSelected={leftMetric}
              sport={effectiveSport}
              unitCtx={unitCtx}
            />
          </div>
        )}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              {leftIsTimeSeries && (
                <linearGradient id={`gradient-${leftMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={leftConfig.color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={leftConfig.color} stopOpacity={0} />
                </linearGradient>
              )}
              {rightIsTimeSeries && (
                <linearGradient id={`gradient-${rightMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={rightConfig.color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={rightConfig.color} stopOpacity={0} />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval={Math.floor(chartData.length / 10)}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              domain={leftDomain}
              tickFormatter={(v: number) => leftConfig.formatTick(v, unitCtx)}
              label={{
                value: leftConfig.unitLabel(unitCtx),
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
              tickFormatter={(v: number) => rightConfig.formatTick(v, unitCtx)}
              label={{
                value: rightConfig.unitLabel(unitCtx),
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
              formatter={formatTooltipValue}
            />

            {/* Left axis */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey={leftMetric}
              stroke={leftConfig.color}
              fill={leftIsTimeSeries ? `url(#gradient-${leftMetric})` : 'none'}
              strokeWidth={2}
              strokeDasharray={leftIsTimeSeries ? undefined : '8 4'}
              dot={false}
              connectNulls
            />

            {/* Right axis */}
            <Area
              yAxisId="right"
              type="monotone"
              dataKey={rightMetric}
              stroke={rightConfig.color}
              fill={rightIsTimeSeries ? `url(#gradient-${rightMetric})` : 'none'}
              strokeWidth={2}
              strokeDasharray={rightIsTimeSeries ? undefined : '8 4'}
              dot={false}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
