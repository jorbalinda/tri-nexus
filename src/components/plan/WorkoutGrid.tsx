'use client'

import type { LibraryWorkout, PlanSport } from '@/lib/types/training-plan'
import WorkoutCard from './WorkoutCard'

interface WorkoutGridProps {
  workouts: LibraryWorkout[]
  sport: PlanSport
  onSelectWorkout: (workout: LibraryWorkout) => void
}

export default function WorkoutGrid({ workouts, sport, onSelectWorkout }: WorkoutGridProps) {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-gray-400 dark:text-gray-500">No workouts found for this filter.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
        {workouts.length} workout{workouts.length !== 1 ? 's' : ''}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {workouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            sport={sport}
            onClick={() => onSelectWorkout(workout)}
          />
        ))}
      </div>
    </div>
  )
}
