'use client'

import type { LabTest, LabCategory } from '@/lib/types/lab-tests'

const priorityStyles: Record<string, { label: string; style: string }> = {
  essential: { label: 'Essential', style: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  recommended: { label: 'Recommended', style: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  optional: { label: 'Optional', style: 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400' },
}

const categoryBorderHover: Record<LabCategory, string> = {
  blood_work: 'hover:border-red-200 dark:hover:border-red-800/50',
  performance_lab: 'hover:border-blue-200 dark:hover:border-blue-800/50',
  diy_home: 'hover:border-green-200 dark:hover:border-green-800/50',
  genetic: 'hover:border-purple-200 dark:hover:border-purple-800/50',
}

interface LabTestCardProps {
  test: LabTest
  onClick: () => void
  lastDate?: string
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function LabTestCard({ test, onClick, lastDate }: LabTestCardProps) {
  const p = priorityStyles[test.priority]

  return (
    <button
      onClick={onClick}
      className={`text-left w-full bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md ${categoryBorderHover[test.category]} cursor-pointer`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${p.style}`}>
          {p.label}
        </span>
        {test.optimalRange && (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {test.optimalRange} {test.unit}
          </span>
        )}
        {lastDate && (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 ml-auto">
            Last: {formatShortDate(lastDate)}
          </span>
        )}
      </div>

      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
        {test.shortName}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
        {test.description}
      </p>

      <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
        <span className="font-semibold">{test.frequency}</span>
      </div>

      {test.submarkers && test.submarkers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {test.submarkers.map((s) => (
            <span
              key={s.name}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400"
            >
              {s.name}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
