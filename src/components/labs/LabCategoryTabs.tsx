'use client'

import { Droplets, FlaskConical, House, Dna } from 'lucide-react'
import type { LabCategory } from '@/lib/types/lab-tests'

const categories: { key: LabCategory; label: string; icon: typeof Droplets; color: string }[] = [
  { key: 'blood_work', label: 'Blood Work', icon: Droplets, color: 'text-red-500' },
  { key: 'performance_lab', label: 'Performance Lab', icon: FlaskConical, color: 'text-blue-600' },
  { key: 'diy_home', label: 'DIY / At-Home', icon: House, color: 'text-green-600' },
  { key: 'genetic', label: 'Genetic / DNA', icon: Dna, color: 'text-purple-600' },
]

interface LabCategoryTabsProps {
  activeCategory: LabCategory
  onCategoryChange: (category: LabCategory) => void
}

export default function LabCategoryTabs({ activeCategory, onCategoryChange }: LabCategoryTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-2xl p-1.5">
      {categories.map(({ key, label, icon: Icon, color }) => {
        const isActive = activeCategory === key
        return (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              isActive
                ? `bg-[var(--card-bg)] shadow-sm ${color}`
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
