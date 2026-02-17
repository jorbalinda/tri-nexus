'use client'

import { useState, useMemo } from 'react'
import type { Workout } from '@/lib/types/database'
import { getCalendarDays, toDateKey, isSameDay, isInMonth } from '@/lib/utils/calendar'
import { useCalendarWorkouts } from '@/hooks/useCalendarWorkouts'
import CalendarHeader from './CalendarHeader'
import CalendarDayCell from './CalendarDayCell'
import WorkoutCalendarModal from './WorkoutCalendarModal'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function TrainingCalendar() {
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const days = useMemo(() => getCalendarDays(year, month), [year, month])

  const startDate = toDateKey(days[0])
  const endDate = toDateKey(days[days.length - 1])

  const { workouts, loading } = useCalendarWorkouts(startDate, endDate)

  const workoutsByDate = useMemo(() => {
    const map = new Map<string, Workout[]>()
    workouts.forEach((w) => {
      const key = w.date
      const list = map.get(key)
      if (list) {
        list.push(w)
      } else {
        map.set(key, [w])
      }
    })
    return map
  }, [workouts])

  const today = new Date()

  const handlePrev = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const handleNext = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    setViewDate(new Date())
  }

  return (
    <div className="card-squircle p-6">
      <CalendarHeader
        month={viewDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 text-center py-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Loading workouts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-7 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          {days.map((date) => {
            const key = toDateKey(date)
            return (
              <CalendarDayCell
                key={key}
                date={date}
                workouts={workoutsByDate.get(key) || []}
                isCurrentMonth={isInMonth(date, year, month)}
                isToday={isSameDay(date, today)}
                onWorkoutClick={setSelectedWorkout}
              />
            )
          })}
        </div>
      )}

      <WorkoutCalendarModal
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
      />
    </div>
  )
}
