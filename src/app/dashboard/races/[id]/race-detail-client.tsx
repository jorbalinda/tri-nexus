'use client'

import { useMemo } from 'react'
import { ArrowLeft, Trophy, ChevronRight, ListChecks, Zap } from 'lucide-react'
import Link from 'next/link'
import type { TargetRace } from '@/lib/types/target-race'
import type { ManualLog, Workout } from '@/lib/types/database'
import type { RaceProjection } from '@/lib/types/projection'
import type { RaceCourse, RaceWeather } from '@/lib/types/race-plan'
import { useProjection } from '@/hooks/useProjection'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useCourseConditions } from '@/hooks/useCourseConditions'
import { computeConfidenceV2, tierBarColor } from '@/lib/analytics/confidence-score-v2'
import { calculateCTL, calculateATL, calculateTSB } from '@/lib/analytics/training-stress'
import ProjectionHero from '@/components/races/ProjectionHero'
import RaceReadinessCard from '@/components/races/RaceReadinessCard'
import DataQualityCard from '@/components/races/DataQualityCard'
import DeepDiveCard from '@/components/races/DeepDiveCard'
import CourseConditions from '@/components/races/CourseConditions'
import TierTransitionToast from '@/components/races/TierTransitionToast'
import ThresholdSetCard from '@/components/races/ThresholdSetCard'

