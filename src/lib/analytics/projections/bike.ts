/*
=== BIKE SPEED ===
targetPower = FTP × IF[distance]
speed: prefer empirical (flat rides, power-adjusted) → fallback: v ≈ 5.1 × P^0.36
adjust: courseProfile, heat(+3%/5°F>75), altitude(+2%/1000ft>3000)
wind: physics-based loop formula — t_wind/t_calm = v₀²/(v₀²−v_eff²)
      v_eff = windSpeedKph × 0.5 (average headwind exposure on loop course)
      threshold ≥10 kph (6 mph), capped at +25% time increase
*/

import type { Workout } from '@/lib/types/database'
import type { RaceDistance } from '@/lib/types/race-plan'

export interface SplitProjection {
  realistic: number
  optimistic: number
  conservative: number
}

export interface BikeProjectionResult extends SplitProjection {
  targetPower: number
  windAdjustmentSeconds: number // 0 when no wind data; positive = slower
}

interface BikeConditions {
  tempHighF?: number | null
  altitudeFt?: number | null
  courseProfile?: 'flat' | 'rolling' | 'hilly' | 'mountainous' | null
  windSpeedKph?: number | null
}

const IF_TARGET: Record<string, number> = {
  super_sprint: 0.98,
  sprint: 0.95,
  wt_sprint: 0.95,
  olympic: 0.85,
  wt_standard: 0.85,
  '70.3': 0.76,
  '140.6': 0.70,
  custom: 0.76,
}

export function projectBikeSplit(
  ftp: number | null,
  weight: number | null,
  raceDistance: RaceDistance,
  bikeDistanceKm: number,
  conditions: BikeConditions | null,
  recentBikeWorkouts: Workout[]
): BikeProjectionResult {
  const effectiveFtp = ftp ?? 180 // age grouper default
  const targetPower = effectiveFtp * (IF_TARGET[raceDistance] ?? 0.76)

  // Environmental adjustments (heat, altitude)
  let envMultiplier = 1.0

  if (conditions?.tempHighF != null && conditions.tempHighF > 75) {
    envMultiplier += 0.03 * Math.floor((conditions.tempHighF - 75) / 5)
  }

  if (conditions?.altitudeFt != null && conditions.altitudeFt > 3000) {
    envMultiplier += 0.02 * Math.floor((conditions.altitudeFt - 3000) / 1000)
  }

  // Elevation-aware speed estimation
  let avgSpeedKph: number

  // Check for real-world speed data from flat rides (≥40 min, <8m gain/km)
  const flatRides = recentBikeWorkouts.filter(
    (w) =>
      w.avg_speed_mps != null &&
      w.avg_speed_mps > 3.5 && // exclude indoor trainer / stationary data (<12.6 km/h)
      (w.duration_seconds || 0) >= 2400 &&
      (w.elevation_gain_meters ?? 0) / ((w.distance_meters || 1) / 1000) < 8
  )

  if (flatRides.length >= 3) {
    // Empirical speed, power-adjusted: speed ∝ power^(1/3)
    const top5 = flatRides.slice(0, 5)
    const avgWorkoutSpeed =
      top5.reduce((sum, w) => sum + w.avg_speed_mps! * 3.6, 0) / top5.length
    const avgWorkoutPower =
      top5.reduce(
        (sum, w) => sum + (w.normalized_power ?? w.avg_power_watts ?? targetPower),
        0
      ) / top5.length

    avgSpeedKph = avgWorkoutSpeed * Math.pow(targetPower / avgWorkoutPower, 1 / 3)
  } else {
    // Fallback: regression approximation for typical TT setup at sea level
    // v(km/h) ≈ 5.1 × P^0.36  (calibrated: 200W → ~35 km/h, 150W → ~30 km/h)
    avgSpeedKph = 5.1 * Math.pow(targetPower, 0.36)
  }

  // Course profile modifier
  if (conditions?.courseProfile === 'hilly') {
    avgSpeedKph *= 0.93
  } else if (conditions?.courseProfile === 'mountainous') {
    avgSpeedKph *= 0.87
  }

  // Apply heat/altitude slowdown
  avgSpeedKph /= envMultiplier

  const baseTimeSeconds = (bikeDistanceKm / avgSpeedKph) * 3600

  // ─── Wind resistance adjustment ────────────────────────────────────────────
  // Physics basis: aerodynamic drag scales with (v_ground + v_wind)²,
  // so riding into a headwind costs disproportionately more than a tailwind saves.
  //
  // For a loop/out-and-back course at constant power:
  //   t_wind / t_calm = v₀² / (v₀² − v_eff²)
  //
  // where v_eff = wind_speed × 0.5 (loop exposure factor — on average ~50% of
  // the course faces a headwind component, rest is tailwind or crosswind).
  //
  // Only applied at ≥ 13 kph (8 mph) where the net penalty exceeds ~2%.
  // Capped at +25% to prevent extreme values in gale conditions.
  // ───────────────────────────────────────────────────────────────────────────
  let windAdjustmentSeconds = 0

  if (conditions?.windSpeedKph != null && conditions.windSpeedKph >= 10) {
    const v0 = avgSpeedKph
    // Effective headwind component on a loop course (~35% exposure).
    // A tri loop faces ~25% pure headwind, ~25% pure tailwind, ~50% crosswind;
    // crosswind drag contribution reduces effective factor to ~0.35.
    const vEff = conditions.windSpeedKph * 0.35

    if (vEff < v0) {
      // t_wind/t_calm multiplier — always > 1 (net time cost)
      const rawMultiplier = (v0 * v0) / (v0 * v0 - vEff * vEff)
      const windMultiplier = Math.min(rawMultiplier, 1.25)
      const windTime = Math.round(baseTimeSeconds * windMultiplier)
      windAdjustmentSeconds = windTime - Math.round(baseTimeSeconds)
    }
  }

  const bikeTimeSeconds = Math.round(baseTimeSeconds) + windAdjustmentSeconds

  const qualifyingPowers = recentBikeWorkouts
    .filter((w) => w.normalized_power && (w.duration_seconds || 0) >= 1200)
    .map((w) => w.normalized_power!)

  let bikeCV: number | null = null
  if (qualifyingPowers.length >= 2) {
    const mean = qualifyingPowers.reduce((a, b) => a + b, 0) / qualifyingPowers.length
    const variance = qualifyingPowers.reduce((s, p) => s + (p - mean) ** 2, 0) / qualifyingPowers.length
    bikeCV = Math.sqrt(variance) / mean
  }

  const bandWidth = (bikeCV != null && bikeCV > 0.15)
    ? { opt: 0.93, cons: 1.10 }
    : { opt: 0.97, cons: 1.05 }

  return {
    targetPower: Math.round(targetPower),
    windAdjustmentSeconds,
    realistic: bikeTimeSeconds,
    optimistic: Math.round(bikeTimeSeconds * bandWidth.opt),
    conservative: Math.round(bikeTimeSeconds * bandWidth.cons),
  }
}
