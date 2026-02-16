'use client'

import { useEffect } from 'react'
import type { PlanSport, WorkoutCategory } from '@/lib/types/training-plan'
import type { CategoryMeta } from '@/lib/types/training-plan'

const sportActiveStyles: Record<PlanSport, string> = {
  swim: 'bg-blue-600 text-white',
  bike: 'bg-orange-600 text-white',
  run: 'bg-green-600 text-white',
}

interface CategoryFilterProps {
  sport: PlanSport
  categories: WorkoutCategory[]
  categoryMeta: Record<WorkoutCategory, CategoryMeta>
  activeCategory: WorkoutCategory | null
  onCategoryChange: (category: WorkoutCategory | null) => void
}

export default function CategoryFilter({
  sport,
  categories,
  categoryMeta,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  useEffect(() => {
    onCategoryChange(null)
  }, [sport])

  const activeStyle = sportActiveStyles[sport]
  const inactiveStyle =
    'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => onCategoryChange(null)}
        className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
          activeCategory === null ? activeStyle : inactiveStyle
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeCategory === cat ? activeStyle : inactiveStyle
          }`}
        >
          {categoryMeta[cat].shortLabel}
        </button>
      ))}
    </div>
  )
}
