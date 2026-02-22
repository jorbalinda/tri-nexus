'use client'

import { X, ExternalLink, Waves, Bike, Footprints, Clock, Heart, Zap, MapPin } from 'lucide-react'
import type { Workout } from '@/lib/types/database'

interface WorkoutDetailModalProps {
  workout: Workout
  onClose: () => void
}

const SPORT_LABELS: Record<string, { label: string; icon: typeof Waves; color: string }> = {
  swim: { label: 'Swim', icon: Waves, color: 'text-blue-600' },
  bike: { label: 'Bike', icon: Bike, color: 'text-orange-600' },
  run: { label: 'Run', icon: Footprints, color: 'text-green-600' },
  brick: { label: 'Brick', icon: Bike, color: 'text-purple-600' },
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDistance(meters: number | null, sport: string): string {
  if (!meters) return '-'
  if (sport === 'swim') return `${meters}m`
  return `${(meters / 1000).toFixed(2)}km`
}

function formatPace(secPerKm: number | null): string {
  if (!secPerKm) return '-'
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}:${s.toString().padStart(2, '0')}/km`
}

export default function WorkoutDetailModal({ workout, onClose }: WorkoutDetailModalProps) {
  const sport = SPORT_LABELS[workout.sport] || SPORT_LABELS.run
  const Icon = sport.icon

  // Cast to access potential source fields (added in Phase 2 migration)
  const w = workout as Workout & { source?: string; external_url?: string }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-squircle p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <X size={18} className="text-gray-400" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Icon size={16} className={sport.color} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${sport.color}`}>{sport.label}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
          {workout.title || `${sport.label} Workout`}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{workout.date}</p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <Clock size={14} className="text-gray-400" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Duration</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatDuration(workout.duration_seconds)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <MapPin size={14} className="text-gray-400" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Distance</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatDistance(workout.distance_meters, workout.sport)}</p>
            </div>
          </div>
          {workout.avg_hr && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <Heart size={14} className="text-red-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Avg HR</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{workout.avg_hr} bpm</p>
              </div>
            </div>
          )}
          {workout.avg_power_watts && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <Zap size={14} className="text-yellow-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Avg Power</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{workout.avg_power_watts}W</p>
              </div>
            </div>
          )}
          {workout.avg_pace_sec_per_km && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <Footprints size={14} className="text-green-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Pace</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatPace(workout.avg_pace_sec_per_km)}</p>
              </div>
            </div>
          )}
          {workout.tss && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <Zap size={14} className="text-orange-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">TSS</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{workout.tss}</p>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {workout.notes && (
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{workout.notes}</p>
          </div>
        )}

        {/* External link */}
        {w.external_url && (
          <a
            href={w.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink size={14} />
            View on {w.source === 'garmin' ? 'Garmin Connect' : w.source === 'strava' ? 'Strava' : 'Source'}
          </a>
        )}
      </div>
    </div>
  )
}
