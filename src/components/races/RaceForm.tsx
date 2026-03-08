'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, CalendarCheck, CheckCircle, Thermometer, Mountain, Waves } from 'lucide-react'
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
  const [customSwim, setCustomSwim] = useState(initialData?.custom_swim_distance_m?.toString() || '')
  const [customBike, setCustomBike] = useState(initialData?.custom_bike_distance_km?.toString() || '')
  const [customRun, setCustomRun] = useState(initialData?.custom_run_distance_km?.toString() || '')
  const [gunStartTime, setGunStartTime] = useState(initialData?.gun_start_time || '')
  const [expectedTempF, setExpectedTempF] = useState(initialData?.expected_temp_f?.toString() || '')
  const [altitudeFt, setAltitudeFt] = useState(initialData?.altitude_ft?.toString() || '')
  const [courseProfile, setCourseProfile] = useState<string>(initialData?.course_profile || '')
  const [swimType, setSwimType] = useState<string>(initialData?.swim_type || initialData?.water_type || '')
  const [wetsuit, setWetsuit] = useState(initialData?.wetsuit ?? false)
  const [conditionsExpanded, setConditionsExpanded] = useState(false)
  const [dateFromCourse, setDateFromCourse] = useState(false)
  const [distanceFromCourse, setDistanceFromCourse] = useState(false)
  const [gunTimeFromCourse, setGunTimeFromCourse] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customName, setCustomName] = useState(false)
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
  const [distanceDropdownOpen, setDistanceDropdownOpen] = useState(false)
  const [courseSearch, setCourseSearch] = useState('')
  const [courseSort, setCourseSort] = useState<'date' | 'name'>('date')

  const courseDropdownRef = useRef<HTMLDivElement>(null)
  const distanceDropdownRef = useRef<HTMLDivElement>(null)

  const { courses } = useRaceCourses()

  // Check if initialData race name matches a course
  useEffect(() => {
    if (initialData?.race_name && courses.length > 0) {
      const match = courses.find((c) => c.name === initialData.race_name)
      if (!match) setCustomName(true)
    }
  }, [initialData?.race_name, courses])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(e.target as Node)) {
        setCourseDropdownOpen(false)
        setCourseSearch('')
      }
      if (distanceDropdownRef.current && !distanceDropdownRef.current.contains(e.target as Node)) {
        setDistanceDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredCourses = (courseSearch
    ? courses.filter((c) =>
        c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.location_city.toLowerCase().includes(courseSearch.toLowerCase())
      )
    : courses
  ).slice().sort((a, b) => {
    if (courseSort === 'date') {
      if (!a.next_race_date && !b.next_race_date) return a.name.localeCompare(b.name)
      if (!a.next_race_date) return 1
      if (!b.next_race_date) return -1
      return a.next_race_date.localeCompare(b.next_race_date)
    }
    return a.name.localeCompare(b.name)
  })

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
        notes: null,
        actual_finish_seconds: initialData?.actual_finish_seconds || null,
        actual_swim_seconds: initialData?.actual_swim_seconds || null,
        actual_bike_seconds: initialData?.actual_bike_seconds || null,
        actual_run_seconds: initialData?.actual_run_seconds || null,
        actual_t1_seconds: initialData?.actual_t1_seconds || null,
        actual_t2_seconds: initialData?.actual_t2_seconds || null,
        race_type: initialData?.race_type || 'triathlon',
        water_type: (['pool', 'lake', 'river', 'bay', 'ocean'].includes(swimType) ? swimType as TargetRace['water_type'] : null),
        wetsuit,
        expected_temp_f: expectedTempF ? parseFloat(expectedTempF) : null,
        gun_start_time: gunStartTime || initialData?.gun_start_time || null,
        altitude_ft: altitudeFt ? parseFloat(altitudeFt) : null,
        course_profile: (['flat', 'rolling', 'hilly', 'mountainous'].includes(courseProfile) ? courseProfile as TargetRace['course_profile'] : null),
        swim_type: (['pool', 'lake', 'river', 'bay', 'ocean'].includes(swimType) ? swimType as TargetRace['swim_type'] : null),
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

  function handleCourseSelect(value: string) {
    if (value === '__custom__') {
      setCustomName(true)
      setRaceName('')
      setRaceCourseId('')
      setDateFromCourse(false)
      setDistanceFromCourse(false)
      setGunTimeFromCourse(false)
      setRaceDate('')
      setGunStartTime('')
      return
    }
    const course = courses.find((c) => c.id === value)
    if (course) {
      setRaceCourseId(course.id)
      setRaceName(course.name)
      setRaceDistance(course.race_distance as TargetRace['race_distance'])
      setDistanceFromCourse(true)
      if (course.next_race_date) {
        setRaceDate(course.next_race_date)
        setDateFromCourse(true)
      } else {
        setRaceDate('')
        setDateFromCourse(false)
      }
      if (course.next_race_date && course.typical_start_time) {
        const gunDate = new Date(`${course.next_race_date}T${course.typical_start_time}:00`)
        setGunStartTime(gunDate.toISOString())
        setGunTimeFromCourse(true)
      } else if (course.typical_start_time) {
        setGunStartTime(course.typical_start_time)
        setGunTimeFromCourse(true)
      } else {
        setGunStartTime('')
        setGunTimeFromCourse(false)
      }
      // Auto-populate race conditions from course data
      if (course.typical_temp_high_f) setExpectedTempF(course.typical_temp_high_f.toString())
      if (course.altitude_ft) setAltitudeFt(course.altitude_ft.toString())
      if (course.course_profile) setCourseProfile(course.course_profile)
      if (course.water_type) setSwimType(course.water_type)
      if (course.wetsuit_legal != null) setWetsuit(course.wetsuit_legal)
      setCustomName(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Error banner */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Race Name */}
      <div>
        <label className={LABEL_CLASS}>Race Name</label>
        {!customName ? (
          <div ref={courseDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
              className={`${INPUT_CLASS} flex items-center justify-between text-left cursor-pointer`}
            >
              <span className={raceName ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
                {raceName || 'Select a race course...'}
              </span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${courseDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {courseDropdownOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-gray-100 dark:border-gray-800 space-y-2">
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    placeholder="Search courses..."
                    autoFocus
                    maxLength={100}
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mr-1">Sort by</span>
                    <button
                      type="button"
                      onClick={() => setCourseSort('date')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        courseSort === 'date'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}
                    >
                      Date
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseSort('name')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        courseSort === 'name'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}
                    >
                      Name
                    </button>
                  </div>
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {filteredCourses.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        handleCourseSelect(c.id)
                        setCourseDropdownOpen(false)
                        setCourseSearch('')
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                        raceCourseId === c.id ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{c.location_city}, {c.location_country} ({c.race_distance})</span>
                        </div>
                        {c.next_race_date && (
                          <span className="flex items-center gap-1 shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400">
                            <CalendarCheck size={10} />
                            {new Date(c.next_race_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      handleCourseSelect('__custom__')
                      setCourseDropdownOpen(false)
                      setCourseSearch('')
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-t border-gray-100 dark:border-gray-800"
                  >
                    Other / Custom Race...
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={raceName}
              onChange={(e) => {
                setRaceName(e.target.value)
                if (e.target.value === '') setRaceCourseId('')
              }}
              className={INPUT_CLASS}
              placeholder="Enter race name..."
              maxLength={100}
              required
            />
            <button
              type="button"
              onClick={() => {
                setCustomName(false)
                setRaceName('')
                setRaceCourseId('')
              }}
              className="px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer whitespace-nowrap"
            >
              Browse
            </button>
          </div>
        )}
      </div>

      {/* Date + Distance */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Race Date</label>
          {dateFromCourse && raceDate ? (
            <div className={`${INPUT_CLASS} flex items-center gap-2 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800`}>
              <CalendarCheck size={14} className="text-green-500 shrink-0" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {new Date(raceDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          ) : (
            <input
              type="date"
              value={raceDate}
              onChange={(e) => setRaceDate(e.target.value)}
              className={INPUT_CLASS}
              required
            />
          )}
        </div>
        <div ref={distanceDropdownRef} className="relative">
          <label className={LABEL_CLASS}>Distance</label>
          {distanceFromCourse ? (
            <div className={`${INPUT_CLASS} flex items-center gap-2 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800`}>
              <CheckCircle size={14} className="text-green-500 shrink-0" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {DISTANCES.find((d) => d.value === raceDistance)?.label || raceDistance}
              </span>
            </div>
          ) : (
          <button
            type="button"
            onClick={() => setDistanceDropdownOpen(!distanceDropdownOpen)}
            className={`${INPUT_CLASS} flex items-center justify-between text-left cursor-pointer`}
          >
            <span className="text-gray-900 dark:text-gray-100">
              {DISTANCES.find((d) => d.value === raceDistance)?.label || raceDistance}
            </span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${distanceDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          )}
          {distanceDropdownOpen && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
              {DISTANCES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => {
                    setRaceDistance(d.value as TargetRace['race_distance'])
                    setDistanceDropdownOpen(false)
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                    raceDistance === d.value ? 'bg-blue-50 dark:bg-blue-950/30 font-medium text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
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

      {/* Gun Start Time */}
      <div>
        <label className={LABEL_CLASS}>Gun Start Time</label>
        {gunTimeFromCourse && gunStartTime ? (
          <div className={`${INPUT_CLASS} flex items-center gap-2 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800`}>
            <CheckCircle size={14} className="text-green-500 shrink-0" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {(() => {
                try {
                  // Handle both ISO string and HH:MM format
                  if (gunStartTime.includes('T')) {
                    return new Date(gunStartTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                  }
                  const [h, m] = gunStartTime.split(':').map(Number)
                  const ampm = h >= 12 ? 'PM' : 'AM'
                  const hour12 = h % 12 || 12
                  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`
                } catch {
                  return gunStartTime
                }
              })()}
            </span>
          </div>
        ) : (
          <input
            type="time"
            value={gunStartTime.includes('T') ? gunStartTime.slice(11, 16) : gunStartTime}
            onChange={(e) => setGunStartTime(e.target.value)}
            className={INPUT_CLASS}
          />
        )}
      </div>

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

      {/* Race Conditions (collapsible) */}
      <div>
        <button
          type="button"
          onClick={() => setConditionsExpanded(!conditionsExpanded)}
          className="flex items-center gap-2 w-full text-left mb-2 cursor-pointer"
        >
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${conditionsExpanded ? 'rotate-180' : ''}`} />
          <span className={LABEL_CLASS + ' mb-0'}>Race Conditions</span>
          {(expectedTempF || altitudeFt || courseProfile || swimType) && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400">
              Set
            </span>
          )}
        </button>
        {conditionsExpanded && (
          <div className="space-y-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Thermometer size={10} />
                  Expected High Temp (°F)
                </label>
                <input
                  type="number"
                  value={expectedTempF}
                  onChange={(e) => setExpectedTempF(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="85"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mountain size={10} />
                  Altitude (ft)
                </label>
                <input
                  type="number"
                  value={altitudeFt}
                  onChange={(e) => setAltitudeFt(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="1000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Course Profile</label>
                <select
                  value={courseProfile}
                  onChange={(e) => setCourseProfile(e.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="">Not set</option>
                  <option value="flat">Flat</option>
                  <option value="rolling">Rolling</option>
                  <option value="hilly">Hilly</option>
                  <option value="mountainous">Mountainous</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Waves size={10} />
                  Swim Type
                </label>
                <select
                  value={swimType}
                  onChange={(e) => setSwimType(e.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="">Not set</option>
                  <option value="pool">Pool</option>
                  <option value="lake">Lake</option>
                  <option value="river">River</option>
                  <option value="bay">Bay</option>
                  <option value="ocean">Ocean</option>
                </select>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wetsuit}
                  onChange={(e) => setWetsuit(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500/30"
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Wetsuit Legal</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !raceName || !raceDate}
          className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
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
