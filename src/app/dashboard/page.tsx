'use client'

import { useState } from 'react'
import WeekVolumeSummary from '@/components/dashboard/WeekVolumeSummary'
import WeeklyCalendar from '@/components/dashboard/WeeklyCalendar'
import TrainingLoadCard from '@/components/dashboard/TrainingLoadCard'
import UpcomingRaceCards from '@/components/dashboard/UpcomingRaceCards'
import FitnessTrends from '@/components/dashboard/FitnessTrends'
import ManualWorkoutEntry from '@/components/dashboard/ManualWorkoutEntry'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import FitUploadDropzone from '@/components/dashboard/FitUploadDropzone'
import { useWeekWorkouts } from '@/hooks/useWeekWorkouts'

export default function DashboardPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const { workoutsByDay, volume, loading, refetch, monday } = useWeekWorkouts(weekOffset)

  const handleWorkoutSaved = () => {
    refetch()
    setSavedCount((c) => c + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
          Dashboard
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          This Week
        </h1>
      </div>

      {/* Calendar — full width */}
      <WeeklyCalendar
        workoutsByDay={workoutsByDay}
        monday={monday}
        weekOffset={weekOffset}
        onWeekChange={setWeekOffset}
        loading={loading}
      />

      {/* Action row — training load, add workout, import */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TrainingLoadCard refreshKey={savedCount} />
        <ManualWorkoutEntry onSaved={handleWorkoutSaved} />
        <FitUploadDropzone onUploaded={handleWorkoutSaved} />
      </div>

      {/* Weekly Volume */}
      <WeekVolumeSummary volume={volume} loading={loading} />

      {/* Fitness / Fatigue / Form */}
      <FitnessTrends />

      {/* Upcoming Races */}
      <UpcomingRaceCards />

      {/* Recent Activity */}
      <ActivityFeed />
    </div>
  )
}
