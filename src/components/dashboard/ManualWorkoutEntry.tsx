'use client'

import { useState, useEffect } from 'react'
import { Plus, X, ChevronRight, ChevronLeft, Waves, Bike, Footprints, Zap } from 'lucide-react'
import { apiPost, apiPatch } from '@/lib/api/client'
import { useUnits } from '@/hooks/useUnits'
import { inputDistanceToMeters, feetToMeters, distanceInputLabel, elevationLabel, secPerKmToSecPerMile, secPerMileToSecPerKm, secPer100mToSecPer100yd, secPer100ydToSecPer100m } from '@/lib/units'
import type { UnitSystem } from '@/lib/units'

function formatPace(sec: number | null): string {
  if (!sec) return ''
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function parsePace(val: string): number | null {
  const parts = val.split(':').map(Number)
  if (parts.some(isNaN) || parts.length < 1) return null
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0] * 60
}

interface ManualWorkoutEntryProps {
  onSaved: () => void
}

const INPUT_CLASS = 'w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all'
const LABEL_CLASS = 'block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1'

type Sport = 'swim' | 'bike' | 'run' | 'threshold'

export default function ManualWorkoutEntry({ onSaved }: ManualWorkoutEntryProps) {
  const { isImperial } = useUnits()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  // Local unit toggle — defaults from profile, can be changed per-workout
  const [localUnits, setLocalUnits] = useState<UnitSystem>(isImperial ? 'imperial' : 'metric')
  const localImperial = localUnits === 'imperial'
  // Step 1: Sport
  const [sport, setSport] = useState<Sport>('run')
  // Step 2: Core details
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [durationH, setDurationH] = useState('')
  const [durationM, setDurationM] = useState('')
  const [distance, setDistance] = useState('')
  // Step 3: Performance metrics
  const [avgHr, setAvgHr] = useState('')
  const [maxHr, setMaxHr] = useState('')
  const [avgPower, setAvgPower] = useState('')
  const [cadence, setCadence] = useState('')
  const [elevation, setElevation] = useState('')
  const [tss, setTss] = useState('')
  const [rpe, setRpe] = useState('')
  const [calories, setCalories] = useState('')
  // Threshold test fields
  const [threshFtp, setThreshFtp] = useState('')
  const [threshCss, setThreshCss] = useState('')
  const [threshRun, setThreshRun] = useState('')
  // Sync local units when profile preference changes
  useEffect(() => {
    setLocalUnits(isImperial ? 'imperial' : 'metric')
  }, [isImperial])

  const resetForm = () => {
    setStep(1)
    setSport('run')
    setTitle('')
    setDate(new Date().toISOString().split('T')[0])
    setDurationH('')
    setDurationM('')
    setDistance('')
    setAvgHr('')
    setMaxHr('')
    setAvgPower('')
    setCadence('')
    setElevation('')
    setTss('')
    setRpe('')
    setCalories('')
    setThreshFtp('')
    setThreshCss('')
    setThreshRun('')
  }

  const handleSave = async () => {
    setSaving(true)

    if (sport === 'threshold') {
      const rawCss = parsePace(threshCss)
      const rawRun = parsePace(threshRun)
      try {
        await apiPatch('/api/profile', {
          ...(threshFtp && { ftp_watts: parseInt(threshFtp) }),
          ...(rawCss !== null && { threshold_pace_swim: localImperial ? secPer100ydToSecPer100m(rawCss) : rawCss }),
          ...(rawRun !== null && { threshold_pace_run: localImperial ? secPerMileToSecPerKm(rawRun) : rawRun }),
        })
        setOpen(false)
        resetForm()
        onSaved()
      } catch { /* ignore */ }
      setSaving(false)
      return
    }

    const h = parseInt(durationH || '0')
    const m = parseInt(durationM || '0')
    const durationSeconds = h * 3600 + m * 60 || null
    const distanceMeters = distance
      ? inputDistanceToMeters(parseFloat(distance), sport, localUnits)
      : null

    try {
      await apiPost('/api/workouts', {
        sport,
        title: title || `${sport.charAt(0).toUpperCase() + sport.slice(1)} Workout`,
        date,
        duration_seconds: durationSeconds,
        distance_meters: distanceMeters,
        avg_hr: avgHr ? parseInt(avgHr) : null,
        max_hr: maxHr ? parseInt(maxHr) : null,
        avg_power_watts: avgPower ? parseInt(avgPower) : null,
        avg_cadence_rpm: sport === 'bike' && cadence ? parseInt(cadence) : null,
        avg_cadence_spm: sport === 'run' && cadence ? parseInt(cadence) : null,
        elevation_gain_meters: elevation ? (localImperial ? feetToMeters(parseFloat(elevation)) : parseFloat(elevation)) : null,
        tss: tss ? parseFloat(tss) : null,
        rpe: rpe ? parseFloat(rpe) : null,
        calories: calories ? parseInt(calories) : null,
      })
      setOpen(false)
      resetForm()
      onSaved()
    } catch { /* ignore */ }
    setSaving(false)
  }

  const distLabel = distanceInputLabel(sport, localUnits)
  const elevLabel = elevationLabel(localUnits)
  const distPlaceholder = sport === 'swim'
    ? (localImperial ? '2200' : '2000')
    : (localImperial ? '6' : '10')

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="card-squircle p-5 flex flex-col w-full cursor-pointer group hover:shadow-md transition-all text-left"
      >
        <div className="flex items-center gap-2 mb-4">
          <Plus size={16} className="text-blue-600" />
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
            Add Workout
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center transition-all shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/30">
            <Plus size={24} className="text-white" />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Log a manual workout</p>
        </div>

        <div className="flex justify-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-[10px] font-medium text-blue-500 flex items-center gap-1"><Waves size={12} /> Swim</span>
          <span className="text-[10px] font-medium text-orange-500 flex items-center gap-1"><Bike size={12} /> Bike</span>
          <span className="text-[10px] font-medium text-green-500 flex items-center gap-1"><Footprints size={12} /> Run</span>
          <span className="text-[10px] font-medium text-purple-500 flex items-center gap-1"><Zap size={12} /> Threshold</span>
        </div>
      </button>
    )
  }

  return (
    <div className="card-squircle p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {sport === 'threshold' ? 'Log Threshold Test' : `Log Workout${step > 1 ? ` (${step}/3)` : ''}`}
        </h3>
        <button onClick={() => { setOpen(false); resetForm() }} className="p-1 cursor-pointer">
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Step 1: Sport Selection */}
      {step === 1 && (
        <>
          <div className="mb-4">
            <label className={LABEL_CLASS}>Type</label>
            <div className="grid grid-cols-2 gap-1">
              {(['swim', 'bike', 'run', 'threshold'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSport(s)}
                  className={`px-2 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    sport === s
                      ? s === 'threshold' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {s === 'swim' && <Waves size={12} />}
                  {s === 'bike' && <Bike size={12} />}
                  {s === 'run' && <Footprints size={12} />}
                  {s === 'threshold' && <Zap size={12} />}
                  {s.charAt(0).toUpperCase() + s.slice(1)} {s === 'threshold' ? 'Test' : ''}
                </button>
              ))}
            </div>
            {sport === 'threshold' && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                Log FTP, CSS, or run threshold pace. Saves directly to your profile.
              </p>
            )}
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full flex items-center justify-center gap-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all cursor-pointer"
          >
            Next <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Step 2: Threshold Test */}
      {step === 2 && sport === 'threshold' && (
        <>
          <div className="space-y-3 mb-4">
            <div>
              <label className={LABEL_CLASS}><span className="text-orange-500">⚡</span> FTP (watts)</label>
              <input type="number" value={threshFtp} onChange={(e) => setThreshFtp(e.target.value)} className={INPUT_CLASS} placeholder="e.g. 220" />
            </div>
            <div>
              <label className={LABEL_CLASS}><span className="text-blue-500">🏊</span> CSS (min:sec / 100{localImperial ? 'yd' : 'm'})</label>
              <input type="text" value={threshCss} onChange={(e) => setThreshCss(e.target.value)} className={INPUT_CLASS} placeholder="e.g. 1:45" />
            </div>
            <div>
              <label className={LABEL_CLASS}><span className="text-green-500">🏃</span> Run Threshold (min:sec / {localImperial ? 'mile' : 'km'})</label>
              <input type="text" value={threshRun} onChange={(e) => setThreshRun(e.target.value)} className={INPUT_CLASS} placeholder={localImperial ? 'e.g. 8:30' : 'e.g. 5:15'} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving || (!threshFtp && !threshCss && !threshRun)}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving…' : 'Save Thresholds'}
            </button>
          </div>
        </>
      )}

      {/* Step 2: Core Details */}
      {step === 2 && sport !== 'threshold' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 min-w-0">
            <div className="col-span-full">
              <label className={LABEL_CLASS}>Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT_CLASS} placeholder={`${sport.charAt(0).toUpperCase() + sport.slice(1)} Workout`} maxLength={100} />
            </div>
            <div className="col-span-full">
              <label className={LABEL_CLASS}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${INPUT_CLASS} appearance-none`} />
            </div>
            <div className="col-span-full">
              <label className={LABEL_CLASS}>Duration</label>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="0" max="23"
                  value={durationH}
                  onChange={(e) => setDurationH(e.target.value)}
                  className={`${INPUT_CLASS} text-center`}
                  placeholder="0"
                />
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500 shrink-0">h</span>
                <input
                  type="number" min="0" max="59"
                  value={durationM}
                  onChange={(e) => setDurationM(e.target.value)}
                  className={`${INPUT_CLASS} text-center`}
                  placeholder="00"
                />
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500 shrink-0">m</span>
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Distance</label>
              <div className="flex items-center gap-1.5">
                <input type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} className={`${INPUT_CLASS} flex-1 min-w-0`} placeholder={distPlaceholder} />
                {sport === 'swim' ? (
                  <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5 shrink-0">
                    <button onClick={() => setLocalUnits('metric')} className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${!localImperial ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-400 dark:text-gray-500'}`}>m</button>
                    <button onClick={() => setLocalUnits('imperial')} className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${localImperial ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-400 dark:text-gray-500'}`}>yd</button>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500 shrink-0">{distLabel}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all cursor-pointer"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}

      {/* Step 3: Performance Metrics + Save */}
      {step === 3 && sport !== 'threshold' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className={LABEL_CLASS}>Avg HR (bpm)</label>
              <input type="number" value={avgHr} onChange={(e) => setAvgHr(e.target.value)} className={INPUT_CLASS} placeholder="145" />
            </div>
            <div>
              <label className={LABEL_CLASS}>Max HR (bpm)</label>
              <input type="number" value={maxHr} onChange={(e) => setMaxHr(e.target.value)} className={INPUT_CLASS} placeholder="175" />
            </div>
            {(sport === 'bike') && (
              <div>
                <label className={LABEL_CLASS}>Avg Power (W)</label>
                <input type="number" value={avgPower} onChange={(e) => setAvgPower(e.target.value)} className={INPUT_CLASS} placeholder="200" />
              </div>
            )}
            <div>
              <label className={LABEL_CLASS}>Cadence ({sport === 'bike' ? 'rpm' : 'spm'})</label>
              <input type="number" value={cadence} onChange={(e) => setCadence(e.target.value)} className={INPUT_CLASS} placeholder={sport === 'bike' ? '85' : '170'} />
            </div>
            {sport !== 'swim' && (
              <div>
                <label className={LABEL_CLASS}>Elevation ({elevLabel})</label>
                <input type="number" value={elevation} onChange={(e) => setElevation(e.target.value)} className={INPUT_CLASS} placeholder={localImperial ? '1500' : '500'} />
              </div>
            )}
            <div>
              <label className={LABEL_CLASS}>TSS</label>
              <input type="number" value={tss} onChange={(e) => setTss(e.target.value)} className={INPUT_CLASS} placeholder="65" />
            </div>
            <div>
              <label className={LABEL_CLASS}>RPE (1-10)</label>
              <input type="number" min="1" max="10" value={rpe} onChange={(e) => setRpe(e.target.value)} className={INPUT_CLASS} placeholder="7" />
            </div>
            <div>
              <label className={LABEL_CLASS}>Calories</label>
              <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} className={INPUT_CLASS} placeholder="600" />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Workout'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
