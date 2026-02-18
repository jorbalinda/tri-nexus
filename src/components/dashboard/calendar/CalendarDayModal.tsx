'use client'

import { useEffect, useCallback } from 'react'
import { X, ChevronRight, Clock, Ruler, Heart, Flame, Zap } from 'lucide-react'
import type { Workout } from '@/lib/types/database'
import { estimateTSS } from '@/lib/analytics/training-stress'

const sportDotColor: Record<string, string> = {
  swim: 'bg-blue-500',
  bike: 'bg-orange-500',
  run: 'bg-green-500',
  brick: 'bg-purple-500',
}

const sportLabel: Record<string, string> = {
  swim: 'Swim',
  bike: 'Bike',
  run: 'Run',
  brick: 'Brick',
}

const sportAccent: Record<string, string> = {
  swim: 'text-blue-600',
  bike: 'text-orange-600',
  run: 'text-green-600',
  brick: 'text-purple-600',
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
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

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

interface CalendarDayModalProps {
  date: string | null
  workouts: Workout[]
  onClose: () => void
  onWorkoutClick: (workout: Workout) => void
}

export default function CalendarDayModal({ date, workouts, onClose, onWorkoutClick }: CalendarDayModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (date) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [date, handleEscape])

  if (!date) return null

  const totalTSS = workouts.reduce((sum, w) => sum + estimateTSS(w), 0)
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration_seconds || 0), 0)
  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto card-squircle m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
                Day Summary
              </p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatFullDate(date)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Day totals strip */}
          {workouts.length > 0 && (
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3 mb-6">
              <span className="font-semibold">
                {workouts.length} workout{workouts.length !== 1 ? 's' : ''}
              </span>
              {totalDuration > 0 && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                  <span>{formatDuration(totalDuration)}</span>
                </>
              )}
              {totalTSS > 0 && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                  <span>TSS {totalTSS}</span>
                </>
              )}
              {totalCalories > 0 && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                  <span>{totalCalories} kcal</span>
                </>
              )}
            </div>
          )}

          {/* Workout cards */}
          {workouts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400 dark:text-gray-500">No workouts on this day</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {workouts.map((w) => (
                <WorkoutCard
                  key={w.id}
                  workout={w}
                  onClick={() => onWorkoutClick(w)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function WorkoutCard({ workout, onClick }: { workout: Workout; onClick: () => void }) {
  const tss = estimateTSS(workout)

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${sportDotColor[workout.sport] || 'bg-gray-400'}`} />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {workout.title}
            </p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${sportAccent[workout.sport] || 'text-gray-500'}`}>
              {sportLabel[workout.sport] || workout.sport}
            </p>
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors mt-1" />
      </div>

      {/* Quick stats row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        {workout.duration_seconds && (
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-gray-400 dark:text-gray-500" />
            {formatDuration(workout.duration_seconds)}
          </span>
        )}
        {workout.distance_meters && (
          <span className="flex items-center gap-1">
            <Ruler size={11} className="text-gray-400 dark:text-gray-500" />
            {formatDistance(workout.distance_meters)}
          </span>
        )}
        {workout.avg_hr && (
          <span className="flex items-center gap-1">
            <Heart size={11} className="text-gray-400 dark:text-gray-500" />
            {workout.avg_hr} bpm
          </span>
        )}
        {workout.avg_power_watts && (
          <span className="flex items-center gap-1">
            <Zap size={11} className="text-gray-400 dark:text-gray-500" />
            {workout.avg_power_watts}W
          </span>
        )}
        {workout.sport === 'run' && workout.avg_pace_sec_per_km && (
          <span>{formatPace(workout.avg_pace_sec_per_km)}</span>
        )}
        {workout.calories && (
          <span className="flex items-center gap-1">
            <Flame size={11} className="text-gray-400 dark:text-gray-500" />
            {workout.calories} kcal
          </span>
        )}
        {tss > 0 && (
          <span className="font-semibold text-gray-600 dark:text-gray-300">TSS {tss}</span>
        )}
      </div>
    </button>
  )
}
