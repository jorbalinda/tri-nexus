'use client'

import { useState, useRef } from 'react'
import { Flag, AlertCircle } from 'lucide-react'
import type { Workout } from '@/lib/types/database'
import type { CalendarRaceEvent } from '@/lib/types/calendar'
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
  raceEvents?: CalendarRaceEvent[]
  isCurrentMonth: boolean
  isToday: boolean
  onWorkoutClick: (workout: Workout) => void
  onDayClick: (dateKey: string, workouts: Workout[]) => void
}

export default function CalendarDayCell({
  date,
  workouts,
  raceEvents = [],
  isCurrentMonth,
  isToday,
  onWorkoutClick,
  onDayClick,
}: CalendarDayCellProps) {
  const dayNum = date.getDate()
  const hasRaceDay = raceEvents.some((e) => e.type === 'race_day')
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  // Reduce workout slots when race events are present
  const maxWorkouts = raceEvents.length > 0 ? 2 : 3
  const visible = workouts.length > maxWorkouts ? workouts.slice(0, maxWorkouts - 1) : workouts
  const overflow = workouts.length > maxWorkouts ? workouts.length - (maxWorkouts - 1) : 0

  const dailyTSS =
    workouts.length > 1
      ? workouts.reduce((sum, w) => sum + estimateTSS(w), 0)
      : 0

  return (
    <div
      className={`min-h-[100px] md:min-h-[120px] border p-1.5 flex flex-col ${
        hasRaceDay
          ? 'border-red-200 dark:border-red-800/50 bg-red-50/30 dark:bg-red-950/10'
          : 'border-gray-100 dark:border-gray-800'
      } ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/30' : ''}`}
    >
      {/* Day number */}
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={() => onDayClick(dateKey, workouts)}
          className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full cursor-pointer transition-all hover:ring-2 hover:ring-blue-500/30 ${
            isToday
              ? 'bg-blue-600 text-white'
              : !isCurrentMonth
              ? 'text-gray-400 opacity-40'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {dayNum}
        </button>
      </div>

      {/* Race event pills — always shown above workouts */}
      {raceEvents.length > 0 && (
        <div className="flex flex-col gap-0.5 mb-0.5">
          {raceEvents.map((event) => (
            <RaceEventPill key={event.id} event={event} />
          ))}
        </div>
      )}

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
          <button
            onClick={() => onDayClick(dateKey, workouts)}
            className="text-[10px] text-blue-500 dark:text-blue-400 px-1.5 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer text-left transition-colors"
          >
            +{overflow} more
          </button>
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

function RaceEventPill({ event }: { event: CalendarRaceEvent }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [openAbove, setOpenAbove] = useState(false)
  const [openLeft, setOpenLeft] = useState(false)
  const pillRef = useRef<HTMLDivElement>(null)
  const isRaceDay = event.type === 'race_day'

  const handleMouseEnter = () => {
    if (pillRef.current) {
      const rect = pillRef.current.getBoundingClientRect()
      // 250px needed below for vertical, 224px (w-56) needed to the right for horizontal
      setOpenAbove(window.innerHeight - rect.bottom < 250)
      setOpenLeft(window.innerWidth - rect.left < 240)
    }
    setShowTooltip(true)
  }

  return (
    <div
      ref={pillRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] truncate ${
          isRaceDay
            ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold'
            : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium'
        }`}
      >
        {isRaceDay ? <Flag size={10} className="shrink-0" /> : <AlertCircle size={10} className="shrink-0" />}
        <span className="truncate">
          {isRaceDay ? event.raceName : event.label}
        </span>
      </div>

      {/* Hover tooltip with task list */}
      {showTooltip && event.tasks.length > 0 && (
        <div
          className={`absolute z-50 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 ${
            openAbove ? 'bottom-full mb-1' : 'top-full mt-1'
          } ${openLeft ? 'right-0' : 'left-0'}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
            {event.label} — {event.raceName}
          </p>
          <ul className="space-y-1">
            {event.tasks.map((task, i) => (
              <li key={i} className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug flex gap-1.5">
                <span className="text-gray-300 dark:text-gray-600 shrink-0">•</span>
                {task}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
