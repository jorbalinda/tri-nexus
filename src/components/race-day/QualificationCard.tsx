'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Trophy, Target, TrendingUp } from 'lucide-react'
import type { QualificationReadiness, QualificationTarget, QualificationPacingPlan } from '@/lib/types/race-plan'

interface QualificationCardProps {
  readiness: QualificationReadiness
  target: QualificationTarget
  qualificationPacing: QualificationPacingPlan | null
  competitive: boolean | null
}

function formatTime(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '--:--:--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

const championshipLabels: Record<string, string> = {
  kona: 'IRONMAN World Championship (Kona)',
  '70.3_worlds': 'IRONMAN 70.3 World Championship',
  wt_ag_sprint: 'World Triathlon AG Sprint Worlds',
  wt_ag_standard: 'World Triathlon AG Standard Worlds',
  wt_ag_long: 'World Triathlon AG Long Distance Worlds',
}

export default function QualificationCard({
  readiness,
  target,
  qualificationPacing,
  competitive,
}: QualificationCardProps) {
  const [expanded, setExpanded] = useState(true)

  const statusColor = readiness.ready
    ? 'text-green-600 dark:text-green-400'
    : 'text-amber-600 dark:text-amber-400'
  const statusBg = readiness.ready
    ? 'bg-green-50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30'
    : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30'

  return (
    <div className="card-squircle p-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Trophy size={20} className={statusColor} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
              Qualification Readiness
            </p>
            <p className={`text-lg font-bold ${statusColor}`}>
              {readiness.ready ? 'On Track to Qualify' : 'Gap to Qualifying'}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-6 flex flex-col gap-6">
          {/* Status overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`rounded-2xl p-4 border ${statusBg}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                Target Time
              </p>
              <p className={`text-xl font-bold ${statusColor}`}>
                {formatTime(readiness.target_time)}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                {championshipLabels[target.championship] || target.championship}
              </p>
            </div>
            <div className={`rounded-2xl p-4 border ${statusBg}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                {readiness.ready ? 'Buffer' : 'Gap'}
              </p>
              <p className={`text-xl font-bold ${statusColor}`}>
                {readiness.ready ? '-' : '+'}
                {Math.abs(Math.round(readiness.gap_seconds / 60))} min
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                Confidence: {readiness.confidence.toUpperCase()}
              </p>
            </div>
            {readiness.age_graded_time && (
              <div className="rounded-2xl p-4 border bg-blue-50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                  Age-Graded Time
                </p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatTime(readiness.age_graded_time)}
                </p>
                {target.standard_multiplier && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Multiplier: {target.standard_multiplier.toFixed(4)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Explanation */}
          <div className="border-l-4 border-l-blue-500 pl-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {readiness.explanation}
            </p>
          </div>

          {/* Recommendations */}
          {readiness.recommendations.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-3 flex items-center gap-1.5">
                <TrendingUp size={14} />
                Recommendations
              </p>
              <ul className="space-y-2">
                {readiness.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Qualification pacing targets */}
          {qualificationPacing && qualificationPacing.gapToCurrentFitness > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1.5">
                <Target size={14} />
                Qualification Split Targets
              </p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
                    Swim
                  </p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {formatTime(qualificationPacing.swimSplitTarget)}
                  </p>
                </div>
                <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
                    Bike
                  </p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {formatTime(qualificationPacing.bikeSplitTarget)}
                  </p>
                </div>
                <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
                    Run
                  </p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {formatTime(qualificationPacing.runSplitTarget)}
                  </p>
                </div>
              </div>
              {qualificationPacing.recommendations.length > 0 && (
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {qualificationPacing.recommendations.map((rec, i) => (
                    <li key={i}>• {rec}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
