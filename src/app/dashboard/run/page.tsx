'use client'

import { useState, useEffect } from 'react'
import TelemetryChart from '@/components/dashboard/TelemetryChart'
import RunMetricsPanel from '@/components/dashboard/RunMetricsPanel'
import ManualContextCard from '@/components/dashboard/ManualContextCard'
import EFCard from '@/components/dashboard/EFCard'
import MetabolicCard from '@/components/dashboard/MetabolicCard'
import WorkoutSelector from '@/components/ui/WorkoutSelector'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useUnits } from '@/hooks/useUnits'
import { createClient } from '@/lib/supabase/client'
import type { Workout, SessionMetric } from '@/lib/types/database'

export default function RunPage() {
  const { workouts, loading } = useWorkouts('run')
  const { speedLabel, paceLabel, convertDistance, distanceLabel } = useUnits()
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetric[]>([])
  const [selectedWorkoutIdx, setSelectedWorkoutIdx] = useState(0)
  const supabase = createClient()

  const selectedWorkout = workouts[selectedWorkoutIdx] || null

  const formatDist = (w: Workout) => {
    if (!w.distance_meters) return ''
    const val = speedLabel === 'mi'
      ? ((w.distance_meters / 1000) * 0.621371).toFixed(1)
      : (w.distance_meters / 1000).toFixed(1)
    return `${val}${speedLabel}`
  }

  useEffect(() => {
    if (!selectedWorkout) return
    supabase
      .from('session_metrics')
      .select('*')
      .eq('workout_id', selectedWorkout.id)
      .order('timestamp_offset_seconds', { ascending: true })
      .then(({ data }) => {
        setSessionMetrics((data as SessionMetric[]) || [])
      })
  }, [selectedWorkout, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading run data...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {workouts.length >= 1 && (
        <WorkoutSelector
          workouts={workouts}
          selectedIndex={selectedWorkoutIdx}
          onSelect={setSelectedWorkoutIdx}
          sportColor="green"
          formatDistance={formatDist}
        />
      )}

      <TelemetryChart
        sport="run"
        sessionMetrics={sessionMetrics}
        workout={selectedWorkout}
        workoutTitle={selectedWorkout?.title}
      />

      <RunMetricsPanel
        workout={selectedWorkout}
      />

      <div className="grid grid-cols-3 gap-6">
        <ManualContextCard />
        <EFCard sport="run" />
        <MetabolicCard sport="run" />
      </div>
    </div>
  )
}
