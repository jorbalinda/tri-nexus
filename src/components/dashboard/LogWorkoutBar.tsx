'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import WorkoutForm from '@/components/forms/WorkoutForm'

export default function LogWorkoutBar() {
  const [open, setOpen] = useState(false)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    },
    []
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, handleEscape])

  return (
    <>
      {/* Compact bar */}
      <button
        onClick={() => setOpen(true)}
        className="card-squircle px-6 py-4 flex items-center justify-between w-full cursor-pointer group hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <Plus size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Log Workout
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Record a swim, bike, run, or brick session
            </p>
          </div>
        </div>
        <span className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold group-hover:bg-blue-700 transition-colors">
          Log
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg h-full overflow-y-auto card-squircle rounded-l-[2.5rem] rounded-r-none"
            style={{ borderRight: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Log Workout
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <WorkoutForm bare />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
