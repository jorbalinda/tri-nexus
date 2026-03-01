'use client'

import { useState } from 'react'
import { ChevronDown, Shield, Database, Calendar, Activity } from 'lucide-react'
import type { RaceProjection } from '@/lib/types/projection'
import type { HRAdjustmentResult } from '@/lib/analytics/hr-adjustment'

interface DeepDiveCardProps {
  breakdown: { volume: number; discipline: number; thresholds: number; trainingLoad: number; completeness: number } | null
  projection: RaceProjection | null
  confidence: number
  workoutCount: number
  daysUntilReveal: number
  notes: string | null
}

const DIMENSION_LABELS: Record<string, string> = {
  'Volume & Recency': 'How much recent training data we have',
  'Discipline Balance': 'How evenly swim, bike, and run are represented',
  'Threshold Quality': 'Whether FTP, CSS, and LT pace are set and current',
  'Training Load': 'Whether fitness is high and readiness is optimal',
  'Data Completeness': 'Whether your profile (HR, weight, power) is filled out',
}

export default function DeepDiveCard({
  breakdown,
  projection,
  confidence,
  workoutCount,
  daysUntilReveal,
  notes,
}: DeepDiveCardProps) {
  const [open, setOpen] = useState(false)

  const hasContent = breakdown || projection?.hr_adjustment || projection?.fitness_snapshot || notes

  if (!hasContent) return null

  return (
    <div className="card-squircle">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-4 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors rounded-3xl"
      >
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-gray-400" />
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
            Projection Transparency
          </p>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-0">
          {/* Score Breakdown with dimension explanations */}
          {breakdown && (
            <div className="pb-4">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
                Confidence Breakdown
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Volume & Recency', value: breakdown.volume, max: 20, color: 'bg-blue-500' },
                  { label: 'Discipline Balance', value: breakdown.discipline, max: 20, color: 'bg-purple-500' },
                  { label: 'Threshold Quality', value: breakdown.thresholds, max: 20, color: 'bg-orange-500' },
                  { label: 'Training Load', value: breakdown.trainingLoad, max: 20, color: 'bg-green-500' },
                  { label: 'Data Completeness', value: breakdown.completeness, max: 20, color: 'bg-cyan-500' },
                ].map((dim) => (
                  <div key={dim.label}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">{dim.label}</span>
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{dim.value}/{dim.max}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full ${dim.color}`}
                        style={{ width: `${(dim.value / dim.max) * 100}%` }}
                      />
                    </div>
                    {/* One-liner explanation when dimension is low */}
                    {dim.value < dim.max * 0.5 && (
                      <p className="text-[9px] text-gray-400 dark:text-gray-500">
                        {DIMENSION_LABELS[dim.label]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HR Analysis */}
          {projection?.hr_adjustment && projection.hr_adjustment.overallConfidence !== 'none' && (() => {
            const hrAdj = projection.hr_adjustment as HRAdjustmentResult
            const confidenceBadge = {
              high: { bg: 'bg-green-100 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400', label: 'High confidence' },
              moderate: { bg: 'bg-amber-100 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', label: 'Moderate confidence' },
              low: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', label: 'Low confidence' },
              none: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', label: 'None' },
            }[hrAdj.overallConfidence]

            const factorDotColor = (adjustment: number, weight: number) => {
              if (weight === 0) return 'bg-gray-300 dark:bg-gray-600'
              if (adjustment < -0.005) return 'bg-green-500'
              if (adjustment > 0.01) return 'bg-red-500'
              if (adjustment > 0.003) return 'bg-amber-500'
              return 'bg-gray-400'
            }

            const factorLabels: Record<string, string> = {
              threshold_hr: 'Threshold HR',
              cardiac_drift: 'Cardiac Drift',
              efficiency_factor: 'Efficiency',
              sustainability: 'Sustainability',
            }

            return (
              <div className="border-t border-gray-100 dark:border-gray-800 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={12} className="text-pink-500" />
                  <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
                    Heart Rate Analysis
                  </p>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${confidenceBadge.bg} ${confidenceBadge.text}`}>
                    {confidenceBadge.label}
                  </span>
                </div>
                <div className="space-y-3">
                  {(['swim', 'bike', 'run'] as const).map((sport) => {
                    const disc = hrAdj[sport]
                    const netAdj = ((disc.multiplier - 1) * 100)
                    const sportColor = { swim: 'text-blue-500', bike: 'text-orange-500', run: 'text-green-500' }[sport]
                    return (
                      <div key={sport} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-semibold capitalize ${sportColor}`}>{sport}</span>
                          <span className={`text-xs font-bold ${netAdj > 0.05 ? 'text-red-500' : netAdj < -0.05 ? 'text-green-600' : 'text-gray-500'}`}>
                            {netAdj >= 0 ? '+' : ''}{netAdj.toFixed(1)}% {netAdj > 0.05 ? '(slower)' : netAdj < -0.05 ? '(faster)' : '(neutral)'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {disc.factors.map((f) => (
                            <div key={f.factor} className="flex items-center gap-1" title={f.status}>
                              <span className={`w-2 h-2 rounded-full ${factorDotColor(f.adjustment, f.weight)}`} />
                              <span className="text-[9px] text-gray-400">{factorLabels[f.factor] ?? f.factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* No HR data message */}
          {(!projection?.hr_adjustment || projection.hr_adjustment.overallConfidence === 'none') && (
            <div className="border-t border-gray-100 dark:border-gray-800 py-4">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2.5">
                  <Activity size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      Set your max heart rate to unlock HR analysis
                    </p>
                    <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1">
                      HR data enables cardiac drift analysis, threshold tracking, and race-effort sustainability checks — refining your projection by up to 5%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="border-t border-gray-100 dark:border-gray-800 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Database size={12} className="text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Data Points</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{projection?.data_points_used ?? workoutCount}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">workouts analyzed</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={12} className="text-orange-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Reveal In</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {daysUntilReveal > 0 ? `${daysUntilReveal}d` : 'Ready'}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">until race week</p>
              </div>
            </div>
          </div>

          {/* Fitness Snapshot */}
          {projection?.fitness_snapshot && (
            <div className="border-t border-gray-100 dark:border-gray-800 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
                Data Sources
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {projection.fitness_snapshot.estimatedFTP && (
                  <span className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-medium">
                    FTP: {projection.fitness_snapshot.estimatedFTP}W
                  </span>
                )}
                {projection.fitness_snapshot.estimatedCSS && (
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-medium">
                    CSS: {Math.floor(projection.fitness_snapshot.estimatedCSS / 60)}:{(projection.fitness_snapshot.estimatedCSS % 60).toString().padStart(2, '0')}/100m
                  </span>
                )}
                {projection.fitness_snapshot.weeklyVolumeHours && (
                  <span className="px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 font-medium">
                    {projection.fitness_snapshot.weeklyVolumeHours}h/week
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Guidance */}
          <div className="border-t border-gray-100 dark:border-gray-800 py-4">
            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20">
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                {confidence < 30
                  ? 'Insufficient data — projection is a rough guess. Keep logging workouts across all three disciplines.'
                  : confidence < 50
                  ? 'Some data gaps — use projection as a ballpark. Add threshold tests (FTP, CSS) for better accuracy.'
                  : confidence < 70
                  ? 'Reasonable data — projection is directionally accurate. Consistency and race conditions will sharpen it.'
                  : confidence < 85
                  ? 'Strong data — projection is reliable within ±5%. Keep your training consistent through race week.'
                  : 'Comprehensive data — projection is highly reliable. Trust the numbers on race day.'}
              </p>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">Notes</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
