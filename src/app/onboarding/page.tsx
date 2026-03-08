'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Watch, Search, X } from 'lucide-react'

type RaceDistance = 'sprint' | 'olympic' | '70.3' | '140.6'

interface CatalogueRace {
  id: string
  name: string
  race_distance: RaceDistance
  location_city: string | null
  location_country: string | null
  next_race_date: string | null
}

interface OnboardingData {
  raceName: string
  raceDistance: RaceDistance | null
  raceDate: string
  device: string
  catalogueRaceId: string | null
}

const INITIAL_DATA: OnboardingData = {
  raceName: '',
  raceDistance: null,
  raceDate: '',
  device: '',
  catalogueRaceId: null,
}

const RACE_DISTANCES: { value: RaceDistance; label: string; sub: string }[] = [
  { value: 'sprint', label: 'Sprint', sub: '750m / 20km / 5km' },
  { value: 'olympic', label: 'Olympic', sub: '1.5km / 40km / 10km' },
  { value: '70.3', label: '70.3', sub: '1.9km / 90km / 21.1km' },
  { value: '140.6', label: '140.6', sub: '3.8km / 180km / 42.2km' },
]

const DEVICES = [
  { value: 'garmin', label: 'Garmin' },
  { value: 'manual', label: 'Manual Entry' },
  { value: 'skip', label: 'Skip for Now' },
]

