'use client'

import { useMemo } from 'react'
import { useCalendarWorkouts } from './useCalendarWorkouts'
import type { Workout } from '@/lib/types/database'

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getSunday(monday: Date): Date {
  const d = new Date(monday)
  d.setDate(d.getDate() + 6)
  return d
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

export interface DisciplineVolume {
  swim: { hours: number; meters: number }
  bike: { hours: number; meters: number }
  run: { hours: number; meters: number }
  total: { hours: number }
}

export function useWeekWorkouts(weekOffset: number = 0) {
  const now = new Date()
  const monday = getMonday(now)
  monday.setDate(monday.getDate() + weekOffset * 7)
  const sunday = getSunday(monday)

  const startDate = formatDate(monday)
  const endDate = formatDate(sunday)

  const { workouts, loading, refetch } = useCalendarWorkouts(startDate, endDate)

  const volume = useMemo<DisciplineVolume>(() => {
    const result: DisciplineVolume = {
      swim: { hours: 0, meters: 0 },
      bike: { hours: 0, meters: 0 },
      run: { hours: 0, meters: 0 },
      total: { hours: 0 },
    }

    workouts.forEach((w: Workout) => {
      const hours = (w.duration_seconds || 0) / 3600
      const meters = w.distance_meters || 0
      result.total.hours += hours

      if (w.sport === 'swim') {
        result.swim.hours += hours
        result.swim.meters += meters
      } else if (w.sport === 'bike') {
        result.bike.hours += hours
        result.bike.meters += meters
      } else if (w.sport === 'run') {
        result.run.hours += hours
        result.run.meters += meters
      }
    })

    return result
  }, [workouts])

  const workoutsByDay = useMemo(() => {
    const map = new Map<string, Workout[]>()
    const d = new Date(monday)
    for (let i = 0; i < 7; i++) {
      map.set(formatDate(d), [])
      d.setDate(d.getDate() + 1)
    }
    workouts.forEach((w: Workout) => {
      const existing = map.get(w.date) || []
      existing.push(w)
      map.set(w.date, existing)
    })
    return map
  }, [workouts, monday])

  return {
    workouts,
    workoutsByDay,
    volume,
    loading,
    refetch,
    startDate,
    endDate,
    monday,
    sunday,
  }
}
