import type { RacesCatalogueRow, FitnessSnapshotRow } from '@/lib/types/social'

/** Race distances in metres/km for each category */
const RACE_DISTANCES = {
  sprint:  { swim_m: 750,  bike_km: 20,  run_km: 5  },
  olympic: { swim_m: 1500, bike_km: 40,  run_km: 10 },
  half:    { swim_m: 1900, bike_km: 90,  run_km: 21.1 },
  full:    { swim_m: 3800, bike_km: 180, run_km: 42.2 },
}

/** Standard transition times (seconds) by race distance */
const TRANSITION_TIMES = {
  sprint:  { t1: 90,  t2: 60  },
  olympic: { t1: 120, t2: 90  },
  half:    { t1: 150, t2: 120 },
  full:    { t1: 180, t2: 150 },
}

/**
 * Estimate race finish time in seconds from a fitness snapshot.
 * Returns null if insufficient data (<2 of 3 disciplines have data).
 */
export function projectFinishTime(
  race: Pick<RacesCatalogueRow, 'distance' | 'swim_m' | 'bike_km' | 'run_km'>,
  snapshot: FitnessSnapshotRow
): number | null {
  const dist = RACE_DISTANCES[race.distance] ?? RACE_DISTANCES.olympic
  const trans = TRANSITION_TIMES[race.distance] ?? TRANSITION_TIMES.olympic

  // Use race-specific distances if available, otherwise use category defaults
  const swimM  = race.swim_m  ?? dist.swim_m
  const bikeKm = race.bike_km ?? dist.bike_km
  const runKm  = race.run_km  ?? dist.run_km

  let knownSegments = 0
  let totalSec = trans.t1 + trans.t2

  // ── Swim ────────────────────────────────────────────────────────────────────
  if (snapshot.css_sec_per_100m) {
    // Apply ~5% race-day effort modifier (athletes push harder in races)
    const pacePer100m = snapshot.css_sec_per_100m * 0.95
    totalSec += (swimM / 100) * pacePer100m
    knownSegments++
  }

  // ── Bike ────────────────────────────────────────────────────────────────────
  if (snapshot.ftp_watts) {
    // Race effort ~75% of FTP for Ironman, 85% for shorter distances
    const effortFactor = race.distance === 'full' ? 0.75
      : race.distance === 'half' ? 0.80
      : 0.85
    const raceFTP  = snapshot.ftp_watts * effortFactor
    // ~3.5W/kg assumed; use power-to-speed approximation
    // Simplified: average triathlete produces ~230W at 35km/h
    // Speed (km/h) ≈ 35 * (raceFTP / 230)^0.33 (aerodynamic drag cube-root)
    const speedKph = 35 * Math.pow(raceFTP / 230, 0.33)
    totalSec += (bikeKm / speedKph) * 3600
    knownSegments++
  }

  // ── Run ─────────────────────────────────────────────────────────────────────
  if (snapshot.run_pace_sec_per_km) {
    // Apply fatigue factor for longer distances
    const fatigue = race.distance === 'full' ? 1.18
      : race.distance === 'half' ? 1.10
      : race.distance === 'olympic' ? 1.05
      : 1.02
    const paceSec = snapshot.run_pace_sec_per_km * fatigue
    totalSec += runKm * paceSec
    knownSegments++
  }

  if (knownSegments < 2) return null

  return Math.round(totalSec)
}

/** Format seconds as h:mm:ss */
export function formatFinishTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
