'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle2, Circle, Trash2, MapPin, CalendarDays, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTimelineEvents } from '@/hooks/useTimelineEvents'
import { CONFIGURABLE_ACTIVITIES } from '@/lib/timeline/generator'
import TimeCombobox from '@/components/timeline/TimeCombobox'
import type { TargetRace } from '@/lib/types/target-race'
import type { RaceCourse } from '@/lib/types/race-plan'

const INPUT_CLASS = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee] transition-all'

const TYPE_COLORS: Record<string, string> = {
  logistics: 'bg-[#4361ee]',
  nutrition: 'bg-[#fb8500]',
  action: 'bg-[#4cc9a0]',
}

const TYPE_BADGES: Record<string, string> = {
  logistics: 'bg-[#4361ee]/10 text-[#4361ee]',
  nutrition: 'bg-[#fb8500]/10 text-[#fb8500]',
  action: 'bg-[#4cc9a0]/10 text-[#4cc9a0]',
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

interface Props {
  race: TargetRace
  course: RaceCourse | null
}

export default function TimelineClient({ race, course }: Props) {
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const { events, loading, generate, generateFromSelections, toggleCompleted, addCustomEvent, removeEvent } = useTimelineEvents(race.id)

  const initialGunTime = race.gun_start_time
    ? (() => {
        const d = new Date(race.gun_start_time)
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      })()
    : course?.typical_start_time ?? ''

  const [gunTimeOnly, setGunTimeOnly] = useState(initialGunTime)
  const [settingGunTime, setSettingGunTime] = useState(false)
  const [suggestedFromCourse, setSuggestedFromCourse] = useState(!race.gun_start_time && !!course?.typical_start_time)
  const [showQuickSetup, setShowQuickSetup] = useState(false)
  const [newEventName, setNewEventName] = useState('')
  const [newEventTime, setNewEventTime] = useState('')
  const [newEventType, setNewEventType] = useState<'logistics' | 'nutrition' | 'action'>('action')
  const newEventInputRef = useRef<HTMLInputElement>(null)

  const computeTimeFromOffset = useCallback((gunTimeHHMM: string, offsetMinutes: number): string => {
    const [gh, gm] = gunTimeHHMM.split(':').map(Number)
    const gunTotalMin = gh * 60 + gm
    const activityMin = gunTotalMin - offsetMinutes
    const h = Math.floor(activityMin / 60)
    const m = activityMin % 60
    const snappedM = Math.round(m / 15) * 15
    const finalH = snappedM === 60 ? h + 1 : h
    const finalM = snappedM === 60 ? 0 : snappedM
    return `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`
  }, [])

  const isLong = race.race_distance === '70.3' || race.race_distance === '140.6'
  const visibleActivities = CONFIGURABLE_ACTIVITIES.filter((a) => !a.longOnly || isLong)

  const initActivityStateFromGun = useCallback((gunHHMM: string) => {
    const state: Record<string, { enabled: boolean; time: string }> = {}
    for (const a of visibleActivities) {
      const offset = isLong ? a.defaultOffsetLong : a.defaultOffsetShort
      state[a.id] = { enabled: true, time: computeTimeFromOffset(gunHHMM, offset) }
    }
    return state
  }, [visibleActivities, isLong, computeTimeFromOffset])

  const [activityState, setActivityState] = useState<Record<string, { enabled: boolean; time: string }>>(() =>
    initActivityStateFromGun(initialGunTime || '07:00')
  )

  const enabledCount = Object.values(activityState).filter((s) => s.enabled).length

  const toggleActivity = (actId: string) => {
    setActivityState((prev) => ({ ...prev, [actId]: { ...prev[actId], enabled: !prev[actId].enabled } }))
  }

  const setActivityTime = (actId: string, time: string) => {
    setActivityState((prev) => ({ ...prev, [actId]: { ...prev[actId], time } }))
  }

  const recalculateTimesForGun = useCallback((newGunHHMM: string) => {
    setActivityState((prev) => {
      const next = { ...prev }
      for (const a of CONFIGURABLE_ACTIVITIES) {
        if (next[a.id]) {
          const offset = isLong ? a.defaultOffsetLong : a.defaultOffsetShort
          next[a.id] = { ...next[a.id], time: computeTimeFromOffset(newGunHHMM, offset) }
        }
      }
      return next
    })
  }, [isLong, computeTimeFromOffset])

  const handleSetGunTime = async () => {
    if (!gunTimeOnly || !race.race_date) return
    setSettingGunTime(true)
    const gunDate = new Date(`${race.race_date}T${gunTimeOnly}:00`)

    await supabaseRef.current
      .from('target_races')
      .update({ gun_start_time: gunDate.toISOString() })
      .eq('id', race.id)

    setSuggestedFromCourse(false)

    if (showQuickSetup) {
      const selections = visibleActivities
        .filter((a) => activityState[a.id]?.enabled)
        .map((a) => ({
          event_name: a.event_name,
          scheduled_time: activityState[a.id].time,
          event_type: a.event_type,
        }))
      await generateFromSelections(gunDate, selections)
      setShowQuickSetup(false)
    } else {
      await generate(gunDate, race.race_distance || 'olympic')
    }

    setSettingGunTime(false)
  }

  const handleAddCustomEvent = async () => {
    if (!newEventName.trim() || !newEventTime || !race.race_date) return
    const scheduledTime = new Date(`${race.race_date}T${newEventTime}:00`)
    await addCustomEvent(newEventName.trim(), scheduledTime.toISOString(), newEventType)
    setNewEventName('')
    setNewEventTime('')
    setNewEventType('action')
    newEventInputRef.current?.focus()
  }

  const groupedEvents: Map<string, typeof events> = new Map()
  events.forEach((e) => {
    const day = formatDay(e.scheduled_time, race.race_date)
    const group = groupedEvents.get(day) || []
    group.push(e)
    groupedEvents.set(day, group)
  })

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push(`/dashboard/races/${race.id}`)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">Timeline</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Race Week Schedule</h1>
        </div>
      </div>

      <div className="card-squircle p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock size={18} className="text-[#4361ee]" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Gun Start Time</h2>
        </div>
        {race.race_date && (
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={14} className="text-gray-400" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatRaceDate(race.race_date)}</p>
            {course?.timezone && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">{course.timezone}</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-3">
          <input
            type="time"
            value={gunTimeOnly}
            onChange={(e) => {
              setGunTimeOnly(e.target.value)
              setSuggestedFromCourse(false)
              if (e.target.value) recalculateTimesForGun(e.target.value)
            }}
            className={INPUT_CLASS}
          />
          <button
            onClick={handleSetGunTime}
            disabled={settingGunTime || !gunTimeOnly || (showQuickSetup && enabledCount === 0)}
            className="px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {settingGunTime ? 'Generating...' : events.length > 0 ? 'Regenerate' : showQuickSetup ? `Create Timeline (${enabledCount})` : 'Generate Timeline'}
          </button>
        </div>
        {suggestedFromCourse && course?.typical_start_time && (
          <div className="flex items-center gap-2 mt-2">
            <MapPin size={12} className="text-[#57a2ea] shrink-0" />
            <p className="text-[11px] text-[#57a2ea]">
              Pre-filled from {course.name} typical start ({course.typical_start_time} {course.timezone ?? 'local'})
            </p>
          </div>
        )}
        <button onClick={() => setShowQuickSetup((prev) => !prev)} className="mt-3 text-xs font-medium text-[#57a2ea] hover:text-[#7ab8f0] cursor-pointer transition-colors">
          {showQuickSetup ? 'Use default template instead' : 'Customize activities & timing'}
        </button>
      </div>

      {events.length > 0 && (
        <div className="card-squircle p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Plus size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
              <input
                ref={newEventInputRef}
                type="text"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomEvent() }}
                placeholder="Event name"
                maxLength={100}
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <div className="flex items-center gap-2 pl-[22px]">
              <input type="time" value={newEventTime} onChange={(e) => setNewEventTime(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomEvent() }} className="w-[120px] shrink-0 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee] transition-all" />
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${TYPE_COLORS[newEventType]}`} />
                <select value={newEventType} onChange={(e) => setNewEventType(e.target.value as 'logistics' | 'nutrition' | 'action')} className="flex-1 min-w-0 px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee] transition-all">
                  <option value="action">Action</option>
                  <option value="logistics">Logistics</option>
                  <option value="nutrition">Nutrition</option>
                </select>
              </div>
              <button onClick={handleAddCustomEvent} disabled={!newEventName.trim() || !newEventTime} className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-30 cursor-pointer shrink-0">Add</button>
            </div>
          </div>
        </div>
      )}

      {showQuickSetup && (
        <div className="card-squircle p-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Race Morning Activities</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4361ee]/10 text-[#4361ee] font-medium">Quick Setup</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Toggle activities on/off and set the time for each.</p>
          <div className="flex flex-col gap-2">
            {visibleActivities.map((activity) => {
              const state = activityState[activity.id]
              if (!state) return null
              return (
                <div key={activity.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${state.enabled ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50' : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 opacity-50'}`}>
                  <button onClick={() => toggleActivity(activity.id)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${state.enabled ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                    {state.enabled && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{activity.event_name}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${TYPE_BADGES[activity.event_type]}`}>{activity.event_type}</span>
                    </div>
                  </div>
                  <TimeCombobox value={state.time} onChange={(time) => setActivityTime(activity.id, time)} disabled={!state.enabled} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="card-squircle p-4 h-16 animate-pulse bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : (
        Array.from(groupedEvents.entries()).map(([dayLabel, dayEvents]) => (
          <div key={dayLabel}>
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3 px-1">{dayLabel}</p>
            <div className="relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex flex-col gap-1">
                {dayEvents.map((event) => (
                  <div key={event.id} className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all group ${event.is_completed ? 'opacity-50' : ''}`}>
                    <div className={`relative z-10 w-3 h-3 rounded-full ${event.is_completed ? 'bg-gray-400' : TYPE_COLORS[event.event_type || 'action']} ring-4 ring-[var(--background)]`} />
                    <span className="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400 min-w-[70px]">{formatTime(event.scheduled_time)}</span>
                    <span className={`text-sm flex-1 ${event.is_completed ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>{event.event_name}</span>
                    {event.event_type && <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_BADGES[event.event_type]}`}>{event.event_type}</span>}
                    <button onClick={() => toggleCompleted(event.id)} className="cursor-pointer flex-shrink-0">
                      {event.is_completed ? <CheckCircle2 size={18} className="text-[#4cc9a0]" /> : <Circle size={18} className="text-gray-300 dark:text-gray-600" />}
                    </button>
                    <button onClick={() => removeEvent(event.id)} className="opacity-0 group-hover:opacity-100 p-1 cursor-pointer">
                      <Trash2 size={14} className="text-gray-400 hover:text-[#d62828] transition-colors" />
                    </button>
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
          <p className="text-gray-500 dark:text-gray-400">Set your gun start time above to generate your race week timeline.</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Or click &quot;Customize activities &amp; timing&quot; to choose which activities to include.</p>
        </div>
      )}
    </div>
  )
}
