'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Waves, Bike, Footprints, Clock, Heart, Zap, MapPin, Trash2, Loader2, Cloud } from 'lucide-react'
import type { Workout, WorkoutHRZone, WorkoutPowerZone, WorkoutLap } from '@/lib/types/database'
import { apiGet, apiDelete } from '@/lib/api/client'
import { useUnits } from '@/hooks/useUnits'

interface WorkoutDetailModalProps {
  workout: Workout
  onClose: () => void
  onDeleted?: () => void
}

interface FullWorkout extends Workout {
  hr_zones: WorkoutHRZone[]
  power_zones: WorkoutPowerZone[]
  laps: WorkoutLap[]
}

const SPORT_LABELS: Record<string, { label: string; icon: typeof Waves; color: string }> = {
  swim: { label: 'Swim', icon: Waves, color: 'text-blue-600' },
  bike: { label: 'Bike', icon: Bike, color: 'text-orange-600' },
  run: { label: 'Run', icon: Footprints, color: 'text-green-600' },
  brick: { label: 'Brick', icon: Bike, color: 'text-purple-600' },
}

const ZONE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b']

function formatDuration(seconds: number | null): string {
  if (!seconds) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function WorkoutDetailModal({ workout, onClose, onDeleted }: WorkoutDetailModalProps) {
  const { fmtDistance, fmtPaceForSport, fmtElevation } = useUnits()
  const sport = SPORT_LABELS[workout.sport] || SPORT_LABELS.run
  const Icon = sport.icon

  const [fullData, setFullData] = useState<FullWorkout | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    apiGet<FullWorkout>(`/api/workouts/${workout.id}`)
      .then(setFullData)
      .catch(() => setFullData(null))
      .finally(() => setLoadingDetail(false))
  }, [workout.id])

  const handleDelete = async () => {
    if (!confirm('Delete this workout? This action can be undone.')) return
    setDeleting(true)
    try {
      await apiDelete(`/api/workouts/${workout.id}`)
      onDeleted?.()
      onClose()
    } catch { /* ignore */ }
    setDeleting(false)
  }

  const hrZones = fullData?.hr_zones || []
  const powerZones = fullData?.power_zones || []
  const laps = fullData?.laps || []

  // Find fastest lap
  const fastestLapIdx = laps.length > 0
    ? laps.reduce((best, lap, i) => {
        if (!lap.avg_pace_sec_per_km) return best
        if (best === -1) return i
        return lap.avg_pace_sec_per_km < (laps[best].avg_pace_sec_per_km || Infinity) ? i : best
      }, -1)
    : -1

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-squircle p-6 sm:p-8 w-full sm:max-w-lg max-h-[85dvh] overflow-y-auto rounded-b-none sm:rounded-b-[var(--card-radius)]" style={{ paddingBottom: 'calc(1.5rem + var(--safe-area-bottom))' }}>
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
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
          {workout.is_indoor && (
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">Indoor</span>
          )}
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
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fmtDistance(workout.distance_meters, workout.sport)}</p>
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
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fmtPaceForSport(workout.avg_pace_sec_per_km, workout.sport)}</p>
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

        {/* Weather */}
        {workout.weather_conditions && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <Cloud size={14} />
            {workout.weather_conditions}
            {workout.weather_temp_c != null && ` · ${workout.weather_temp_c}°C`}
          </div>
        )}

        {/* HR Zones */}
        {loadingDetail ? (
          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs">Loading details...</span>
          </div>
        ) : (
          <>
            {hrZones.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">HR Zones</p>
                <div className="flex h-6 rounded-lg overflow-hidden mb-1">
                  {hrZones.map((z) => (
                    <div
                      key={z.zone_number}
                      style={{ width: `${z.percent_of_total}%`, backgroundColor: ZONE_COLORS[z.zone_number - 1] }}
                      title={`Zone ${z.zone_number}: ${z.percent_of_total}%`}
                    />
                  ))}
                </div>
                <div className="flex gap-2 text-[11px] text-gray-400">
                  {hrZones.map((z) => (
                    <span key={z.zone_number} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ZONE_COLORS[z.zone_number - 1] }} />
                      Z{z.zone_number} {z.percent_of_total}%
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Power Zones (bike) */}
            {powerZones.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Power Zones</p>
                <div className="flex h-6 rounded-lg overflow-hidden mb-1">
                  {powerZones.map((z) => (
                    <div
                      key={z.zone_number}
                      style={{ width: `${z.percent_of_total}%`, backgroundColor: ZONE_COLORS[z.zone_number - 1] }}
                      title={`Zone ${z.zone_number}: ${z.percent_of_total}%`}
                    />
                  ))}
                </div>
                <div className="flex gap-2 text-[11px] text-gray-400 flex-wrap">
                  {powerZones.map((z) => (
                    <span key={z.zone_number} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ZONE_COLORS[z.zone_number - 1] }} />
                      Z{z.zone_number} {z.percent_of_total}%
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Laps */}
            {laps.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Lap Splits</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left py-1.5 font-medium">Lap</th>
                        <th className="text-right py-1.5 font-medium">Dist</th>
                        <th className="text-right py-1.5 font-medium">Time</th>
                        <th className="text-right py-1.5 font-medium">Pace</th>
                        <th className="text-right py-1.5 font-medium">HR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laps.map((lap, i) => (
                        <tr
                          key={lap.id}
                          className={`border-b border-gray-50 dark:border-gray-800/50 ${i === fastestLapIdx ? 'bg-green-50/50 dark:bg-green-950/10' : ''}`}
                        >
                          <td className="py-1.5 text-gray-600 dark:text-gray-300">
                            {lap.lap_number}
                            {i === fastestLapIdx && <span className="ml-1 text-green-500 text-[11px]">fastest</span>}
                          </td>
                          <td className="py-1.5 text-right text-gray-600 dark:text-gray-300">
                            {lap.distance_meters ? fmtDistance(lap.distance_meters, workout.sport) : '-'}
                          </td>
                          <td className="py-1.5 text-right text-gray-600 dark:text-gray-300">
                            {formatDuration(lap.duration_seconds)}
                          </td>
                          <td className="py-1.5 text-right text-gray-600 dark:text-gray-300">
                            {fmtPaceForSport(lap.avg_pace_sec_per_km, workout.sport)}
                          </td>
                          <td className="py-1.5 text-right text-gray-600 dark:text-gray-300">
                            {lap.avg_hr || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Notes */}
        {workout.notes && (
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{workout.notes}</p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          {workout.external_url ? (
            <a
              href={workout.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink size={14} />
              View on {workout.source === 'garmin' ? 'Garmin Connect' : workout.source === 'strava' ? 'Strava' : 'Source'}
            </a>
          ) : <div />}

          {workout.source === 'manual' && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={12} />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
