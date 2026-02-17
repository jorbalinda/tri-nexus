'use client'

import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import type { Workout } from '@/lib/types/database'
import { estimateTSS } from '@/lib/analytics/training-stress'

const sportAccent: Record<string, string> = {
  swim: 'text-blue-600',
  bike: 'text-orange-600',
  run: 'text-green-600',
  brick: 'text-purple-600',
}

const sportLabel: Record<string, string> = {
  swim: 'Swim',
  bike: 'Bike',
  run: 'Run',
  brick: 'Brick',
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    const km = meters / 1000
    return km % 1 === 0 ? `${km} km` : `${km.toFixed(1)} km`
  }
  return `${meters}m`
}

function formatPace(secPerKm: number): string {
  const min = Math.floor(secPerKm / 60)
  const sec = Math.round(secPerKm % 60)
  return `${min}:${String(sec).padStart(2, '0')} /km`
}

interface StatCellProps {
  label: string
  value: string | number
}

function StatCell({ label, value }: StatCellProps) {
  return (
    <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
        {label}
      </p>
      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
  )
}

interface WorkoutCalendarModalProps {
  workout: Workout | null
  onClose: () => void
}

export default function WorkoutCalendarModal({ workout, onClose }: WorkoutCalendarModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (workout) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [workout, handleEscape])

  if (!workout) return null

  const tss = estimateTSS(workout)

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg h-full overflow-y-auto card-squircle rounded-l-[2.5rem] rounded-r-none"
        style={{ borderRight: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0 pr-4">
              <p className={`text-[10px] font-bold uppercase tracking-[2px] ${sportAccent[workout.sport] || 'text-gray-500'} mb-2`}>
                {sportLabel[workout.sport] || workout.sport}
              </p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {workout.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Date & Duration */}
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <span>{formatDate(workout.date)}</span>
            {workout.duration_seconds && (
              <>
                <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                <span>{formatDuration(workout.duration_seconds)}</span>
              </>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCell label="TSS" value={tss} />

            {workout.distance_meters && (
              <StatCell label="Distance" value={formatDistance(workout.distance_meters)} />
            )}

            {workout.avg_hr && (
              <StatCell label="Avg HR" value={`${workout.avg_hr} bpm`} />
            )}

            {workout.max_hr && (
              <StatCell label="Max HR" value={`${workout.max_hr} bpm`} />
            )}

            {workout.rpe && (
              <StatCell label="RPE" value={`${workout.rpe}/10`} />
            )}

            {/* Sport-specific stats */}
            {workout.sport === 'bike' && workout.avg_power_watts && (
              <StatCell label="Avg Power" value={`${workout.avg_power_watts}W`} />
            )}

            {workout.sport === 'run' && workout.avg_pace_sec_per_km && (
              <StatCell label="Avg Pace" value={formatPace(workout.avg_pace_sec_per_km)} />
            )}

            {workout.sport === 'swim' && workout.swolf && (
              <StatCell label="SWOLF" value={workout.swolf} />
            )}

            {workout.elevation_gain_meters && (
              <StatCell label="Elevation" value={`${workout.elevation_gain_meters}m`} />
            )}

            {workout.avg_cadence_rpm && (
              <StatCell label="Cadence" value={`${workout.avg_cadence_rpm} rpm`} />
            )}

            {workout.avg_cadence_spm && (
              <StatCell label="Cadence" value={`${workout.avg_cadence_spm} spm`} />
            )}

            {workout.calories && (
              <StatCell label="Calories" value={`${workout.calories} kcal`} />
            )}
          </div>

          {/* Notes */}
          {workout.notes && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
                Notes
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                {workout.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
