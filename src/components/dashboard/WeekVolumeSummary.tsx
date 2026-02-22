'use client'

import { Waves, Bike, Footprints, Clock } from 'lucide-react'
import type { DisciplineVolume } from '@/hooks/useWeekWorkouts'

interface WeekVolumeSummaryProps {
  volume: DisciplineVolume
  loading: boolean
}

function formatHours(h: number): string {
  if (h < 0.1) return '0h'
  return `${h.toFixed(1)}h`
}

function formatDistance(meters: number, sport: 'swim' | 'bike' | 'run'): string {
  if (meters === 0) return '-'
  if (sport === 'swim') return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

export default function WeekVolumeSummary({ volume, loading }: WeekVolumeSummaryProps) {
  const items = [
    {
      label: 'Total',
      icon: Clock,
      value: formatHours(volume.total.hours),
      color: 'text-gray-600 dark:text-gray-300',
      bg: 'bg-gray-50 dark:bg-gray-800/50',
      border: 'border-gray-100 dark:border-gray-800',
    },
    {
      label: 'Swim',
      icon: Waves,
      value: formatDistance(volume.swim.meters, 'swim'),
      sub: formatHours(volume.swim.hours),
      color: 'text-blue-600',
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
      border: 'border-blue-100 dark:border-blue-900/30',
    },
    {
      label: 'Bike',
      icon: Bike,
      value: formatDistance(volume.bike.meters, 'bike'),
      sub: formatHours(volume.bike.hours),
      color: 'text-orange-600',
      bg: 'bg-orange-50/50 dark:bg-orange-950/20',
      border: 'border-orange-100 dark:border-orange-900/30',
    },
    {
      label: 'Run',
      icon: Footprints,
      value: formatDistance(volume.run.meters, 'run'),
      sub: formatHours(volume.run.hours),
      color: 'text-green-600',
      bg: 'bg-green-50/50 dark:bg-green-950/20',
      border: 'border-green-100 dark:border-green-900/30',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map(({ label, icon: Icon, value, sub, color, bg, border }) => (
        <div key={label} className={`rounded-2xl p-4 ${bg} border ${border}`}>
          <div className="flex items-center gap-2 mb-2">
            <Icon size={14} className={color} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>{label}</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {loading ? '--' : value}
          </p>
          {sub && (
            <p className="text-xs text-gray-400 dark:text-gray-500">{loading ? '' : sub}</p>
          )}
        </div>
      ))}
    </div>
  )
}
