'use client'

import { useState } from 'react'
import WeekVolumeSummary from '@/components/dashboard/WeekVolumeSummary'
import WeeklyCalendar from '@/components/dashboard/WeeklyCalendar'
import UpcomingRaceCards from '@/components/dashboard/UpcomingRaceCards'
import FitnessTrends from '@/components/dashboard/FitnessTrends'
import ManualWorkoutEntry from '@/components/dashboard/ManualWorkoutEntry'
import { useWeekWorkouts } from '@/hooks/useWeekWorkouts'

export default function DashboardPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const { workoutsByDay, volume, loading, refetch, monday } = useWeekWorkouts(weekOffset)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
          Dashboard
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          This Week
        </h1>
      </div>

      <WeekVolumeSummary volume={volume} loading={loading} />

      <WeeklyCalendar
        workoutsByDay={workoutsByDay}
        monday={monday}
        weekOffset={weekOffset}
        onWeekChange={setWeekOffset}
        loading={loading}
      />

      <ManualWorkoutEntry onSaved={refetch} />

      <UpcomingRaceCards />

      <FitnessTrends />
    </div>
  )
}
