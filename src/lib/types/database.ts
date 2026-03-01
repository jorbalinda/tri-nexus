export interface Profile {
  id: string
  email: string
  display_name: string | null
  unit_system: 'imperial' | 'metric'
  weight_kg: number | null
  date_of_birth: string | null
  gender: 'male' | 'female' | 'non_binary' | null
  timezone: string
  onboarding_completed: boolean
  subscription_tier: 'free' | 'pro'
  subscription_expires_at: string | null
  equipment_details: Record<string, unknown> | null
  sweat_rate_lph: number | null
  profile_public: boolean
  resting_heart_rate: number | null
  max_heart_rate: number | null
  ftp_watts: number | null
  threshold_pace_swim: number | null
  threshold_pace_run: number | null
  height_cm: number | null
  max_hr_source: 'none' | 'manual' | 'age_formula' | 'workout_derived'
  lthr_swim: number | null
  lthr_bike: number | null
  lthr_run: number | null
  created_at: string
}

export interface WorkoutBlock {
  label: string
  distance_meters: number | null
  zone: number | string | null
  rpe: number | null
  duration_minutes: number | null
  notes: string | null
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
  blocks: WorkoutBlock[] | null
  source: 'manual' | 'garmin' | 'file_upload' | 'strava'
  external_id: string | null
  external_url: string | null
  started_at: string | null
  moving_time_seconds: number | null
  is_indoor: boolean | null
  gear_id: string | null
  weather_temp_c: number | null
  weather_conditions: string | null
  deleted_at: string | null
  max_power_watts: number | null
  intensity_factor: number | null
  avg_speed_mps: number | null
  max_speed_mps: number | null
  max_cadence: number | null
  total_descent_meters: number | null
  tss_source: 'device' | 'power' | 'pace' | 'hr' | 'rpe' | null
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
  latitude: number | null
  longitude: number | null
  altitude_meters: number | null
  temperature_c: number | null
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
  file_type: 'fit' | 'tcx' | 'gpx' | 'csv' | 'pdf'
  file_size_bytes: number
  storage_path: string
  status: 'uploaded' | 'processing' | 'parsed' | 'error'
}


export interface SleepLog {
  id: string
  user_id: string
  log_date: string
  sleep_score: number | null
  duration_hours: number | null
  source: string | null
  created_at: string
}

export interface NutritionPlan {
  id: string
  race_id: string
  segment: 'bike' | 'run'
  carbs_per_hour_g: number | null
  sodium_per_hour_mg: number | null
  fluid_per_hour_oz: number | null
  created_at: string
}

export interface FuelingTimelineEntry {
  id: string
  nutrition_plan_id: string
  time_offset_minutes: number
  instruction: string
  created_at: string
}

export interface TimelineEvent {
  id: string
  race_id: string
  event_name: string
  scheduled_time: string
  event_type: 'logistics' | 'nutrition' | 'action' | null
  is_custom: boolean
  is_completed: boolean
  created_at: string
}

export interface RaceResult {
  id: string
  race_id: string
  actual_swim_seconds: number | null
  actual_t1_seconds: number | null
  actual_bike_seconds: number | null
  actual_t2_seconds: number | null
  actual_run_seconds: number | null
  actual_total_seconds: number | null
  weather_notes: string | null
  mechanical_notes: string | null
  nutrition_notes: string | null
  overall_notes: string | null
  created_at: string
}

export interface DeviceConnection {
  id: string
  user_id: string
  provider: 'garmin' | 'strava' | 'wahoo' | 'coros'
  access_token: string
  token_secret: string | null
  refresh_token: string | null
  token_expires_at: string | null
  external_user_id: string | null
  last_sync_at: string | null
  sync_status: 'active' | 'paused' | 'error' | 'disconnected'
  created_at: string
}

export interface WorkoutHRZone {
  id: string
  workout_id: string
  zone_number: number
  min_hr: number
  max_hr: number
  time_in_zone_seconds: number
  percent_of_total: number
}

export interface WorkoutPowerZone {
  id: string
  workout_id: string
  zone_number: number
  min_watts: number
  max_watts: number
  time_in_zone_seconds: number
  percent_of_total: number
}

export interface WorkoutLap {
  id: string
  workout_id: string
  lap_number: number
  start_offset_seconds: number | null
  duration_seconds: number | null
  distance_meters: number | null
  avg_hr: number | null
  max_hr: number | null
  avg_power_watts: number | null
  avg_pace_sec_per_km: number | null
  avg_cadence: number | null
  elevation_gain_meters: number | null
}
