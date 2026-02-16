'use client'

import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import type { LibraryWorkout, PlanSport, WorkoutInterval } from '@/lib/types/training-plan'

const sportAccent: Record<PlanSport, string> = {
  swim: 'text-blue-600',
  bike: 'text-orange-600',
  run: 'text-green-600',
}

const zoneBarColors: Record<string, string> = {
  '1': 'bg-sky-400',
  '2': 'bg-emerald-400',
  '3': 'bg-amber-400',
  '4': 'bg-orange-400',
  '5': 'bg-red-500',
  'max': 'bg-rose-500',
  'mixed': 'bg-violet-400',
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    const km = meters / 1000
    return km % 1 === 0 ? `${km} km` : `${km.toFixed(1)} km`
  }
  return `${meters}m`
}

function IntervalRow({ interval, index }: { interval: WorkoutInterval; index: number }) {
  const barColor = interval.zone ? zoneBarColors[String(interval.zone)] || 'bg-gray-300' : 'bg-gray-300'

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <div className={`w-1 rounded-full self-stretch shrink-0 ${barColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {interval.repeat && interval.repeat > 1 && (
            <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
              {interval.repeat}×
            </span>
          )}
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {interval.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {interval.distance_meters && <span>{formatDistance(interval.distance_meters)}</span>}
          {interval.duration_minutes && <span>{interval.duration_minutes} min</span>}
          {interval.zone && (
            <span className="font-semibold">Zone {interval.zone}</span>
          )}
          {interval.rest_seconds && (
            <span className="text-gray-400 dark:text-gray-500">
              Rest: {interval.rest_seconds >= 60
                ? `${Math.floor(interval.rest_seconds / 60)}m${interval.rest_seconds % 60 > 0 ? ` ${interval.rest_seconds % 60}s` : ''}`
                : `${interval.rest_seconds}s`}
            </span>
          )}
        </div>
        {interval.notes && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 italic">
            {interval.notes}
          </p>
        )}
      </div>
    </div>
  )
}

interface WorkoutDetailModalProps {
  workout: LibraryWorkout | null
  sport: PlanSport
  onClose: () => void
}

export default function WorkoutDetailModal({ workout, sport, onClose }: WorkoutDetailModalProps) {
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
              <p className={`text-[10px] font-bold uppercase tracking-[2px] ${sportAccent[sport]} mb-2`}>
                {workout.category.replace('_', ' ')}
              </p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {workout.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {workout.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
                Zone
              </p>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {workout.zone === 'max' || workout.zone === 'mixed' ? workout.zone : `Z${workout.zone}`}
              </span>
            </div>
            <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
                Duration
              </p>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatDuration(workout.duration_minutes)}
              </span>
            </div>
            {workout.distance_meters && (
              <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
                  Distance
                </p>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatDistance(workout.distance_meters)}
                </span>
              </div>
            )}
            <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
                RPE
              </p>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {workout.rpe_range[0]}–{workout.rpe_range[1]}
              </span>
            </div>
          </div>

          {/* Workout Structure */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
              Workout Structure
            </p>
            <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              {workout.structure.map((interval, i) => (
                <IntervalRow key={i} interval={interval} index={i} />
              ))}
            </div>
          </div>

          {/* Tags */}
          {workout.tags.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {workout.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
