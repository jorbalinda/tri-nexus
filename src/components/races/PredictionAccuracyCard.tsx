'use client'

import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { TargetRace } from '@/lib/types/target-race'
import type { RaceProjection } from '@/lib/types/projection'

interface PredictionAccuracyCardProps {
  race: TargetRace
  projection: RaceProjection
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatDelta(delta: number): string {
  const sign = delta >= 0 ? '+' : '-'
  const abs = Math.abs(delta)
  const m = Math.floor(abs / 60)
  const s = abs % 60
  return `${sign}${m}:${s.toString().padStart(2, '0')}`
}

function accuracyPct(predicted: number, actual: number): number {
  if (actual === 0) return 0
  return Math.round((1 - Math.abs(predicted - actual) / actual) * 1000) / 10
}

interface SplitRowProps {
  label: string
  predicted: number
  actual: number | null
  color: string
}

function SplitRow({ label, predicted, actual, color }: SplitRowProps) {
  if (!actual) return null
  const delta = actual - predicted
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className={`text-xs font-semibold ${color}`}>{label}</span>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-400 dark:text-gray-500 w-20 text-right">{formatTime(predicted)}</span>
        <span className="text-gray-900 dark:text-gray-100 font-semibold w-20 text-right">{formatTime(actual)}</span>
        <span className={`w-16 text-right font-mono text-xs ${delta > 0 ? 'text-[#d62828]' : delta < 0 ? 'text-[#4cc9a0]' : 'text-gray-400'}`}>
          {formatDelta(delta)}
        </span>
      </div>
    </div>
  )
}

export default function PredictionAccuracyCard({ race, projection }: PredictionAccuracyCardProps) {
  const actual = race.actual_finish_seconds
  if (!actual) return null

  const predicted = projection.realistic_seconds
  const delta = actual - predicted
  const accuracy = accuracyPct(predicted, actual)
  const absDeltaMin = Math.round(Math.abs(delta) / 60)

  return (
    <div className="card-squircle p-6">
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-4">
        Prediction Accuracy
      </p>

      {/* Big accuracy number */}
      <div className="text-center mb-6">
        <p className={`text-5xl font-bold ${accuracy >= 98 ? 'text-[#4cc9a0]' : accuracy >= 95 ? 'text-[#57a2ea]' : accuracy >= 90 ? 'text-[#e2622c]' : 'text-[#d62828]'}`}>
          {accuracy}%
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {delta > 0 ? (
            <span className="inline-flex items-center gap-1 text-[#d62828]">
              <TrendingDown size={14} /> {absDeltaMin}min slower than predicted
            </span>
          ) : delta < 0 ? (
            <span className="inline-flex items-center gap-1 text-[#4cc9a0]">
              <TrendingUp size={14} /> {absDeltaMin}min faster than predicted
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[#57a2ea]">
              <Minus size={14} /> Exactly as predicted
            </span>
          )}
        </p>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Predicted</p>
          <p className="text-xl font-bold text-[#57a2ea]">{formatTime(predicted)}</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Actual</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatTime(actual)}</p>
        </div>
      </div>

      {/* Split comparison */}
      <div>
        <div className="flex items-center justify-between mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <span>Split</span>
          <div className="flex items-center gap-4">
            <span className="w-20 text-right">Predicted</span>
            <span className="w-20 text-right">Actual</span>
            <span className="w-16 text-right">Delta</span>
          </div>
        </div>
        <SplitRow label="Swim" predicted={projection.swim_seconds} actual={race.actual_swim_seconds} color="text-[#219ebc]" />
        <SplitRow label="T1" predicted={projection.t1_seconds} actual={race.actual_t1_seconds} color="text-gray-500" />
        <SplitRow label="Bike" predicted={projection.bike_seconds} actual={race.actual_bike_seconds} color="text-[#fb8500]" />
        <SplitRow label="T2" predicted={projection.t2_seconds} actual={race.actual_t2_seconds} color="text-gray-500" />
        <SplitRow label="Run" predicted={projection.run_seconds} actual={race.actual_run_seconds} color="text-[#4cc9a0]" />
      </div>
    </div>
  )
}
