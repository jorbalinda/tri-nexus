'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import type { EquipmentPlan, RacePlanChecklist, ChecklistCategory } from '@/lib/types/race-plan'

interface EquipmentCardProps {
  equipment: EquipmentPlan
  checklistItems: RacePlanChecklist[]
  onToggle: (itemId: string, checked: boolean) => void
}

const categoryLabels: Record<ChecklistCategory, string> = {
  swim: 'Swim',
  bike: 'Bike',
  run: 'Run',
  transition: 'Transition',
  nutrition: 'Nutrition',
  special_needs: 'Special Needs',
}

const categoryColors: Record<ChecklistCategory, string> = {
  swim: 'text-blue-500',
  bike: 'text-orange-500',
  run: 'text-green-500',
  transition: 'text-purple-500',
  nutrition: 'text-amber-500',
  special_needs: 'text-red-500',
}

export default function EquipmentCard({ equipment, checklistItems, onToggle }: EquipmentCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { raceWeekTimeline } = equipment

  const checkedCount = checklistItems.filter((i) => i.is_checked).length
  const totalCount = checklistItems.length
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

  // Group checklist by category
  const grouped = checklistItems.reduce(
    (acc, item) => {
      const cat = item.category as ChecklistCategory
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    },
    {} as Record<ChecklistCategory, RacePlanChecklist[]>
  )

  return (
    <div className="card-squircle p-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
            Equipment & Logistics
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {checkedCount}/{totalCount} items packed
          </p>
        </div>
        {expanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>

      {/* Progress bar */}
      <div className="mt-3 w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {expanded && (
        <div className="mt-6 flex flex-col gap-6">
          {/* Interactive checklist */}
          {(Object.keys(categoryLabels) as ChecklistCategory[]).map((cat) => {
            const items = grouped[cat]
            if (!items || items.length === 0) return null
            return (
              <div key={cat}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${categoryColors[cat]}`}>
                  {categoryLabels[cat]}
                </p>
                <div className="flex flex-col gap-1">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => onToggle(item.id, !item.is_checked)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                          item.is_checked
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {item.is_checked && <Check size={12} className="text-white" strokeWidth={3} />}
                      </button>
                      <span
                        className={`text-sm ${
                          item.is_checked
                            ? 'line-through text-gray-400 dark:text-gray-500'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {item.item_name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Race week timeline */}
          <div className="mt-2">
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
              Race Week Timeline
            </p>
            <div className="flex flex-col gap-4">
              {raceWeekTimeline.map((day) => (
                <div key={day.daysOut} className="border-l-4 border-l-blue-500 pl-4">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">{day.label}</p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                    {day.tasks.map((task, i) => (
                      <li key={i}>• {task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
