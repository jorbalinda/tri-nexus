'use client'

import { useState, useMemo } from 'react'
import SportTabs from '@/components/plan/SportTabs'
import CategoryFilter from '@/components/plan/CategoryFilter'
import WorkoutGrid from '@/components/plan/WorkoutGrid'
import WorkoutDetailModal from '@/components/plan/WorkoutDetailModal'
import { CATEGORY_META, getWorkoutsBySport, getCategoriesForSport } from '@/lib/data/workout-library'
import type { PlanSport, WorkoutCategory, LibraryWorkout } from '@/lib/types/training-plan'

export default function PlanPage() {
  const [sport, setSport] = useState<PlanSport>('swim')
  const [category, setCategory] = useState<WorkoutCategory | null>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<LibraryWorkout | null>(null)

  const sportWorkouts = useMemo(() => getWorkoutsBySport(sport), [sport])
  const categories = useMemo(() => getCategoriesForSport(sport), [sport])

  const filteredWorkouts = useMemo(() => {
    const list = category ? sportWorkouts.filter((w) => w.category === category) : sportWorkouts
    const zoneOrder: Record<string, number> = { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, 'max': 6, 'mixed': 7 }
    return [...list].sort((a, b) => (zoneOrder[String(a.zone)] ?? 99) - (zoneOrder[String(b.zone)] ?? 99))
  }, [sportWorkouts, category])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Workout Library
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse swim, bike, and run workouts by training type
          </p>
        </div>
        <SportTabs activeSport={sport} onSportChange={setSport} />
      </div>

      <CategoryFilter
        sport={sport}
        categories={categories}
        categoryMeta={CATEGORY_META}
        activeCategory={category}
        onCategoryChange={setCategory}
      />

      <WorkoutGrid
        workouts={filteredWorkouts}
        sport={sport}
        onSelectWorkout={setSelectedWorkout}
      />

      <WorkoutDetailModal
        workout={selectedWorkout}
        sport={sport}
        onClose={() => setSelectedWorkout(null)}
      />
    </div>
  )
}
