/**
 * Auto-calculation engine for derived workout fields.
 * Runs server-side before insert/update.
 * All values stored in metric; imperial conversions happen at display time.
 */

import { secPerKmToSecPerMile, metersToMiles, mpsToMph, metersToFeet } from '@/lib/units'
import type { UnitSystem } from '@/lib/units'
import { calculateTSS, type TssSource } from '@/lib/analytics/training-stress'
import type { Workout } from '@/lib/types/database'

interface CalcInput {
  sport: string
  duration_seconds?: number | null
  distance_meters?: number | null
  avg_power_watts?: number | null
  normalized_power?: number | null
  avg_pace_sec_per_km?: number | null
  avg_hr?: number | null
  rpe?: number | null
  tss?: number | null  // explicit device value
  // Thresholds from user profile
  ftp_watts?: number | null
  threshold_pace_swim?: number | null
  threshold_pace_run?: number | null
  resting_heart_rate?: number | null
  max_heart_rate?: number | null
}

interface CalcOutput {
  avg_speed_mps?: number | null
  avg_pace_sec_per_km?: number | null
  intensity_factor?: number | null
  tss?: number | null
  tss_source?: TssSource | null
}

export function computeDerivedFields(input: CalcInput): CalcOutput {
  const result: CalcOutput = {}

  const duration = input.duration_seconds
  const distance = input.distance_meters

  // Average speed
  if (distance && duration && duration > 0) {
    result.avg_speed_mps = Number((distance / duration).toFixed(3))
  }

  // Average pace for run/swim
  if (result.avg_speed_mps && result.avg_speed_mps > 0 && (input.sport === 'run' || input.sport === 'swim')) {
    result.avg_pace_sec_per_km = Math.round(1000 / result.avg_speed_mps)
  }

  // Build a pseudo-workout to delegate TSS to the shared engine
  const pseudoWorkout = {
    sport: input.sport,
    duration_seconds: input.duration_seconds ?? null,
    distance_meters: input.distance_meters ?? null,
    avg_power_watts: input.avg_power_watts ?? null,
    normalized_power: input.normalized_power ?? null,
    avg_pace_sec_per_km: input.avg_pace_sec_per_km ?? result.avg_pace_sec_per_km ?? null,
    avg_hr: input.avg_hr ?? null,
    rpe: input.rpe ?? null,
    tss: input.tss ?? null,
    intensity_factor: null,
  } as unknown as Workout

  const thresholds = {
    ftp_watts: input.ftp_watts,
    threshold_pace_swim: input.threshold_pace_swim,
    threshold_pace_run: input.threshold_pace_run,
    resting_heart_rate: input.resting_heart_rate,
    max_heart_rate: input.max_heart_rate,
  }

  const tssResult = calculateTSS(pseudoWorkout, thresholds)
  if (tssResult.tss > 0) {
    result.intensity_factor = Number(tssResult.intensity_factor.toFixed(3))
    result.tss = tssResult.tss
    result.tss_source = tssResult.source
  }

  return result
}

/**
 * Compute HR zone percentages from time-in-zone values.
 */
export function computeZonePercentages(zones: { time_in_zone_seconds: number }[]): number[] {
  const total = zones.reduce((sum, z) => sum + z.time_in_zone_seconds, 0)
  if (total === 0) return zones.map(() => 0)
  return zones.map((z) => Number(((z.time_in_zone_seconds / total) * 100).toFixed(1)))
}

/**
 * Add imperial-converted display fields to a workout object.
 * Appends _imperial suffixed fields alongside the metric originals.
 */
export function addImperialFields(workout: Record<string, unknown>, units: UnitSystem): Record<string, unknown> {
  if (units !== 'imperial') return workout

  const result = { ...workout }

  // Distance in miles
  const distanceMeters = workout.distance_meters as number | null
  if (distanceMeters) {
    result.distance_miles = Number(metersToMiles(distanceMeters).toFixed(3))
  }

  // Pace in sec/mile
  const paceSecPerKm = workout.avg_pace_sec_per_km as number | null
  if (paceSecPerKm) {
    result.avg_pace_sec_per_mile = secPerKmToSecPerMile(paceSecPerKm)
  }

  // Speed in mph
  const speedMps = workout.avg_speed_mps as number | null
  if (speedMps) {
    result.avg_speed_mph = Number(mpsToMph(speedMps).toFixed(2))
  }
  const maxSpeedMps = workout.max_speed_mps as number | null
  if (maxSpeedMps) {
    result.max_speed_mph = Number(mpsToMph(maxSpeedMps).toFixed(2))
  }

  // Elevation in feet
  const elevGain = workout.elevation_gain_meters as number | null
  if (elevGain) {
    result.elevation_gain_feet = Math.round(metersToFeet(elevGain))
  }
  const totalDescent = workout.total_descent_meters as number | null
  if (totalDescent) {
    result.total_descent_feet = Math.round(metersToFeet(totalDescent))
  }

  return result
}
