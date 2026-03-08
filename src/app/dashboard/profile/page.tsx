'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { apiPatch } from '@/lib/api/client'
import DeviceConnectionCard from '@/components/profile/DeviceConnectionCard'
import CustomSelect from '@/components/ui/CustomSelect'
import { estimateLT, estimateMaxHRByAge, estimateMaxHRTanaka, deriveMaxHR } from '@/lib/analytics/lactate-threshold'
import { estimateLTHR } from '@/lib/analytics/race-pacing'
import type { Workout } from '@/lib/types/database'
import { useUnits } from '@/hooks/useUnits'
import {
  kgToLbs, lbsToKg,
  cmToInches, inchesToCm,
  secPerKmToSecPerMile, secPerMileToSecPerKm,
  secPer100mToSecPer100yd, secPer100ydToSecPer100m,
} from '@/lib/units'

interface ProfileData {
  display_name: string
  username: string | null
  email: string
  weight_kg: number | null
  date_of_birth: string | null
  gender: string | null
  unit_system: string
  timezone: string
  resting_heart_rate: number | null
  max_heart_rate: number | null
  ftp_watts: number | null
  threshold_pace_swim: number | null
  threshold_pace_run: number | null
  height_cm: number | null
  max_hr_source: 'none' | 'manual' | 'age_formula' | 'workout_derived'
  lthr_swim: number | null
  lthr_bike: number | null
  lthr_run: number | null
}

const INPUT_CLASS = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'
const LABEL_CLASS = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

const ZONE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#f97316', '#ef4444']
const POWER_ZONE_COLORS = ['#94a3b8', '#22c55e', '#3b82f6', '#f59e0b', '#f97316', '#ef4444', '#991b1b']
const POWER_ZONE_NAMES = ['Active Recovery', 'Endurance', 'Tempo', 'Threshold', 'VO2max', 'Anaerobic', 'Neuromuscular']

