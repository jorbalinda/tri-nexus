'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  type UnitSystem,
  formatDistance,
  formatDistanceShort,
  formatPace,
  formatPaceForSport,
  formatElevation,
  formatSpeed,
  formatWeight,
  distanceInputLabel,
  paceLabel,
  distanceLabel,
  elevationLabel,
  weightLabel,
  inputDistanceToMeters,
  inputPaceToSecPerKm,
  secPerKmToInputPace,
  metersToYards,
  KM_TO_MILES,
  kgToLbs,
  lbsToKg,
  cmToInches,
  inchesToCm,
  secPer100mToSecPer100yd,
  secPer100ydToSecPer100m,
} from '@/lib/units'

interface UnitContextType {
  units: UnitSystem
  setUnits: (u: UnitSystem) => void
  isImperial: boolean
  // Formatting
  fmtDistance: (meters: number | null, sport: string) => string
  fmtDistanceShort: (meters: number | null, sport: string) => string
  fmtPace: (secPerKm: number | null) => string
  fmtPaceForSport: (secPerKm: number | null, sport: string) => string
  fmtElevation: (meters: number | null) => string
  fmtSpeed: (mps: number | null) => string
  fmtWeight: (kg: number | null) => string
  // Labels
  distLabel: string          // "mi" or "km"
  paceLabel: string          // "/mi" or "/km"
  elevLabel: string          // "ft" or "m"
  weightLabel: string        // "lbs" or "kg"
  distInputLabel: (sport: string) => string  // "mi"/"km" or "yd"/"m" for swim
  // Input conversions (user input → metric for storage)
  distToMeters: (value: number, sport: string) => number
  paceToSecPerKm: (totalSeconds: number) => number
  secPerKmToDisplay: (secPerKm: number) => number
  // Weight/height conversions
  displayWeight: (kg: number) => number       // kg → display value (lbs or kg)
  saveWeight: (display: number) => number     // display value → kg
  displayHeight: (cm: number) => number       // cm → display value (in or cm)
  saveHeight: (display: number) => number     // display value → cm
  displaySwimPace: (secPer100m: number) => number  // sec/100m → display (sec/100yd or sec/100m)
  saveSwimPace: (display: number) => number         // display → sec/100m
  // Legacy compatibility
  convertDistance: (meters: number) => number
  convertPace: (secPerKm: number) => number
  speedLabel: string
  poolLabel: string
  distanceUnit: 'meters' | 'yards'
  speedUnit: 'km' | 'miles'
}

const UnitContext = createContext<UnitContextType | null>(null)

export function UnitProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState<UnitSystem>('metric')
  const supabase = createClient()

  useEffect(() => {
    async function loadPreference() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('unit_system')
        .eq('id', user.id)
        .single()
      if (data?.unit_system) {
        setUnits(data.unit_system as UnitSystem)
      }
    }
    loadPreference()
  }, [supabase])

  const isImperial = units === 'imperial'

  const fmtDistance = useCallback((m: number | null, sport: string) => formatDistance(m, sport, units), [units])
  const fmtDistanceShort = useCallback((m: number | null, sport: string) => formatDistanceShort(m, sport, units), [units])
  const fmtPace = useCallback((s: number | null) => formatPace(s, units), [units])
  const fmtPaceForSportFn = useCallback((s: number | null, sport: string) => formatPaceForSport(s, sport, units), [units])
  const fmtElevation = useCallback((m: number | null) => formatElevation(m, units), [units])
  const fmtSpeed = useCallback((mps: number | null) => formatSpeed(mps, units), [units])
  const fmtWeight = useCallback((kg: number | null) => formatWeight(kg, units), [units])

  const distInputLabelFn = useCallback((sport: string) => distanceInputLabel(sport, units), [units])
  const distToMeters = useCallback((v: number, sport: string) => inputDistanceToMeters(v, sport, units), [units])
  const paceToSecPerKm = useCallback((s: number) => inputPaceToSecPerKm(s, units), [units])
  const secPerKmToDisplay = useCallback((s: number) => secPerKmToInputPace(s, units), [units])

  // Weight/height bidirectional
  const displayWeightFn = useCallback((kg: number) => isImperial ? kgToLbs(kg) : kg, [isImperial])
  const saveWeightFn = useCallback((display: number) => isImperial ? lbsToKg(display) : display, [isImperial])
  const displayHeightFn = useCallback((cm: number) => isImperial ? cmToInches(cm) : cm, [isImperial])
  const saveHeightFn = useCallback((display: number) => isImperial ? inchesToCm(display) : display, [isImperial])
  const displaySwimPaceFn = useCallback((secPer100m: number) => isImperial ? secPer100mToSecPer100yd(secPer100m) : secPer100m, [isImperial])
  const saveSwimPaceFn = useCallback((display: number) => isImperial ? secPer100ydToSecPer100m(display) : display, [isImperial])

  // Legacy compat for existing code
  const convertDistance = useCallback(
    (meters: number) => isImperial ? Math.round(metersToYards(meters)) : meters,
    [isImperial]
  )
  const convertPace = useCallback(
    (secPerKm: number) => isImperial ? Math.round(secPerKm / KM_TO_MILES) : secPerKm,
    [isImperial]
  )

  return (
    <UnitContext.Provider
      value={{
        units,
        setUnits,
        isImperial,
        fmtDistance,
        fmtDistanceShort,
        fmtPace,
        fmtPaceForSport: fmtPaceForSportFn,
        fmtElevation,
        fmtSpeed,
        fmtWeight,
        distLabel: distanceLabel(units),
        paceLabel: paceLabel(units),
        elevLabel: elevationLabel(units),
        weightLabel: weightLabel(units),
        distInputLabel: distInputLabelFn,
        distToMeters,
        paceToSecPerKm,
        secPerKmToDisplay,
        displayWeight: displayWeightFn,
        saveWeight: saveWeightFn,
        displayHeight: displayHeightFn,
        saveHeight: saveHeightFn,
        displaySwimPace: displaySwimPaceFn,
        saveSwimPace: saveSwimPaceFn,
        convertDistance,
        convertPace,
        speedLabel: isImperial ? 'mi' : 'km',
        poolLabel: isImperial ? '/100yd' : '/100m',
        distanceUnit: isImperial ? 'yards' : 'meters',
        speedUnit: isImperial ? 'miles' : 'km',
      }}
    >
      {children}
    </UnitContext.Provider>
  )
}

export function useUnits() {
  const ctx = useContext(UnitContext)
  if (!ctx) throw new Error('useUnits must be used within UnitProvider')
  return ctx
}
