'use client'

import { CheckCircle2, Circle, ArrowRight, Lightbulb } from 'lucide-react'
import type { SufficiencyResult } from '@/lib/analytics/data-sufficiency'

interface DataQualityCardProps {
  sufficiency: SufficiencyResult | null
  tier: number
}

const SPORT_COLORS: Record<string, string> = {
  swim: 'text-blue-500',
  bike: 'text-orange-500',
  run: 'text-green-500',
}

const SPORT_LABELS: Record<string, string> = {
  swim: 'Swim',
  bike: 'Bike',
  run: 'Run',
}

export default function DataQualityCard({ sufficiency, tier }: DataQualityCardProps) {
  if (!sufficiency) return null

  // At higher tiers, if all gates pass and few actions remain, collapse the card
  const allGatesPassed = sufficiency.gates.every(g => g.passed)

  return (
    <div className="card-squircle p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
          Data Quality
        </p>
        {allGatesPassed && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-[10px] font-bold">
            <CheckCircle2 size={10} />
            All disciplines covered
          </span>
        )}
      </div>

      {/* Discipline gates — dashed borders for needs-data, solid for data-backed */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {sufficiency.gates.map((gate) => (
          <div
            key={gate.sport}
            className={`p-2 sm:p-2.5 rounded-xl ${
              gate.passed
                ? 'bg-green-50/50 dark:bg-green-950/10 border border-green-200 dark:border-green-800'
                : 'bg-gray-50/50 dark:bg-gray-800/30 border-2 border-dashed border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {gate.passed ? (
                <CheckCircle2 size={12} className="text-green-500" />
              ) : (
                <Circle size={12} className="text-gray-300 dark:text-gray-600" />
              )}
              <span className={`text-xs font-semibold ${SPORT_COLORS[gate.sport]}`}>
                {SPORT_LABELS[gate.sport]}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              {gate.workoutCount}/{gate.required} workouts
            </p>
            {gate.hasThreshold ? (
              <p className="text-[11px] text-green-600 dark:text-green-400 mt-0.5">
                Threshold set
              </p>
            ) : gate.passed ? (
              <p className="text-[11px] text-amber-500 dark:text-amber-400 mt-0.5">
                No threshold
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {/* Next Steps — tone adapts based on tier */}
      {sufficiency.nextActions.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2.5">
            {tier >= 2 ? 'Polish Your Prediction' : 'Next Steps'}
          </p>
          <div className="space-y-2">
            {sufficiency.nextActions.map((action, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl ${
                  tier >= 2
                    ? 'bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800'
                    : 'bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20'
                }`}
              >
                {tier >= 2 ? (
                  <Lightbulb size={12} className="text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <ArrowRight size={12} className="text-blue-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{action.action}</p>
                  <p className={`text-[10px] ${tier >= 2 ? 'text-gray-400 dark:text-gray-500' : 'text-blue-600/70 dark:text-blue-400/70'}`}>
                    {action.impact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
