'use client'

import { useState, useCallback } from 'react'
import TrainingCalendar from '@/components/dashboard/calendar/TrainingCalendar'
import LTEstimatorCard from '@/components/dashboard/LTEstimatorCard'
import LogWorkoutBar from '@/components/dashboard/LogWorkoutBar'
import SampleDataBanner from '@/components/dashboard/SampleDataBanner'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useManualLogs } from '@/hooks/useManualLogs'
import { useReadiness } from '@/hooks/useReadiness'
import { deriveMaxHR, deriveRestingHR } from '@/lib/analytics/lactate-threshold'
import { generateSampleWorkouts } from '@/lib/data/sample-workouts'

function readinessBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

function cnsTextColor(status: string): string {
  if (status === 'optimal') return 'text-green-600'
  if (status === 'warning') return 'text-yellow-600'
  return 'text-red-600'
}

export default function DashboardPage() {
  const { workouts, loading: workoutsLoading } = useWorkouts()
  const { logs, loading: logsLoading } = useManualLogs('physiological')
  const { loading: readinessLoading, score, cns } = useReadiness()
  const [sampleDataEnabled, setSampleDataEnabled] = useState(false)

  const handleSampleToggle = useCallback((enabled: boolean) => {
    setSampleDataEnabled(enabled)
  }, [])

  const loading = workoutsLoading || logsLoading

  // Merge sample data with real workouts when enabled
  const allWorkouts = sampleDataEnabled ? [...workouts, ...generateSampleWorkouts()] : workouts
  const derivedMax = deriveMaxHR(allWorkouts)
  const derivedResting = deriveRestingHR(logs)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
          Dashboard
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Training Calendar
        </h1>
      </div>

      <SampleDataBanner workoutCount={workouts.length} onToggle={handleSampleToggle} />

      <TrainingCalendar />

      {/* Readiness & CNS strip */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-squircle p-5">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
            Daily Readiness
          </p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {readinessLoading ? '--' : score ?? '--'}
            </span>
            <span className="text-sm text-gray-400 dark:text-gray-500 mb-1">/ 100</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${score !== null ? readinessBarColor(score) : 'bg-gray-300'}`}
              style={{ width: score !== null ? `${score}%` : '0%' }}
            />
          </div>
        </div>

        <div className="card-squircle p-5">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
            CNS Balance
          </p>
          <p className={`text-sm font-semibold ${cns ? cnsTextColor(cns.status) : 'text-gray-400'}`}>
            {readinessLoading ? '--' : cns?.label ?? '--'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {readinessLoading ? '' : cns?.description ?? ''}
          </p>
        </div>
      </div>

      <LogWorkoutBar />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Loading data...</p>
        </div>
      ) : (
        <LTEstimatorCard
          derivedMaxHR={derivedMax}
          derivedRestingHR={derivedResting}
        />
      )}
    </div>
  )
}
