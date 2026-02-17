'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { PacingPlan } from '@/lib/types/race-plan'

interface PacingCardProps {
  pacing: PacingPlan
  useImperial: boolean
}

function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '--:--:--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatPace100m(sec: number): string {
  if (!sec) return '--:--'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatPaceKm(secPerKm: number, imperial: boolean): string {
  if (!secPerKm) return '--:--'
  const val = imperial ? secPerKm * 1.60934 : secPerKm
  const m = Math.floor(val / 60)
  const s = Math.round(val % 60)
  return `${m}:${String(s).padStart(2, '0')} /${imperial ? 'mi' : 'km'}`
}

export default function PacingCard({ pacing, useImperial }: PacingCardProps) {
  const [expanded, setExpanded] = useState(true)
  const { swim, bike, run, transitions, totalEstimate, qualificationPacing } = pacing

  return (
    <div className="card-squircle p-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
            Pacing Plan
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Est. Finish: {formatTime(totalEstimate.realisticSeconds)}
          </p>
        </div>
        {expanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="mt-6 flex flex-col gap-6">
          {/* Finish time scenarios */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl p-4 bg-green-50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/30">
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-500 mb-1">Optimistic</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatTime(totalEstimate.optimisticSeconds)}</p>
            </div>
            <div className="rounded-2xl p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1">Realistic</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatTime(totalEstimate.realisticSeconds)}</p>
            </div>
            <div className="rounded-2xl p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">Conservative</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{formatTime(totalEstimate.conservativeSeconds)}</p>
            </div>
          </div>

          {/* Swim */}
          <Section title="Swim" color="blue" available={swim.dataAvailable}>
            <Row label="Target Pace" value={`${formatPace100m(swim.targetPacePer100m)} /100m`} />
            <Row label="Est. Split" value={formatTime(swim.estimatedSplitSeconds)} />
            <Row label="Stroke Rate" value={swim.strokeRateTarget} />
            <Row label="Sighting" value={swim.sightingFrequency} />
            <Note text={swim.strategy} />
          </Section>

          {/* Bike */}
          <Section title="Bike" color="orange" available={bike.dataAvailable} badge={bike.isDraftLegal ? 'DRAFT-LEGAL' : null}>
            {bike.targetPowerWatts && (
              <Row
                label="Target Power"
                value={`${bike.targetPowerWatts}W (${bike.targetPowerRange?.[0]}-${bike.targetPowerRange?.[1]}W range)`}
              />
            )}
            <Row label="Target HR" value={bike.targetHRZone} />
            <Row label="Est. Split" value={formatTime(bike.estimatedSplitSeconds)} />
            <Row label="Cadence" value={bike.cadenceTarget} />
            {(bike.heatAdjustment > 0 || bike.altitudeAdjustment > 0) && (
              <Row
                label="Adjustments"
                value={[
                  bike.heatAdjustment > 0 ? `Heat: -${bike.heatAdjustment}%` : '',
                  bike.altitudeAdjustment > 0 ? `Altitude: -${bike.altitudeAdjustment}%` : '',
                ].filter(Boolean).join(', ')}
              />
            )}
            <Note text={bike.strategy} />
          </Section>

          {/* Run */}
          <Section title="Run" color="green" available={run.dataAvailable}>
            <Row label="Target Pace" value={formatPaceKm(run.targetPaceSecPerKm, useImperial)} />
            <Row label="Target HR" value={run.targetHRZone} />
            <Row label="Est. Split" value={formatTime(run.estimatedSplitSeconds)} />
            {run.walkBreakStrategy && <Row label="Walk Strategy" value={run.walkBreakStrategy} />}
            <Note text={run.strategy} />
            <Note text={run.brickFactorNote} />
          </Section>

          {/* Transitions */}
          <Section title="Transitions" color="purple" available={true}>
            <Row label="T1 Target" value={formatTime(transitions.t1Seconds)} />
            <Row label="T2 Target" value={formatTime(transitions.t2Seconds)} />
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">T1 Checklist</p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {transitions.t1Checklist.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">T2 Checklist</p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {transitions.t2Checklist.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* Qualification Pacing */}
          {qualificationPacing && (
            <Section title="Qualification Split Targets" color="amber" available={true}>
              <Row label="Target Finish" value={formatTime(qualificationPacing.targetFinishSeconds)} />
              <Row label="Swim Target" value={formatTime(qualificationPacing.swimSplitTarget)} />
              <Row label="Bike Target" value={formatTime(qualificationPacing.bikeSplitTarget)} />
              <Row label="Run Target" value={formatTime(qualificationPacing.runSplitTarget)} />
              <Row label="T1 Target" value={formatTime(qualificationPacing.t1Target)} />
              <Row label="T2 Target" value={formatTime(qualificationPacing.t2Target)} />
              {qualificationPacing.gapToCurrentFitness > 0 && (
                <div className="mt-2 rounded-xl p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                    Gap to current fitness: +{Math.round(qualificationPacing.gapToCurrentFitness / 60)} min
                  </p>
                  <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-0.5">
                    {qualificationPacing.recommendations.map((rec, i) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          )}
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  color,
  available,
  badge,
  children,
}: {
  title: string
  color: string
  available: boolean
  badge?: string | null
  children: React.ReactNode
}) {
  const colorMap: Record<string, string> = {
    blue: 'border-l-blue-500',
    orange: 'border-l-orange-500',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
    amber: 'border-l-amber-500',
  }
  return (
    <div className={`border-l-4 ${colorMap[color] || 'border-l-gray-300'} pl-4`}>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</p>
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            {badge}
          </span>
        )}
      </div>
      {available ? (
        children
      ) : (
        <p className="text-xs text-amber-500 dark:text-amber-400">
          Add {title.toLowerCase()} workouts to unlock {title.toLowerCase()} pacing.
        </p>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value || value === '--:--' || value === '--:--:--') return null
  return (
    <div className="flex justify-between py-1">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{value}</span>
    </div>
  )
}

function Note({ text }: { text: string }) {
  if (!text) return null
  return (
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">{text}</p>
  )
}
