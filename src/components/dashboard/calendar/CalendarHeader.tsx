'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface CalendarHeaderProps {
  month: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export default function CalendarHeader({ month, onPrev, onNext, onToday }: CalendarHeaderProps) {
  const label = `${MONTH_NAMES[month.getMonth()]} ${month.getFullYear()}`

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onNext}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
        <h2 className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 ml-2">
          {label}
        </h2>
      </div>
      <button
        onClick={onToday}
        className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
      >
        Today
      </button>
    </div>
  )
}
