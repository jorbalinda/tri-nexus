'use client'

import { Activity, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface RaceReadinessCardProps {
  trainingLoad: { ctl: number; atl: number; tsb: number } | null
  daysUntilRace: number
}


export default function RaceReadinessCard({ trainingLoad, daysUntilRace }: RaceReadinessCardProps) {
  if (!trainingLoad) return null

  const { ctl, atl, tsb } = trainingLoad

  // Readiness status
  let readinessLabel: string
  let readinessColor: string
  let readinessBg: string
  let coachingText: string

  if (tsb >= 10 && tsb <= 25) {
    readinessLabel = 'Race Ready'
    readinessColor = 'text-green-600 dark:text-green-400'
    readinessBg = 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
    coachingText = 'You are in the optimal race-ready window. Fitness is strong, fatigue has cleared. Trust the taper.'
  } else if (tsb > 0 && tsb < 10) {
    readinessLabel = 'Fresh'
    readinessColor = 'text-blue-600 dark:text-blue-400'
    readinessBg = 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
    coachingText = 'Well recovered and ready for quality sessions. A few more easy days could push you into the race-ready zone.'
  } else if (tsb >= -10 && tsb <= 0) {
    readinessLabel = 'Normal Training'
    readinessColor = 'text-yellow-600 dark:text-yellow-400'
    readinessBg = 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
    coachingText = 'Absorbing recent training load. This is a healthy place to be during a build block.'
  } else if (tsb < -10 && tsb >= -20) {
    readinessLabel = 'Fatigued'
    readinessColor = 'text-orange-600 dark:text-orange-400'
    readinessBg = 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
    coachingText = daysUntilRace <= 21
      ? 'Time to start tapering. Reduce volume to arrive fresh on race day.'
      : 'Moderate fatigue from training load. A recovery week would help absorb this fitness.'
  } else if (tsb < -20) {
    readinessLabel = 'Deep Fatigue'
    readinessColor = 'text-red-600 dark:text-red-400'
    readinessBg = 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
    coachingText = 'Heavy fatigue accumulated. Prioritize recovery to avoid overtraining.'
  } else {
    readinessLabel = 'Extended Rest'
    readinessColor = 'text-amber-600 dark:text-amber-400'
    readinessBg = 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
    coachingText = 'Extended time off may be costing fitness. Light training can reverse the trend.'
  }

  // Trend icon for TSB
  const TsbIcon = tsb > 5 ? TrendingUp : tsb < -5 ? TrendingDown : Minus

  return (
    <div className="card-squircle p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-purple-500" />
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
            Training Status
          </p>
        </div>
        {/* Status badge */}
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${readinessBg.replace('border-', 'border border-')} ${readinessColor}`}>
          {readinessLabel}
        </span>
      </div>

      {/* 3-column: CTL / ATL / TSB */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="p-2 sm:p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-0.5">CTL</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{ctl}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">Fitness</p>
        </div>
        <div className="p-2 sm:p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500 mb-0.5">ATL</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{atl}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">Fatigue</p>
        </div>
        <div className="p-2 sm:p-3 rounded-xl bg-green-50/50 dark:bg-green-950/20 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-green-500 mb-0.5">TSB</p>
          <div className="flex items-center justify-center gap-1">
            <p className={`text-xl font-bold ${tsb >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {tsb > 0 ? '+' : ''}{tsb}
            </p>
            <TsbIcon size={14} className={tsb >= 0 ? 'text-green-500' : 'text-red-400'} />
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">Form</p>
        </div>
      </div>

      {/* Coaching text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        {coachingText}
      </p>

      {/* Warnings */}
      {tsb < -20 && (
        <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 dark:text-red-400">
            Consider tapering before race day — deep fatigue can impair performance.
          </p>
        </div>
      )}
      {tsb > 25 && (
        <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Extended rest may be costing you fitness. Light training can maintain your edge.
          </p>
        </div>
      )}
    </div>
  )
}
