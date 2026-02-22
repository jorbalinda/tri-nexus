'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Waves, Bike, Footprints } from 'lucide-react'
import type { Workout } from '@/lib/types/database'
import WorkoutDetailModal from './WorkoutDetailModal'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const SPORT_COLORS: Record<string, { bg: string; text: string; icon: typeof Waves }> = {
  swim: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', icon: Waves },
  bike: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', icon: Bike },
  run: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', icon: Footprints },
  brick: { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', icon: Bike },
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
}

export default function WeeklyCalendar({ workoutsByDay, monday, weekOffset, onWeekChange, loading }: WeeklyCalendarProps) {
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
    <div className="card-squircle p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{weekLabel}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onWeekChange(weekOffset - 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => onWeekChange(0)}
              className="px-2 py-1 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
            >
              Today
            </button>
          )}
          <button
            onClick={() => onWeekChange(weekOffset + 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 pb-2">
            {label}
          </div>
        ))}

        {/* Day cells */}
        {days.map(({ date, label, isToday }) => {
          const dayWorkouts = workoutsByDay.get(date) || []
          return (
            <div
              key={date}
              className={`min-h-[80px] rounded-xl p-2 border transition-all ${
                isToday
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/10'
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20'
              }`}
            >
              <p className={`text-xs font-medium mb-1.5 ${isToday ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>
                {label}
              </p>
              {loading ? (
                <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                <div className="flex flex-col gap-1">
                  {dayWorkouts.map((w) => {
                    const sport = SPORT_COLORS[w.sport] || SPORT_COLORS.run
                    const Icon = sport.icon
                    return (
                      <button
                        key={w.id}
                        onClick={() => setSelectedWorkout(w)}
                        className={`flex items-center gap-1 px-1.5 py-1 rounded-lg ${sport.bg} ${sport.text} text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity truncate`}
                      >
                        <Icon size={10} className="shrink-0" />
                        <span className="truncate">{formatDuration(w.duration_seconds)}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedWorkout && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
        />
      )}
    </div>
  )
}
