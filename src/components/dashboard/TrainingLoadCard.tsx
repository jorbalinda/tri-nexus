'use client'

import { useEffect } from 'react'
import { Activity } from 'lucide-react'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useProfile } from '@/hooks/useProfile'
import { calculateCTL, calculateATL, calculateTSB, estimateTSS } from '@/lib/analytics/training-stress'

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

function getFormColor(tsb: number): string {
  if (tsb >= 10) return '#4cc9a0'
  if (tsb >= -10) return ''
  if (tsb >= -25) return '#e63946'
  return '#ef4444'
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
      accentColor: '#fb8500',
    },
    {
      label: 'CTL',
      sub: 'Fitness',
      value: ctl,
      unit: 'TSS/d',
      accentColor: '#219ebc',
    },
    {
      label: 'ATL',
      sub: 'Fatigue',
      value: atl,
      unit: 'TSS/d',
      accentColor: '#e63946',
    },
    {
      label: 'TSB',
      sub: formLabel,
      value: tsb > 0 ? `+${tsb}` : tsb,
      unit: '',
      accentColor: formColor,
    },
  ]

  return (
    <div className="card-squircle p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} style={{ color: '#219ebc' }} />
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
          Training Load
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {tiles.map(({ label, sub, value, unit, accentColor }) => (
          <div
            key={label}
            className="rounded-xl border p-4 flex flex-col justify-between border-gray-100 dark:border-gray-700"
            style={accentColor ? { borderColor: `rgba(${hexToRgb(accentColor)}, 0.20)`, background: `rgba(${hexToRgb(accentColor)}, 0.10)` } : undefined}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-wider"
              style={accentColor ? { color: accentColor } : undefined}
            >
              {label}
            </p>
            <div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-bold text-gray-900 dark:text-gray-100"
                  style={label === 'TSB' && accentColor ? { color: accentColor } : undefined}
                >
                  {value}
                </span>
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
