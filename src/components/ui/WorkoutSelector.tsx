'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Clock, Ruler, Calendar } from 'lucide-react'
import type { Workout } from '@/lib/types/database'

interface WorkoutSelectorProps {
  workouts: Workout[]
  selectedIndex: number
  onSelect: (index: number) => void
  sportColor: string // e.g. 'blue', 'orange', 'green'
  formatDistance: (w: Workout) => string
}

const colorMap: Record<string, { ring: string; bg: string; text: string; dot: string }> = {
  blue: { ring: 'ring-blue-500/30', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  orange: { ring: 'ring-orange-500/30', bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500' },
  green: { ring: 'ring-green-500/30', bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
  purple: { ring: 'ring-purple-500/30', bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
}

const darkColorMap: Record<string, { bg: string }> = {
  blue: { bg: 'dark:bg-blue-950/40' },
  orange: { bg: 'dark:bg-orange-950/40' },
  green: { bg: 'dark:bg-green-950/40' },
  purple: { bg: 'dark:bg-purple-950/40' },
}

export default function WorkoutSelector({
  workouts,
  selectedIndex,
  onSelect,
  sportColor,
  formatDistance,
}: WorkoutSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const colors = colorMap[sportColor] || colorMap.blue
  const darkColors = darkColorMap[sportColor] || darkColorMap.blue

  const selected = workouts[selectedIndex]

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!selected) return null

  const formatDate = (date: string) =>
    new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

  const formatDuration = (sec: number | null) => {
    if (!sec) return ''
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl bg-[var(--card-bg)] border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer w-full max-w-md ${
          open ? `ring-2 ${colors.ring}` : ''
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${colors.dot} shrink-0`} />
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{selected.title}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {formatDate(selected.date)}
            </span>
            <span className="flex items-center gap-1">
              <Ruler size={10} />
              {formatDistance(selected)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {formatDuration(selected.duration_seconds)}
            </span>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 dark:text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-full max-w-md bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {workouts.map((w, i) => {
            const isSelected = i === selectedIndex
            return (
              <button
                key={w.id}
                onClick={() => {
                  onSelect(i)
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all cursor-pointer ${
                  isSelected
                    ? `${colors.bg} ${darkColors.bg} ${colors.text}`
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                } ${i !== workouts.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isSelected ? colors.dot : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isSelected ? '' : 'text-gray-800 dark:text-gray-200'}`}>
                    {w.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(w.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Ruler size={10} />
                      {formatDistance(w)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {formatDuration(w.duration_seconds)}
                    </span>
                    {w.rpe && (
                      <span className="text-gray-300 dark:text-gray-600">RPE {w.rpe}</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
