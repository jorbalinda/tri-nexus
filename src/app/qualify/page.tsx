'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  CheckCircle,
  XCircle,
  Waves,
  Bike,
  Footprints,
  ArrowRight,
  ChevronDown,
  Timer,
  Target,
  Zap,
} from 'lucide-react'
import {
  QUALIFICATION_STANDARDS,
  CHAMPIONSHIP_LABELS,
  CHAMPIONSHIP_DISTANCES,
} from '@/lib/data/qualification-standards'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHAMPIONSHIP_KEYS = Object.keys(CHAMPIONSHIP_LABELS) as string[]

const ALL_AGE_GROUPS = [
  '18-24', '25-29', '30-34', '35-39', '40-44', '45-49',
  '50-54', '55-59', '60-64', '65-69', '70-74', '75-79',
]

const WT_MAX_AGE_GROUP = '60-64'

function ageGroupsForChampionship(championship: string): string[] {
  if (championship === 'wt_ag_sprint' || championship === 'wt_ag_standard') {
    const cutIdx = ALL_AGE_GROUPS.indexOf(WT_MAX_AGE_GROUP)
    return ALL_AGE_GROUPS.slice(0, cutIdx + 1)
  }
  return ALL_AGE_GROUPS
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatHM(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

function formatMS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.round(totalSeconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatKmH(kmPerHour: number): string {
  return `${kmPerHour.toFixed(1)} km/h`
}

// ---------------------------------------------------------------------------
// Split calculator
// ---------------------------------------------------------------------------

interface SplitTargets {
  swim: { time: number; pace: string }
  t1: number
  bike: { time: number; pace: string }
  t2: number
  run: { time: number; pace: string }
}

function computeSplits(championship: string, totalSeconds: number): SplitTargets | null {
  const dist = CHAMPIONSHIP_DISTANCES[championship]
  if (!dist) return null

  const swimKm = dist.swim_m / 1000
  const bikeKm = dist.bike_km
  const runKm = dist.run_km

  // Weighted fractions
  const swimWeight = swimKm * 1.8
  const bikeWeight = bikeKm * 0.85
  const runWeight = runKm * 1.2
  const totalWeight = swimWeight + bikeWeight + runWeight

  // Transition estimates
  const t1 = Math.min(180, totalSeconds * 0.005)
  const t2 = Math.min(120, totalSeconds * 0.003)
  const raceTime = totalSeconds - t1 - t2

  const swimTime = (swimWeight / totalWeight) * raceTime
  const bikeTime = (bikeWeight / totalWeight) * raceTime
  const runTime = (runWeight / totalWeight) * raceTime

  // Paces
  const swimPacePer100m = swimTime / (dist.swim_m / 100) // seconds per 100m
  const bikeKmH = bikeKm / (bikeTime / 3600)
  const runPacePerKm = runTime / runKm

  return {
    swim: { time: swimTime, pace: `${formatMS(swimPacePer100m)}/100m` },
    t1,
    bike: { time: bikeTime, pace: formatKmH(bikeKmH) },
    t2,
    run: { time: runTime, pace: `${formatMS(runPacePerKm)}/km` },
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const INPUT_CLASS =
  'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'

const LABEL_CLASS =
  'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

export default function QualifyPage() {
  // Form state
  const [championship, setChampionship] = useState('')
  const [gender, setGender] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')

  // Available age groups based on championship
  const availableAgeGroups = useMemo(
    () => (championship ? ageGroupsForChampionship(championship) : ALL_AGE_GROUPS),
    [championship],
  )

  // Reset age group if it's no longer valid for the chosen championship
  useEffect(() => {
    if (ageGroup && !availableAgeGroups.includes(ageGroup)) {
      setAgeGroup('')
    }
  }, [availableAgeGroups, ageGroup])

  // Compute results
  const result = useMemo(() => {
    if (!championship || !gender || !ageGroup || hours === '' || minutes === '') return null

    const h = parseInt(hours, 10)
    const m = parseInt(minutes, 10)
    if (isNaN(h) || isNaN(m)) return null
    if (h < 0 || m < 0 || m > 59) return null

    const enteredSeconds = h * 3600 + m * 60

    const standard = QUALIFICATION_STANDARDS.find(
      (s) =>
        s.championship === championship &&
        s.gender === gender &&
        s.age_group === ageGroup,
    )

    if (!standard) return null

    const cutoffSeconds = standard.estimated_cutoff_seconds
    const gapSeconds = enteredSeconds - cutoffSeconds
    const qualifies = gapSeconds <= 0
    const gapMinutes = Math.round(Math.abs(gapSeconds) / 60)

    // Percentage progress toward qualifying (capped between 0 and 150)
    const progress = Math.min(150, Math.max(0, (cutoffSeconds / enteredSeconds) * 100))

    const splits = computeSplits(championship, cutoffSeconds)

    return {
      cutoffSeconds,
      enteredSeconds,
      gapSeconds,
      gapMinutes,
      qualifies,
      progress,
      splits,
      championshipLabel: CHAMPIONSHIP_LABELS[championship] || championship,
    }
  }, [championship, gender, ageGroup, hours, minutes])

  // Confidence message
  const confidenceMessage = useCallback(() => {
    if (!result) return ''
    if (result.qualifies) {
      if (result.gapMinutes >= 20)
        return 'Solid buffer. You have real margin -- stay consistent and race smart.'
      if (result.gapMinutes >= 5)
        return 'You are within striking distance of a comfortable qualification. Keep sharpening those splits.'
      return 'Tight but doable. Every second counts -- nail transitions and pacing.'
    }
    if (result.gapMinutes <= 5)
      return 'You are incredibly close. A disciplined race plan and fresh legs could close the gap.'
    if (result.gapMinutes <= 15)
      return 'Achievable gap. Focus on your weakest discipline and transition speed for quick gains.'
    return 'Meaningful gap to close, but structured training over a full season can get you there.'
  }, [result])

  return (
    <div className="min-h-screen bg-background">
      {/* ----------------------------------------------------------------- */}
      {/* Hero */}
      {/* ----------------------------------------------------------------- */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 qualify-hero-gradient" />

        {/* Decorative icons */}
        <div className="absolute inset-0 pointer-events-none">
          <Waves className="absolute top-[12%] left-[8%] text-white/10" size={70} strokeWidth={1} />
          <Bike className="absolute top-[40%] right-[8%] text-white/10" size={80} strokeWidth={1} />
          <Footprints className="absolute bottom-[15%] left-[18%] text-white/10" size={60} strokeWidth={1} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center px-6 py-20 md:py-28">
          <p className="text-xs font-bold uppercase tracking-[5px] text-white/80 mb-4">
            TRI-NEXUS
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Can You Qualify?
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Enter your finish time and find out if you meet the qualifying standard
            for the world&apos;s biggest triathlon championships.
          </p>

          {/* Sport icons row */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-white/50">
              <Waves size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Swim</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2 text-white/50">
              <Bike size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Bike</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2 text-white/50">
              <Footprints size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Run</span>
            </div>
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Main content */}
      {/* ----------------------------------------------------------------- */}
      <main className="max-w-2xl mx-auto px-4 md:px-6 -mt-8 pb-20 space-y-8 relative z-10">
        {/* Form card */}
        <section className="card-squircle p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Target size={18} className="text-blue-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Your Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Championship */}
            <div className="sm:col-span-2">
              <label htmlFor="championship" className={LABEL_CLASS}>
                Championship Target
              </label>
              <div className="relative">
                <select
                  id="championship"
                  value={championship}
                  onChange={(e) => setChampionship(e.target.value)}
                  className={`${INPUT_CLASS} appearance-none pr-10`}
                >
                  <option value="">Select a championship...</option>
                  {CHAMPIONSHIP_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {CHAMPIONSHIP_LABELS[key]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className={LABEL_CLASS}>
                Gender
              </label>
              <div className="relative">
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`${INPUT_CLASS} appearance-none pr-10`}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Age Group */}
            <div>
              <label htmlFor="age-group" className={LABEL_CLASS}>
                Age Group
              </label>
              <div className="relative">
                <select
                  id="age-group"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className={`${INPUT_CLASS} appearance-none pr-10`}
                >
                  <option value="">Select...</option>
                  {availableAgeGroups.map((ag) => (
                    <option key={ag} value={ag}>
                      {ag}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Finish Time */}
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS}>
                Recent / Estimated Finish Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    placeholder="Hours"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className={INPUT_CLASS}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    hrs
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Minutes"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className={INPUT_CLASS}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        {/* Results card */}
        {/* --------------------------------------------------------------- */}
        {result && (
          <section className="card-squircle p-6 md:p-8 space-y-6 animate-fadeIn">
            {/* Header badge */}
            <div className="flex items-center gap-3">
              {result.qualifies ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle size={24} />
                  <span className="text-lg font-bold">You&apos;d Qualify!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <XCircle size={24} />
                  <span className="text-lg font-bold">Gap to Close</span>
                </div>
              )}
            </div>

            {/* Stat pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Qualifying Standard */}
              <div
                className={`rounded-2xl p-4 border ${
                  result.qualifies
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30'
                    : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30'
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                  Qualifying Cutoff
                </p>
                <p
                  className={`text-xl font-bold ${
                    result.qualifies
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {formatHM(result.cutoffSeconds)}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                  {result.championshipLabel}
                </p>
              </div>

              {/* Your Time */}
              <div className="rounded-2xl p-4 border bg-blue-50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                  Your Time
                </p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatHM(result.enteredSeconds)}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {gender === 'male' ? 'Male' : 'Female'} &middot; {ageGroup}
                </p>
              </div>

              {/* Gap / Buffer */}
              <div
                className={`rounded-2xl p-4 border ${
                  result.qualifies
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30'
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                  {result.qualifies ? 'Buffer' : 'Gap'}
                </p>
                <p
                  className={`text-xl font-bold ${
                    result.qualifies
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {result.qualifies ? '-' : '+'}
                  {result.gapMinutes} min
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {result.qualifies ? 'Under cutoff' : 'Over cutoff'}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Qualification Progress
                </span>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {Math.min(100, Math.round(result.progress))}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    result.qualifies
                      ? 'bg-gradient-to-r from-green-400 to-green-500'
                      : result.progress >= 90
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                      : 'bg-gradient-to-r from-red-400 to-red-500'
                  }`}
                  style={{ width: `${Math.min(100, result.progress)}%` }}
                />
              </div>
            </div>

            {/* Confidence message */}
            <div className="border-l-4 border-l-blue-500 pl-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {confidenceMessage()}
              </p>
            </div>

            {/* Split targets */}
            {result.splits && (
              <div>
                <div className="flex items-center gap-1.5 mb-4">
                  <Timer size={14} className="text-blue-500" />
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
                    Qualifying Split Targets
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Swim */}
                  <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Waves size={14} className="text-blue-400" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Swim
                      </p>
                    </div>
                    <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                      {formatHM(result.splits.swim.time)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {result.splits.swim.pace}
                    </p>
                  </div>

                  {/* Bike */}
                  <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Bike size={14} className="text-green-400" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Bike
                      </p>
                    </div>
                    <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                      {formatHM(result.splits.bike.time)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {result.splits.bike.pace}
                    </p>
                  </div>

                  {/* Run */}
                  <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Footprints size={14} className="text-orange-400" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Run
                      </p>
                    </div>
                    <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                      {formatHM(result.splits.run.time)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {result.splits.run.pace}
                    </p>
                  </div>
                </div>

                {/* Transitions */}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
                  <span>T1: {formatMS(result.splits.t1)}</span>
                  <span>T2: {formatMS(result.splits.t2)}</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* --------------------------------------------------------------- */}
        {/* CTA */}
        {/* --------------------------------------------------------------- */}
        <section className="card-squircle p-6 md:p-8 text-center">
          <Zap size={28} className="text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            Want a Full Race Plan?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-5 leading-relaxed">
            Get personalized pacing, nutrition, equipment, and mental strategy
            tailored to your goal race. Completely free.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            Sign Up Free
            <ArrowRight size={16} />
          </Link>
        </section>

        {/* --------------------------------------------------------------- */}
        {/* Footer */}
        {/* --------------------------------------------------------------- */}
        <footer className="text-center pb-8">
          <Link
            href="/"
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
          >
            Back to TRI-NEXUS Home
          </Link>
        </footer>
      </main>

      {/* Scoped styles */}
      <style jsx>{`
        .qualify-hero-gradient {
          background: linear-gradient(135deg, #0a2463, #1e3a8a, #7c3aed, #c026d3, #ea580c);
          background-size: 300% 300%;
          animation: gradientShift 12s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        :global(.dark) .qualify-hero-gradient {
          background: linear-gradient(135deg, #020617, #0f172a, #2e1065, #4a044e, #431407);
          background-size: 300% 300%;
          animation: gradientShift 12s ease infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        :global(.animate-fadeIn) {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
