'use client'

import { useEffect, useState } from 'react'
import { Flag, Calendar, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface TargetRace {
  id: string
  race_name: string
  race_date: string
  race_distance: string
  priority: string
  status: string
}

interface ProjectionRow {
  target_race_id: string
  realistic_seconds: number
}

function daysUntil(dateStr: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const race = new Date(dateStr)
  race.setHours(0, 0, 0, 0)
  return Math.ceil((race.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatTimeShort(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}:${m.toString().padStart(2, '0')}`
}

const PRIORITY_COLORS: Record<string, string> = {
  a: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  b: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  c: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

export default function UpcomingRaceCards() {
  const [races, setRaces] = useState<TargetRace[]>([])
  const [projections, setProjections] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchRaces() {
      const { data } = await supabase
        .from('target_races')
        .select('id, race_name, race_date, race_distance, priority, status')
        .in('status', ['upcoming', 'race_week'])
        .order('race_date', { ascending: true })
        .limit(3)

      const raceList = (data as TargetRace[]) || []
      setRaces(raceList)

      // Fetch latest projection per race
      if (raceList.length > 0) {
        const raceIds = raceList.map((r) => r.id)
        const { data: projData } = await supabase
          .from('projections')
          .select('target_race_id, realistic_seconds')
          .in('target_race_id', raceIds)
          .order('projected_at', { ascending: false })

        if (projData && projData.length > 0) {
          const projMap = new Map<string, number>()
          for (const row of projData as ProjectionRow[]) {
            // First occurrence per race is the latest (ordered desc)
            if (!projMap.has(row.target_race_id)) {
              projMap.set(row.target_race_id, row.realistic_seconds)
            }
          }
          setProjections(projMap)
        }
      }

      setLoading(false)
    }
    fetchRaces()
  }, [supabase])

  if (loading) {
    return (
      <div className="card-squircle p-5">
        <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (races.length === 0) {
    return (
      <div className="card-squircle p-6 text-center">
        <Flag size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No upcoming races</p>
        <Link
          href="/dashboard/races"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Add your target race
          <ChevronRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
        Upcoming Races
      </p>
      <div className="flex flex-col gap-3">
        {races.map((race) => {
          const days = daysUntil(race.race_date)
          const realisticSeconds = projections.get(race.id)
          return (
            <Link
              key={race.id}
              href={`/dashboard/races/${race.id}`}
              className="card-squircle p-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg ${PRIORITY_COLORS[race.priority] || PRIORITY_COLORS.c}`}>
                  {race.priority.toUpperCase()} Race
                </span>
                <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5 group-hover:text-blue-600 transition-colors">
                {race.race_name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar size={12} />
                <span>{race.race_date}</span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className={days <= 7 ? 'text-red-600 font-semibold' : ''}>
                  {days > 0 ? `${days}d away` : days === 0 ? 'Today!' : 'Completed'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 uppercase tracking-wide">{race.race_distance}</p>
              {realisticSeconds && (
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                  Projected: {formatTimeShort(realisticSeconds)}
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
