export interface ParsedWorkout {
  sport: 'swim' | 'bike' | 'run' | 'brick' | null
  title: string | null
  date: string | null
  duration_seconds: number | null
  distance_meters: number | null
  avg_hr: number | null
  max_hr: number | null
  calories: number | null
  rpe: number | null
  notes: string | null
  // Swim
  pool_length_meters: number | null
  swolf: number | null
  // Bike
  avg_power_watts: number | null
  normalized_power: number | null
  tss: number | null
  avg_cadence_rpm: number | null
  elevation_gain_meters: number | null
  // Run
  avg_pace_sec_per_km: number | null
  avg_cadence_spm: number | null
  // Source
  source_file: string
  source_format: 'fit' | 'tcx' | 'gpx' | 'csv'
}
