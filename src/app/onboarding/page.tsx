'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Waves,
  Bike,
  Footprints,
  ChevronRight,
  ChevronLeft,
  Watch,
  Upload,
  Target,
  Trophy,
  Flag,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RaceDistance = 'sprint' | 'olympic' | '70.3' | '140.6'
type GoalType = 'finish' | 'pr' | 'qualify'
type Device = 'garmin' | 'wahoo' | 'coros' | 'polar' | 'apple_watch' | 'none'

interface OnboardingData {
  // Step 1
  raceDistance: RaceDistance | null
  raceDate: string
  goal: GoalType | null
  // Step 2
  recentRaceHours: string
  recentRaceMinutes: string
  recentRaceDistance: RaceDistance | null
  swimPaceMin: string
  swimPaceSec: string
  bikeFtp: string
  runPaceMin: string
  runPaceSec: string
  weeklyHours: string
  weight: string
  // Step 3
  devices: Device[]
}

const INITIAL_DATA: OnboardingData = {
  raceDistance: null,
  raceDate: '',
  goal: null,
  recentRaceHours: '',
  recentRaceMinutes: '',
  recentRaceDistance: null,
  swimPaceMin: '',
  swimPaceSec: '',
  bikeFtp: '',
  runPaceMin: '',
  runPaceSec: '',
  weeklyHours: '',
  weight: '',
  devices: [],
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RACE_DISTANCES: { value: RaceDistance; label: string; sub: string }[] = [
  { value: 'sprint', label: 'Sprint', sub: '750m / 20km / 5km' },
  { value: 'olympic', label: 'Olympic', sub: '1.5km / 40km / 10km' },
  { value: '70.3', label: '70.3', sub: '1.9km / 90km / 21.1km' },
  { value: '140.6', label: '140.6', sub: '3.8km / 180km / 42.2km' },
]

const GOALS: { value: GoalType; label: string; desc: string; icon: typeof Flag }[] = [
  { value: 'finish', label: 'Finish', desc: 'Cross the line', icon: Flag },
  { value: 'pr', label: 'PR', desc: 'Personal record', icon: Trophy },
  { value: 'qualify', label: 'Qualify', desc: 'Hit a standard', icon: Target },
]

const DEVICES: { value: Device; label: string }[] = [
  { value: 'garmin', label: 'Garmin' },
  { value: 'wahoo', label: 'Wahoo' },
  { value: 'coros', label: 'COROS' },
  { value: 'polar', label: 'Polar' },
  { value: 'apple_watch', label: 'Apple Watch' },
  { value: 'none', label: 'None' },
]

const DEVICE_TIPS: Record<Device, string> = {
  garmin:
    'Connect your Garmin account via Garmin Connect, or export .FIT files from Garmin Connect web and upload them on the Log page.',
  wahoo:
    'Export .FIT files from the Wahoo app (Workout History > Share > Export FIT) and upload them on the Log page.',
  coros:
    'Export .FIT files from the COROS app or COROS Training Hub and upload them on the Log page.',
  polar:
    'Export workouts from Polar Flow (Training > export) as .TCX or .FIT files, then upload on the Log page.',
  apple_watch:
    'Use a third-party app like HealthFit or RunGap to export Apple Health workouts as .FIT files, then upload on the Log page.',
  none:
    'No worries! You can manually log your workouts directly in the app and still get full race-day analytics.',
}

// ---------------------------------------------------------------------------
// Shared style constants
// ---------------------------------------------------------------------------

const INPUT_CLASS =
  'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'

const LABEL_CLASS =
  'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA)
  const [transitioning, setTransitioning] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [visible, setVisible] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const containerRef = useRef<HTMLDivElement>(null)

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tri-nexus-onboarding')
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<OnboardingData>
        setData((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist to localStorage on every data change
  useEffect(() => {
    localStorage.setItem('tri-nexus-onboarding', JSON.stringify(data))
  }, [data])

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const update = useCallback(
    <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const canAdvance = useCallback(() => {
    if (step === 1) return data.raceDistance !== null && data.goal !== null
    return true // Step 2 and 3 are fully optional
  }, [step, data.raceDistance, data.goal])

  const animateTransition = useCallback(
    (newStep: number) => {
      if (transitioning) return
      setDirection(newStep > step ? 'forward' : 'backward')
      setTransitioning(true)
      setVisible(false)

      setTimeout(() => {
        setStep(newStep)
        setVisible(true)
        setTimeout(() => setTransitioning(false), 300)
      }, 200)
    },
    [step, transitioning]
  )

  const handleNext = useCallback(() => {
    if (!canAdvance()) return
    if (step < 3) {
      animateTransition(step + 1)
    }
  }, [step, canAdvance, animateTransition])

  const handleBack = useCallback(() => {
    if (step > 1) {
      animateTransition(step - 1)
    }
  }, [step, animateTransition])

  const handleComplete = useCallback(async () => {
    // Persist final state
    localStorage.setItem('tri-nexus-onboarding', JSON.stringify(data))

    // Attempt to mark onboarding as completed in Supabase profile
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.auth.updateUser({
          data: { onboarding_completed: true },
        })
      }
    } catch {
      // Not critical -- data is already in localStorage
    }

    // Redirect to the race-day dashboard so the user can create their first race plan
    router.push('/dashboard/race-day')
    router.refresh()
  }, [data, supabase, router])

  // Toggle device selection (multi-select, but "none" is exclusive)
  const toggleDevice = useCallback(
    (device: Device) => {
      setData((prev) => {
        let next: Device[]
        if (device === 'none') {
          next = prev.devices.includes('none') ? [] : ['none']
        } else {
          const without = prev.devices.filter((d) => d !== 'none')
          next = without.includes(device)
            ? without.filter((d) => d !== device)
            : [...without, device]
        }
        return { ...prev, devices: next }
      })
    },
    []
  )

  // ---------------------------------------------------------------------------
  // Step renderers
  // ---------------------------------------------------------------------------

  const renderStep1 = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          What&apos;s your next race?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          We&apos;ll use this to start building your personalized race plan.
        </p>
      </div>

      {/* Race distance */}
      <div>
        <label className={LABEL_CLASS}>Race Distance</label>
        <div className="grid grid-cols-2 gap-3">
          {RACE_DISTANCES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => update('raceDistance', d.value)}
              className={`px-4 py-4 rounded-xl border text-left transition-all cursor-pointer ${
                data.raceDistance === d.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                {d.label}
              </span>
              <span className="block text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                {d.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Race date */}
      <div>
        <label className={LABEL_CLASS}>Approximate Race Date</label>
        <input
          type="date"
          value={data.raceDate}
          onChange={(e) => update('raceDate', e.target.value)}
          className={INPUT_CLASS}
        />
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Optional</p>
      </div>

      {/* Goal */}
      <div>
        <label className={LABEL_CLASS}>Goal</label>
        <div className="grid grid-cols-3 gap-3">
          {GOALS.map((g) => {
            const Icon = g.icon
            return (
              <button
                key={g.value}
                type="button"
                onClick={() => update('goal', g.value)}
                className={`flex flex-col items-center gap-2 px-4 py-5 rounded-xl border transition-all cursor-pointer ${
                  data.goal === g.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon
                  size={20}
                  className={
                    data.goal === g.value
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {g.label}
                </span>
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  {g.desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Tell us about your current fitness
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          All fields are optional. Fill in what you know and we&apos;ll estimate the rest.
        </p>
      </div>

      {/* Recent race time */}
      <div>
        <label className={LABEL_CLASS}>Recent Race Time</label>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">
          If you&apos;ve done a triathlon recently, enter your finish time.
        </p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <input
              type="number"
              min="0"
              max="30"
              placeholder="Hours"
              value={data.recentRaceHours}
              onChange={(e) => update('recentRaceHours', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">h</span>
          <div className="flex-1">
            <input
              type="number"
              min="0"
              max="59"
              placeholder="Minutes"
              value={data.recentRaceMinutes}
              onChange={(e) => update('recentRaceMinutes', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">m</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {RACE_DISTANCES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => update('recentRaceDistance', d.value)}
              className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                data.recentRaceDistance === d.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Swim pace */}
      <div>
        <label className={LABEL_CLASS}>Swim Pace (per 100m)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="9"
            placeholder="MM"
            value={data.swimPaceMin}
            onChange={(e) => update('swimPaceMin', e.target.value)}
            className={INPUT_CLASS}
          />
          <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">:</span>
          <input
            type="number"
            min="0"
            max="59"
            placeholder="SS"
            value={data.swimPaceSec}
            onChange={(e) => update('swimPaceSec', e.target.value)}
            className={INPUT_CLASS}
          />
          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">/ 100m</span>
        </div>
      </div>

      {/* Bike FTP */}
      <div>
        <label className={LABEL_CLASS}>Bike FTP</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="50"
            max="500"
            placeholder="e.g. 220"
            value={data.bikeFtp}
            onChange={(e) => update('bikeFtp', e.target.value)}
            className={INPUT_CLASS}
          />
          <span className="text-xs text-gray-400 dark:text-gray-500">watts</span>
        </div>
      </div>

      {/* Run pace */}
      <div>
        <label className={LABEL_CLASS}>Run Pace (per km)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="2"
            max="15"
            placeholder="MM"
            value={data.runPaceMin}
            onChange={(e) => update('runPaceMin', e.target.value)}
            className={INPUT_CLASS}
          />
          <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">:</span>
          <input
            type="number"
            min="0"
            max="59"
            placeholder="SS"
            value={data.runPaceSec}
            onChange={(e) => update('runPaceSec', e.target.value)}
            className={INPUT_CLASS}
          />
          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">/ km</span>
        </div>
      </div>

      {/* Weekly hours & weight row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Weekly Training Hours</label>
          <input
            type="number"
            min="1"
            max="30"
            placeholder="e.g. 10"
            value={data.weeklyHours}
            onChange={(e) => update('weeklyHours', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Weight</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="30"
              max="200"
              placeholder="e.g. 75"
              value={data.weight}
              onChange={(e) => update('weight', e.target.value)}
              className={INPUT_CLASS}
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">kg</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          How do you track?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select the devices you use so we can help you get your data in.
        </p>
      </div>

      {/* Device selection */}
      <div>
        <label className={LABEL_CLASS}>Your Devices</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DEVICES.map((d) => {
            const selected = data.devices.includes(d.value)
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDevice(d.value)}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl border transition-all cursor-pointer ${
                  selected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Watch
                  size={18}
                  className={
                    selected
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }
                />
                <span
                  className={`text-sm font-medium ${
                    selected
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {d.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Device-specific tips */}
      {data.devices.length > 0 && (
        <div className="flex flex-col gap-3">
          <label className={LABEL_CLASS}>
            <Upload size={12} className="inline mr-1.5 -mt-0.5" />
            Getting Your Data In
          </label>
          {data.devices.map((device) => (
            <div
              key={device}
              className="rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 px-4 py-3"
            >
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1 uppercase tracking-wider">
                {DEVICES.find((d) => d.value === device)?.label}
              </p>
              <p className="text-sm text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
                {DEVICE_TIPS[device]}
              </p>
            </div>
          ))}
        </div>
      )}

      {data.devices.length === 0 && (
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-4 py-6 text-center">
          <Watch size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Select your devices above to see how to import your data.
          </p>
        </div>
      )}
    </div>
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const stepContent = step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header / branding */}
      <header className="flex items-center justify-center pt-8 pb-4 px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
            <Waves size={14} />
            <Bike size={14} />
            <Footprints size={14} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[4px] text-gray-900 dark:text-gray-100">
            TRI-NEXUS
          </p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="px-6 pt-2 pb-6 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Step {step} of 3
          </span>
          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
            {step === 1 ? 'Your Race' : step === 2 ? 'Your Fitness' : 'Your Devices'}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start justify-center px-6 pb-32">
        <div
          ref={containerRef}
          className={`card-squircle p-8 sm:p-10 w-full max-w-lg transition-all duration-200 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{
            transform: visible
              ? 'translateY(0) translateX(0)'
              : direction === 'forward'
                ? 'translateY(0) translateX(12px)'
                : 'translateY(0) translateX(-12px)',
          }}
        >
          {stepContent}
        </div>
      </div>

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-background/80 backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-lg mx-auto flex items-center justify-between px-6 py-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={transitioning}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance() || transitioning}
              className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={transitioning}
              className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer"
            >
              Get Started
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
