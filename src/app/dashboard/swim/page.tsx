'use client'

import { useState, useEffect } from 'react'
import TelemetryChart from '@/components/dashboard/TelemetryChart'
import SwimMetricsPanel from '@/components/dashboard/SwimMetricsPanel'
import ManualContextCard from '@/components/dashboard/ManualContextCard'
import EFCard from '@/components/dashboard/EFCard'
import MetabolicCard from '@/components/dashboard/MetabolicCard'
import WorkoutSelector from '@/components/ui/WorkoutSelector'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useUnits } from '@/hooks/useUnits'
import { createClient } from '@/lib/supabase/client'
import type { Workout, SessionMetric } from '@/lib/types/database'

export default function SwimPage() {
  const { workouts, loading } = useWorkouts('swim')
  const { convertDistance, distanceLabel } = useUnits()
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetric[]>([])
  const [selectedWorkoutIdx, setSelectedWorkoutIdx] = useState(0)
  const supabase = createClient()

  const selectedWorkout = workouts[selectedWorkoutIdx] || null

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

  const formatDist = (w: Workout) =>
    `${convertDistance(w.distance_meters || 0)}${distanceLabel}`

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading swim data...</p>
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
          sportColor="blue"
          formatDistance={formatDist}
        />
      )}

      <TelemetryChart
        sport="swim"
        sessionMetrics={sessionMetrics}
        workout={selectedWorkout}
        workoutTitle={selectedWorkout?.title}
      />

      <SwimMetricsPanel
        workout={selectedWorkout}
      />

      <div className="grid grid-cols-3 gap-6">
        <ManualContextCard />
        <EFCard sport="swim" />
        <MetabolicCard sport="swim" />
      </div>
    </div>
  )
}
