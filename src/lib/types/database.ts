export interface Profile {
  id: string
  email: string
  display_name: string | null
  unit_system: 'imperial' | 'metric'
  created_at: string
}

export interface Workout {
  id: string
  user_id: string
  sport: 'swim' | 'bike' | 'run' | 'brick'
  title: string
  date: string
  duration_seconds: number | null
  distance_meters: number | null
  // Swim
  pool_length_meters: number | null
  stroke_type: string | null
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
  // Universal
  avg_hr: number | null
  max_hr: number | null
  calories: number | null
  rpe: number | null
  notes: string | null
  created_at: string
}

export interface SessionMetric {
  id: string
  workout_id: string
  timestamp_offset_seconds: number
  heart_rate: number | null
  power_watts: number | null
  pace_sec_per_km: number | null
  cadence: number | null
  speed_mps: number | null
}

export interface ManualLog {
  id: string
  user_id: string
  workout_id: string | null
  date: string
  category: 'metabolic' | 'physiological' | 'environmental'
  log_type: string
  value: number
  unit: string | null
}

export interface UploadedFile {
  id: string
  user_id: string
  file_name: string
  file_type: 'fit' | 'csv' | 'pdf'
  file_size_bytes: number
  storage_path: string
  status: 'uploaded' | 'processing' | 'parsed' | 'error'
}
