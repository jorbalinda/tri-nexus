'use client'

import { useEffect } from 'react'
import { Activity } from 'lucide-react'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useProfile } from '@/hooks/useProfile'
import { calculateCTL, calculateATL, calculateTSB, estimateTSS } from '@/lib/analytics/training-stress'

function getFormColor(tsb: number): string {
  if (tsb >= 25) return 'text-blue-500'
  if (tsb >= 10) return 'text-green-500'
  if (tsb >= -10) return 'text-gray-500 dark:text-gray-400'
  if (tsb >= -25) return 'text-orange-500'
  return 'text-red-500'
}

function getFormLabel(tsb: number): string {
  if (tsb >= 25) return 'Very Fresh'
  if (tsb >= 10) return 'Fresh'
  if (tsb >= -10) return 'Neutral'
  if (tsb >= -25) return 'Tired'
  return 'Fatigued'
}

export default function TrainingLoadCard({ refreshKey }: { refreshKey?: number }) {
  const { workouts, loading, refetch } = useWorkouts()
  const { profile } = useProfile()

  useEffect(() => {
    if (refreshKey) refetch()
  }, [refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="card-squircle p-5">
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    )
  }

  const ctl = calculateCTL(workouts, profile)
  const atl = calculateATL(workouts, profile)
  const tsb = calculateTSB(workouts, profile)
  const formColor = getFormColor(tsb)
  const formLabel = getFormLabel(tsb)

  const today = new Date().toISOString().split('T')[0]
  const todayTSS = workouts
    .filter((w) => w.date === today)
    .reduce((sum, w) => sum + estimateTSS(w), 0)

  const tiles = [
    {
      label: 'TSS',
      sub: 'Today',
      value: todayTSS,
      unit: '',
      valueColor: 'text-gray-900 dark:text-gray-100',
      labelColor: 'text-gray-500 dark:text-gray-400',
      bg: 'bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700',
    },
    {
      label: 'CTL',
      sub: 'Fitness',
      value: ctl,
      unit: 'TSS/d',
      valueColor: 'text-gray-900 dark:text-gray-100',
      labelColor: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30',
    },
    {
      label: 'ATL',
      sub: 'Fatigue',
      value: atl,
      unit: 'TSS/d',
      valueColor: 'text-gray-900 dark:text-gray-100',
      labelColor: 'text-orange-500 dark:text-orange-400',
      bg: 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30',
    },
    {
      label: 'TSB',
      sub: formLabel,
      value: tsb > 0 ? `+${tsb}` : tsb,
      unit: '',
      valueColor: formColor,
      labelColor: formColor,
      bg: 'bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700',
    },
  ]

  return (
    <div className="card-squircle p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-blue-600" />
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
          Training Load
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {tiles.map(({ label, sub, value, unit, valueColor, labelColor, bg }) => (
          <div key={label} className={`rounded-xl border p-4 flex flex-col justify-between ${bg}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${labelColor}`}>
              {label}
            </p>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${valueColor}`}>{value}</span>
                {unit && <span className="text-[10px] text-gray-400">{unit}</span>}
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
