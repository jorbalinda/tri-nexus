import type { FitnessSnapshot } from '@/lib/types/race-plan'
import type { HRAdjustmentResult } from '@/lib/analytics/hr-adjustment'

export interface RaceProjection {
  id: string
  user_id: string
  target_race_id: string
  projected_at: string
  swim_seconds: number
  t1_seconds: number
  bike_seconds: number
  t2_seconds: number
  run_seconds: number
  optimistic_seconds: number
  realistic_seconds: number
  conservative_seconds: number
  confidence_score: number
  data_points_used: number
  fitness_snapshot: FitnessSnapshot | null
  weather_adjustment: Record<string, unknown> | null
  hr_adjustment: HRAdjustmentResult | null
  is_revealed: boolean
  created_at: string
}
