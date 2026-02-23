'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Flag, Clock, Target, Trophy, ChevronRight, Package, Utensils, Bike, ListChecks, Zap } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { TargetRace } from '@/lib/types/target-race'
import { useProjection } from '@/hooks/useProjection'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useCourseConditions } from '@/hooks/useCourseConditions'
import ProgressIndicator from '@/components/races/ProgressIndicator'
import CourseConditions from '@/components/races/CourseConditions'

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

export default function RaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [race, setRace] = useState<TargetRace | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // All hooks must be called unconditionally (Rules of Hooks)
  const raceId = (race?.id ?? '') as string
  const { projection, loading: projLoading } = useProjection(raceId)
  const { workouts } = useWorkouts()
  const { course, weather, loading: conditionsLoading } = useCourseConditions(race?.race_course_id ?? null, raceId)

  useEffect(() => {
    async function fetchRace() {
      const { data } = await supabase
        .from('target_races')
        .select('*')
        .eq('id', params.id)
        .single()

      setRace(data as TargetRace | null)
      setLoading(false)
    }
    if (params.id) fetchRace()
  }, [params.id, supabase])

  if (loading) {
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
        <p className="text-gray-500 dark:text-gray-400">Race not found.</p>
        <Link href="/dashboard/races" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
          Back to races
        </Link>
      </div>
    )
  }

  const days = daysUntil(race.race_date)

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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{race.race_name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {DISTANCE_LABELS[race.race_distance] || race.race_distance}
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-squircle p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Date</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{race.race_date}</p>
        </div>
        <div className="card-squircle p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-orange-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Countdown</span>
          </div>
          <p className={`text-sm font-semibold ${days <= 7 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
            {days > 0 ? `${days} days` : days === 0 ? 'Race Day!' : 'Completed'}
          </p>
        </div>
        <div className="card-squircle p-4">
          <div className="flex items-center gap-2 mb-1">
            <Flag size={14} className="text-green-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Priority</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{race.priority.toUpperCase()} Race</p>
        </div>
        <div className="card-squircle p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-purple-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Goal</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {race.goal_time_seconds ? formatTime(race.goal_time_seconds) : 'Not set'}
          </p>
        </div>
      </div>

      {/* Projection Progress */}
      <ProgressIndicator
        projection={projection}
        loading={projLoading}
        daysUntilRace={days}
        workoutCount={workouts.length}
      />

      {/* Course & Conditions */}
      <CourseConditions
        course={course}
        weather={weather}
        loading={conditionsLoading}
        daysUntilRace={days}
      />

      {/* Post-Race Prompt */}
      {days < 0 && !race.actual_finish_seconds && (
        <Link
          href={`/dashboard/races/${race.id}/results`}
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
      {race.actual_finish_seconds && (
        <Link
          href={`/dashboard/races/${race.id}/results`}
          className="card-squircle p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <Trophy size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Race Results: {formatTime(race.actual_finish_seconds)}
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
            { href: `/dashboard/races/${race.id}/gear`, icon: Package, label: 'Packing List', desc: 'Smart gear checklist', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
            { href: `/dashboard/races/${race.id}/timeline`, icon: ListChecks, label: 'Race Week Timeline', desc: 'Logistics & schedule', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
            { href: `/dashboard/races/${race.id}/nutrition`, icon: Utensils, label: 'Nutrition Plan', desc: 'Fueling strategy & timeline', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
            { href: `/dashboard/races/${race.id}/equipment`, icon: Bike, label: 'Equipment Profile', desc: 'Bike setup & CdA', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
            ...(days <= 1 ? [{ href: `/dashboard/races/${race.id}/race-day`, icon: Zap, label: 'Race Day Mode', desc: 'Distraction-free race morning', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' }] : []),
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

      {/* Notes */}
      {race.notes && (
        <div className="card-squircle p-6">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">Notes</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{race.notes}</p>
        </div>
      )}
    </div>
  )
}
