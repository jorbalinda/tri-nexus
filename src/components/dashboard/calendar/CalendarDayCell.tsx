'use client'

import type { Workout } from '@/lib/types/database'
import { estimateTSS } from '@/lib/analytics/training-stress'

const sportDotColor: Record<string, string> = {
  swim: 'bg-blue-500',
  bike: 'bg-orange-500',
  run: 'bg-green-500',
  brick: 'bg-purple-500',
}

interface CalendarDayCellProps {
  date: Date
  workouts: Workout[]
  isCurrentMonth: boolean
  isToday: boolean
  onWorkoutClick: (workout: Workout) => void
}

export default function CalendarDayCell({
  date,
  workouts,
  isCurrentMonth,
  isToday,
  onWorkoutClick,
}: CalendarDayCellProps) {
  const dayNum = date.getDate()
  const visible = workouts.length > 3 ? workouts.slice(0, 2) : workouts
  const overflow = workouts.length > 3 ? workouts.length - 2 : 0

  const dailyTSS =
    workouts.length > 1
      ? workouts.reduce((sum, w) => sum + estimateTSS(w), 0)
      : 0

  return (
    <div
      className={`min-h-[100px] md:min-h-[120px] border border-gray-100 dark:border-gray-800 p-1.5 flex flex-col ${
        !isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/30' : ''
      }`}
    >
      {/* Day number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
            isToday
              ? 'bg-blue-600 text-white'
              : !isCurrentMonth
              ? 'text-gray-400 opacity-40'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {dayNum}
        </span>
      </div>

      {/* Workout pills */}
      <div className="flex flex-col gap-0.5 flex-1">
        {visible.map((w) => {
          const tss = estimateTSS(w)
          return (
            <button
              key={w.id}
              onClick={() => onWorkoutClick(w)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full cursor-pointer group"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${sportDotColor[w.sport] || 'bg-gray-400'}`}
              />
              <span className="text-[11px] text-gray-700 dark:text-gray-300 truncate flex-1 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                {w.title}
              </span>
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 shrink-0">
                {tss}
              </span>
            </button>
          )
        })}

        {overflow > 0 && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1.5">
            +{overflow} more
          </span>
        )}
      </div>

      {/* Daily total TSS */}
      {dailyTSS > 0 && (
        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-right mt-auto pt-0.5 border-t border-gray-100 dark:border-gray-800">
          TSS {dailyTSS}
        </div>
      )}
    </div>
  )
}
