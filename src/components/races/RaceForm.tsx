'use client'

import { useState, useEffect, useRef } from 'react'
import { useRaceCourses } from '@/hooks/useRaceCourses'
import type { TargetRace } from '@/lib/types/target-race'

const DISTANCES = [
  { value: 'sprint', label: 'Sprint (750m / 20km / 5km)' },
  { value: 'olympic', label: 'Olympic (1.5km / 40km / 10km)' },
  { value: '70.3', label: '70.3 (1.9km / 90km / 21.1km)' },
  { value: '140.6', label: '140.6 (3.8km / 180km / 42.2km)' },
  { value: 'custom', label: 'Custom' },
]

const PRIORITIES = [
  { value: 'a', label: 'A Race', desc: 'Primary target' },
  { value: 'b', label: 'B Race', desc: 'Secondary goal' },
  { value: 'c', label: 'C Race', desc: 'Training race' },
]

interface RaceFormProps {
  initialData?: Partial<TargetRace>
  onSubmit: (data: Omit<TargetRace, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

const INPUT_CLASS = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'
const LABEL_CLASS = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

export default function RaceForm({ initialData, onSubmit, onCancel, submitLabel = 'Save Race' }: RaceFormProps) {
  const [raceName, setRaceName] = useState(initialData?.race_name || '')
  const [raceDate, setRaceDate] = useState(initialData?.race_date || '')
  const [raceDistance, setRaceDistance] = useState<TargetRace['race_distance']>(initialData?.race_distance || 'olympic')
  const [priority, setPriority] = useState<TargetRace['priority']>(initialData?.priority || 'a')
  const [raceCourseId, setRaceCourseId] = useState(initialData?.race_course_id || '')
  const [goalHours, setGoalHours] = useState('')
  const [goalMinutes, setGoalMinutes] = useState('')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [customSwim, setCustomSwim] = useState(initialData?.custom_swim_distance_m?.toString() || '')
  const [customBike, setCustomBike] = useState(initialData?.custom_bike_distance_km?.toString() || '')
  const [customRun, setCustomRun] = useState(initialData?.custom_run_distance_km?.toString() || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const { courses } = useRaceCourses()

  // Filter courses based on race name input
  const filteredCourses = raceName.length >= 2
    ? courses.filter((c) =>
        c.name.toLowerCase().includes(raceName.toLowerCase()) ||
        c.location_city.toLowerCase().includes(raceName.toLowerCase())
      ).slice(0, 8)
    : []

  // Initialize goal time from initialData
  useEffect(() => {
    if (initialData?.goal_time_seconds) {
      const h = Math.floor(initialData.goal_time_seconds / 3600)
      const m = Math.floor((initialData.goal_time_seconds % 3600) / 60)
      setGoalHours(h.toString())
      setGoalMinutes(m.toString())
    }
  }, [initialData?.goal_time_seconds])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!raceName || !raceDate) return

    setError('')
    setSaving(true)
    const goalTimeSeconds = goalHours || goalMinutes
      ? (parseInt(goalHours || '0') * 3600) + (parseInt(goalMinutes || '0') * 60)
      : null

    try {
      await onSubmit({
        race_name: raceName,
        race_date: raceDate,
        race_course_id: raceCourseId || null,
        race_distance: raceDistance as TargetRace['race_distance'],
        priority: priority as TargetRace['priority'],
        custom_swim_distance_m: customSwim ? parseFloat(customSwim) : null,
        custom_bike_distance_km: customBike ? parseFloat(customBike) : null,
        custom_run_distance_km: customRun ? parseFloat(customRun) : null,
        gpx_course_data: null,
        goal_time_seconds: goalTimeSeconds,
        notes: notes || null,
        actual_finish_seconds: initialData?.actual_finish_seconds || null,
        actual_swim_seconds: initialData?.actual_swim_seconds || null,
        actual_bike_seconds: initialData?.actual_bike_seconds || null,
        actual_run_seconds: initialData?.actual_run_seconds || null,
        actual_t1_seconds: initialData?.actual_t1_seconds || null,
        actual_t2_seconds: initialData?.actual_t2_seconds || null,
        race_type: initialData?.race_type || 'triathlon',
        water_type: initialData?.water_type || null,
        wetsuit: initialData?.wetsuit || false,
        expected_temp_f: initialData?.expected_temp_f || null,
        gun_start_time: initialData?.gun_start_time || null,
        status: initialData?.status || 'upcoming',
      })
    } catch (err: unknown) {
      const message = err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to save race. Please try again.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  function selectCourse(course: typeof courses[number]) {
    setRaceCourseId(course.id)
    setRaceName(course.name)
    setRaceDistance(course.race_distance as TargetRace['race_distance'])
    setShowDropdown(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Error banner */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Race Name / Course Search (combined) */}
      <div className="relative">
        <label className={LABEL_CLASS}>Race Name</label>
        <input
          ref={inputRef}
          type="text"
          value={raceName}
          onChange={(e) => {
            setRaceName(e.target.value)
            setShowDropdown(true)
            if (e.target.value === '') setRaceCourseId('')
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => {
            // Delay hiding so mousedown on dropdown items fires first
            setTimeout(() => setShowDropdown(false), 200)
          }}
          className={INPUT_CLASS}
          placeholder="Search courses or type a race name..."
          required
        />
        {showDropdown && filteredCourses.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[var(--card-bg)] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {filteredCourses.map((c) => (
              <button
                key={c.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectCourse(c)
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{c.location_city} | {c.race_distance}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date + Distance */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Race Date</label>
          <input
            type="date"
            value={raceDate}
            onChange={(e) => setRaceDate(e.target.value)}
            className={INPUT_CLASS}
            required
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Distance</label>
          <select
            value={raceDistance}
            onChange={(e) => setRaceDistance(e.target.value as TargetRace['race_distance'])}
            className={INPUT_CLASS}
          >
            {DISTANCES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom distances */}
      {raceDistance === 'custom' && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={LABEL_CLASS}>Swim (m)</label>
            <input type="number" value={customSwim} onChange={(e) => setCustomSwim(e.target.value)} className={INPUT_CLASS} placeholder="1900" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Bike (km)</label>
            <input type="number" value={customBike} onChange={(e) => setCustomBike(e.target.value)} className={INPUT_CLASS} placeholder="90" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Run (km)</label>
            <input type="number" value={customRun} onChange={(e) => setCustomRun(e.target.value)} className={INPUT_CLASS} placeholder="21.1" />
          </div>
        </div>
      )}

      {/* Priority */}
      <div>
        <label className={LABEL_CLASS}>Priority</label>
        <div className="grid grid-cols-3 gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value as TargetRace['priority'])}
              className={`px-3 py-3 rounded-xl border text-center transition-all cursor-pointer ${
                priority === p.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{p.label}</span>
              <span className="block text-[10px] text-gray-400 dark:text-gray-500">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Goal Time */}
      <div>
        <label className={LABEL_CLASS}>Goal Time (optional)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="30"
            placeholder="Hours"
            value={goalHours}
            onChange={(e) => setGoalHours(e.target.value)}
            className={INPUT_CLASS}
          />
          <span className="text-gray-400 text-sm">h</span>
          <input
            type="number"
            min="0"
            max="59"
            placeholder="Min"
            value={goalMinutes}
            onChange={(e) => setGoalMinutes(e.target.value)}
            className={INPUT_CLASS}
          />
          <span className="text-gray-400 text-sm">m</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={LABEL_CLASS}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={INPUT_CLASS}
          rows={2}
          placeholder="Any notes about this race..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !raceName || !raceDate}
          className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
