export interface TargetRace {
  id: string
  user_id: string
  race_name: string
  race_date: string
  race_course_id: string | null
  race_distance: 'sprint' | 'olympic' | '70.3' | '140.6' | 'custom'
  priority: 'a' | 'b' | 'c'
  custom_swim_distance_m: number | null
  custom_bike_distance_km: number | null
  custom_run_distance_km: number | null
  gpx_course_data: Record<string, unknown> | null
  goal_time_seconds: number | null
  notes: string | null
  actual_finish_seconds: number | null
  actual_swim_seconds: number | null
  actual_bike_seconds: number | null
  actual_run_seconds: number | null
  actual_t1_seconds: number | null
  actual_t2_seconds: number | null
  race_type: 'triathlon' | 'duathlon' | 'aquabike'
  water_type: 'pool' | 'lake' | 'river' | 'bay' | 'ocean' | null
  wetsuit: boolean
  expected_temp_f: number | null
  gun_start_time: string | null
  altitude_ft: number | null
  course_profile: 'flat' | 'rolling' | 'hilly' | 'mountainous' | null
  swim_type: 'pool' | 'lake' | 'river' | 'bay' | 'ocean' | null
  status: 'upcoming' | 'race_week' | 'completed' | 'dns' | 'dnf'
  created_at: string
  updated_at: string
}
