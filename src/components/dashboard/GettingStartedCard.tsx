'use client'

import { useState, useEffect } from 'react'
import { Watch, Shield, CheckCircle2, ChevronRight, Waves, Bike, Footprints } from 'lucide-react'
import ConsentSheet from '@/components/consent/ConsentSheet'
import ManualWorkoutEntry from '@/components/dashboard/ManualWorkoutEntry'
import FitUploadDropzone from '@/components/dashboard/FitUploadDropzone'
import type { Workout } from '@/lib/types/database'

// ---------------------------------------------------------------------------
// Constants (mirror DISCIPLINE_REQUIREMENTS tier1MinDuration from data-sufficiency)
// ---------------------------------------------------------------------------

const EIGHT_WEEKS_MS = 8 * 7 * 86_400_000

const SPORT_REQUIRED: Record<'swim' | 'bike' | 'run', number> = {
  swim: 2,
  bike: 3,
  run: 3,
}

const SPORT_MIN_DURATION: Record<'swim' | 'bike' | 'run', number> = {
  swim: 600,   // 10 min
  bike: 1200,  // 20 min
  run: 1200,   // 20 min
}

const SPORT_MIN_LABEL: Record<'swim' | 'bike' | 'run', string> = {
  swim: '10+ min',
  bike: '20+ min',
  run: '20+ min',
}

const SPORT_COLOR: Record<'swim' | 'bike' | 'run', string> = {
  swim: 'bg-blue-500',
  bike: 'bg-orange-500',
  run: 'bg-green-500',
}

// ---------------------------------------------------------------------------
// Gate helper (exported so dashboard can use it without a second fetch)
// ---------------------------------------------------------------------------

function countQualifying(workouts: Workout[], sport: 'swim' | 'bike' | 'run'): number {
  const cutoffMs = Date.now() - EIGHT_WEEKS_MS
  return workouts.filter(
    (w) =>
      w.sport === sport &&
      new Date(w.date).getTime() >= cutoffMs &&
      (w.duration_seconds || 0) >= SPORT_MIN_DURATION[sport]
  ).length
}

