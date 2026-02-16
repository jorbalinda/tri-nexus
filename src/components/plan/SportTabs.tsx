'use client'

import { Waves, Bike, Footprints } from 'lucide-react'
import type { PlanSport } from '@/lib/types/training-plan'

const sports: { key: PlanSport; label: string; icon: typeof Waves; color: string }[] = [
  { key: 'swim', label: 'Swim', icon: Waves, color: 'text-blue-600' },
  { key: 'bike', label: 'Bike', icon: Bike, color: 'text-orange-600' },
  { key: 'run', label: 'Run', icon: Footprints, color: 'text-green-600' },
]

interface SportTabsProps {
  activeSport: PlanSport
  onSportChange: (sport: PlanSport) => void
}

export default function SportTabs({ activeSport, onSportChange }: SportTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-2xl p-1.5">
      {sports.map(({ key, label, icon: Icon, color }) => {
        const isActive = activeSport === key
        return (
          <button
            key={key}
            onClick={() => onSportChange(key)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              isActive
                ? `bg-[var(--card-bg)] shadow-sm ${color}`
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
