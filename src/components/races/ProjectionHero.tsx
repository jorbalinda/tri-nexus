'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Shield, CheckCircle2, Circle, ArrowRight, Activity } from 'lucide-react'
import type { RaceProjection } from '@/lib/types/projection'
import type { TargetRace } from '@/lib/types/target-race'
import type { Workout, ManualLog } from '@/lib/types/database'
import type { SufficiencyResult } from '@/lib/analytics/data-sufficiency'
import { generateFullRacePlan } from '@/lib/analytics/race-plan-generator'

interface ProjectionHeroProps {
  projection: RaceProjection | null
  loading: boolean
  confidence: number
  confidenceTier: string
  confidenceTierColor: string
  confidenceBarColor: string
  sufficiency: SufficiencyResult | null
  race: TargetRace
  workouts: Workout[]
  logs: ManualLog[]
  trainingLoad: { ctl: number; atl: number; tsb: number } | null
  daysUntilRace: number
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

function getTsbBadge(tsb: number): { label: string; color: string; bg: string } | null {
  if (tsb >= 10 && tsb <= 25) return { label: 'Race Ready', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-950/30' }
  if (tsb > 0 && tsb < 10) return { label: 'Fresh', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/30' }
  if (tsb >= -10 && tsb <= 0) return { label: 'Training', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-950/30' }
  if (tsb < -10 && tsb >= -20) return { label: 'Fatigued', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-950/30' }
  if (tsb < -20) return { label: 'Overtrained', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950/30' }
  return { label: 'Rested', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950/30' }
}

export default function ProjectionHero({
  projection,
  loading,
  confidence,
  confidenceTier,
  confidenceTierColor,
  confidenceBarColor,
  sufficiency,
  race,
  workouts,
  logs,
  trainingLoad,
  daysUntilRace,
}: ProjectionHeroProps) {
  const tier = sufficiency?.tier ?? 0

  const racePlan = useMemo(() => {
    if (tier < 2 || !race || workouts.length === 0) return null
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
  }, [tier, race, workouts, logs])

  if (loading) {
    return (
      <div className="card-squircle p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between mb-6">
          <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const tsbBadge = trainingLoad && tier >= 2 ? getTsbBadge(trainingLoad.tsb) : null
  const hrActive = projection?.hr_adjustment && projection.hr_adjustment.overallConfidence !== 'none'

  // ── Tier 0 — Onboarding State ──────────────────────────────
  if (tier === 0 || !projection) {
    const gatesPassed = sufficiency?.gates.filter(g => g.passed).length ?? 0
    const totalGates = sufficiency?.gates.length ?? 3

    // Build onboarding checklist
    const checklistItems = [
      { label: 'Set a target race', done: true },
      { label: 'Log your first workout', done: workouts.length > 0 },
      { label: 'Log 10+ workouts across swim, bike, and run', done: gatesPassed >= 3 },
      { label: 'Set threshold data (FTP, CSS, or LT pace)', done: sufficiency?.gates.some(g => g.hasThreshold) ?? false },
    ]
    const completedCount = checklistItems.filter(c => c.done).length
    const progressPct = Math.round((completedCount / checklistItems.length) * 100)

    return (
      <div className="card-squircle p-4 sm:p-6 lg:p-8 border-2 border-dashed border-gray-200 dark:border-gray-700">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-6">
          Projected Finish Time
        </p>

        {/* Ghost outline of where the time will appear */}
        <div className="text-center mb-6">
          <p className="text-5xl font-bold text-gray-200 dark:text-gray-700 tracking-wider select-none">
            —:——
          </p>
          <p className="text-sm text-gray-300 dark:text-gray-600 mt-2">
            Your finish time will appear here
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Getting started</span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{completedCount}/{checklistItems.length}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Onboarding checklist */}
        <div className="space-y-2 mb-6">
          {checklistItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              {item.done ? (
                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
              ) : (
                <Circle size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
              )}
              <span className={`text-sm ${item.done ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Ghost discipline split cards */}
        <div className="grid grid-cols-3 gap-2">
          {(sufficiency?.gates ?? [{ sport: 'swim', passed: false, workoutCount: 0, required: 10 }, { sport: 'bike', passed: false, workoutCount: 0, required: 10 }, { sport: 'run', passed: false, workoutCount: 0, required: 10 }]).map((gate) => (
            <div
              key={gate.sport}
              className={`p-3 rounded-xl border-2 border-dashed text-center ${
                gate.passed
                  ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/10'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/20'
              }`}
            >
              <p className={`text-xs font-semibold mb-1 ${SPORT_COLORS[gate.sport]}`}>
                {SPORT_LABELS[gate.sport]}
              </p>
              {gate.passed ? (
                <CheckCircle2 size={14} className="text-green-500 mx-auto mb-1" />
              ) : (
                <p className="text-lg font-bold text-gray-200 dark:text-gray-700 mb-1">——</p>
              )}
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                {gate.workoutCount}/{gate.required} workouts
              </p>
            </div>
          ))}
        </div>

        {/* Next actions */}
        {sufficiency && sufficiency.nextActions.length > 0 && (
          <div className="mt-5 space-y-2">
            {sufficiency.nextActions.slice(0, 2).map((action, i) => (
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
    )
  }

  // ── Tier 1 — Early Estimate ────────────────────────────────
  if (tier === 1) {
    return (
      <div className="card-squircle p-4 sm:p-6 lg:p-8">
        {/* Top bar: badge + confidence */}
        <div className="flex items-center justify-between mb-6">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
            Early Estimate
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${confidenceTierColor}`}>{confidence}%</span>
            <div className="w-16 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${confidenceBarColor}`}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hero: realistic time with tilde */}
        <div className="text-center mb-3">
          <p className="text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            ~{formatTimeShort(projection.realistic_seconds)}
          </p>
        </div>

        {/* Range below */}
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mb-4">
          {formatTimeShort(projection.optimistic_seconds)} to {formatTimeShort(projection.conservative_seconds)}
        </p>

        {/* Goal comparison */}
        {race.goal_time_seconds && (
          <div className="mb-4">
            <GoalComparison goalSeconds={race.goal_time_seconds} realisticSeconds={projection.realistic_seconds} />
          </div>
        )}

        {/* What would improve this */}
        {sufficiency && sufficiency.nextActions.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2.5">
              Improve This Estimate
            </p>
            <div className="space-y-1.5">
              {sufficiency.nextActions.slice(0, 3).map((action, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                  <ArrowRight size={11} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">{action.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer link */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <Link
            href={`/dashboard/races/${race.id}/reveal`}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            View Full Projection &rarr;
          </Link>
        </div>
      </div>
    )
  }

  // ── Tier 2+ — Full Display ─────────────────────────────────
  const swimPace = racePlan?.pacing_plan?.swim
    ? `${Math.floor(racePlan.pacing_plan.swim.targetPacePer100m / 60)}:${(racePlan.pacing_plan.swim.targetPacePer100m % 60).toString().padStart(2, '0')}/100m`
    : null
  const bikePower = racePlan?.pacing_plan?.bike?.targetPowerRange
    ? `${racePlan.pacing_plan.bike.targetPowerRange[0]}–${racePlan.pacing_plan.bike.targetPowerRange[1]}W`
    : null
  const runPace = racePlan?.pacing_plan?.run
    ? `${Math.floor(racePlan.pacing_plan.run.targetPaceSecPerKm / 60)}:${(racePlan.pacing_plan.run.targetPaceSecPerKm % 60).toString().padStart(2, '0')}/km`
    : null

  // Data source footer items
  const footerItems: string[] = []
  if (projection.data_points_used) footerItems.push(`${projection.data_points_used} workouts`)
  if (projection.fitness_snapshot?.estimatedFTP) footerItems.push(`FTP ${projection.fitness_snapshot.estimatedFTP}W`)
  if (projection.fitness_snapshot?.estimatedCSS) {
    const cssMin = Math.floor(projection.fitness_snapshot.estimatedCSS / 60)
    const cssSec = (projection.fitness_snapshot.estimatedCSS % 60).toString().padStart(2, '0')
    footerItems.push(`CSS ${cssMin}:${cssSec}`)
  }
  if (projection.fitness_snapshot?.weeklyVolumeHours) footerItems.push(`${projection.fitness_snapshot.weeklyVolumeHours}h/wk`)

  return (
    <div className="card-squircle p-8">
      {/* Top bar: confidence + badges */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${confidenceTierColor}`}>{confidenceTier}: {confidence}%</span>
          <div className="w-20 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${confidenceBarColor}`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* HR-Enhanced badge */}
          {hrActive && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-pink-100 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 text-[10px] font-bold">
              <Activity size={10} />
              HR
            </span>
          )}
          {/* TSB readiness badge */}
          {tsbBadge && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${tsbBadge.bg} ${tsbBadge.color}`}>
              {tsbBadge.label}
            </span>
          )}
          {/* Tier badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            tier === 3
              ? 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400'
              : 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
          }`}>
            {tier === 3 && <Shield size={9} />}
            {sufficiency?.tierLabel ?? 'Standard'}
          </span>
        </div>
      </div>

      {/* HERO: Total realistic finish time — largest number on screen */}
      <div className="text-center mb-2">
        <p className="text-6xl font-bold text-blue-600 dark:text-blue-400 tracking-tight leading-none">
          {formatTimeShort(projection.realistic_seconds)}
        </p>
      </div>

      {/* Range */}
      <p className="text-center text-sm text-gray-400 dark:text-gray-500 mb-1">
        {formatTimeShort(projection.optimistic_seconds)} to {formatTimeShort(projection.conservative_seconds)}
      </p>

      {/* Goal comparison */}
      {race.goal_time_seconds && (
        <div className="mb-5">
          <GoalComparison goalSeconds={race.goal_time_seconds} realisticSeconds={projection.realistic_seconds} />
        </div>
      )}
      {!race.goal_time_seconds && <div className="mb-5" />}

      {/* Split cards with integrated pacing targets — race flow order */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center mb-5">
        {/* Swim */}
        <div className="p-2.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/15 border border-blue-100/60 dark:border-blue-900/30">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1">Swim</p>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatTime(projection.swim_seconds)}</p>
          {swimPace && (
            <p className="text-[10px] font-semibold text-blue-500/80 mt-1">{swimPace}</p>
          )}
        </div>
        {/* T1 */}
        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">T1</p>
          <p className="text-sm font-bold text-gray-500">{formatTime(projection.t1_seconds)}</p>
        </div>
        {/* Bike */}
        <div className="p-2.5 rounded-xl bg-orange-50/40 dark:bg-orange-950/15 border border-orange-100/60 dark:border-orange-900/30">
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500 mb-1">Bike</p>
          <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{formatTime(projection.bike_seconds)}</p>
          {bikePower && (
            <p className="text-[10px] font-semibold text-orange-500/80 mt-1">{bikePower}</p>
          )}
        </div>
        {/* T2 */}
        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">T2</p>
          <p className="text-sm font-bold text-gray-500">{formatTime(projection.t2_seconds)}</p>
        </div>
        {/* Run */}
        <div className="p-2.5 rounded-xl bg-green-50/40 dark:bg-green-950/15 border border-green-100/60 dark:border-green-900/30">
          <p className="text-[10px] font-bold uppercase tracking-wider text-green-500 mb-1">Run</p>
          <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatTime(projection.run_seconds)}</p>
          {runPace && (
            <p className="text-[10px] font-semibold text-green-500/80 mt-1">{runPace}</p>
          )}
        </div>
      </div>

      {/* Data source footer */}
      {footerItems.length > 0 && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mb-4">
          Based on {footerItems.join(' · ')}
        </p>
      )}

      {/* Reveal link */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <Link
          href={`/dashboard/races/${race.id}/reveal`}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          View Full Projection &rarr;
        </Link>
        {/* Inline coaching nudge based on countdown */}
        <span className="text-[10px] text-gray-400 dark:text-gray-500">
          {daysUntilRace > 84
            ? 'Build your fitness'
            : daysUntilRace > 28
            ? 'Sharpen your speed'
            : daysUntilRace > 14
            ? 'Trust the work you\'ve done'
            : daysUntilRace > 0
            ? 'You\'re ready'
            : ''}
        </span>
      </div>
    </div>
  )
}

function GoalComparison({ goalSeconds, realisticSeconds }: { goalSeconds: number; realisticSeconds: number }) {
  const diffSeconds = realisticSeconds - goalSeconds
  const diffMin = Math.round(Math.abs(diffSeconds) / 60)
  const isUnder = diffSeconds < 0

  return (
    <p className={`text-xs font-medium text-center ${isUnder ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
      {isUnder
        ? `${diffMin} min under goal`
        : diffMin === 0
        ? 'On target for goal'
        : `+${diffMin} min from goal`}
    </p>
  )
}