/** Format total seconds into MM:SS string for input display */
function formatPaceInput(totalSeconds: number | null): string {
  if (!totalSeconds) return ''
  const m = Math.floor(totalSeconds / 60)
  const s = Math.round(totalSeconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Auto-insert colon on 3rd digit: "130" → "1:30" */
function autoFormatPace(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, digits.length - 2)}:${digits.slice(-2)}`
}

/** Parse MM:SS string into total seconds */
function parsePaceInput(value: string): number | null {
  const parts = value.split(':').map(Number)
  if (parts.some(isNaN)) return null
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 1) return parts[0] * 60
  return null
}

function getAge(dob: string | null): number | null {
  if (!dob) return null
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}

/** Round to 1 decimal for display, strip trailing zeros */
function roundDisplay(val: number): string {
  return parseFloat(val.toFixed(1)).toString()
}

export default function ProfilePage() {
  const { setUnits: setGlobalUnits } = useUnits()
  const searchParams = useSearchParams()
  const isOnboarding = searchParams.get('onboarding') === 'true'
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [savingThresholds, setSavingThresholds] = useState(false)
  const [saveThresholdsStatus, setSaveThresholdsStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'unchanged'>('idle')
  const [originalUsername, setOriginalUsername] = useState('')
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [dobYear, setDobYear]   = useState('')
  const [dobMonth, setDobMonth] = useState('')
  const [dobDay, setDobDay]     = useState('')
  const [gender, setGender] = useState('')

  // Derived ISO string for storage/calculations (YYYY-MM-DD or '')
  const dob = dobYear && dobMonth && dobDay
    ? `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`
    : ''

  // Unit system — drives all conversions on this page
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric')
  const isImperial = unitSystem === 'imperial'

  // These store DISPLAY values in the user's chosen unit system
  const [weight, setWeight] = useState('')          // kg or lbs
  const [height, setHeight] = useState('')          // cm or inches
  const [restingHr, setRestingHr] = useState('')
  const [maxHr, setMaxHr] = useState('')
  const [ftpWatts, setFtpWatts] = useState('')
  const [swimPace, setSwimPace] = useState('')      // MM:SS in /100m or /100yd
  const [runPace, setRunPace] = useState('')         // MM:SS in /km or /mi

  // Max HR source tracking
  const [maxHrSource, setMaxHrSource] = useState<'none' | 'manual' | 'age_formula' | 'workout_derived'>('none')
  const [maxHrMethod, setMaxHrMethod] = useState<'manual' | 'age' | 'workout'>('manual')

  // Per-sport LTHR
  const [lthrSwim, setLthrSwim] = useState('')
  const [lthrBike, setLthrBike] = useState('')
  const [lthrRun, setLthrRun] = useState('')
  const [lthrOpen, setLthrOpen] = useState(false)

  // Workouts for auto-derive
  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([])

  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  // Live username availability check (debounced, skips if unchanged from saved value)
  useEffect(() => {
    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current)
    if (!username) { setUsernameStatus('idle'); return }
    if (username === originalUsername) { setUsernameStatus('unchanged'); return }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) { setUsernameStatus('invalid'); return }
    setUsernameStatus('checking')
    usernameDebounceRef.current = setTimeout(async () => {
      const { data } = await supabase.rpc('is_username_available', { p_username: username })
      setUsernameStatus(data === true ? 'available' : 'taken')
    }, 500)
    return () => { if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  /** Convert metric DB values to display values for a given unit system */
  function toDisplay(p: ProfileData, units: 'metric' | 'imperial') {
    const imp = units === 'imperial'
    setWeight(p.weight_kg != null ? roundDisplay(imp ? kgToLbs(p.weight_kg) : p.weight_kg) : '')
    setHeight(p.height_cm != null ? roundDisplay(imp ? cmToInches(p.height_cm) : p.height_cm) : '')
    setSwimPace(
      p.threshold_pace_swim != null
        ? formatPaceInput(imp ? secPer100mToSecPer100yd(p.threshold_pace_swim) : p.threshold_pace_swim)
        : ''
    )
    setRunPace(
      p.threshold_pace_run != null
        ? formatPaceInput(imp ? secPerKmToSecPerMile(p.threshold_pace_run) : p.threshold_pace_run)
        : ''
    )
  }

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('display_name, username, email, weight_kg, date_of_birth, gender, unit_system, timezone, resting_heart_rate, max_heart_rate, ftp_watts, threshold_pace_swim, threshold_pace_run, height_cm, max_hr_source, lthr_swim, lthr_bike, lthr_run')
        .eq('id', user.id)
        .single()

      if (data) {
        const p = data as ProfileData
        setProfile(p)
        setDisplayName(p.display_name || '')
        setUsername(p.username || '')
        setOriginalUsername(p.username || '')
        if (p.date_of_birth) {
          const [y, m, d] = p.date_of_birth.split('-')
          setDobYear(y || '')
          setDobMonth(m ? String(parseInt(m)) : '')
          setDobDay(d ? String(parseInt(d)) : '')
        }
        setGender(p.gender || '')
        const units = (p.unit_system || 'metric') as 'metric' | 'imperial'
        setUnitSystem(units)
        setRestingHr(p.resting_heart_rate?.toString() || '')
        setMaxHr(p.max_heart_rate?.toString() || '')
        setFtpWatts(p.ftp_watts?.toString() || '')
        setMaxHrSource(p.max_hr_source || 'none')
        if (p.max_hr_source === 'age_formula') setMaxHrMethod('age')
        else if (p.max_hr_source === 'workout_derived') setMaxHrMethod('workout')
        else setMaxHrMethod('manual')
        setLthrSwim(p.lthr_swim?.toString() || '')
        setLthrBike(p.lthr_bike?.toString() || '')
        setLthrRun(p.lthr_run?.toString() || '')
        if (p.lthr_swim || p.lthr_bike || p.lthr_run) setLthrOpen(true)
        toDisplay(p, units)
      }

      // Fetch workouts for derive features
      const { data: workouts } = await supabase
        .from('workouts')
        .select('*')
        .is('deleted_at', null)
        .order('date', { ascending: false })
        .limit(200)
      if (workouts) setUserWorkouts(workouts as Workout[])

      setLoading(false)
    }
    fetchProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** When user toggles the unit system, convert current display values in-place */
  const handleUnitToggle = (newUnits: 'metric' | 'imperial') => {
    if (newUnits === unitSystem) return
    const wasImperial = unitSystem === 'imperial'
    const nowImperial = newUnits === 'imperial'

    // Convert weight display value
    if (weight) {
      const currentVal = parseFloat(weight)
      if (!isNaN(currentVal)) {
        // Convert current display → kg → new display
        const kg = wasImperial ? lbsToKg(currentVal) : currentVal
        setWeight(roundDisplay(nowImperial ? kgToLbs(kg) : kg))
      }
    }

    // Convert height display value
    if (height) {
      const currentVal = parseFloat(height)
      if (!isNaN(currentVal)) {
        const cm = wasImperial ? inchesToCm(currentVal) : currentVal
        setHeight(roundDisplay(nowImperial ? cmToInches(cm) : cm))
      }
    }

    // Convert swim pace display value
    if (swimPace) {
      const currentSec = parsePaceInput(swimPace)
      if (currentSec != null) {
        const secPer100m = wasImperial ? secPer100ydToSecPer100m(currentSec) : currentSec
        setSwimPace(formatPaceInput(nowImperial ? secPer100mToSecPer100yd(secPer100m) : secPer100m))
      }
    }

    // Convert run pace display value
    if (runPace) {
      const currentSec = parsePaceInput(runPace)
      if (currentSec != null) {
        const secPerKm = wasImperial ? secPerMileToSecPerKm(currentSec) : currentSec
        setRunPace(formatPaceInput(nowImperial ? secPerKmToSecPerMile(secPerKm) : secPerKm))
      }
    }

    setUnitSystem(newUnits)
    setGlobalUnits(newUnits)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus('idle')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (!displayName.trim()) throw new Error('Display name is required.')

      const weightKg = weight ? (isImperial ? lbsToKg(parseFloat(weight)) : parseFloat(weight)) : null
      const heightCm = height ? (isImperial ? inchesToCm(parseFloat(height)) : parseFloat(height)) : null

      // Validate username if changed
      if (username && username !== originalUsername && usernameStatus !== 'available') {
        throw new Error('Username is not available. Please choose a different one.')
      }

      const { error } = await supabase.from('profiles').update({
        display_name: displayName || null,
        username: username || null,
        weight_kg: weightKg != null ? Math.round(weightKg * 10) / 10 : null,
        date_of_birth: dob || null,
        gender: gender || null,
        unit_system: unitSystem,
        height_cm: heightCm != null ? Math.round(heightCm * 10) / 10 : null,
      }).eq('id', user.id)

      if (error) throw error
      setOriginalUsername(username)
      setUsernameStatus(username ? 'unchanged' : 'idle')
      if (isOnboarding) {
        router.push('/dashboard')
        return
      }
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveThresholds = async () => {
    setSavingThresholds(true)
    setSaveThresholdsStatus('idle')
    try {
      const swimSec = parsePaceInput(swimPace)
      const runSec = parsePaceInput(runPace)

      await apiPatch('/api/profile', {
        resting_heart_rate: restingHr ? parseInt(restingHr) : null,
        max_heart_rate: maxHr ? parseInt(maxHr) : null,
        ftp_watts: ftpWatts ? parseInt(ftpWatts) : null,
        threshold_pace_swim: swimSec != null ? (isImperial ? secPer100ydToSecPer100m(swimSec) : swimSec) : null,
        threshold_pace_run: runSec != null ? (isImperial ? secPerMileToSecPerKm(runSec) : runSec) : null,
        max_hr_source: maxHrSource,
        lthr_swim: lthrSwim ? parseInt(lthrSwim) : null,
        lthr_bike: lthrBike ? parseInt(lthrBike) : null,
        lthr_run: lthrRun ? parseInt(lthrRun) : null,
      })
      setSaveThresholdsStatus('saved')
      setTimeout(() => setSaveThresholdsStatus('idle'), 2500)
    } catch {
      setSaveThresholdsStatus('error')
      setTimeout(() => setSaveThresholdsStatus('idle'), 3000)
    } finally {
      setSavingThresholds(false)
    }
  }

  const handleEstimateMaxHR = () => {
    const age = getAge(dob)
    if (age) {
      setMaxHr(estimateMaxHRByAge(age).toString())
      setMaxHrSource('age_formula')
    }
  }

  const handleEstimateMaxHRTanaka = () => {
    const age = getAge(dob)
    if (age) {
      setMaxHr(estimateMaxHRTanaka(age).toString())
      setMaxHrSource('age_formula')
    }
  }

  const handleDeriveMaxHR = () => {
    const derived = deriveMaxHR(userWorkouts)
    if (derived) {
      setMaxHr(derived.toString())
      setMaxHrSource('workout_derived')
    }
  }

  const handleAutoLTHR = (sport: 'swim' | 'bike' | 'run') => {
    const lthr = estimateLTHR(userWorkouts, sport)
    if (lthr) {
      if (sport === 'swim') setLthrSwim(lthr.toString())
      else if (sport === 'bike') setLthrBike(lthr.toString())
      else setLthrRun(lthr.toString())
    }
  }

  const derivedMaxHR = useMemo(() => deriveMaxHR(userWorkouts), [userWorkouts])
  const workoutsWithHR = useMemo(() => userWorkouts.filter((w) => w.max_hr).length, [userWorkouts])

  // Live HR zone preview
  const hrZonePreview = useMemo(() => {
    const rhr = parseInt(restingHr)
    const mhr = parseInt(maxHr)
    if (!rhr || !mhr || rhr >= mhr) return null
    return estimateLT(mhr, rhr)
  }, [restingHr, maxHr])

  // Live power zone preview (Coggan 7-zone)
  const powerZonePreview = useMemo(() => {
    const ftp = parseInt(ftpWatts)
    if (!ftp || ftp <= 0) return null
    return [
      { zone: 1, name: 'Active Recovery', min: 0, max: Math.round(ftp * 0.55) },
      { zone: 2, name: 'Endurance', min: Math.round(ftp * 0.56), max: Math.round(ftp * 0.75) },
      { zone: 3, name: 'Tempo', min: Math.round(ftp * 0.76), max: Math.round(ftp * 0.90) },
      { zone: 4, name: 'Threshold', min: Math.round(ftp * 0.91), max: Math.round(ftp * 1.05) },
      { zone: 5, name: 'VO2max', min: Math.round(ftp * 1.06), max: Math.round(ftp * 1.20) },
      { zone: 6, name: 'Anaerobic', min: Math.round(ftp * 1.21), max: Math.round(ftp * 1.50) },
      { zone: 7, name: 'Neuromuscular', min: Math.round(ftp * 1.51), max: 9999 },
    ]
  }, [ftpWatts])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {isOnboarding && (
        <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 px-5 py-4">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">One last step — set up your profile</p>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5">
            Add your name and a few details so we can personalize your predictions. Hit Save when you're done.
          </p>
        </div>
      )}

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
          Profile
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Athlete Profile
        </h1>
      </div>

      {/* Unit System Toggle — prominent at the top */}
      <div className="card-squircle p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Measurement System</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {isImperial ? 'Miles, lbs, inches, ft' : 'Kilometers, kg, cm, meters'}
            </p>
          </div>
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 sm:shrink-0">
            <button
              onClick={() => handleUnitToggle('metric')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                !isImperial
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Metric
            </button>
            <button
              onClick={() => handleUnitToggle('imperial')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                isImperial
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Imperial
            </button>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="card-squircle p-6 sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-4">
          Personal Information
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={LABEL_CLASS}>Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={INPUT_CLASS} maxLength={50} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500 pointer-events-none">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className={`${INPUT_CLASS} pl-8 pr-10`}
                placeholder="yourhandle"
                maxLength={20}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                {usernameStatus === 'checking' && <span className="text-gray-400 animate-pulse">…</span>}
                {(usernameStatus === 'available') && <span className="text-green-500">✓</span>}
                {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <span className="text-red-500">✗</span>}
              </div>
            </div>
            {usernameStatus === 'invalid' && <p className="text-xs text-red-500 mt-1">3–20 chars, lowercase letters, numbers, underscores only</p>}
            {usernameStatus === 'taken' && <p className="text-xs text-red-500 mt-1">That username is already taken</p>}
            {usernameStatus === 'available' && <p className="text-xs text-green-500 mt-1">@{username} is available</p>}
          </div>
          <div>
            <label className={LABEL_CLASS}>Email</label>
            <input type="email" value={profile?.email || ''} disabled className={`${INPUT_CLASS} opacity-50`} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Weight ({isImperial ? 'lbs' : 'kg'})</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={INPUT_CLASS}
              placeholder={isImperial ? '165' : '75'}
              step="0.1"
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Height</label>
            {isImperial ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    value={height ? String(Math.floor(parseFloat(height) / 12)) : ''}
                    onChange={(e) => {
                      const ft = parseInt(e.target.value) || 0
                      const inches = height ? Math.round(parseFloat(height) % 12) : 0
                      setHeight(String(ft * 12 + inches))
                    }}
                    className={INPUT_CLASS}
                    placeholder="5"
                    min="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">ft</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={height ? String(Math.round(parseFloat(height) % 12)) : ''}
                    onChange={(e) => {
                      const inches = parseInt(e.target.value) || 0
                      const ft = height ? Math.floor(parseFloat(height) / 12) : 0
                      setHeight(String(ft * 12 + inches))
                    }}
                    className={INPUT_CLASS}
                    placeholder="11"
                    min="0"
                    max="11"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">in</span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="175"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">cm</span>
              </div>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS}>Date of Birth</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <CustomSelect
                value={dobMonth}
                onChange={setDobMonth}
                placeholder="Month"
                className="col-span-2 sm:col-span-1"
                options={['January','February','March','April','May','June','July','August','September','October','November','December'].map((name, i) => ({ value: String(i + 1), label: name }))}
              />
              <CustomSelect
                value={dobDay}
                onChange={setDobDay}
                placeholder="Day"
                options={Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
              />
              <CustomSelect
                value={dobYear}
                onChange={setDobYear}
                placeholder="Year"
                options={Array.from({ length: 85 }, (_, i) => { const y = new Date().getFullYear() - 16 - i; return { value: String(y), label: String(y) } })}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Gender</label>
            <CustomSelect
              value={gender}
              onChange={setGender}
              placeholder="Not set"
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'non_binary', label: 'Non-binary' },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer ${
              saveStatus === 'saved'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : saveStatus === 'error'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {saving ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? 'Error — try again' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Training Thresholds */}
      <div className="card-squircle p-6 sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-4">
          Training Thresholds
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={LABEL_CLASS}>Resting HR (bpm)</label>
            <input type="number" value={restingHr} onChange={(e) => setRestingHr(e.target.value)} className={INPUT_CLASS} placeholder="55" />
          </div>
          <div className="col-span-2">
            <label className={LABEL_CLASS}>Max HR (bpm)</label>
            {/* 3-path selection */}
            <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-3">
              {[
                { key: 'manual' as const, label: 'Known' },
                { key: 'age' as const, label: 'Estimate' },
                { key: 'workout' as const, label: 'From Workouts' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setMaxHrMethod(key)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    maxHrMethod === key
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {maxHrMethod === 'manual' && (
              <input
                type="number"
                value={maxHr}
                onChange={(e) => { setMaxHr(e.target.value); setMaxHrSource('manual') }}
                className={INPUT_CLASS}
                placeholder="185"
              />
            )}

            {maxHrMethod === 'age' && (
              <div className="space-y-2">
                {dob ? (
                  <>
                    <div className="flex gap-2">
                      <button
                        onClick={handleEstimateMaxHRTanaka}
                        className="flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold border border-blue-200 dark:border-blue-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer"
                      >
                        Tanaka: {estimateMaxHRTanaka(getAge(dob)!)} bpm
                        <span className="block text-[11px] text-gray-400 font-normal mt-0.5">208 - 0.7 x age (recommended)</span>
                      </button>
                      <button
                        onClick={handleEstimateMaxHR}
                        className="flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
                      >
                        Classic: {estimateMaxHRByAge(getAge(dob)!)} bpm
                        <span className="block text-[11px] text-gray-400 font-normal mt-0.5">220 - age</span>
                      </button>
                    </div>
                    {maxHr && maxHrSource === 'age_formula' && (
                      <p className="text-xs text-green-600 dark:text-green-400">Using estimate: {maxHr} bpm</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Set your date of birth above to estimate Max HR</p>
                )}
              </div>
            )}

            {maxHrMethod === 'workout' && (
              <div className="space-y-2">
                {derivedMaxHR ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{derivedMaxHR} bpm</span>
                      <span className="text-xs text-gray-400">Based on {workoutsWithHR} workouts</span>
                    </div>
                    <button
                      onClick={handleDeriveMaxHR}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-all cursor-pointer"
                    >
                      Use This Value
                    </button>
                    {maxHrSource === 'workout_derived' && maxHr === derivedMaxHR.toString() && (
                      <p className="text-xs text-green-600 dark:text-green-400">Applied from workouts</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-400">No workouts with max HR data found. Log workouts with a heart rate monitor to auto-detect.</p>
                )}
              </div>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS}>FTP (watts)</label>
            <input type="number" value={ftpWatts} onChange={(e) => setFtpWatts(e.target.value)} className={INPUT_CLASS} placeholder="250" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Swim Threshold (MM:SS{isImperial ? '/100yd' : '/100m'})</label>
            <input type="text" value={swimPace} onChange={(e) => setSwimPace(autoFormatPace(e.target.value))} className={INPUT_CLASS} placeholder="1:45" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Run Threshold (MM:SS{isImperial ? '/mi' : '/km'})</label>
            <input type="text" value={runPace} onChange={(e) => setRunPace(autoFormatPace(e.target.value))} className={INPUT_CLASS} placeholder={isImperial ? '8:00' : '5:00'} />
          </div>
        </div>

        {/* Per-Sport LTHR */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setLthrOpen(!lthrOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer mb-2"
          >
            <svg className={`w-3 h-3 transition-transform ${lthrOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            Lactate Threshold HR (per sport)
          </button>
          {lthrOpen && (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-3">
              <p className="text-[10px] text-gray-400 dark:text-gray-500">From a 30-minute time trial or field test</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  { sport: 'swim' as const, label: 'Swim LTHR', value: lthrSwim, setter: setLthrSwim },
                  { sport: 'bike' as const, label: 'Bike LTHR', value: lthrBike, setter: setLthrBike },
                  { sport: 'run' as const, label: 'Run LTHR', value: lthrRun, setter: setLthrRun },
                ]).map(({ sport, label, value, setter }) => (
                  <div key={sport}>
                    <label className={LABEL_CLASS}>{label}</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className={INPUT_CLASS}
                      placeholder="165"
                    />
                    <button
                      onClick={() => handleAutoLTHR(sport)}
                      className="mt-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                    >
                      Auto-estimate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* HR Zone Preview */}
        {hrZonePreview && (
          <div className="mb-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">HR Zones Preview</p>
            <div className="space-y-1.5">
              {hrZonePreview.zones.map((z, i) => (
                <div key={z.zone} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ZONE_COLORS[i] }} />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-20">Z{z.zone} {z.name}</span>
                  <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ backgroundColor: ZONE_COLORS[i], width: '100%' }} />
                  </div>
                  <span className="text-[10px] text-gray-400 w-24 text-right">{z.minHR}–{z.maxHR} bpm</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Power Zone Preview */}
        {powerZonePreview && (
          <div className="mb-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Power Zones Preview (Coggan)</p>
            <div className="space-y-1.5">
              {powerZonePreview.map((z, i) => (
                <div key={z.zone} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: POWER_ZONE_COLORS[i] }} />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-28">Z{z.zone} {POWER_ZONE_NAMES[i]}</span>
                  <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ backgroundColor: POWER_ZONE_COLORS[i], width: '100%' }} />
                  </div>
                  <span className="text-[10px] text-gray-400 w-24 text-right">
                    {z.min}–{z.max > 9000 ? '∞' : z.max}W
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveThresholds}
            disabled={savingThresholds}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer ${
              saveThresholdsStatus === 'saved'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : saveThresholdsStatus === 'error'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {savingThresholds ? 'Saving…' : saveThresholdsStatus === 'saved' ? '✓ Saved' : saveThresholdsStatus === 'error' ? 'Error — try again' : 'Save Thresholds'}
          </button>
        </div>
      </div>

      {/* Devices */}
      <DeviceConnectionCard />

      {/* Privacy & Data */}
      <div className="card-squircle p-5">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
          Privacy & Data
        </p>
        <Link
          href="/dashboard/account/privacy"
          className="flex items-center justify-between group"
        >
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Data & Account Management
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Export your data or delete your account
            </p>
          </div>
          <span className="text-[10px] font-semibold text-blue-500 group-hover:text-blue-600 transition-colors">
            Manage →
          </span>
        </Link>
      </div>

      {/* Sign out — mobile only (desktop has it in the sidebar) */}
      <button
        onClick={handleSignOut}
        className="lg:hidden flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  )
}
