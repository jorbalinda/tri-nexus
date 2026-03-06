'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TimelineEvent } from '@/lib/types/database'
import type { TargetRace } from '@/lib/types/target-race'

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Race started!'
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}h ${minutes}m to gun time`
  return `${minutes}m to gun time`
}

interface Props {
  initialRace: TargetRace
  initialEvents: TimelineEvent[]
}

export default function RaceDayClient({ initialRace, initialEvents }: Props) {
  const supabaseRef = useRef(createClient())
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents)
  const [countdown, setCountdown] = useState('')
  const [completingId, setCompletingId] = useState<string | null>(null)

  // Countdown timer
  useEffect(() => {
    if (!initialRace.gun_start_time) return

    const update = () => {
      const ms = new Date(initialRace.gun_start_time!).getTime() - Date.now()
      setCountdown(formatCountdown(ms))
    }

    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [initialRace.gun_start_time])

  const markDone = async (eventId: string) => {
    setCompletingId(eventId)

    await supabaseRef.current
      .from('timeline_events')
      .update({ is_completed: true })
      .eq('id', eventId)

    // Animate out, then update
    setTimeout(() => {
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, is_completed: true } : e)))
      setCompletingId(null)
    }, 400)
  }

  const uncompleted = events.filter((e) => !e.is_completed)
  const allDone = uncompleted.length === 0 && events.length > 0
  const next3 = uncompleted.slice(0, 3)

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <p className="text-2xl font-bold text-white mb-4">No timeline events</p>
        <p className="text-gray-500">Set up your race timeline first, then come back to Race Day Mode.</p>
      </div>
    )
  }

  if (allDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="text-6xl mb-6">&#10003;</div>
        <p className="text-4xl font-bold text-white mb-4">You&apos;re ready.</p>
        <p className="text-2xl text-gray-400">Go race.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
      {/* Countdown */}
      {countdown && (
        <p className="text-sm text-gray-500 mb-12 tracking-wider uppercase">
          {countdown}
        </p>
      )}

      {/* Next 3 tasks */}
      <div className="w-full max-w-md flex flex-col gap-8">
        {next3.map((event, idx) => {
          const isFirst = idx === 0
          const isSecond = idx === 1
          const isCompleting = completingId === event.id

          return (
            <div
              key={event.id}
              className={`transition-all duration-400 ${
                isCompleting ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              {/* Time */}
              <p className={`font-mono font-bold mb-2 ${
                isFirst ? 'text-5xl text-white' : isSecond ? 'text-2xl text-gray-400' : 'text-xl text-gray-600'
              }`}>
                {formatTime(event.scheduled_time)}
              </p>

              {/* Event name */}
              <p className={`font-medium mb-4 ${
                isFirst ? 'text-2xl text-gray-200' : isSecond ? 'text-lg text-gray-500' : 'text-base text-gray-600'
              }`}>
                {event.event_name}
              </p>

              {/* Done button (only for first task) */}
              {isFirst && (
                <button
                  onClick={() => markDone(event.id)}
                  disabled={!!completingId}
                  className="w-full py-4 rounded-2xl bg-green-600 text-white text-lg font-bold hover:bg-green-500 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Remaining count */}
      <p className="text-sm text-gray-600 mt-16">
        {uncompleted.length} task{uncompleted.length !== 1 ? 's' : ''} remaining
      </p>
    </div>
  )
}