function daysUntil(dateStr: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const race = new Date(dateStr)
  race.setHours(0, 0, 0, 0)
  return Math.ceil((race.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatTime(seconds: number | null): string {
  if (!seconds) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const DISTANCE_LABELS: Record<string, string> = {
  sprint: 'Sprint (750m / 20km / 5km)',
  olympic: 'Olympic (1.5km / 40km / 10km)',
  '70.3': 'Half Ironman (1.9km / 90km / 21.1km)',
  '140.6': 'Full Ironman (3.8km / 180km / 42.2km)',
  custom: 'Custom Distance',
}

const PRIORITY_STYLES: Record<string, string> = {
  a: 'bg-[#e76f51]/15 text-[#e76f51] dark:bg-[#e76f51]/20 dark:text-[#e76f51]',
  b: 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400',
  c: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
}

interface Props {
  initialRace: TargetRace
  initialLogs: ManualLog[]
  initialWorkouts: Workout[]
  initialProjection: RaceProjection | null
  initialCourse: RaceCourse | null
  initialWeather: RaceWeather | null
}

export default function RaceDetailClient({ initialRace, initialLogs, initialWorkouts, initialProjection, initialCourse, initialWeather }: Props) {
  const raceId = initialRace.id
  const { projection, loading: projLoading, sufficiency, tierTransition, dismissTierTransition } = useProjection(raceId, {
    initialProjection,
    race: initialRace,
    initialWorkouts,
    initialLogs,
  })
  const { workouts } = useWorkouts(undefined, initialWorkouts)
  const { course, weather, loading: conditionsLoading } = useCourseConditions(initialRace.race_course_id ?? null, raceId, initialCourse, initialWeather, initialRace.race_date)

  const trainingLoad = useMemo(() => {
    if (workouts.length === 0) return null
    return { ctl: calculateCTL(workouts), atl: calculateATL(workouts), tsb: calculateTSB(workouts) }
  }, [workouts])

  const confidenceResult = useMemo(() => {
    if (workouts.length === 0 || !initialLogs.length) return null
    return computeConfidenceV2(workouts, initialLogs, initialRace)
  }, [workouts, initialLogs, initialRace])

  const days = daysUntil(initialRace.race_date)

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link
        href="/dashboard/races"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors w-fit"
      >
        <ArrowLeft size={14} />
        All Races
      </Link>

      {/* Tier Transition Toast */}
      {tierTransition && (
        <TierTransitionToast
          transition={tierTransition}
          onDismiss={dismissTierTransition}
        />
      )}

      {/* Compact Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{initialRace.race_name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {DISTANCE_LABELS[initialRace.race_distance] || initialRace.race_distance}
        </p>
        <div className="flex items-center gap-2 flex-wrap mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{initialRace.race_date}</span>
          <span className="text-gray-300 dark:text-gray-600">&middot;</span>
          <span className={days <= 7 && days > 0 ? 'text-red-600 font-semibold' : ''}>
            {days > 0 ? `${days} days away` : days === 0 ? 'Race Day!' : 'Completed'}
          </span>
          <span className="text-gray-300 dark:text-gray-600">&middot;</span>
          <span className={`px-2 py-0.5 rounded-lg font-semibold ${PRIORITY_STYLES[initialRace.priority] ?? PRIORITY_STYLES.c}`}>
            {initialRace.priority.toUpperCase()} Race
          </span>
          {initialRace.goal_time_seconds && (
            <>
              <span className="text-gray-300 dark:text-gray-600">&middot;</span>
              <span>Goal: {formatTime(initialRace.goal_time_seconds)}</span>
            </>
          )}
        </div>
        {/* Race phase context */}
        {days > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 italic">
            {days > 84
              ? 'Build phase. Focus on consistent volume.'
              : days > 28
              ? 'Sharpen phase. Add race-specific intensity.'
              : days > 14
              ? "Taper phase. Trust the work you've done."
              : days > 0
              ? "Race week. You're ready."
              : ''}
          </p>
        )}
      </div>

      {/* HERO: ProjectionHero */}
      <ProjectionHero
        projection={projection}
        loading={projLoading}
        confidence={confidenceResult?.total ?? projection?.confidence_score ?? 0}
        confidenceTier={confidenceResult?.tier ?? 'Low'}
        confidenceTierColor={confidenceResult?.tierColor ?? 'text-gray-500'}
        confidenceBarColor={confidenceResult ? tierBarColor(confidenceResult.total) : 'bg-gray-300'}
        sufficiency={sufficiency}
        race={initialRace}
        workouts={workouts}
        logs={initialLogs}
        trainingLoad={trainingLoad}
        daysUntilRace={days}
      />

      {/* Threshold entry — Tier 2 only */}
      {sufficiency?.tier === 2 && (
        <ThresholdSetCard />
      )}

      {/* Race Readiness */}
      <RaceReadinessCard trainingLoad={trainingLoad} daysUntilRace={days} />

      {/* Data Quality & Next Steps */}
      <DataQualityCard sufficiency={sufficiency} tier={sufficiency?.tier ?? 0} />

      {/* Course & Conditions */}
      <CourseConditions
        course={course}
        weather={weather}
        loading={conditionsLoading}
        daysUntilRace={days}
      />

      {/* Post-Race Prompt */}
      {days < 0 && !initialRace.actual_finish_seconds && (
        <Link
          href={`/dashboard/races/${raceId}/results`}
          className="card-squircle p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
              <Trophy size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">How did it go?</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enter your race results to see predicted vs. actual</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </Link>
      )}

      {/* View Results Link (if results already entered) */}
      {initialRace.actual_finish_seconds && (
        <Link
          href={`/dashboard/races/${raceId}/results`}
          className="card-squircle p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <Trophy size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Race Results: {formatTime(initialRace.actual_finish_seconds)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">View predicted vs. actual comparison</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </Link>
      )}

      {/* Race Prep Modules */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
          Race Preparation
        </p>
        <div className="flex flex-col gap-2">
          {[
            { href: `/dashboard/races/${raceId}/timeline`, icon: ListChecks, label: 'Race Week Timeline', desc: 'Logistics & schedule', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
            ...(days <= 1 ? [{ href: `/dashboard/races/${raceId}/race-day`, icon: Zap, label: 'Race Day Mode', desc: 'Distraction-free race morning', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' }] : []),
          ].map(({ href, icon: Icon, label, desc, color, bg }) => (
            <Link
              key={href}
              href={href}
              className="card-squircle p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon size={20} className={color} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Deep Dive */}
      <DeepDiveCard
        breakdown={confidenceResult?.breakdown ?? null}
        projection={projection}
        confidence={confidenceResult?.total ?? 0}
        workoutCount={workouts.length}
        daysUntilReveal={Math.max(0, days - 7)}
      />
    </div>
  )
}
