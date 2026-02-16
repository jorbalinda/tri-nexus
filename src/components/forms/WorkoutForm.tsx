'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'

type Sport = 'swim' | 'bike' | 'run' | 'brick'

export default function WorkoutForm() {
  const [sport, setSport] = useState<Sport>('swim')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [durationMin, setDurationMin] = useState('')
  const [distanceKm, setDistanceKm] = useState('')
  const [avgHr, setAvgHr] = useState('')
  const [maxHr, setMaxHr] = useState('')
  const [rpe, setRpe] = useState('')
  const [calories, setCalories] = useState('')
  const [notes, setNotes] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    const { error } = await supabase.from('workouts').insert({
      sport,
      title: title || `${sport} workout`,
      date,
      duration_seconds: durationMin ? Number(durationMin) * 60 : null,
      distance_meters: distanceKm ? Number(distanceKm) * 1000 : null,
      avg_hr: avgHr ? Number(avgHr) : null,
      max_hr: maxHr ? Number(maxHr) : null,
      rpe: rpe ? Number(rpe) : null,
      calories: calories ? Number(calories) : null,
      notes: notes || null,
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
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const sportButtons: { key: Sport; label: string; color: string }[] = [
    { key: 'swim', label: 'Swim', color: 'blue' },
    { key: 'bike', label: 'Bike', color: 'orange' },
    { key: 'run', label: 'Run', color: 'green' },
    { key: 'brick', label: 'Brick', color: 'purple' },
  ]

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'
  const labelClass = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
          Log Workout
        </p>

        {/* Sport selector */}
        <div className="flex gap-2">
          {sportButtons.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSport(key)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                sport === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Common fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Morning swim"
            />
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Duration (min)</label>
            <input
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className={inputClass}
              placeholder="60"
            />
          </div>
          <div>
            <label className={labelClass}>Distance (km)</label>
            <input
              type="number"
              step="0.01"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              className={inputClass}
              placeholder="3.8"
            />
          </div>
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
            <label className={labelClass}>RPE (1-10)</label>
            <input
              type="number"
              min={1}
              max={10}
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
              className={inputClass}
              placeholder="6"
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

        {/* Sport-specific fields */}
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

        {(sport === 'bike' || sport === 'brick') && (
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

        {(sport === 'run' || sport === 'brick') && (
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
    </Card>
  )
}
