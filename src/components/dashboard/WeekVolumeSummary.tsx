'use client'

import { Waves, Bike, Footprints, Clock } from 'lucide-react'
import type { DisciplineVolume } from '@/hooks/useWeekWorkouts'
import { useUnits } from '@/hooks/useUnits'

interface WeekVolumeSummaryProps {
  volume: DisciplineVolume
  loading: boolean
}

function formatHours(h: number): string {
  if (h < 0.1) return '0h'
  return `${h.toFixed(1)}h`
}

export default function WeekVolumeSummary({ volume, loading }: WeekVolumeSummaryProps) {
  const { fmtDistanceShort } = useUnits()

  const items = [
    {
      label: 'Swim',
      icon: Waves,
      value: volume.swim.meters === 0 ? '-' : fmtDistanceShort(volume.swim.meters, 'swim'),
      sub: formatHours(volume.swim.hours),
      iconBg: 'bg-blue-500',
      accentText: 'text-blue-600 dark:text-blue-400',
      cardBg: 'bg-blue-50/60 dark:bg-blue-950/20',
      border: 'border-blue-100 dark:border-blue-900/30',
    },
    {
      label: 'Bike',
      icon: Bike,
      value: volume.bike.meters === 0 ? '-' : fmtDistanceShort(volume.bike.meters, 'bike'),
      sub: formatHours(volume.bike.hours),
      iconBg: 'bg-orange-500',
      accentText: 'text-orange-600 dark:text-orange-400',
      cardBg: 'bg-orange-50/60 dark:bg-orange-950/20',
      border: 'border-orange-100 dark:border-orange-900/30',
    },
    {
      label: 'Run',
      icon: Footprints,
      value: volume.run.meters === 0 ? '-' : fmtDistanceShort(volume.run.meters, 'run'),
      sub: formatHours(volume.run.hours),
      iconBg: 'bg-green-500',
      accentText: 'text-green-600 dark:text-green-400',
      cardBg: 'bg-green-50/60 dark:bg-green-950/20',
      border: 'border-green-100 dark:border-green-900/30',
    },
    {
      label: 'Total',
      icon: Clock,
      value: formatHours(volume.total.hours),
      sub: null,
      iconBg: 'bg-gray-800 dark:bg-gray-200',
      accentText: 'text-gray-600 dark:text-gray-300',
      cardBg: 'bg-gray-50/60 dark:bg-gray-800/40',
      border: 'border-gray-200 dark:border-gray-700/50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ label, icon: Icon, value, sub, iconBg, accentText, cardBg, border }) => (
        <div key={label} className={`rounded-2xl p-5 ${cardBg} border ${border}`}>
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
            <Icon size={18} className="text-white dark:text-gray-900" />
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-[1.5px] ${accentText} mb-1`}>
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {loading ? '--' : value}
          </p>
          {sub && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              {loading ? '' : sub}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
