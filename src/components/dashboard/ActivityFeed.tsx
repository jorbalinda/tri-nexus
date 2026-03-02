'use client'

import { useState, useEffect, useCallback } from 'react'
import { Waves, Bike, Footprints, Clock, Heart, Filter, ChevronDown } from 'lucide-react'
import { apiGet } from '@/lib/api/client'
import type { Workout } from '@/lib/types/database'
import { useUnits } from '@/hooks/useUnits'
import WorkoutDetailModal from './WorkoutDetailModal'

const SPORT_CONFIG: Record<string, { icon: typeof Waves; color: string; bg: string }> = {
  swim: { icon: Waves, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  bike: { icon: Bike, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  run: { icon: Footprints, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
  brick: { icon: Bike, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
}

const SOURCE_BADGES: Record<string, string> = {
  manual: 'Manual',
  garmin: 'Garmin',
  file_upload: 'Import',
  strava: 'Strava',
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const COLLAPSED_COUNT = 4

export default function ActivityFeed() {
  const { fmtDistanceShort } = useUnits()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [sportFilter, setSportFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const fetchWorkouts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '15' })
      if (sportFilter) params.set('sport', sportFilter)
      const res = await apiGet<{ data: Workout[] }>(`/api/workouts?${params}`)
      setWorkouts(res.data || [])
    } catch {
      setWorkouts([])
    }
    setLoading(false)
  }, [sportFilter])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  return (
    <div className="card-squircle p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
          Recent Activity
        </p>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
          <Filter size={12} />
          Filter
          <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showFilters && (
        <div className="flex gap-1 mb-4">
          {['', 'swim', 'bike', 'run'].map((s) => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                sportFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No workouts yet</p>
      ) : (
        <div className="space-y-2">
          {(expanded ? workouts : workouts.slice(0, COLLAPSED_COUNT)).map((w) => {
            const config = SPORT_CONFIG[w.sport] || SPORT_CONFIG.run
            const Icon = config.icon
            return (
              <button
                key={w.id}
                onClick={() => setSelectedWorkout(w)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl ${config.bg} hover:shadow-sm transition-all cursor-pointer text-left`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {w.title || `${w.sport.charAt(0).toUpperCase() + w.sport.slice(1)} Workout`}
                    </p>
                    <span className="text-[9px] font-medium uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                      {SOURCE_BADGES[w.source] || w.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{w.date}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock size={10} />
                      {formatDuration(w.duration_seconds)}
                    </span>
                    {w.distance_meters && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {fmtDistanceShort(w.distance_meters, w.sport)}
                      </span>
                    )}
                    {w.avg_hr && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Heart size={10} className="text-red-400" />
                        {w.avg_hr}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
          {workouts.length > COLLAPSED_COUNT && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1.5 pt-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
            >
              {expanded ? 'Show less' : `Show ${workouts.length - COLLAPSED_COUNT} more`}
              <ChevronDown size={13} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      )}

      {selectedWorkout && (
        <WorkoutDetailModal workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} />
      )}
    </div>
  )
}
