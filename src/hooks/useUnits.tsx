'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface UnitContextType {
  distanceUnit: 'meters' | 'yards'
  speedUnit: 'km' | 'miles'
  toggleDistance: () => void
  toggleSpeed: () => void
  convertDistance: (meters: number) => number
  convertSpeed: (kmValue: number) => number
  convertPace: (secPerKm: number) => number
  distanceLabel: string
  speedLabel: string
  paceLabel: string
  poolLabel: string
}

const UnitContext = createContext<UnitContextType | null>(null)

const METERS_TO_YARDS = 1.09361
const KM_TO_MILES = 0.621371

export function UnitProvider({ children }: { children: ReactNode }) {
  const [distanceUnit, setDistanceUnit] = useState<'meters' | 'yards'>('meters')
  const [speedUnit, setSpeedUnit] = useState<'km' | 'miles'>('km')

  const toggleDistance = () =>
    setDistanceUnit((prev) => (prev === 'meters' ? 'yards' : 'meters'))

  const toggleSpeed = () =>
    setSpeedUnit((prev) => (prev === 'km' ? 'miles' : 'km'))

  const convertDistance = (meters: number) =>
    distanceUnit === 'yards' ? Math.round(meters * METERS_TO_YARDS) : meters

  const convertSpeed = (kmValue: number) =>
    speedUnit === 'miles' ? Number((kmValue * KM_TO_MILES).toFixed(2)) : kmValue

  // Convert sec/km to sec/mile (or keep as sec/km)
  const convertPace = (secPerKm: number) =>
    speedUnit === 'miles' ? Math.round(secPerKm / KM_TO_MILES) : secPerKm

  const distanceLabel = distanceUnit === 'yards' ? 'yd' : 'm'
  const speedLabel = speedUnit === 'miles' ? 'mi' : 'km'
  const paceLabel = speedUnit === 'miles' ? '/mi' : '/km'
  const poolLabel = distanceUnit === 'yards' ? '/100yd' : '/100m'

  return (
    <UnitContext.Provider
      value={{
        distanceUnit,
        speedUnit,
        toggleDistance,
        toggleSpeed,
        convertDistance,
        convertSpeed,
        convertPace,
        distanceLabel,
        speedLabel,
        paceLabel,
        poolLabel,
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
