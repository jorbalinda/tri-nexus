'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Waves, Bike, Footprints } from 'lucide-react'
import type { Workout } from '@/lib/types/database'
import WorkoutDetailModal from './WorkoutDetailModal'

const DAY_LABELS = [
  { short: 'M', long: 'Mon' },
  { short: 'T', long: 'Tue' },
  { short: 'W', long: 'Wed' },
  { short: 'T', long: 'Thu' },
  { short: 'F', long: 'Fri' },
  { short: 'S', long: 'Sat' },
  { short: 'S', long: 'Sun' },
]

const SPORT_COLORS: Record<string, { bg: string; text: string; icon: typeof Waves }> = {
  swim: { bg: 'bg-swim/10 dark:bg-swim/20', text: 'text-swim', icon: Waves },
  bike: { bg: 'bg-bike/10 dark:bg-bike/20', text: 'text-bike', icon: Bike },
  run: { bg: 'bg-run/10 dark:bg-run/20', text: 'text-run', icon: Footprints },
  brick: { bg: 'bg-brick/10 dark:bg-brick/20', text: 'text-brick', icon: Bike },
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h${m}m` : `${m}m`
}

interface WeeklyCalendarProps {
  workoutsByDay: Map<string, Workout[]>
  monday: Date
  weekOffset: number
  onWeekChange: (offset: number) => void
  loading: boolean
  onWorkoutDeleted?: () => void
}

export default function WeeklyCalendar({ workoutsByDay, monday, weekOffset, onWeekChange, loading, onWorkoutDeleted }: WeeklyCalendarProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const days: { date: string; label: string; isToday: boolean }[] = []
  const d = new Date(monday)
  for (let i = 0; i < 7; i++) {
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      label: `${d.getDate()}`,
      isToday: dateStr === today,
    })
    d.setDate(d.getDate() + 1)
  }

  const weekLabel = (() => {
    const start = new Date(monday)
    const end = new Date(monday)
    end.setDate(end.getDate() + 6)
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} – ${end.getDate()}`
    }
    return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}`
  })()

  return (
    <div className="card-squircle p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{weekLabel}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onWeekChange(weekOffset - 1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => onWeekChange(0)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
            >
              Today
            </button>
          )}
          <button
            onClick={() => onWeekChange(weekOffset + 1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Grid — 7 columns always visible; icon-only pills on small screens */}
      <div>
        <div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Day headers */}
            {DAY_LABELS.map((label) => (
              <div key={label.long} className="text-center text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 pb-1 sm:pb-2">
                <span className="sm:hidden">{label.short}</span>
                <span className="hidden sm:inline">{label.long}</span>
              </div>
            ))}

            {/* Day cells */}
            {days.map(({ date, label, isToday }) => {
              const dayWorkouts = workoutsByDay.get(date) || []
              return (
                <div
                  key={date}
                  className={`min-h-[56px] sm:aspect-square sm:min-h-0 rounded-xl p-1.5 sm:p-2.5 border transition-all flex flex-col ${
                    isToday
                      ? 'border-blue-500 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/15 shadow-sm shadow-blue-500/10'
                      : 'border-gray-200 dark:border-gray-700/60 bg-gray-50/40 dark:bg-gray-800/20'
                  }`}
                >
                  <p className={`text-xs font-semibold mb-1 sm:mb-2 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {label}
                  </p>
                  {loading ? (
                    <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                  ) : (
                    <div className="flex flex-col gap-0.5 sm:gap-1 flex-1 justify-start">
                      {dayWorkouts.slice(0, 2).map((w) => {
                        const sport = SPORT_COLORS[w.sport] || SPORT_COLORS.run
                        const Icon = sport.icon
                        return (
                          <button
                            key={w.id}
                            onClick={() => setSelectedWorkout(w)}
                            className={`flex items-center justify-center gap-1 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg ${sport.bg} ${sport.text} text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity w-full`}
                          >
                            <Icon size={10} className="shrink-0" />
                            <span className="hidden sm:inline truncate">{formatDuration(w.duration_seconds)}</span>
                          </button>
                        )
                      })}
                      {dayWorkouts.length > 2 && (
                        <span className="text-[10px] text-blue-500 dark:text-blue-400 px-1 cursor-default">
                          +{dayWorkouts.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {selectedWorkout && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          onDeleted={() => { setSelectedWorkout(null); onWorkoutDeleted?.() }}
        />
      )}
    </div>
  )
}
