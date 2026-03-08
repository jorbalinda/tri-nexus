'use client'

import { useState } from 'react'
import { ArrowLeft, Trophy } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { TargetRace } from '@/lib/types/target-race'
import type { RaceProjection } from '@/lib/types/projection'
import { useProjection } from '@/hooks/useProjection'
import PostRaceEntry from '@/components/races/PostRaceEntry'
import PredictionAccuracyCard from '@/components/races/PredictionAccuracyCard'
import type { PostRaceData } from '@/components/races/PostRaceEntry'

function formatTime(seconds: number | null): string {
  if (!seconds) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function ResultsClient({ initialRace }: { initialRace: TargetRace }) {
  const [race, setRace] = useState<TargetRace>(initialRace)
  const raceId = race.id
  const supabase = createClient()

  const { projection, loading: projLoading } = useProjection(raceId)

  async function handleSaveResults(data: PostRaceData) {
    const { data: updated } = await supabase
      .from('target_races')
      .update({
        status: data.status,
        actual_finish_seconds: data.actual_finish_seconds,
        actual_swim_seconds: data.actual_swim_seconds,
        actual_bike_seconds: data.actual_bike_seconds,
        actual_run_seconds: data.actual_run_seconds,
        actual_t1_seconds: data.actual_t1_seconds,
        actual_t2_seconds: data.actual_t2_seconds,
        updated_at: new Date().toISOString(),
      })
      .eq('id', raceId)
      .select()
      .single()

    if (updated) setRace(updated as TargetRace)
  }

  if (projLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
      </div>
    )
  }

  const hasResults = race.actual_finish_seconds !== null

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/dashboard/races/${raceId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors w-fit"
      >
        <ArrowLeft size={14} />
        Back to Race
      </Link>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#4361ee] mb-2">Post-Race Results</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{race.race_name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{race.race_date}</p>
      </div>

      {hasResults && projection && (
        <PredictionAccuracyCard race={race} projection={projection} />
      )}

      {hasResults && !projection && (
        <div className="card-squircle p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-[#ffb703]" />
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
              Race Results
            </p>
          </div>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {formatTime(race.actual_finish_seconds)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {race.status === 'completed' ? 'Finished' : race.status?.toUpperCase()}
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
            {[
              { label: 'Swim', time: race.actual_swim_seconds, color: 'text-[#219ebc]' },
              { label: 'T1', time: race.actual_t1_seconds, color: 'text-gray-500' },
              { label: 'Bike', time: race.actual_bike_seconds, color: 'text-[#fb8500]' },
              { label: 'T2', time: race.actual_t2_seconds, color: 'text-gray-500' },
              { label: 'Run', time: race.actual_run_seconds, color: 'text-[#4cc9a0]' },
            ].map(({ label, time, color }) => (
              <div key={label} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
                <p className={`text-sm font-bold ${color}`}>{time ? formatTime(time) : '-'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <PostRaceEntry race={race} onSave={handleSaveResults} />
    </div>
  )
}