const INPUT_CLASS = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'
const LABEL_CLASS = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA)
  const [visible, setVisible] = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const [catalogueRaces, setCatalogueRaces] = useState<CatalogueRace[]>([])
  const [raceSearch, setRaceSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [useCustomRace, setUseCustomRace] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Fetch races catalogue on mount
  useEffect(() => {
    supabase
      .from('race_courses')
      .select('id, name, race_distance, location_city, location_country, next_race_date')
      .is('user_id', null)
      .order('name', { ascending: true })
      .then(({ data: races }) => {
        if (races) setCatalogueRaces(races as CatalogueRace[])
      })
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredRaces = catalogueRaces.filter((r) =>
    r.name.toLowerCase().includes(raceSearch.toLowerCase()) ||
    (r.location_city ?? '').toLowerCase().includes(raceSearch.toLowerCase()) ||
    (r.location_country ?? '').toLowerCase().includes(raceSearch.toLowerCase())
  ).slice(0, 8)

  const selectCatalogueRace = (race: CatalogueRace) => {
    setData((prev) => ({
      ...prev,
      raceName: race.name,
      raceDistance: race.race_distance,
      raceDate: race.next_race_date ?? prev.raceDate,
      catalogueRaceId: race.id,
    }))
    setRaceSearch(race.name)
    setShowDropdown(false)
    setUseCustomRace(false)
    if (race.next_race_date) {
      setTimeout(() => animateTransition(2), 300)
    }
  }

  const clearRaceSelection = () => {
    setData((prev) => ({ ...prev, raceName: '', raceDistance: null, raceDate: '', catalogueRaceId: null }))
    setRaceSearch('')
    setUseCustomRace(false)
  }

  const update = useCallback(
    <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const animateTransition = useCallback(
    (newStep: number) => {
      if (transitioning) return
      setTransitioning(true)
      setVisible(false)
      setTimeout(() => {
        setStep(newStep)
        setVisible(true)
        setTimeout(() => setTransitioning(false), 300)
      }, 200)
    },
    [transitioning]
  )

  const handleComplete = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Mark onboarding completed
        await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)

        // Create target race if they selected one
        if (data.raceDistance && data.raceDate) {
          await supabase.from('target_races').insert({
            user_id: user.id,
            race_name: data.raceName || `My ${data.raceDistance} Race`,
            race_date: data.raceDate,
            race_distance: data.raceDistance,
            priority: 'a',
            status: 'upcoming',
          })
        }
      }
    } catch {
      // Non-critical
    }

    router.push('/dashboard/profile?onboarding=true')
    router.refresh()
  }, [data, supabase, router])

  const canAdvance = data.raceDistance !== null

  const renderStep1 = () => (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          What&apos;s your target race?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          We&apos;ll project your finish time as you train.
        </p>
      </div>

      {/* Race search / selection */}
      <div ref={searchRef}>
        <label className={LABEL_CLASS}>Find Your Race</label>

        {data.catalogueRaceId ? (
          /* Selected race pill */
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/30">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{data.raceName}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 capitalize">
                {data.raceDistance}{data.raceDate ? ` · ${data.raceDate}` : ''}
              </p>
            </div>
            <button type="button" onClick={clearRaceSelection} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
              <X size={16} />
            </button>
          </div>
        ) : useCustomRace ? (
          /* Custom race name input */
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={data.raceName}
              onChange={(e) => update('raceName', e.target.value.slice(0, 100))}
              className={INPUT_CLASS}
              placeholder="e.g. IRONMAN 70.3 Oceanside"
              maxLength={100}
              autoFocus
            />
            <button
              type="button"
              onClick={() => { setUseCustomRace(false); update('raceName', '') }}
              className="text-xs text-blue-500 hover:underline text-left"
            >
              ← Search catalogue instead
            </button>
          </div>
        ) : (
          /* Search input + dropdown */
          <div className="relative">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={raceSearch}
                onChange={(e) => { setRaceSearch(e.target.value); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
                className={`${INPUT_CLASS} pl-9`}
                placeholder="Search races..."
                maxLength={100}
              />
            </div>
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
                {filteredRaces.length > 0 ? (
                  filteredRaces.map((race) => (
                    <button
                      key={race.id}
                      type="button"
                      onMouseDown={() => selectCatalogueRace(race)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{race.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 capitalize">
                        {race.race_distance}{race.location_city ? ` · ${race.location_city}, ${race.location_country}` : ''}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-400">No races found</div>
                )}
                <button
                  type="button"
                  onMouseDown={() => { setShowDropdown(false); setUseCustomRace(true) }}
                  className="w-full text-left px-4 py-3 text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 border-t border-gray-100 dark:border-gray-800 font-medium"
                >
                  + My race isn&apos;t listed — enter manually
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Distance — hidden if pre-filled from catalogue */}
      {!data.catalogueRaceId && (
        <div>
          <label className={LABEL_CLASS}>Distance</label>
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
                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{d.label}</span>
                <span className="block text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{d.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Race date — always shown, pre-filled if from catalogue */}
      <div>
        <label className={LABEL_CLASS}>Race Date</label>
        <input
          type="date"
          value={data.raceDate}
          onChange={(e) => update('raceDate', e.target.value)}
          className={INPUT_CLASS}
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          How do you track workouts?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Connect a device for automatic sync, or enter workouts manually.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {DEVICES.map((d) => {
          const selected = data.device === d.value
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => update('device', d.value)}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl border transition-all cursor-pointer ${
                selected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Watch size={18} className={selected ? 'text-blue-600' : 'text-gray-400'} />
              <span className={`text-sm font-medium ${selected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {d.label}
              </span>
            </button>
          )
        })}
      </div>

      {data.device === 'garmin' && (
        <div className="rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 px-4 py-3">
          <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
            You&apos;ll be able to connect your Garmin account on the Profile page after setup.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleComplete}
          disabled={transitioning}
          className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
        >
          Get Started
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )

  const stepContent = step === 1 ? renderStep1() : renderStep2()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-center pt-8 pb-4 px-6">
        <p className="text-xs font-bold uppercase tracking-[5px] text-[#4361ee]">RACE DAY</p>
      </header>

      <div className="px-6 pt-2 pb-6 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Step {step} of 2
          </span>
          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
            {step === 1 ? 'Your Race' : 'Your Device'}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary dark:bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pb-32">
        <div
          className={`card-squircle p-8 sm:p-10 w-full max-w-lg transition-all duration-200 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {stepContent}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-background/80 backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-lg mx-auto flex items-center justify-between px-6 py-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => animateTransition(1)}
              disabled={transitioning}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={() => animateTransition(2)}
              disabled={!canAdvance || transitioning}
              className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
            >
              Next
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
