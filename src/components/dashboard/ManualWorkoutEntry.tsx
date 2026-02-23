'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ManualWorkoutEntryProps {
  onSaved: () => void
}

export default function ManualWorkoutEntry({ onSaved }: ManualWorkoutEntryProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sport, setSport] = useState<'swim' | 'bike' | 'run'>('run')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [durationMin, setDurationMin] = useState('')
  const [distanceKm, setDistanceKm] = useState('')
  const [notes, setNotes] = useState('')

  const supabase = createClient()

  const handleSave = async () => {
    setSaving(true)
    const durationSeconds = durationMin ? Math.round(parseFloat(durationMin) * 60) : null
    const distanceMeters = distanceKm ? Math.round(parseFloat(distanceKm) * (sport === 'swim' ? 1 : 1000)) : null

    const { error } = await supabase.from('workouts').insert({
      sport,
      title: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Workout`,
      date,
      duration_seconds: durationSeconds,
      distance_meters: distanceMeters,
      notes: notes || null,
      source: 'manual',
    })

    setSaving(false)
    if (!error) {
      setOpen(false)
      setSport('run')
      setDurationMin('')
      setDistanceKm('')
      setNotes('')
      onSaved()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="card-squircle px-6 py-4 flex items-center gap-3 w-full cursor-pointer group hover:shadow-md transition-all"
      >
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
          <Plus size={16} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          Add Workout
        </span>
      </button>
    )
  }

  return (
    <div className="card-squircle p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Log Workout</h3>
        <button onClick={() => setOpen(false)} className="p-1 cursor-pointer">
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Sport */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Sport</label>
          <div className="flex gap-1">
            {(['swim', 'bike', 'run'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  sport === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Duration (min)</label>
          <input
            type="number"
            placeholder="60"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>

        {/* Distance */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
            Distance ({sport === 'swim' ? 'm' : 'km'})
          </label>
          <input
            type="number"
            step="0.1"
            placeholder={sport === 'swim' ? '2000' : '10'}
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
      >
        {saving ? 'Saving...' : 'Save Workout'}
      </button>
    </div>
  )
}
