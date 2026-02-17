'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, X, MapPin, Trophy } from 'lucide-react'
import type { RaceCourse } from '@/lib/types/race-plan'

interface CourseSearchComboboxProps {
  globalCourses: RaceCourse[]
  userCourses: RaceCourse[]
  selectedCourse: RaceCourse | null
  onSelect: (course: RaceCourse) => void
  onClear: () => void
}

const seriesBadge: Record<string, { label: string; bg: string; text: string; darkBg: string; darkText: string }> = {
  ironman: { label: 'IRONMAN', bg: 'bg-red-100', text: 'text-red-700', darkBg: 'dark:bg-red-900/40', darkText: 'dark:text-red-400' },
  ironman_703: { label: '70.3', bg: 'bg-orange-100', text: 'text-orange-700', darkBg: 'dark:bg-orange-900/40', darkText: 'dark:text-orange-400' },
  world_triathlon: { label: 'WTS', bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/40', darkText: 'dark:text-blue-400' },
  pto_t100: { label: 'T100', bg: 'bg-purple-100', text: 'text-purple-700', darkBg: 'dark:bg-purple-900/40', darkText: 'dark:text-purple-400' },
  challenge: { label: 'CHALLENGE', bg: 'bg-teal-100', text: 'text-teal-700', darkBg: 'dark:bg-teal-900/40', darkText: 'dark:text-teal-400' },
  usat: { label: 'USAT', bg: 'bg-indigo-100', text: 'text-indigo-700', darkBg: 'dark:bg-indigo-900/40', darkText: 'dark:text-indigo-400' },
  other: { label: 'OTHER', bg: 'bg-gray-100', text: 'text-gray-600', darkBg: 'dark:bg-gray-800', darkText: 'dark:text-gray-400' },
  local: { label: 'LOCAL', bg: 'bg-gray-100', text: 'text-gray-600', darkBg: 'dark:bg-gray-800', darkText: 'dark:text-gray-400' },
}

const distanceBadge: Record<string, { label: string; bg: string; text: string; darkBg: string; darkText: string }> = {
  '140.6': { label: '140.6', bg: 'bg-red-50', text: 'text-red-600', darkBg: 'dark:bg-red-950/30', darkText: 'dark:text-red-400' },
  '70.3': { label: '70.3', bg: 'bg-orange-50', text: 'text-orange-600', darkBg: 'dark:bg-orange-950/30', darkText: 'dark:text-orange-400' },
  olympic: { label: 'Olympic', bg: 'bg-blue-50', text: 'text-blue-600', darkBg: 'dark:bg-blue-950/30', darkText: 'dark:text-blue-400' },
  sprint: { label: 'Sprint', bg: 'bg-green-50', text: 'text-green-600', darkBg: 'dark:bg-green-950/30', darkText: 'dark:text-green-400' },
}

export default function CourseSearchCombobox({
  globalCourses,
  userCourses,
  selectedCourse,
  onSelect,
  onClear,
}: CourseSearchComboboxProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    const matchesCourse = (c: RaceCourse) => {
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.location_city.toLowerCase().includes(q) ||
        c.location_country.toLowerCase().includes(q) ||
        c.race_series.toLowerCase().includes(q)
      )
    }
    return {
      user: userCourses.filter(matchesCourse),
      global: globalCourses.filter(matchesCourse),
    }
  }, [query, userCourses, globalCourses])

  const totalResults = filtered.user.length + filtered.global.length

  if (selectedCourse) {
    const sb = seriesBadge[selectedCourse.race_series] || seriesBadge.other
    const db = distanceBadge[selectedCourse.race_distance]
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <MapPin size={14} className="text-blue-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
            {selectedCourse.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {selectedCourse.location_city}, {selectedCourse.location_country}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${sb.bg} ${sb.text} ${sb.darkBg} ${sb.darkText}`}>
            {sb.label}
          </span>
          {db && (
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${db.bg} ${db.text} ${db.darkBg} ${db.darkText}`}>
              {db.label}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          placeholder="Search courses (e.g. Kona, Chattanooga, Nice...)"
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-full bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {totalResults === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">No courses found</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Try a different search or enter details manually</p>
            </div>
          ) : (
            <>
              {filtered.user.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-gray-400 dark:text-gray-500">
                      My Custom Courses
                    </p>
                  </div>
                  {filtered.user.map((course) => (
                    <CourseItem key={course.id} course={course} onSelect={onSelect} setOpen={setOpen} />
                  ))}
                </>
              )}
              {filtered.global.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-gray-400 dark:text-gray-500">
                      Global Courses ({filtered.global.length})
                    </p>
                  </div>
                  {filtered.global.map((course) => (
                    <CourseItem key={course.id} course={course} onSelect={onSelect} setOpen={setOpen} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function CourseItem({
  course,
  onSelect,
  setOpen,
}: {
  course: RaceCourse
  onSelect: (c: RaceCourse) => void
  setOpen: (open: boolean) => void
}) {
  const sb = seriesBadge[course.race_series] || seriesBadge.other
  const db = distanceBadge[course.race_distance]

  return (
    <button
      type="button"
      onClick={() => {
        onSelect(course)
        setOpen(false)
      }}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
          {course.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
            {course.location_city}, {course.location_country}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${sb.bg} ${sb.text} ${sb.darkBg} ${sb.darkText}`}>
          {sb.label}
        </span>
        {db && (
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${db.bg} ${db.text} ${db.darkBg} ${db.darkText}`}>
            {db.label}
          </span>
        )}
        {course.is_kona_qualifier && (
          <span className="flex items-center" aria-label="Kona Qualifier">
            <Trophy size={12} className="text-amber-500" />
          </span>
        )}
        {course.is_703_worlds_qualifier && (
          <span className="flex items-center" aria-label="70.3 Worlds Qualifier">
            <Trophy size={12} className="text-orange-500" />
          </span>
        )}
      </div>
    </button>
  )
}
