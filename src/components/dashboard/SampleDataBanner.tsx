'use client'

import { useState, useEffect } from 'react'
import { Database, X, Sparkles } from 'lucide-react'

interface SampleDataBannerProps {
  workoutCount: number
  onToggle: (enabled: boolean) => void
}

const STORAGE_KEY = 'tri-nexus-sample-data'
const DISMISSED_KEY = 'tri-nexus-sample-dismissed'

export default function SampleDataBanner({ workoutCount, onToggle }: SampleDataBannerProps) {
  const [enabled, setEnabled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const wasDismissed = localStorage.getItem(DISMISSED_KEY)
    if (stored === 'true') {
      setEnabled(true)
      onToggle(true)
    }
    if (wasDismissed === 'true' || workoutCount >= 10) {
      setDismissed(true)
    }
  }, [workoutCount, onToggle])

  if (dismissed || workoutCount >= 10) return null

  const toggle = () => {
    const next = !enabled
    setEnabled(next)
    localStorage.setItem(STORAGE_KEY, String(next))
    onToggle(next)
  }

  const dismiss = () => {
    setDismissed(true)
    localStorage.setItem(DISMISSED_KEY, 'true')
    if (enabled) {
      setEnabled(false)
      localStorage.setItem(STORAGE_KEY, 'false')
      onToggle(false)
    }
  }

  return (
    <div className={`rounded-2xl p-4 mb-6 border transition-all ${
      enabled
        ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
        : 'bg-gray-50/80 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            enabled
              ? 'bg-blue-100 dark:bg-blue-900/40'
              : 'bg-gray-100 dark:bg-gray-800'
          }`}>
            {enabled ? (
              <Sparkles size={16} className="text-blue-500" />
            ) : (
              <Database size={16} className="text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {enabled ? 'Viewing Sample Data' : 'Explore with Sample Data'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {enabled
                ? '12 weeks of realistic triathlon training data. Log workouts to see your own metrics.'
                : `You have ${workoutCount} workout${workoutCount !== 1 ? 's' : ''}. Toggle sample data to explore all features.`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggle}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              enabled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60'
            }`}
          >
            {enabled ? 'Hide Sample' : 'Show Sample'}
          </button>
          <button
            onClick={dismiss}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
