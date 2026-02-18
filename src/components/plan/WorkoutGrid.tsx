'use client'

import type { LibraryWorkout, PlanSport, TrainingZone } from '@/lib/types/training-plan'
import WorkoutCard from './WorkoutCard'

interface WorkoutGridProps {
  workouts: LibraryWorkout[]
  sport: PlanSport
  onSelectWorkout: (workout: LibraryWorkout) => void
}

const zoneLabels: Record<string, string> = {
  '1': 'Zone 1 — Recovery',
  '2': 'Zone 2 — Endurance',
  '3': 'Zone 3 — Tempo',
  '4': 'Zone 4 — Threshold',
  '5': 'Zone 5 — VO2 Max',
  'max': 'Max — Sprint / Speed',
  'mixed': 'Mixed — Multi-Zone',
}

const zoneColors: Record<string, string> = {
  '1': 'text-sky-500',
  '2': 'text-emerald-500',
  '3': 'text-amber-500',
  '4': 'text-orange-500',
  '5': 'text-red-500',
  'max': 'text-rose-500',
  'mixed': 'text-violet-500',
}

export default function WorkoutGrid({ workouts, sport, onSelectWorkout }: WorkoutGridProps) {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-gray-400 dark:text-gray-500">No workouts found for this filter.</p>
      </div>
    )
  }

  // Group workouts by zone in order
  const groups = groupByZone(workouts)

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
        {workouts.length} workout{workouts.length !== 1 ? 's' : ''}
      </p>
      <div className="space-y-8">
        {groups.map(({ zone, items }) => (
          <div key={String(zone)}>
            <p className={`text-xs font-bold uppercase tracking-[2px] mb-3 ${zoneColors[String(zone)] ?? 'text-gray-400'}`}>
              {zoneLabels[String(zone)] ?? `Zone ${zone}`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  sport={sport}
                  onClick={() => onSelectWorkout(workout)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function groupByZone(workouts: LibraryWorkout[]): { zone: TrainingZone; items: LibraryWorkout[] }[] {
  const map = new Map<string, LibraryWorkout[]>()
  for (const w of workouts) {
    const key = String(w.zone)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(w)
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    zone: items[0].zone,
    items,
  }))
}
