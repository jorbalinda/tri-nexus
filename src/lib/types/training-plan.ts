export type PlanSport = 'swim' | 'bike' | 'run'

export type WorkoutCategory =
  | 'lsd'
  | 'recovery'
  | 'tempo'
  | 'threshold'
  | 'vo2max'
  | 'sprint'
  | 'brick'
  | 'race_pace'
  | 'hill_repeats'
  | 'fartlek'
  | 'drills'
  | 'test'

export type TrainingZone = 1 | 2 | 3 | 4 | 5 | 'max' | 'mixed'

export type Difficulty = 'easy' | 'moderate' | 'hard' | 'very_hard'

export interface WorkoutInterval {
  label: string
  duration_minutes?: number
  distance_meters?: number
  repeat?: number
  zone?: TrainingZone
  rest_seconds?: number
  notes?: string
}

export interface LibraryWorkout {
  id: string
  sport: PlanSport
  category: WorkoutCategory
  name: string
  description: string
  zone: TrainingZone
  duration_minutes: number
  distance_meters?: number
  rpe_range: [number, number]
  structure: WorkoutInterval[]
  tags: string[]
  difficulty: Difficulty
}

export interface CategoryMeta {
  key: WorkoutCategory
  label: string
  shortLabel: string
  zone: TrainingZone
  color: string
}
