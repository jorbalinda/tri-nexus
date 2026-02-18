'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Waves, Bike, Footprints, ArrowLeft, Calculator, ArrowRight, Clock, Gauge, Timer } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Distance data                                                      */
/* ------------------------------------------------------------------ */
const DISTANCES: Record<string, { swim_m: number; bike_km: number; run_km: number }> = {
  super_sprint: { swim_m: 400, bike_km: 10, run_km: 2.5 },
  sprint: { swim_m: 750, bike_km: 20, run_km: 5 },
  olympic: { swim_m: 1500, bike_km: 40, run_km: 10 },
  '70.3': { swim_m: 1900, bike_km: 90, run_km: 21.1 },
  '140.6': { swim_m: 3800, bike_km: 180, run_km: 42.2 },
}

const DISTANCE_LABELS: Record<string, string> = {
  super_sprint: 'Super Sprint (400m / 10K / 2.5K)',
  sprint: 'Sprint (750m / 20K / 5K)',
  olympic: 'Olympic (1.5K / 40K / 10K)',
  '70.3': '70.3 Half Ironman (1.9K / 90K / 21.1K)',
  '140.6': '140.6 Ironman (3.8K / 180K / 42.2K)',
  custom: 'Custom',
}

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */
function formatTime(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '--:--:--'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.round(totalSeconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatPace(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '--:--'
  const m = Math.floor(totalSeconds / 60)
  const s = Math.round(totalSeconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/* ------------------------------------------------------------------ */
/*  Calculation engine                                                 */
/* ------------------------------------------------------------------ */
interface SplitResult {
  swimSplit: number
  bikeSplit: number
  runSplit: number
  t1: number
  t2: number
  swimPacePer100m: number
  bikeSpeedKmh: number
  runPacePerKm: number
}

function calculateSplits(
  totalSeconds: number,
  swim_m: number,
  bike_km: number,
  run_km: number,
): SplitResult {
  const t1 = Math.min(180, totalSeconds * 0.005)
  const t2 = Math.min(120, totalSeconds * 0.003)
  const remaining = totalSeconds - t1 - t2

  const totalKm = swim_m / 1000 + bike_km + run_km

  const swimFraction = ((swim_m / 1000) / totalKm) * 1.8
  const bikeFraction = (bike_km / totalKm) * 0.85
  const runFraction = (run_km / totalKm) * 1.2

  const total = swimFraction + bikeFraction + runFraction

  const swimSplit = (swimFraction / total) * remaining
  const bikeSplit = (bikeFraction / total) * remaining
  const runSplit = (runFraction / total) * remaining

  const swimPacePer100m = swimSplit / (swim_m / 100)
  const bikeSpeedKmh = bike_km / (bikeSplit / 3600)
  const runPacePerKm = runSplit / run_km

  return {
    swimSplit,
    bikeSplit,
    runSplit,
    t1,
    t2,
    swimPacePer100m,
    bikeSpeedKmh,
    runPacePerKm,
  }
}

/* ------------------------------------------------------------------ */
/*  Input classes                                                      */
/* ------------------------------------------------------------------ */
const inputClass =
  'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'
const labelClass =
  'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
export default function PaceCalculatorPage() {
  const [raceType, setRaceType] = useState('olympic')
  const [customSwim, setCustomSwim] = useState('1500')
  const [customBike, setCustomBike] = useState('40')
  const [customRun, setCustomRun] = useState('10')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [calculated, setCalculated] = useState(false)

  const distances = useMemo(() => {
    if (raceType === 'custom') {
      return {
        swim_m: Number(customSwim) || 0,
        bike_km: Number(customBike) || 0,
        run_km: Number(customRun) || 0,
      }
    }
    return DISTANCES[raceType]
  }, [raceType, customSwim, customBike, customRun])

  const totalSeconds = useMemo(() => {
    return (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60
  }, [hours, minutes])

  const results = useMemo(() => {
    if (!calculated || totalSeconds <= 0 || !distances) return null
    const realistic = calculateSplits(totalSeconds, distances.swim_m, distances.bike_km, distances.run_km)
    const optimistic = calculateSplits(totalSeconds * 0.95, distances.swim_m, distances.bike_km, distances.run_km)
    const conservative = calculateSplits(totalSeconds * 1.05, distances.swim_m, distances.bike_km, distances.run_km)
    return { realistic, optimistic, conservative }
  }, [calculated, totalSeconds, distances])

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    if (totalSeconds > 0) {
      setCalculated(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 pointer-events-none">
          <Waves className="absolute top-[12%] left-[8%] text-white/10" size={70} strokeWidth={1} />
          <Bike className="absolute top-[35%] right-[6%] text-white/10" size={80} strokeWidth={1} />
          <Footprints className="absolute bottom-[15%] left-[15%] text-white/10" size={60} strokeWidth={1} />
          <Calculator className="absolute top-[20%] right-[25%] text-white/6" size={50} strokeWidth={1} />
          <Clock className="absolute bottom-[30%] right-[15%] text-white/8" size={45} strokeWidth={1} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center px-6 pt-16 pb-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white/90 text-xs font-semibold uppercase tracking-widest mb-8 transition-colors"
          >
            <ArrowLeft size={14} />
            Home
          </Link>

          <p className="text-xs font-bold uppercase tracking-[5px] text-white/80 mb-4">
            TRI-NEXUS
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Triathlon Pace Calculator
          </h1>
          <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
            Enter your target finish time and race distance to get precise swim, bike, and run split
            targets with transition estimates.
          </p>

          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-blue-300/70">
              <Waves size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider">Swim</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2 text-orange-300/70">
              <Bike size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider">Bike</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2 text-green-300/70">
              <Footprints size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider">Run</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 pb-20 relative z-20">
        {/* Form Card */}
        <form onSubmit={handleCalculate} className="card-squircle p-6 sm:p-8 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
            Race Details
          </h2>

          {/* Race Distance */}
          <div className="mb-5">
            <label className={labelClass}>Race Distance</label>
            <select
              value={raceType}
              onChange={(e) => {
                setRaceType(e.target.value)
                setCalculated(false)
              }}
              className={inputClass + ' cursor-pointer'}
            >
              {Object.entries(DISTANCE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom distance inputs */}
          {raceType === 'custom' && (
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div>
                <label className={labelClass}>Swim (meters)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={customSwim}
                  onChange={(e) => {
                    setCustomSwim(e.target.value)
                    setCalculated(false)
                  }}
                  className={inputClass}
                  placeholder="1500"
                />
              </div>
              <div>
                <label className={labelClass}>Bike (km)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={customBike}
                  onChange={(e) => {
                    setCustomBike(e.target.value)
                    setCalculated(false)
                  }}
                  className={inputClass}
                  placeholder="40"
                />
              </div>
              <div>
                <label className={labelClass}>Run (km)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={customRun}
                  onChange={(e) => {
                    setCustomRun(e.target.value)
                    setCalculated(false)
                  }}
                  className={inputClass}
                  placeholder="10"
                />
              </div>
            </div>
          )}

          {/* Target Finish Time */}
          <div className="mb-6">
            <label className={labelClass}>Target Finish Time</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => {
                    setHours(e.target.value)
                    setCalculated(false)
                  }}
                  className={inputClass}
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
                  hours
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => {
                    setMinutes(e.target.value)
                    setCalculated(false)
                  }}
                  className={inputClass}
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
                  min
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={totalSeconds <= 0}
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            <Calculator size={16} />
            Calculate Splits
          </button>
        </form>

        {/* Results */}
        {results && (
          <div className="card-squircle p-6 sm:p-8 mb-6 animate-fade-in">
            {/* Summary */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
                  Target Finish Time
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatTime(totalSeconds)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
                  Distance
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {distances.swim_m}m / {distances.bike_km}km / {distances.run_km}km
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800 mb-6" />

            {/* Split Cards */}
            <div className="flex flex-col gap-4">
              {/* Swim */}
              <div className="rounded-2xl p-4 sm:p-5 bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                    <Waves size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Swim
                    </p>
                    <p className="text-[10px] text-blue-500/70 dark:text-blue-400/60">
                      {distances.swim_m}m
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400/80 dark:text-blue-500/80 mb-0.5">
                      Split Time
                    </p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                      {formatTime(results.realistic.swimSplit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400/80 dark:text-blue-500/80 mb-0.5">
                      Pace /100m
                    </p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                      {formatPace(results.realistic.swimPacePer100m)}
                    </p>
                  </div>
                </div>
              </div>

              {/* T1 */}
              <div className="rounded-2xl p-4 bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
                      <Timer size={16} className="text-purple-500" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      T1 &mdash; Swim to Bike
                    </p>
                  </div>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    {formatTime(results.realistic.t1)}
                  </p>
                </div>
              </div>

              {/* Bike */}
              <div className="rounded-2xl p-4 sm:p-5 bg-orange-50/80 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
                    <Bike size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                      Bike
                    </p>
                    <p className="text-[10px] text-orange-500/70 dark:text-orange-400/60">
                      {distances.bike_km}km
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-400/80 dark:text-orange-500/80 mb-0.5">
                      Split Time
                    </p>
                    <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                      {formatTime(results.realistic.bikeSplit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-400/80 dark:text-orange-500/80 mb-0.5">
                      Avg Speed
                    </p>
                    <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                      {results.realistic.bikeSpeedKmh.toFixed(1)} <span className="text-sm font-semibold">km/h</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* T2 */}
              <div className="rounded-2xl p-4 bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
                      <Timer size={16} className="text-purple-500" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      T2 &mdash; Bike to Run
                    </p>
                  </div>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    {formatTime(results.realistic.t2)}
                  </p>
                </div>
              </div>

              {/* Run */}
              <div className="rounded-2xl p-4 sm:p-5 bg-green-50/80 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
                    <Footprints size={16} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                      Run
                    </p>
                    <p className="text-[10px] text-green-500/70 dark:text-green-400/60">
                      {distances.run_km}km
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-green-400/80 dark:text-green-500/80 mb-0.5">
                      Split Time
                    </p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-300">
                      {formatTime(results.realistic.runSplit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-green-400/80 dark:text-green-500/80 mb-0.5">
                      Pace /km
                    </p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-300">
                      {formatPace(results.realistic.runPacePerKm)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario Table */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">
                Race Scenarios
              </h3>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 py-2 px-2">
                        Scenario
                      </th>
                      <th className="text-right text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 py-2 px-2">
                        Total
                      </th>
                      <th className="text-right text-[10px] font-bold uppercase tracking-wider text-blue-400 py-2 px-2">
                        Swim
                      </th>
                      <th className="text-right text-[10px] font-bold uppercase tracking-wider text-orange-400 py-2 px-2">
                        Bike
                      </th>
                      <th className="text-right text-[10px] font-bold uppercase tracking-wider text-green-400 py-2 px-2">
                        Run
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Optimistic */}
                    <tr className="border-b border-gray-50 dark:border-gray-800/50">
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Optimistic
                          </span>
                          <span className="text-[10px] text-gray-400">-5%</span>
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-bold text-gray-900 dark:text-gray-100">
                        {formatTime(totalSeconds * 0.95)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {formatTime(results.optimistic.swimSplit)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-semibold text-orange-600 dark:text-orange-400">
                        {formatTime(results.optimistic.bikeSplit)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-semibold text-green-600 dark:text-green-400">
                        {formatTime(results.optimistic.runSplit)}
                      </td>
                    </tr>

                    {/* Realistic */}
                    <tr className="border-b border-gray-50 dark:border-gray-800/50 bg-blue-50/30 dark:bg-blue-950/10">
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Realistic
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-bold text-gray-900 dark:text-gray-100">
                        {formatTime(totalSeconds)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {formatTime(results.realistic.swimSplit)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-semibold text-orange-600 dark:text-orange-400">
                        {formatTime(results.realistic.bikeSplit)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-semibold text-green-600 dark:text-green-400">
                        {formatTime(results.realistic.runSplit)}
                      </td>
                    </tr>

                    {/* Conservative */}
                    <tr>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Conservative
                          </span>
                          <span className="text-[10px] text-gray-400">+5%</span>
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-bold text-gray-900 dark:text-gray-100">
                        {formatTime(totalSeconds * 1.05)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {formatTime(results.conservative.swimSplit)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-semibold text-orange-600 dark:text-orange-400">
                        {formatTime(results.conservative.bikeSplit)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-semibold text-green-600 dark:text-green-400">
                        {formatTime(results.conservative.runSplit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pace detail row under scenario table */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl p-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-800/20 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-0.5">
                    Swim Pace
                  </p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {formatPace(results.realistic.swimPacePer100m)}/100m
                  </p>
                </div>
                <div className="rounded-xl p-3 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/50 dark:border-orange-800/20 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-0.5">
                    Bike Speed
                  </p>
                  <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {results.realistic.bikeSpeedKmh.toFixed(1)} km/h
                  </p>
                </div>
                <div className="rounded-xl p-3 bg-green-50/50 dark:bg-green-950/10 border border-green-100/50 dark:border-green-800/20 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-green-400 mb-0.5">
                    Run Pace
                  </p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatPace(results.realistic.runPacePerKm)}/km
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="card-squircle p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Gauge size={20} className="text-blue-500" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Want a personalized race plan?
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-md mx-auto">
            Get a complete race plan with nutrition strategy, pacing by segment, mental cues, and
            equipment checklists tailored to your fitness data.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            Sign up free
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Footer link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Back to TRI-NEXUS
          </Link>
        </div>
      </div>

      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(135deg, #0a2463, #1e3a8a, #7c3aed, #c026d3, #ea580c);
          background-size: 300% 300%;
          animation: gradientShift 12s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        :global(.dark) .hero-gradient {
          background: linear-gradient(135deg, #020617, #0f172a, #2e1065, #4a044e, #431407);
          background-size: 300% 300%;
          animation: gradientShift 12s ease infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
