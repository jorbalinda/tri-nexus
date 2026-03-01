'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import {
  Activity,
  ArrowLeft,
  Clock,
  Timer,
  TrendingDown,
  TrendingUp,
  Shield,
  CheckCircle2,
  Circle,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { TargetRace } from '@/lib/types/target-race'
import type { RaceProjection } from '@/lib/types/projection'
import { useProjection } from '@/hooks/useProjection'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useManualLogs } from '@/hooks/useManualLogs'
import { checkRevealEligibility } from '@/lib/analytics/reveal-engine'
import { generateFullRacePlan } from '@/lib/analytics/race-plan-generator'
import PacingCard from '@/components/race-day/PacingCard'
import NutritionCard from '@/components/race-day/NutritionCard'
import MindsetCard from '@/components/race-day/MindsetCard'
import ProjectionHistory from '@/components/races/ProjectionHistory'

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatTimeShort(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}:${m.toString().padStart(2, '0')}`
}

export default function RevealPage() {
  const params = useParams()
  const raceId = params.id as string
  const [race, setRace] = useState<TargetRace | null>(null)
  const [loading, setLoading] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const supabase = createClient()

  const { projection, loading: projLoading, sufficiency } = useProjection(raceId)
  const { workouts } = useWorkouts()
  const { logs } = useManualLogs()

  useEffect(() => {
    async function fetchRace() {
      const { data } = await supabase
        .from('target_races')
        .select('*')
        .eq('id', raceId)
        .single()
      setRace(data as TargetRace | null)
      setLoading(false)
    }
    fetchRace()
  }, [raceId, supabase])

  const eligibility = useMemo(() => {
    if (!race || !workouts) return null
    return checkRevealEligibility(race, projection, workouts)
  }, [race, projection, workouts])

  // Generate full race plan for display
  const racePlan = useMemo(() => {
    if (!race || workouts.length === 0) return null
    try {
      return generateFullRacePlan(
        workouts,
        logs,
        race.race_distance as any,
        'finish',
        race.race_name,
        null,
        'age_grouper',
        [],
        null,
        null,
        {
          swim: race.custom_swim_distance_m,
          bike: race.custom_bike_distance_km,
          run: race.custom_run_distance_km,
        }
      )
    } catch {
      return null
    }
  }, [race, workouts, logs])

  if (loading || projLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
      </div>
    )
  }

  if (!race) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Race not found.</p>
      </div>
    )
  }

  const tier = sufficiency?.tier ?? 2 // default to standard if no sufficiency

  // Existing reveal eligibility check still works independently
  if (!eligibility?.eligible && !revealed) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href={`/dashboard/races/${raceId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          Back to Race
        </Link>

        <div className="card-squircle p-12 text-center">
          <Clock size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Not Yet Ready</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
            {eligibility?.reason || 'Your projection needs more data before reveal.'}
          </p>
          <div className="flex justify-center gap-4 text-xs text-gray-400">
            <span>Workouts (8wk): {eligibility?.workoutCount8Weeks ?? 0}/20</span>
            <span>|</span>
            <span>Confidence: {eligibility?.confidenceScore ?? 0}%/40%</span>
            <span>|</span>
            <span>Race in: {eligibility?.daysUntilRace ?? '?'}d</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/dashboard/races/${raceId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors w-fit"
      >
        <ArrowLeft size={14} />
        Back to Race
      </Link>

      {/* Race header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-blue-500 mb-2">Race Week Reveal</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{race.race_name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{race.race_date}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* HR-Enhanced badge */}
          {projection?.hr_adjustment && projection.hr_adjustment.overallConfidence !== 'none' && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              projection.hr_adjustment.overallConfidence === 'high'
                ? 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400'
                : projection.hr_adjustment.overallConfidence === 'moderate'
                  ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`} title={`Swim: ${((projection.hr_adjustment.swim.multiplier - 1) * 100).toFixed(1)}%, Bike: ${((projection.hr_adjustment.bike.multiplier - 1) * 100).toFixed(1)}%, Run: ${((projection.hr_adjustment.run.multiplier - 1) * 100).toFixed(1)}%`}>
              <Activity size={12} />
              HR-Enhanced
            </span>
          )}
          {/* Tier 3: High Confidence badge */}
          {tier === 3 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-xs font-bold">
              <Shield size={12} />
              High Confidence
            </span>
          )}
        </div>
      </div>

      {/* Tier 0: No Prediction — empty state */}
      {tier === 0 && (
        <div className="card-squircle p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Clock size={28} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Not Enough Data for a Prediction
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Log more workouts across swim, bike, and run to unlock your race projection.
          </p>

          {/* Discipline gate progress */}
          {sufficiency && (
            <div className="max-w-sm mx-auto mb-6">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {sufficiency.gates.map((gate) => (
                  <div
                    key={gate.sport}
                    className={`p-3 rounded-xl border text-center ${
                      gate.passed
                        ? 'bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {gate.passed ? (
                        <CheckCircle2 size={14} className="text-green-500" />
                      ) : (
                        <Circle size={14} className="text-gray-300 dark:text-gray-600" />
                      )}
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                        {gate.sport}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {gate.workoutCount}/{gate.required} workouts
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next actions */}
          {sufficiency && sufficiency.nextActions.length > 0 && (
            <div className="max-w-sm mx-auto text-left space-y-2">
              {sufficiency.nextActions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20"
                >
                  <ArrowRight size={12} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{action.action}</p>
                    <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70">{action.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tier 1: Rough Estimate — realistic only with wide range */}
      {tier === 1 && projection && (
        <div className="card-squircle p-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider">
              Rough Estimate
            </span>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-4 text-center">
            Projected Finish Time
          </p>

          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {formatTimeShort(projection.optimistic_seconds)} – {formatTimeShort(projection.conservative_seconds)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Realistic: {formatTimeShort(projection.realistic_seconds)}
            </p>
          </div>

          <p className="text-xs text-center text-orange-600/80 dark:text-orange-400/80 max-w-md mx-auto">
            Log more data to narrow this range. Add workouts across all three disciplines and set your threshold data.
          </p>
        </div>
      )}

      {/* Tier 2: Standard — full 3-scenario display */}
      {tier === 2 && projection && (
        <div className="card-squircle p-8">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-4 text-center">
            Projected Finish Time
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-1">Optimistic</p>
              <p className="text-2xl font-bold text-green-600">{formatTimeShort(projection.optimistic_seconds)}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">Realistic</p>
              <p className="text-3xl font-bold text-blue-600">{formatTimeShort(projection.realistic_seconds)}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 mb-1">Conservative</p>
              <p className="text-2xl font-bold text-orange-600">{formatTimeShort(projection.conservative_seconds)}</p>
            </div>
          </div>

          {/* Split Breakdown */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
            {[
              { label: 'Swim', time: projection.swim_seconds, color: 'text-blue-600' },
              { label: 'T1', time: projection.t1_seconds, color: 'text-gray-500' },
              { label: 'Bike', time: projection.bike_seconds, color: 'text-orange-600' },
              { label: 'T2', time: projection.t2_seconds, color: 'text-gray-500' },
              { label: 'Run', time: projection.run_seconds, color: 'text-green-600' },
            ].map(({ label, time, color }) => (
              <div key={label} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
                <p className={`text-sm font-bold ${color}`}>{formatTime(time)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tier 3: Refined — tight bands + pacing targets */}
      {tier === 3 && projection && (
        <div className="card-squircle p-8">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-4 text-center">
            Projected Finish Time
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-1">Optimistic</p>
              <p className="text-2xl font-bold text-green-600">{formatTimeShort(projection.optimistic_seconds)}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">Realistic</p>
              <p className="text-3xl font-bold text-blue-600">{formatTimeShort(projection.realistic_seconds)}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 mb-1">Conservative</p>
              <p className="text-2xl font-bold text-orange-600">{formatTimeShort(projection.conservative_seconds)}</p>
            </div>
          </div>

          {/* Split Breakdown */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
            {[
              { label: 'Swim', time: projection.swim_seconds, color: 'text-blue-600' },
              { label: 'T1', time: projection.t1_seconds, color: 'text-gray-500' },
              { label: 'Bike', time: projection.bike_seconds, color: 'text-orange-600' },
              { label: 'T2', time: projection.t2_seconds, color: 'text-gray-500' },
              { label: 'Run', time: projection.run_seconds, color: 'text-green-600' },
            ].map(({ label, time, color }) => (
              <div key={label} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
                <p className={`text-sm font-bold ${color}`}>{formatTime(time)}</p>
              </div>
            ))}
          </div>

          {/* Pacing Targets from race plan */}
          {racePlan?.pacing_plan && (
            <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3 text-center">
                Pacing Targets
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {racePlan.pacing_plan.swim && (
                  <div className="p-3 rounded-xl bg-blue-50/30 dark:bg-blue-950/10 text-center">
                    <p className="text-[10px] font-bold uppercase text-blue-500 mb-1">Swim Pace</p>
                    <p className="text-sm font-bold text-blue-600">
                      {Math.floor(racePlan.pacing_plan.swim.targetPacePer100m / 60)}:{(racePlan.pacing_plan.swim.targetPacePer100m % 60).toString().padStart(2, '0')}/100m
                    </p>
                  </div>
                )}
                {racePlan.pacing_plan.bike?.targetPowerRange && (
                  <div className="p-3 rounded-xl bg-orange-50/30 dark:bg-orange-950/10 text-center">
                    <p className="text-[10px] font-bold uppercase text-orange-500 mb-1">Bike Power</p>
                    <p className="text-sm font-bold text-orange-600">
                      {racePlan.pacing_plan.bike.targetPowerRange[0]}–{racePlan.pacing_plan.bike.targetPowerRange[1]}W
                    </p>
                  </div>
                )}
                {racePlan.pacing_plan.run && (
                  <div className="p-3 rounded-xl bg-green-50/30 dark:bg-green-950/10 text-center">
                    <p className="text-[10px] font-bold uppercase text-green-500 mb-1">Run Pace</p>
                    <p className="text-sm font-bold text-green-600">
                      {Math.floor(racePlan.pacing_plan.run.targetPaceSecPerKm / 60)}:{(racePlan.pacing_plan.run.targetPaceSecPerKm % 60).toString().padStart(2, '0')}/km
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Projection History Chart (all tiers except 0) */}
      {tier > 0 && <ProjectionHistory raceId={raceId} />}

      {/* Race Day Plan (Tier 2+) */}
      {tier >= 2 && racePlan && (
        <>
          {racePlan.pacing_plan && <PacingCard pacing={racePlan.pacing_plan} useImperial={false} />}
          {racePlan.nutrition_plan && <NutritionCard nutrition={racePlan.nutrition_plan} />}
          {racePlan.mindset_plan && <MindsetCard mindset={racePlan.mindset_plan} />}
        </>
      )}
    </div>
  )
}
