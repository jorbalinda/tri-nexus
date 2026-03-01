/**
 * Centralized unit conversion and formatting.
 * Backend stores everything in metric (meters, sec/km, m/s, kg, cm).
 * This module converts for display based on user preference.
 */

// Conversion constants
export const KM_TO_MILES = 0.621371
export const METERS_TO_FEET = 3.28084
export const METERS_TO_YARDS = 1.09361
export const KG_TO_LBS = 2.20462
export const CM_TO_INCHES = 0.393701

// Distance conversions
export function metersToKm(meters: number): number {
  return meters / 1000
}

export function metersToMiles(meters: number): number {
  return meters / 1609.344
}

export function metersToFeet(meters: number): number {
  return meters * METERS_TO_FEET
}

export function metersToYards(meters: number): number {
  return meters * METERS_TO_YARDS
}

// Pace conversions (stored as sec/km)
export function secPerKmToSecPerMile(secPerKm: number): number {
  return Math.round(secPerKm / KM_TO_MILES)
}

// Speed conversions (stored as m/s)
export function mpsToKph(mps: number): number {
  return mps * 3.6
}

export function mpsToMph(mps: number): number {
  return mps * 2.23694
}

// Weight
export function kgToLbs(kg: number): number {
  return kg * KG_TO_LBS
}

export function lbsToKg(lbs: number): number {
  return lbs / KG_TO_LBS
}

// Height
export function cmToInches(cm: number): number {
  return cm * CM_TO_INCHES
}

export function inchesToCm(inches: number): number {
  return inches / CM_TO_INCHES
}

// Swim pace (stored as sec/100m)
export function secPer100mToSecPer100yd(secPer100m: number): number {
  return Math.round(secPer100m * 0.9144)
}

export function secPer100ydToSecPer100m(secPer100yd: number): number {
  return Math.round(secPer100yd / 0.9144)
}

// Input conversions (imperial user input → metric for storage)
export function milesToMeters(miles: number): number {
  return miles * 1609.344
}

export function feetToMeters(feet: number): number {
  return feet / METERS_TO_FEET
}

export function secPerMileToSecPerKm(secPerMile: number): number {
  return Math.round(secPerMile * KM_TO_MILES)
}

// ─── Formatting functions ────────────────────────────────────────────

export type UnitSystem = 'metric' | 'imperial'

export function formatDistance(meters: number | null, sport: string, units: UnitSystem): string {
  if (!meters) return '-'
  if (sport === 'swim') {
    if (units === 'imperial') return `${Math.round(metersToYards(meters))} yd`
    return `${Math.round(meters)}m`
  }
  if (units === 'imperial') {
    const mi = metersToMiles(meters)
    return mi < 0.1 ? `${Math.round(metersToFeet(meters))} ft` : `${mi.toFixed(2)} mi`
  }
  const km = metersToKm(meters)
  return km < 1 ? `${Math.round(meters)}m` : `${km.toFixed(2)} km`
}

export function formatDistanceShort(meters: number | null, sport: string, units: UnitSystem): string {
  if (!meters) return ''
  if (sport === 'swim') {
    if (units === 'imperial') return `${Math.round(metersToYards(meters))}yd`
    return `${Math.round(meters)}m`
  }
  if (units === 'imperial') return `${metersToMiles(meters).toFixed(1)}mi`
  return `${metersToKm(meters).toFixed(1)}km`
}

export function formatPace(secPerKm: number | null, units: UnitSystem): string {
  if (!secPerKm) return '-'
  const val = units === 'imperial' ? secPerKmToSecPerMile(secPerKm) : secPerKm
  const m = Math.floor(val / 60)
  const s = Math.round(val % 60)
  const label = units === 'imperial' ? '/mi' : '/km'
  return `${m}:${s.toString().padStart(2, '0')}${label}`
}

export function formatPaceForSport(secPerKm: number | null, sport: string, units: UnitSystem): string {
  if (!secPerKm) return '-'
  if (sport === 'swim') {
    const secPer100m = secPerKm / 10
    const val = units === 'imperial' ? secPer100mToSecPer100yd(secPer100m) : secPer100m
    const m = Math.floor(val / 60)
    const s = Math.round(val % 60)
    const label = units === 'imperial' ? '/100yd' : '/100m'
    return `${m}:${s.toString().padStart(2, '0')}${label}`
  }
  return formatPace(secPerKm, units)
}

export function formatElevation(meters: number | null, units: UnitSystem): string {
  if (!meters) return '-'
  if (units === 'imperial') return `${Math.round(metersToFeet(meters))} ft`
  return `${Math.round(meters)}m`
}

export function formatSpeed(mps: number | null, units: UnitSystem): string {
  if (!mps) return '-'
  if (units === 'imperial') return `${mpsToMph(mps).toFixed(1)} mph`
  return `${mpsToKph(mps).toFixed(1)} km/h`
}

export function formatWeight(kg: number | null, units: UnitSystem): string {
  if (!kg) return '-'
  if (units === 'imperial') return `${kgToLbs(kg).toFixed(1)} lbs`
  return `${kg.toFixed(1)} kg`
}

export function distanceInputLabel(sport: string, units: UnitSystem): string {
  if (sport === 'swim') return units === 'imperial' ? 'yd' : 'm'
  return units === 'imperial' ? 'mi' : 'km'
}

export function paceLabel(units: UnitSystem): string {
  return units === 'imperial' ? '/mi' : '/km'
}

export function distanceLabel(units: UnitSystem): string {
  return units === 'imperial' ? 'mi' : 'km'
}

export function elevationLabel(units: UnitSystem): string {
  return units === 'imperial' ? 'ft' : 'm'
}

export function weightLabel(units: UnitSystem): string {
  return units === 'imperial' ? 'lbs' : 'kg'
}

/**
 * Convert user's distance input to meters for storage.
 * Swim input is always in m/yd; bike/run in km/mi.
 */
export function inputDistanceToMeters(value: number, sport: string, units: UnitSystem): number {
  if (sport === 'swim') {
    return units === 'imperial' ? Math.round(value / METERS_TO_YARDS) : Math.round(value)
  }
  return units === 'imperial' ? Math.round(milesToMeters(value)) : Math.round(value * 1000)
}

/**
 * Convert user's pace input (sec) to sec/km for storage.
 * Input is sec/mi for imperial, sec/km for metric.
 */
export function inputPaceToSecPerKm(totalSeconds: number, units: UnitSystem): number {
  return units === 'imperial' ? secPerMileToSecPerKm(totalSeconds) : totalSeconds
}

/**
 * Convert stored sec/km to display seconds for input field.
 */
export function secPerKmToInputPace(secPerKm: number, units: UnitSystem): number {
  return units === 'imperial' ? secPerKmToSecPerMile(secPerKm) : secPerKm
}
