'use client'

import { TrendingUp, TrendingDown, Minus, BarChart3, Database, Calendar, Shield } from 'lucide-react'
import type { RaceProjection } from '@/lib/types/projection'

interface ProgressIndicatorProps {
  projection: RaceProjection | null
  loading: boolean
  daysUntilRace: number
  workoutCount: number
}

function confidenceLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'High', color: 'text-green-600' }
  if (score >= 50) return { label: 'Moderate', color: 'text-blue-600' }
  if (score >= 25) return { label: 'Building', color: 'text-orange-600' }
  return { label: 'Low', color: 'text-gray-400' }
}

function confidenceBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 50) return 'bg-blue-500'
  if (score >= 25) return 'bg-orange-500'
  return 'bg-gray-300'
}

export default function ProgressIndicator({ projection, loading, daysUntilRace, workoutCount }: ProgressIndicatorProps) {
  if (loading) {
    return (
      <div className="card-squircle p-6">
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    )
  }

  const confidence = projection?.confidence_score ?? 0
  const { label: confLabel, color: confColor } = confidenceLabel(confidence)
  const daysUntilReveal = Math.max(0, daysUntilRace - 7)

  return (
    <div className="card-squircle p-6">
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-4">
        Projection Progress
      </p>

      {/* Confidence Meter */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-blue-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Confidence</span>
          </div>
          <span className={`text-sm font-semibold ${confColor}`}>{confLabel} — {confidence}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${confidenceBarColor(confidence)}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Database size={12} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Data Points</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{projection?.data_points_used ?? workoutCount}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">workouts analyzed</p>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={12} className="text-orange-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Reveal In</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {daysUntilReveal > 0 ? `${daysUntilReveal}d` : 'Ready'}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">until race week</p>
        </div>
      </div>

      {/* Fitness summary */}
      {projection?.fitness_snapshot && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
            Training Snapshot
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            {projection.fitness_snapshot.estimatedFTP && (
              <span className="px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-medium">
                FTP: {projection.fitness_snapshot.estimatedFTP}W
              </span>
            )}
            {projection.fitness_snapshot.estimatedCSS && (
              <span className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-medium">
                CSS: {Math.floor(projection.fitness_snapshot.estimatedCSS / 60)}:{(projection.fitness_snapshot.estimatedCSS % 60).toString().padStart(2, '0')}/100m
              </span>
            )}
            {projection.fitness_snapshot.weeklyVolumeHours && (
              <span className="px-2 py-1 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 font-medium">
                {projection.fitness_snapshot.weeklyVolumeHours}h/week
              </span>
            )}
          </div>
        </div>
      )}

      {/* Guidance message */}
      <div className="mt-4 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20">
        <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
          {confidence < 25
            ? 'Keep logging workouts to build your projection. The more data, the more accurate your finish time prediction.'
            : confidence < 50
            ? 'Your projection is forming. Add swim, bike, and run workouts to improve accuracy.'
            : confidence < 80
            ? 'Looking good! Your projection is building nicely. Keep training consistently.'
            : 'Strong data foundation. Your projection will be highly accurate when revealed.'}
        </p>
      </div>
    </div>
  )
}
