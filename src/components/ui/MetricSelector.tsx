'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  METRIC_CONFIGS,
  TIMESERIES_METRICS,
  AGGREGATE_METRICS,
  getMetricLabel,
  type MetricKey,
  type Sport,
  type UnitContext,
} from '@/lib/telemetry/metric-config'

interface MetricSelectorProps {
  value: MetricKey
  onChange: (key: MetricKey) => void
  disabledMetrics: Set<MetricKey>
  otherSelected: MetricKey
  sport: Sport
  unitCtx: UnitContext
}

function MetricRow({
  metricKey,
  sport,
  isSelected,
  isDisabled,
  isOtherAxis,
  isNoData,
  onClick,
  isLast,
}: {
  metricKey: MetricKey
  sport: Sport
  isSelected: boolean
  isDisabled: boolean
  isOtherAxis: boolean
  isNoData: boolean
  onClick: () => void
  isLast: boolean
}) {
  const mc = METRIC_CONFIGS[metricKey]
  const label = getMetricLabel(metricKey, sport)

  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-all ${
        isDisabled
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
      } ${!isLast ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
      style={isSelected ? { backgroundColor: `${mc.color}10` } : undefined}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: isDisabled ? '#d1d5db' : mc.color }}
      />
      <span className={`text-sm ${isSelected ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-700 dark:text-gray-300'}`}>
        {label}
      </span>
      {isNoData && (
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">(no data)</span>
      )}
      {isOtherAxis && !isNoData && (
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">(other axis)</span>
      )}
    </button>
  )
}

export default function MetricSelector({
  value,
  onChange,
  disabledMetrics,
  otherSelected,
  sport,
}: MetricSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const config = METRIC_CONFIGS[value]
  const displayLabel = getMetricLabel(value, sport)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const renderGroup = (keys: readonly MetricKey[], isLastGroup: boolean) => {
    // Filter out metrics with no data — don't show them at all
    const available = keys.filter((key) => !disabledMetrics.has(key))
    if (available.length === 0) return null

    return available.map((key, i) => {
      const isSelected = key === value
      const isOtherAxis = key === otherSelected
      const isDisabled = isOtherAxis
      const isLast = isLastGroup && i === available.length - 1

      return (
        <MetricRow
          key={key}
          metricKey={key}
          sport={sport}
          isSelected={isSelected}
          isDisabled={isDisabled}
          isOtherAxis={isOtherAxis}
          isNoData={false}
          isLast={isLast}
          onClick={() => {
            if (!isDisabled) {
              onChange(key)
              setOpen(false)
            }
          }}
        />
      )
    })
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--card-bg)] border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer text-sm ${
          open ? 'ring-2 ring-gray-300/50 dark:ring-gray-600/50' : ''
        }`}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: config.color }}
        />
        <span className="font-medium text-gray-700 dark:text-gray-300">{displayLabel}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 dark:text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (() => {
        const liveGroup = renderGroup(TIMESERIES_METRICS, false)
        const statsGroup = renderGroup(AGGREGATE_METRICS, true)

        return (
          <div className="absolute top-full right-0 mt-2 min-w-[200px] bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
            {liveGroup && (
              <>
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-gray-300 dark:text-gray-500 bg-gray-50/80 dark:bg-gray-900/80">
                  Live Data
                </div>
                {liveGroup}
              </>
            )}
            {statsGroup && (
              <>
                <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-gray-300 dark:text-gray-500 bg-gray-50/80 dark:bg-gray-900/80 ${liveGroup ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}>
                  Workout Stats
                </div>
                {statsGroup}
              </>
            )}
          </div>
        )
      })()}
    </div>
  )
}
