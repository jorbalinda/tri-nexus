'use client'

import { useState } from 'react'
import type { TargetRace } from '@/lib/types/target-race'
import ParticleBurst from '@/components/ui/ParticleBurst'

interface PostRaceEntryProps {
  race: TargetRace
  onSave: (data: PostRaceData) => Promise<void>
}

export interface PostRaceData {
  status: 'completed' | 'dns' | 'dnf'
  actual_finish_seconds: number | null
  actual_swim_seconds: number | null
  actual_bike_seconds: number | null
  actual_run_seconds: number | null
  actual_t1_seconds: number | null
  actual_t2_seconds: number | null
}

function parseTimeInput(value: string): number | null {
  if (!value.trim()) return null
  const parts = value.split(':').map(Number)
  if (parts.some(isNaN)) return null
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return null
}

function secondsToInput(seconds: number | null): string {
  if (!seconds) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function PostRaceEntry({ race, onSave }: PostRaceEntryProps) {
  const [status, setStatus] = useState<'completed' | 'dns' | 'dnf'>(
    (race.status === 'completed' || race.status === 'dns' || race.status === 'dnf') ? race.status : 'completed'
  )
  const [finish, setFinish] = useState(secondsToInput(race.actual_finish_seconds))
  const [swim, setSwim] = useState(secondsToInput(race.actual_swim_seconds))
  const [bike, setBike] = useState(secondsToInput(race.actual_bike_seconds))
  const [run, setRun] = useState(secondsToInput(race.actual_run_seconds))
  const [t1, setT1] = useState(secondsToInput(race.actual_t1_seconds))
  const [t2, setT2] = useState(secondsToInput(race.actual_t2_seconds))
  const [saving, setSaving] = useState(false)
  const [showBurst, setShowBurst] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        status,
        actual_finish_seconds: parseTimeInput(finish),
        actual_swim_seconds: parseTimeInput(swim),
        actual_bike_seconds: parseTimeInput(bike),
        actual_run_seconds: parseTimeInput(run),
        actual_t1_seconds: parseTimeInput(t1),
        actual_t2_seconds: parseTimeInput(t2),
      })
      setShowBurst(true)
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#4361ee]/30 focus:border-transparent outline-none'

  return (
    <form onSubmit={handleSubmit} className="card-squircle p-6">
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-4">
        Post-Race Results
      </p>

      {/* Status */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Race Status</label>
        <div className="flex gap-2">
          {(['completed', 'dns', 'dnf'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                status === s
                  ? s === 'completed'
                    ? 'bg-[#4cc9a0]/15 text-[#4cc9a0]'
                    : 'bg-[#d62828]/10 text-[#d62828]'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {status === 'completed' && (
        <>
          {/* Finish Time */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
              Finish Time (h:mm:ss)
            </label>
            <input
              type="text"
              value={finish}
              onChange={(e) => setFinish(e.target.value)}
              placeholder="5:30:00"
              maxLength={9}
              className={inputClass}
            />
          </div>

          {/* Splits */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Swim</label>
              <input type="text" value={swim} onChange={(e) => setSwim(e.target.value)} placeholder="0:35:00" maxLength={9} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">T1</label>
              <input type="text" value={t1} onChange={(e) => setT1(e.target.value)} placeholder="0:03:00" maxLength={9} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Bike</label>
              <input type="text" value={bike} onChange={(e) => setBike(e.target.value)} placeholder="2:45:00" maxLength={9} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">T2</label>
              <input type="text" value={t2} onChange={(e) => setT2(e.target.value)} placeholder="0:02:00" maxLength={9} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Run</label>
              <input type="text" value={run} onChange={(e) => setRun(e.target.value)} placeholder="2:05:00" maxLength={9} className={inputClass} />
            </div>
          </div>
        </>
      )}

      <ParticleBurst active={showBurst} onComplete={() => setShowBurst(false)}>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Results'}
        </button>
      </ParticleBurst>
    </form>
  )
}
