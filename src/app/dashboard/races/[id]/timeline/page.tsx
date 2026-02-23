'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle2, Circle, Trash2, MapPin, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTimelineEvents } from '@/hooks/useTimelineEvents'
import type { TargetRace } from '@/lib/types/target-race'
import type { RaceCourse } from '@/lib/types/race-plan'

const INPUT_CLASS = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'

const TYPE_COLORS: Record<string, string> = {
  logistics: 'bg-blue-500',
  nutrition: 'bg-orange-500',
  action: 'bg-green-500',
}

const TYPE_BADGES: Record<string, string> = {
  logistics: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  nutrition: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
  action: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDay(dateStr: string, raceDateStr: string): string {
  const d = new Date(dateStr)
  const raceDate = new Date(raceDateStr)
  const dDay = new Date(raceDate)
  dDay.setHours(0, 0, 0, 0)

  const eventDay = new Date(d)
  eventDay.setHours(0, 0, 0, 0)

  const diff = (dDay.getTime() - eventDay.getTime()) / (1000 * 60 * 60 * 24)

  if (diff <= 0) return 'Race Day'
  if (diff === 1) return 'Day Before'
  return `${Math.round(diff)} Days Before`
}

function formatRaceDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function TimelinePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const [race, setRace] = useState<TargetRace | null>(null)
  const { events, loading, generate, toggleCompleted, removeEvent } = useTimelineEvents(id)

  const [gunTimeOnly, setGunTimeOnly] = useState('')
  const [settingGunTime, setSettingGunTime] = useState(false)
  const [course, setCourse] = useState<RaceCourse | null>(null)
  const [suggestedFromCourse, setSuggestedFromCourse] = useState(false)

  useEffect(() => {
    async function loadRace() {
      const { data } = await supabaseRef.current
        .from('target_races')
        .select('*')
        .eq('id', id)
        .single()
      const r = data as TargetRace | null
      setRace(r)

      if (r?.gun_start_time) {
        const d = new Date(r.gun_start_time)
        const hours = d.getHours().toString().padStart(2, '0')
        const mins = d.getMinutes().toString().padStart(2, '0')
        setGunTimeOnly(`${hours}:${mins}`)
      }

      // Fetch linked course for start time suggestion
      if (r?.race_course_id) {
        const { data: courseData } = await supabaseRef.current
          .from('race_courses')
          .select('*')
          .eq('id', r.race_course_id)
          .single()
        const c = courseData as RaceCourse | null
        setCourse(c)

        // Auto-suggest gun time from course if user hasn't set one yet
        if (!r.gun_start_time && c?.typical_start_time) {
          setGunTimeOnly(c.typical_start_time)
          setSuggestedFromCourse(true)
        }
      }
    }
    loadRace()
  }, [id])

  const handleSetGunTime = async () => {
    if (!gunTimeOnly || !race?.race_date) return
    setSettingGunTime(true)

    // Combine the fixed race date with the user-selected time
    const gunDate = new Date(`${race.race_date}T${gunTimeOnly}:00`)

    await supabaseRef.current
      .from('target_races')
      .update({ gun_start_time: gunDate.toISOString() })
      .eq('id', id)

    setRace((prev) => prev ? { ...prev, gun_start_time: gunDate.toISOString() } : null)
    setSuggestedFromCourse(false)

    // Generate timeline
    await generate(gunDate, race?.race_distance || 'olympic')
    setSettingGunTime(false)
  }

  // Group events by day
  const groupedEvents: Map<string, typeof events> = new Map()
  if (race) {
    events.forEach((e) => {
      const day = formatDay(e.scheduled_time, race.race_date)
      const group = groupedEvents.get(day) || []
      group.push(e)
      groupedEvents.set(day, group)
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/dashboard/races/${id}`)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
            Timeline
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Race Week Schedule
          </h1>
        </div>
      </div>

      {/* Gun time setup */}
      <div className="card-squircle p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock size={18} className="text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Gun Start Time</h2>
        </div>

        {/* Race date — read-only */}
        {race?.race_date && (
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={14} className="text-gray-400" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatRaceDate(race.race_date)}
            </p>
            {course?.timezone && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                {course.timezone}
              </span>
            )}
          </div>
        )}

        {/* Time-only input */}
        <div className="flex items-center gap-3">
          <input
            type="time"
            value={gunTimeOnly}
            onChange={(e) => {
              setGunTimeOnly(e.target.value)
              setSuggestedFromCourse(false)
            }}
            className={INPUT_CLASS}
          />
          <button
            onClick={handleSetGunTime}
            disabled={settingGunTime || !gunTimeOnly}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {settingGunTime ? 'Generating...' : events.length > 0 ? 'Regenerate' : 'Generate Timeline'}
          </button>
        </div>
        {suggestedFromCourse && course?.typical_start_time && (
          <div className="flex items-center gap-2 mt-2">
            <MapPin size={12} className="text-blue-500 shrink-0" />
            <p className="text-[11px] text-blue-600 dark:text-blue-400">
              Pre-filled from {course.name} typical start ({course.typical_start_time} {course.timezone ?? 'local'})
            </p>
          </div>
        )}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-squircle p-4 h-16 animate-pulse bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        Array.from(groupedEvents.entries()).map(([dayLabel, dayEvents]) => (
          <div key={dayLabel}>
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3 px-1">
              {dayLabel}
            </p>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gray-200 dark:bg-gray-700" />

              <div className="flex flex-col gap-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all group ${
                      event.is_completed ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className={`relative z-10 w-3 h-3 rounded-full ${
                      event.is_completed ? 'bg-gray-400' : TYPE_COLORS[event.event_type || 'action']
                    } ring-4 ring-[var(--background)]`} />

                    {/* Time */}
                    <span className="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400 min-w-[70px]">
                      {formatTime(event.scheduled_time)}
                    </span>

                    {/* Event name */}
                    <span className={`text-sm flex-1 ${
                      event.is_completed
                        ? 'text-gray-400 line-through'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {event.event_name}
                    </span>

                    {/* Type badge */}
                    {event.event_type && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_BADGES[event.event_type]}`}>
                        {event.event_type}
                      </span>
                    )}

                    {/* Complete toggle */}
                    <button
                      onClick={() => toggleCompleted(event.id)}
                      className="cursor-pointer flex-shrink-0"
                    >
                      {event.is_completed ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : (
                        <Circle size={18} className="text-gray-300 dark:text-gray-600" />
                      )}
                    </button>

                    {/* Delete (custom only) */}
                    {event.is_custom && (
                      <button
                        onClick={() => removeEvent(event.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 cursor-pointer"
                      >
                        <Trash2 size={14} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}

      {events.length === 0 && !loading && (
        <div className="card-squircle p-12 text-center">
          <Clock size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Set your gun start time above to generate your race week timeline.
          </p>
        </div>
      )}
    </div>
  )
}
