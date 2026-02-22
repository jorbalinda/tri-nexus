'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TimelineEvent } from '@/lib/types/database'
import { generateTimeline } from '@/lib/timeline/generator'

export function useTimelineEvents(raceId: string) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabaseRef.current
      .from('timeline_events')
      .select('*')
      .eq('race_id', raceId)
      .order('scheduled_time')

    setEvents((data as TimelineEvent[]) || [])
    setLoading(false)
    return (data as TimelineEvent[]) || []
  }, [raceId])

  useEffect(() => {
    if (raceId) fetch()
  }, [raceId, fetch])

  const generate = useCallback(async (gunStartTime: Date, raceDistance: 'sprint' | 'olympic' | '70.3' | '140.6' | 'custom') => {
    // Clear existing non-custom events
    await supabaseRef.current
      .from('timeline_events')
      .delete()
      .eq('race_id', raceId)
      .eq('is_custom', false)

    const generated = generateTimeline(gunStartTime, raceDistance)
    const rows = generated.map((e) => ({
      race_id: raceId,
      event_name: e.event_name,
      scheduled_time: e.scheduled_time.toISOString(),
      event_type: e.event_type,
      is_custom: false,
      is_completed: false,
    }))

    await supabaseRef.current
      .from('timeline_events')
      .insert(rows)

    return fetch()
  }, [raceId, fetch])

  const toggleCompleted = useCallback(async (id: string) => {
    const event = events.find((e) => e.id === id)
    if (!event) return

    const { error } = await supabaseRef.current
      .from('timeline_events')
      .update({ is_completed: !event.is_completed })
      .eq('id', id)

    if (!error) {
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, is_completed: !e.is_completed } : e)))
    }
  }, [events])

  const addCustomEvent = useCallback(async (eventName: string, scheduledTime: string, eventType: TimelineEvent['event_type']) => {
    const { data, error } = await supabaseRef.current
      .from('timeline_events')
      .insert({
        race_id: raceId,
        event_name: eventName,
        scheduled_time: scheduledTime,
        event_type: eventType,
        is_custom: true,
        is_completed: false,
      })
      .select()
      .single()

    if (!error && data) {
      setEvents((prev) => [...prev, data as TimelineEvent].sort(
        (a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
      ))
    }
  }, [raceId])

  const removeEvent = useCallback(async (id: string) => {
    const { error } = await supabaseRef.current
      .from('timeline_events')
      .delete()
      .eq('id', id)

    if (!error) {
      setEvents((prev) => prev.filter((e) => e.id !== id))
    }
  }, [])

  return { events, loading, generate, toggleCompleted, addCustomEvent, removeEvent, refetch: fetch }
}
