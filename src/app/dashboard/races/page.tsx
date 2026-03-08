'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTargetRaces } from '@/hooks/useTargetRaces'
import RaceCard from '@/components/races/RaceCard'
import RaceForm from '@/components/races/RaceForm'
import dynamic from 'next/dynamic'
const FitnessTrends = dynamic(() => import('@/components/dashboard/FitnessTrends'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card-squircle p-5"><div className="h-56 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" /></div>
      <div className="card-squircle p-5"><div className="h-56 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" /></div>
    </div>
  ),
})
import type { TargetRace } from '@/lib/types/target-race'

export default function RacesPage() {
  const { races, loading, create, remove } = useTargetRaces()
  const [showForm, setShowForm] = useState(false)

  const upcoming = races.filter((r) => r.status === 'upcoming' || r.status === 'race_week')
  const completed = races.filter((r) => r.status === 'completed' || r.status === 'dns' || r.status === 'dnf')

  const handleCreate = async (data: Omit<TargetRace, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await create(data)
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Remove this race?')) {
      await remove(id)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
            Races
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Target Races
          </h1>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={16} />
            Add Race
          </button>
        )}
      </div>

      {/* Fitness / Fatigue / Form + Weekly Volume */}
      <FitnessTrends />

      {showForm && (
        <div className="card-squircle p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add Target Race</h2>
          <RaceForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} submitLabel="Add Race" />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="card-squircle p-6 h-24 animate-pulse bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
                Upcoming ({upcoming.length})
              </p>
              {upcoming.map((race) => (
                <RaceCard key={race.id} race={race} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
                Completed ({completed.length})
              </p>
              {completed.map((race) => (
                <RaceCard key={race.id} race={race} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {races.length === 0 && !showForm && (
            <div className="card-squircle p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No races yet. Add your target race to start your projection.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus size={16} />
                Add Your First Race
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