/** Returns true when the athlete is at Tier 0 or Tier 1 (not yet met: 2 swims, 3 bikes, 3 runs). */
export function computeOnboardingGate(workouts: Workout[]): boolean {
  return (['swim', 'bike', 'run'] as const).some(
    (s) => countQualifying(workouts, s) < SPORT_REQUIRED[s]
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SportProgressBar({
  sport,
  count,
}: {
  sport: 'swim' | 'bike' | 'run'
  count: number
}) {
  const label = sport.charAt(0).toUpperCase() + sport.slice(1)
  const required = SPORT_REQUIRED[sport]
  const passed = count >= required
  const progress = Math.min(count / required, 1)
  const Icon = sport === 'swim' ? Waves : sport === 'bike' ? Bike : Footprints

  return (
    <div className="flex items-center gap-3">
      <Icon
        size={16}
        className={passed ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span
            className={`text-xs font-semibold tabular-nums ${
              passed ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {passed ? 'Ready' : `${count} / ${required}`}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              passed ? 'bg-green-500' : SPORT_COLOR[sport]
            }`}
            style={{ width: `${Math.max(progress * 100, count > 0 ? 8 : 0)}%` }}
          />
        </div>
        {!passed && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            {SPORT_MIN_LABEL[sport]} each
          </p>
        )}
      </div>
      {passed && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Phase 1: Connect Device
// ---------------------------------------------------------------------------

function PhaseDevice({
  swimCount,
  bikeCount,
  runCount,
  consented,
  consentLoading,
  onConnectGarmin,
  onImport,
  onManual,
}: {
  swimCount: number
  bikeCount: number
  runCount: number
  consented: boolean
  consentLoading: boolean
  onConnectGarmin: () => void
  onImport: () => void
  onManual: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
          Getting Started
        </p>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {"Let's get your data set up"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Race Day needs at least 2 swims, 3 bikes, and 3 runs to generate a finish-time prediction. Connect a device or import past files to get there faster.
        </p>
      </div>

      {/* Progress bars */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
          Data Progress
        </p>
        <SportProgressBar sport="swim" count={swimCount} />
        <SportProgressBar sport="bike" count={bikeCount} />
        <SportProgressBar sport="run" count={runCount} />
      </div>

      {/* Garmin row */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Watch size={20} className="text-gray-300 dark:text-gray-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Garmin Connect</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {consented ? 'Privacy policy accepted' : 'Accept privacy policy to connect'}
              </p>
            </div>
          </div>
          {consentLoading ? null : consented ? (
            <span className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs font-semibold cursor-not-allowed select-none shrink-0">
              Coming Soon
            </span>
          ) : (
            <button
              onClick={onConnectGarmin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer shrink-0"
            >
              <Shield size={12} />
              Connect Garmin
            </button>
          )}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onImport}
          className="w-full flex items-center justify-center gap-1.5 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer"
        >
          Import Past Workouts
          <ChevronRight size={16} />
        </button>
        <button
          onClick={onManual}
          className="w-full py-3 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
        >
          {"I'll log manually"}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Phase 2: Import Historical Data
// ---------------------------------------------------------------------------

function PhaseImport({
  onUploaded,
  onSkip,
}: {
  onUploaded: () => void
  onSkip: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
          Step 2 of 3
        </p>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Speed things up with past workouts
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Import .FIT, .TCX, or .GPX files from your device to fill in your training history instantly.
        </p>
      </div>

      <FitUploadDropzone onUploaded={onUploaded} />

      <button
        onClick={onSkip}
        className="w-full py-3 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
      >
        {"Skip, I'll start fresh"}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Phase 3: Log Daily
// ---------------------------------------------------------------------------

function PhaseLogging({
  swimCount,
  bikeCount,
  runCount,
  onWorkoutSaved,
}: {
  swimCount: number
  bikeCount: number
  runCount: number
  onWorkoutSaved: () => void
}) {
  const allReady = swimCount >= SPORT_REQUIRED.swim && bikeCount >= SPORT_REQUIRED.bike && runCount >= SPORT_REQUIRED.run

  const nextActions = (
    [
      { sport: 'swim' as const, count: swimCount },
      { sport: 'bike' as const, count: bikeCount },
      { sport: 'run' as const, count: runCount },
    ] as const
  )
    .filter(({ sport, count }) => count < SPORT_REQUIRED[sport])
    .map(({ sport, count }) => {
      const remaining = SPORT_REQUIRED[sport] - count
      return `Log ${remaining} more ${sport} workout${remaining > 1 ? 's' : ''} (${SPORT_MIN_LABEL[sport]} each)`
    })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
          Step 3 of 3
        </p>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Build your prediction one workout at a time
        </h2>
      </div>

      {/* Progress bars */}
      <div className="flex flex-col gap-3">
        <SportProgressBar sport="swim" count={swimCount} />
        <SportProgressBar sport="bike" count={bikeCount} />
        <SportProgressBar sport="run" count={runCount} />
      </div>

      {/* Next actions */}
      {nextActions.length > 0 && (
        <div className="flex flex-col gap-2">
          {nextActions.map((action) => (
            <div
              key={action}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30"
            >
              <ChevronRight size={14} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 dark:text-gray-400">{action}</p>
            </div>
          ))}
        </div>
      )}

      {/* Log workout form */}
      <ManualWorkoutEntry onSaved={onWorkoutSaved} />

      {/* Encourage message */}
      {!allReady && (
        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          Your full dashboard unlocks once you hit 2 swims, 3 bikes, and 3 runs.
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type Phase = 'device' | 'import' | 'logging'

interface GettingStartedCardProps {
  workouts: Workout[]
  onWorkoutSaved: () => void
}

export default function GettingStartedCard({ workouts, onWorkoutSaved }: GettingStartedCardProps) {
  const [phase, setPhase] = useState<Phase>('device')
  const [consentSheetOpen, setConsentSheetOpen] = useState(false)
  const [consented, setConsented] = useState(false)
  const [consentLoading, setConsentLoading] = useState(true)

  useEffect(() => {
    fetch('/api/consent')
      .then((r) => r.json())
      .then((data) => {
        setConsented(!!data.consented)
        setConsentLoading(false)
      })
      .catch(() => setConsentLoading(false))
  }, [])

  const swimCount = countQualifying(workouts, 'swim')
  const bikeCount = countQualifying(workouts, 'bike')
  const runCount = countQualifying(workouts, 'run')

  const handleConsentAccepted = () => {
    setConsentSheetOpen(false)
    setConsented(true)
    setPhase('import')
  }

  return (
    <>
      <div className="card-squircle p-6 sm:p-8">
        {phase === 'device' && (
          <PhaseDevice
            swimCount={swimCount}
            bikeCount={bikeCount}
            runCount={runCount}
            consented={consented}
            consentLoading={consentLoading}
            onConnectGarmin={() => setConsentSheetOpen(true)}
            onImport={() => setPhase('import')}
            onManual={() => setPhase('logging')}
          />
        )}

        {phase === 'import' && (
          <PhaseImport
            onUploaded={onWorkoutSaved}
            onSkip={() => setPhase('logging')}
          />
        )}

        {phase === 'logging' && (
          <PhaseLogging
            swimCount={swimCount}
            bikeCount={bikeCount}
            runCount={runCount}
            onWorkoutSaved={onWorkoutSaved}
          />
        )}
      </div>

      {consentSheetOpen && (
        <ConsentSheet
          onAccept={handleConsentAccepted}
          onClose={() => setConsentSheetOpen(false)}
        />
      )}
    </>
  )
}
