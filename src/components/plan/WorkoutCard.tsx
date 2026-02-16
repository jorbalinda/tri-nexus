'use client'

import type { LibraryWorkout, PlanSport, TrainingZone } from '@/lib/types/training-plan'
import { formatStructurePreview } from '@/lib/data/workout-library'

const zoneColors: Record<string, string> = {
  '1': 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  '2': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  '3': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  '4': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  '5': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'max': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'mixed': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
}

const difficultyLabels: Record<string, { label: string; style: string }> = {
  easy: { label: 'Easy', style: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  moderate: { label: 'Moderate', style: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  hard: { label: 'Hard', style: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  very_hard: { label: 'Very Hard', style: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
}

function formatDuration(min: number): string {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    const km = meters / 1000
    return km % 1 === 0 ? `${km}km` : `${km.toFixed(1)}km`
  }
  return `${meters}m`
}

interface WorkoutCardProps {
  workout: LibraryWorkout
  sport: PlanSport
  onClick: () => void
}

export default function WorkoutCard({ workout, sport, onClick }: WorkoutCardProps) {
  const zoneBadge = zoneColors[String(workout.zone)] || zoneColors['mixed']
  const diff = difficultyLabels[workout.difficulty]
  const preview = formatStructurePreview(workout.structure)

  const sportBorderHover: Record<PlanSport, string> = {
    swim: 'hover:border-blue-200 dark:hover:border-blue-800/50',
    bike: 'hover:border-orange-200 dark:hover:border-orange-800/50',
    run: 'hover:border-green-200 dark:hover:border-green-800/50',
  }

  return (
    <button
      onClick={onClick}
      className={`text-left w-full bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md ${sportBorderHover[sport]} cursor-pointer`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${zoneBadge}`}>
          Z{workout.zone}
        </span>
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${diff.style}`}>
          {diff.label}
        </span>
      </div>

      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
        {workout.name}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
        {workout.description}
      </p>

      <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mb-3">
        <span className="font-semibold">{formatDuration(workout.duration_minutes)}</span>
        {workout.distance_meters && (
          <>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="font-semibold">{formatDistance(workout.distance_meters)}</span>
          </>
        )}
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span className="font-semibold">RPE {workout.rpe_range[0]}-{workout.rpe_range[1]}</span>
      </div>

      {preview && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate">
          {preview}
        </p>
      )}
    </button>
  )
}
