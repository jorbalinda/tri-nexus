'use client'

import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useProfile } from '@/hooks/useProfile'
import { calculateCTL, calculateATL, calculateTSB } from '@/lib/analytics/training-stress'

function getFormLabel(tsb: number): { text: string; color: string } {
  if (tsb >= 25) return { text: 'Very Fresh', color: 'text-blue-500' }
  if (tsb >= 10) return { text: 'Fresh', color: 'text-green-500' }
  if (tsb >= -10) return { text: 'Neutral', color: 'text-gray-500' }
  if (tsb >= -25) return { text: 'Tired', color: 'text-orange-500' }
  return { text: 'Very Fatigued', color: 'text-red-500' }
}

function getTrendIcon(value: number) {
  if (value > 5) return <TrendingUp size={14} />
  if (value < -5) return <TrendingDown size={14} />
  return <Minus size={14} />
}

export default function TrainingLoadCard() {
  const { workouts, loading } = useWorkouts()
  const { profile } = useProfile()

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
  const form = getFormLabel(tsb)

  return (
    <div className="card-squircle p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-blue-600" />
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
          Training Load
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* CTL — Fitness */}
        <div className="rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-1">
            CTL — Fitness
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ctl}</span>
            <span className="text-[10px] text-gray-400">TSS/d</span>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">42-day load</p>
        </div>

        {/* ATL — Fatigue */}
        <div className="rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500 dark:text-orange-400 mb-1">
            ACL — Fatigue
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{atl}</span>
            <span className="text-[10px] text-gray-400">TSS/d</span>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">7-day load</p>
        </div>
      </div>

      {/* TSB — Form */}
      <div className="rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
              Form (CTL − ACL)
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {tsb > 0 ? '+' : ''}{tsb}
              </span>
              <span className={`text-xs font-semibold ${form.color}`}>
                {form.text}
              </span>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${form.color}`}>
            {getTrendIcon(tsb)}
          </div>
        </div>
      </div>
    </div>
  )
}
