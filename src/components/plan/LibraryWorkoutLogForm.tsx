'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LibraryWorkout, PlanSport } from '@/lib/types/training-plan'
import type { WorkoutBlock } from '@/lib/types/database'

const sportLabel: Record<PlanSport, string> = {
  swim: 'Swim',
  bike: 'Bike',
  run: 'Run',
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'
const labelClass =
  'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

const zoneBarColors: Record<string, string> = {
  '1': 'bg-sky-400',
  '2': 'bg-emerald-400',
  '3': 'bg-amber-400',
  '4': 'bg-orange-400',
  '5': 'bg-red-500',
  'max': 'bg-rose-500',
  'mixed': 'bg-violet-400',
}

const zoneBadgeColors: Record<string, string> = {
  '1': 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  '2': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  '3': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  '4': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  '5': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'max': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'mixed': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    const km = meters / 1000
    return km % 1 === 0 ? `${km} km` : `${km.toFixed(1)} km`
  }
  return `${meters}m`
}

interface LibraryWorkoutLogFormProps {
  workout: LibraryWorkout
  sport: PlanSport
  onSaved: () => void
}

interface BlockFormState {
  rpe: string
  durationMin: string
}

export default function LibraryWorkoutLogForm({ workout, sport, onSaved }: LibraryWorkoutLogFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [distanceKm, setDistanceKm] = useState(
    workout.distance_meters ? String(workout.distance_meters / 1000) : ''
  )
  const [avgHr, setAvgHr] = useState('')
  const [maxHr, setMaxHr] = useState('')
  const [calories, setCalories] = useState('')
  const [notes, setNotes] = useState('')

  // Per-block state
  const [blockStates, setBlockStates] = useState<BlockFormState[]>(
    workout.structure.map((interval) => ({
      rpe: '',
      durationMin: interval.duration_minutes ? String(interval.duration_minutes) : '',
    }))
  )

  // Swim
  const [poolLength, setPoolLength] = useState('')
  const [swolf, setSwolf] = useState('')

  // Bike
  const [avgPower, setAvgPower] = useState('')
  const [normalizedPower, setNormalizedPower] = useState('')
  const [tss, setTss] = useState('')
  const [cadenceRpm, setCadenceRpm] = useState('')
  const [elevation, setElevation] = useState('')

  // Run
  const [paceMin, setPaceMin] = useState('')
  const [cadenceSpm, setCadenceSpm] = useState('')

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  const updateBlock = (index: number, field: keyof BlockFormState, value: string) => {
    setBlockStates((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  // Auto-computed session totals
  const sessionTotals = useMemo(() => {
    let totalDuration = 0
    let weightedRpeSum = 0
    let totalRpeDuration = 0

    blockStates.forEach((block) => {
      const dur = block.durationMin ? Number(block.durationMin) : 0
      const rpe = block.rpe ? Number(block.rpe) : 0
      totalDuration += dur
      if (rpe > 0 && dur > 0) {
        weightedRpeSum += rpe * dur
        totalRpeDuration += dur
      }
    })

    const avgRpe = totalRpeDuration > 0 ? Math.round((weightedRpeSum / totalRpeDuration) * 10) / 10 : null

    return { totalDuration, avgRpe }
  }, [blockStates])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    const blocks: WorkoutBlock[] = workout.structure.map((interval, i) => ({
      label: interval.label,
      distance_meters: interval.distance_meters ?? null,
      zone: interval.zone ?? null,
      rpe: blockStates[i].rpe ? Number(blockStates[i].rpe) : null,
      duration_minutes: blockStates[i].durationMin ? Number(blockStates[i].durationMin) : null,
      notes: null,
    }))

    const durationSeconds = sessionTotals.totalDuration > 0
      ? sessionTotals.totalDuration * 60
      : null

    const { error } = await supabase.from('workouts').insert({
      sport,
      title: workout.name,
      date,
      duration_seconds: durationSeconds,
      distance_meters: distanceKm ? Number(distanceKm) * 1000 : null,
      avg_hr: avgHr ? Number(avgHr) : null,
      max_hr: maxHr ? Number(maxHr) : null,
      rpe: sessionTotals.avgRpe,
      calories: calories ? Number(calories) : null,
      notes: notes ? `${notes}\n[library:${workout.id}]` : `[library:${workout.id}]`,
      blocks,
      pool_length_meters: poolLength ? Number(poolLength) : null,
      swolf: swolf ? Number(swolf) : null,
      avg_power_watts: avgPower ? Number(avgPower) : null,
      normalized_power: normalizedPower ? Number(normalizedPower) : null,
      tss: tss ? Number(tss) : null,
      avg_cadence_rpm: cadenceRpm ? Number(cadenceRpm) : null,
      elevation_gain_meters: elevation ? Number(elevation) : null,
      avg_pace_sec_per_km: paceMin ? Number(paceMin) * 60 : null,
      avg_cadence_spm: cadenceSpm ? Number(cadenceSpm) : null,
    })

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onSaved()
      }, 1500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Pre-filled info */}
      <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
              Sport
            </span>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{sportLabel[sport]}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
              Workout
            </span>
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{workout.name}</p>
          </div>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className={labelClass}>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Per-block RPE & Duration */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
          Workout Blocks
        </p>
        <div className="space-y-2">
          {workout.structure.map((interval, i) => {
            const barColor = interval.zone ? zoneBarColors[String(interval.zone)] || 'bg-gray-300' : 'bg-gray-300'
            const badgeColor = interval.zone ? zoneBadgeColors[String(interval.zone)] || '' : ''

            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
              >
                <div className={`w-1 rounded-full self-stretch shrink-0 ${barColor}`} />
                <div className="flex-1 min-w-0">
                  {/* Block header */}
                  <div className="flex items-center gap-2 mb-2">
                    {interval.repeat && interval.repeat > 1 && (
                      <span className="text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
                        {interval.repeat}×
                      </span>
                    )}
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {interval.label}
                    </span>
                    {interval.distance_meters && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistance(interval.distance_meters)}
                      </span>
                    )}
                    {interval.zone && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
                        Z{interval.zone}
                      </span>
                    )}
                  </div>
                  {/* Editable fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={blockStates[i].durationMin}
                        onChange={(e) => updateBlock(i, 'durationMin', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                        placeholder={interval.duration_minutes ? String(interval.duration_minutes) : '—'}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                        RPE (1-10)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={blockStates[i].rpe}
                        onChange={(e) => updateBlock(i, 'rpe', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                        placeholder="—"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Auto-computed session totals */}
        <div className="mt-3 flex items-center gap-4 px-3 py-2 rounded-xl bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-blue-600 dark:text-blue-400">Total Duration:</span>
            <span className="font-bold text-blue-900 dark:text-blue-200">
              {sessionTotals.totalDuration > 0 ? `${sessionTotals.totalDuration} min` : '—'}
            </span>
          </div>
          <div className="w-px h-4 bg-blue-200 dark:bg-blue-700" />
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-blue-600 dark:text-blue-400">Avg RPE:</span>
            <span className="font-bold text-blue-900 dark:text-blue-200">
              {sessionTotals.avgRpe !== null ? sessionTotals.avgRpe : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Distance */}
      <div>
        <label className={labelClass}>Distance (km)</label>
        <input
          type="number"
          step="0.01"
          value={distanceKm}
          onChange={(e) => setDistanceKm(e.target.value)}
          className={inputClass}
          placeholder={workout.distance_meters ? String(workout.distance_meters / 1000) : '—'}
        />
      </div>

      {/* HR / Calories */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Avg HR</label>
          <input
            type="number"
            value={avgHr}
            onChange={(e) => setAvgHr(e.target.value)}
            className={inputClass}
            placeholder="142"
          />
        </div>
        <div>
          <label className={labelClass}>Max HR</label>
          <input
            type="number"
            value={maxHr}
            onChange={(e) => setMaxHr(e.target.value)}
            className={inputClass}
            placeholder="168"
          />
        </div>
        <div>
          <label className={labelClass}>Calories</label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className={inputClass}
            placeholder="650"
          />
        </div>
      </div>

      {/* Swim-specific */}
      {sport === 'swim' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Pool Length (m)</label>
            <input
              type="number"
              value={poolLength}
              onChange={(e) => setPoolLength(e.target.value)}
              className={inputClass}
              placeholder="25"
            />
          </div>
          <div>
            <label className={labelClass}>SWOLF</label>
            <input
              type="number"
              value={swolf}
              onChange={(e) => setSwolf(e.target.value)}
              className={inputClass}
              placeholder="32"
            />
          </div>
        </div>
      )}

      {/* Bike-specific */}
      {sport === 'bike' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Avg Power (W)</label>
            <input
              type="number"
              value={avgPower}
              onChange={(e) => setAvgPower(e.target.value)}
              className={inputClass}
              placeholder="210"
            />
          </div>
          <div>
            <label className={labelClass}>Normalized Power (W)</label>
            <input
              type="number"
              value={normalizedPower}
              onChange={(e) => setNormalizedPower(e.target.value)}
              className={inputClass}
              placeholder="225"
            />
          </div>
          <div>
            <label className={labelClass}>TSS</label>
            <input
              type="number"
              value={tss}
              onChange={(e) => setTss(e.target.value)}
              className={inputClass}
              placeholder="85"
            />
          </div>
          <div>
            <label className={labelClass}>Cadence (RPM)</label>
            <input
              type="number"
              value={cadenceRpm}
              onChange={(e) => setCadenceRpm(e.target.value)}
              className={inputClass}
              placeholder="88"
            />
          </div>
          <div>
            <label className={labelClass}>Elevation (m)</label>
            <input
              type="number"
              value={elevation}
              onChange={(e) => setElevation(e.target.value)}
              className={inputClass}
              placeholder="450"
            />
          </div>
        </div>
      )}

      {/* Run-specific */}
      {sport === 'run' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Avg Pace (min/km)</label>
            <input
              type="number"
              step="0.01"
              value={paceMin}
              onChange={(e) => setPaceMin(e.target.value)}
              className={inputClass}
              placeholder="5.15"
            />
          </div>
          <div>
            <label className={labelClass}>Cadence (SPM)</label>
            <input
              type="number"
              value={cadenceSpm}
              onChange={(e) => setCadenceSpm(e.target.value)}
              className={inputClass}
              placeholder="178"
            />
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputClass} resize-none h-20`}
          placeholder="How did the session feel?"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Log Workout'}
      </button>
    </form>
  )
}
