'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Clock, Timer, TrendingDown, TrendingUp } from 'lucide-react'
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
import EquipmentCard from '@/components/race-day/EquipmentCard'
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

  const { projection, loading: projLoading } = useProjection(raceId)
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
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-blue-500 mb-2">Race Week Reveal</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{race.race_name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{race.race_date}</p>
      </div>

      {/* Finish Time Reveal */}
      {projection && (
        <div className="card-squircle p-8">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-4 text-center">
            Projected Finish Time
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
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
          <div className="grid grid-cols-5 gap-2 text-center">
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

      {/* Projection History Chart */}
      <ProjectionHistory raceId={raceId} />

      {/* Race Day Plan */}
      {racePlan && (
        <>
          {racePlan.pacing_plan && <PacingCard pacing={racePlan.pacing_plan} useImperial={false} />}
          {racePlan.nutrition_plan && <NutritionCard nutrition={racePlan.nutrition_plan} />}
          {racePlan.equipment_plan && <EquipmentCard equipment={racePlan.equipment_plan} checklistItems={[]} onToggle={() => {}} />}
          {racePlan.mindset_plan && <MindsetCard mindset={racePlan.mindset_plan} />}
        </>
      )}
    </div>
  )
}
