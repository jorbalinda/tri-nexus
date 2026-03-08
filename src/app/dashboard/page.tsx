'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import WeeklyCalendar from '@/components/dashboard/WeeklyCalendar'
import TrainingLoadCard from '@/components/dashboard/TrainingLoadCard'
import dynamic from 'next/dynamic'
const FitnessTrends = dynamic(() => import('@/components/dashboard/FitnessTrends'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card-squircle p-5"><div className="h-56 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" /></div>
      <div className="card-squircle p-5"><div className="h-56 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" /></div>
    </div>
  ),
})
import ManualWorkoutEntry from '@/components/dashboard/ManualWorkoutEntry'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import FitUploadDropzone from '@/components/dashboard/FitUploadDropzone'
import GettingStartedCard, { computeOnboardingGate } from '@/components/dashboard/GettingStartedCard'
import Tier2NudgeModal from '@/components/dashboard/Tier2NudgeModal'
import RaceCard from '@/components/races/RaceCard'
import RaceForm from '@/components/races/RaceForm'
import { useWeekWorkouts } from '@/hooks/useWeekWorkouts'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useTargetRaces } from '@/hooks/useTargetRaces'
import type { TargetRace } from '@/lib/types/target-race'

export default function DashboardPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const { workoutsByDay, loading, refetch, monday } = useWeekWorkouts(weekOffset)
  const { workouts: allWorkouts, loading: allLoading, refetch: refetchAll } = useWorkouts()
  const { races, loading: racesLoading, create, remove } = useTargetRaces()
  const [showRaceForm, setShowRaceForm] = useState(false)

  const showGettingStarted = !allLoading && computeOnboardingGate(allWorkouts)

  const handleWorkoutSaved = () => {
    refetch()
    refetchAll()
    setSavedCount((c) => c + 1)
  }

  const handleRaceCreate = async (data: Omit<TargetRace, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await create(data)
    setShowRaceForm(false)
  }

  const handleRaceDelete = async (id: string) => {
    if (confirm('Remove this race?')) await remove(id)
  }

  const upcoming  = races.filter((r) => r.status === 'upcoming' || r.status === 'race_week')
  const completed = races.filter((r) => r.status === 'completed' || r.status === 'dns' || r.status === 'dnf')

  return (
    <div className="flex flex-col gap-6">
      <Tier2NudgeModal />
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
          Dashboard
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          This Week
        </h1>
      </div>

      {/* Onboarding (Tier 0) or normal calendar + action row */}
      {allLoading ? (
        <div className="card-squircle h-64 animate-pulse bg-gray-100 dark:bg-gray-800" />
      ) : showGettingStarted ? (
        <GettingStartedCard workouts={allWorkouts} onWorkoutSaved={handleWorkoutSaved} />
      ) : (
        <>
          {/* Calendar — full width */}
          <WeeklyCalendar
            workoutsByDay={workoutsByDay}
            monday={monday}
            weekOffset={weekOffset}
            onWeekChange={setWeekOffset}
            loading={loading}
            onWorkoutDeleted={handleWorkoutSaved}
          />

          {/* Action row — training load, add workout, import */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TrainingLoadCard refreshKey={savedCount} />
            <ManualWorkoutEntry onSaved={handleWorkoutSaved} />
            <FitUploadDropzone onUploaded={handleWorkoutSaved} />
          </div>
        </>
      )}

      {/* Fitness / Fatigue / Form + Weekly Volume */}
      <FitnessTrends />

      {/* Races */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
            Races
          </p>
          {!showRaceForm && (
            <button
              onClick={() => setShowRaceForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus size={13} />
              Add Race
            </button>
          )}
        </div>

        {showRaceForm && (
          <div className="card-squircle p-6 sm:p-8">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Add Target Race</h2>
            <RaceForm onSubmit={handleRaceCreate} onCancel={() => setShowRaceForm(false)} submitLabel="Add Race" />
          </div>
        )}

        {racesLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="card-squircle h-24 animate-pulse bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
                  Upcoming ({upcoming.length})
                </p>
                {upcoming.map((race) => (
                  <RaceCard key={race.id} race={race} onDelete={handleRaceDelete} />
                ))}
              </div>
            )}

            {completed.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
                  Completed ({completed.length})
                </p>
                {completed.map((race) => (
                  <RaceCard key={race.id} race={race} onDelete={handleRaceDelete} />
                ))}
              </div>
            )}

            {races.length === 0 && !showRaceForm && (
              <div className="card-squircle p-10 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  No races yet. Add your target race to start your projection.
                </p>
                <button
                  onClick={() => setShowRaceForm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Plus size={15} />
                  Add Your First Race
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent Activity */}
      <ActivityFeed />
    </div>
  )
}
