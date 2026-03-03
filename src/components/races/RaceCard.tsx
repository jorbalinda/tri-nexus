'use client'

import { Calendar, ChevronRight, Trash2, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { TargetRace } from '@/lib/types/target-race'

interface RaceCardProps {
  race: TargetRace
  onDelete?: (id: string) => void
}

function daysUntil(dateStr: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const race = new Date(dateStr)
  race.setHours(0, 0, 0, 0)
  return Math.ceil((race.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatGoalTime(seconds: number | null): string {
  if (!seconds) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}:${m.toString().padStart(2, '0')}`
}

const PRIORITY_STYLES: Record<string, { badge: string; accent: string }> = {
  a: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    accent: 'border-l-red-500',
  },
  b: {
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    accent: 'border-l-orange-500',
  },
  c: {
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    accent: 'border-l-gray-400',
  },
}

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming',
  race_week: 'Race Week',
  completed: 'Completed',
  dns: 'DNS',
  dnf: 'DNF',
}

export default function RaceCard({ race, onDelete }: RaceCardProps) {
  const days = daysUntil(race.race_date)
  const priority = PRIORITY_STYLES[race.priority] || PRIORITY_STYLES.c
  const isActive = race.status === 'upcoming' || race.status === 'race_week'

  return (
    <div className={`card-squircle border-l-4 ${priority.accent} group relative hover:shadow-md transition-shadow`}>
      <Link href={`/dashboard/races/${race.id}`} className="block p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg ${priority.badge}`}>
              {race.priority.toUpperCase()} Race
            </span>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase">
              {STATUS_LABELS[race.status]}
            </span>
          </div>
          <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
        </div>

        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 transition-colors">
          {race.race_name}
        </h3>

        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{race.race_date}</span>
          </div>
          {days > 0 && (
            <span className={days <= 7 ? 'text-red-600 font-semibold' : ''}>
              {days}d away
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
          <span className="uppercase font-medium">{race.race_distance}</span>
          {race.goal_time_seconds && (
            <>
              <span>|</span>
              <span>Goal: {formatGoalTime(race.goal_time_seconds)}</span>
            </>
          )}
        </div>

        {isActive && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 dark:text-blue-400">
              <TrendingUp size={12} />
              <span>Tap to see your race prediction</span>
            </div>
            <ChevronRight size={12} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </Link>

      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault()
            onDelete(race.id)
          }}
          className="absolute top-4 right-10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
        >
          <Trash2 size={14} className="text-red-400" />
        </button>
      )}
    </div>
  )
}
