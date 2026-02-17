// ---------------------------------------------------------------------------
// Race Plan Types — Expanded for qualification, pro/AG, dynamic dropdowns
// ---------------------------------------------------------------------------

export type RaceDistance =
  | 'sprint'
  | 'olympic'
  | '70.3'
  | '140.6'
  | 'wt_sprint'
  | 'wt_standard'
  | 'super_sprint'
  | 'custom'

export type AthleteClassification = 'age_grouper' | 'professional'

export type AgeGroupGoalType =
  | 'finish'
  | 'pr'
  | 'ag_podium'
  | 'ag_win'
  | 'qualify_im_703_worlds'
  | 'qualify_im_kona'
  | 'qualify_wt_ag_worlds'
  | 'qualify_usat_nationals'
  | 'legacy_qualification'

export type ProGoalType =
  | 'win_podium'
  | 'pro_card_qualification'
  | 'im_pro_slot'
  | 'pto_ranking_points'
  | 'wt_series_points'
  | 'prize_money'
  | 'course_record'
  | 'pr'

export type GoalType = AgeGroupGoalType | ProGoalType

export type RaceSeries =
  | 'ironman'
  | 'ironman_703'
  | 'world_triathlon'
  | 'wt_sprint_relay'
  | 'wt_long_distance'
  | 'pto_t100'
  | 'challenge'
  | 'usat'
  | 'local'
  | 'other'

export type CourseProfile = 'flat' | 'rolling' | 'hilly' | 'mountainous'
export type WaterType = 'pool' | 'lake' | 'ocean' | 'river'
export type WindCondition = 'calm' | 'light' | 'moderate' | 'strong'
export type CourseType = 'point_to_point' | 'out_and_back' | 'loop' | 'multi_loop'
export type Gender = 'male' | 'female' | 'non_binary'
export type ChecklistCategory = 'swim' | 'bike' | 'run' | 'transition' | 'nutrition' | 'special_needs'

export const AGE_GROUPS = [
  '18-24', '25-29', '30-34', '35-39', '40-44', '45-49',
  '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80-84', '85-89',
] as const
export type AgeGroup = (typeof AGE_GROUPS)[number]

// ---------------------------------------------------------------------------
// Dropdown option definitions (for dynamic UI)
// ---------------------------------------------------------------------------

export const AGE_GROUPER_GOALS: { value: AgeGroupGoalType; label: string }[] = [
  { value: 'finish', label: 'Finish' },
  { value: 'pr', label: 'Personal Record' },
  { value: 'ag_podium', label: 'Age Group Podium (top 3)' },
  { value: 'ag_win', label: 'Age Group Win' },
  { value: 'qualify_im_703_worlds', label: 'Qualify for IRONMAN 70.3 World Championship' },
  { value: 'qualify_im_kona', label: 'Qualify for IRONMAN World Championship (Kona)' },
  { value: 'qualify_wt_ag_worlds', label: 'Qualify for World Triathlon AG Worlds' },
  { value: 'qualify_usat_nationals', label: 'Qualify for USA Triathlon AG Nationals' },
  { value: 'legacy_qualification', label: 'Legacy Qualification (12 full-distance finishes)' },
]

export const PRO_GOALS: { value: ProGoalType; label: string }[] = [
  { value: 'win_podium', label: 'Win / Podium' },
  { value: 'pro_card_qualification', label: 'Pro Card Qualification' },
  { value: 'im_pro_slot', label: 'IRONMAN Pro Qualifying Slot' },
  { value: 'pto_ranking_points', label: 'PTO World Ranking Points' },
  { value: 'wt_series_points', label: 'World Triathlon Championship Series Points' },
  { value: 'prize_money', label: 'Prize Money Threshold (top 5/10)' },
  { value: 'course_record', label: 'Course Record' },
  { value: 'pr', label: 'Personal Record' },
]

export const RACE_SERIES_OPTIONS: { value: RaceSeries; label: string }[] = [
  { value: 'ironman', label: 'IRONMAN Series' },
  { value: 'ironman_703', label: 'IRONMAN 70.3 Series' },
  { value: 'world_triathlon', label: 'World Triathlon Championship Series' },
  { value: 'wt_sprint_relay', label: 'World Triathlon Sprint & Relay Championships' },
  { value: 'wt_long_distance', label: 'World Triathlon Long Distance Championships' },
  { value: 'pto_t100', label: 'PTO / T100 Triathlon World Tour' },
  { value: 'challenge', label: 'Challenge Family' },
  { value: 'usat', label: 'USA Triathlon (USAT) Sanctioned' },
  { value: 'local', label: 'Local / Unsanctioned' },
  { value: 'other', label: 'Other' },
]

export const DISTANCE_OPTIONS: { value: RaceDistance; label: string }[] = [
  { value: 'super_sprint', label: 'Super Sprint' },
  { value: 'sprint', label: 'Sprint (750m / 20K / 5K)' },
  { value: 'olympic', label: 'Olympic (1.5km / 40K / 10K)' },
  { value: 'wt_sprint', label: 'World Triathlon Sprint (draft-legal)' },
  { value: 'wt_standard', label: 'World Triathlon Standard (draft-legal)' },
  { value: '70.3', label: '70.3 Half Ironman (1.9K / 90K / 21.1K)' },
  { value: '140.6', label: '140.6 Ironman (3.8K / 180K / 42.2K)' },
  { value: 'custom', label: 'Custom distances' },
]

// ---------------------------------------------------------------------------
// Race conditions & distances
// ---------------------------------------------------------------------------

export interface RaceConditions {
  temp_low_f: number | null
  temp_high_f: number | null
  humidity_pct: number | null
  altitude_ft: number | null
  course_profile: CourseProfile
  water_temp_f: number | null
  water_type: WaterType
  wetsuit_legal: boolean | null
  wind: WindCondition
  course_type: CourseType
}

export interface RaceDistances {
  swim_m: number
  bike_km: number
  run_km: number
}

export const STANDARD_DISTANCES: Record<Exclude<RaceDistance, 'custom'>, RaceDistances> = {
  super_sprint: { swim_m: 400, bike_km: 10, run_km: 2.5 },
  sprint: { swim_m: 750, bike_km: 20, run_km: 5 },
  olympic: { swim_m: 1500, bike_km: 40, run_km: 10 },
  wt_sprint: { swim_m: 750, bike_km: 20, run_km: 5 },
  wt_standard: { swim_m: 1500, bike_km: 40, run_km: 10 },
  '70.3': { swim_m: 1900, bike_km: 90, run_km: 21.1 },
  '140.6': { swim_m: 3800, bike_km: 180, run_km: 42.2 },
}

// ---------------------------------------------------------------------------
// Qualification types
// ---------------------------------------------------------------------------

export type Championship = 'kona' | '70.3_worlds' | 'wt_ag_sprint' | 'wt_ag_standard' | 'wt_ag_long'

export interface QualificationStandard {
  id: string
  championship: Championship
  qualifying_year: number
  gender: Gender
  age_group: AgeGroup
  standard_multiplier: number | null
  benchmark_time_seconds: number | null
  estimated_cutoff_seconds: number | null
  source_note: string | null
}

export interface QualificationTarget {
  championship: Championship
  standard_multiplier: number | null
  estimated_qualifying_time: number | null
  ag_standard_source_year: number
}

export interface QualificationReadiness {
  ready: boolean
  gap_seconds: number
  confidence: 'low' | 'medium' | 'high'
  age_graded_time: number | null
  target_time: number | null
  recommendations: string[]
  explanation: string
}

// ---------------------------------------------------------------------------
// Pacing plan
// ---------------------------------------------------------------------------

export interface SwimPacing {
  targetPacePer100m: number
  estimatedSplitSeconds: number
  strategy: string
  strokeRateTarget: string
  sightingFrequency: string
  dataAvailable: boolean
}

export interface BikePacing {
  targetPowerWatts: number | null
  targetPowerRange: [number, number] | null
  targetHRZone: string
  estimatedSplitSeconds: number
  cadenceTarget: string
  strategy: string
  heatAdjustment: number
  altitudeAdjustment: number
  dataAvailable: boolean
  isDraftLegal: boolean
}

export interface RunPacing {
  targetPaceSecPerKm: number
  targetHRZone: string
  estimatedSplitSeconds: number
  strategy: string
  walkBreakStrategy: string | null
  brickFactorNote: string
  dataAvailable: boolean
}

export interface TransitionTargets {
  t1Seconds: number
  t2Seconds: number
  t1Checklist: string[]
  t2Checklist: string[]
}

export interface RaceEstimate {
  optimisticSeconds: number
  realisticSeconds: number
  conservativeSeconds: number
}

export interface PacingPlan {
  swim: SwimPacing
  bike: BikePacing
  run: RunPacing
  transitions: TransitionTargets
  totalEstimate: RaceEstimate
  qualificationPacing: QualificationPacingPlan | null
}

export interface QualificationPacingPlan {
  targetFinishSeconds: number
  swimSplitTarget: number
  bikeSplitTarget: number
  runSplitTarget: number
  t1Target: number
  t2Target: number
  gapToCurrentFitness: number
  recommendations: string[]
}

// ---------------------------------------------------------------------------
// Nutrition plan
// ---------------------------------------------------------------------------

export interface PreRaceNutrition {
  carbLoadingTarget: string
  hydrationTarget: string
  foodsToAvoid: string[]
  lastBigMeal: string
}

export interface RaceMorningNutrition {
  mealTarget: string
  exampleMeals: string[]
  caffeine: string
  hydration: string
}

export interface SegmentNutrition {
  carbsPerHour: string
  hydrationPerHour: string
  electrolytesPerHour: string
  timing: string
  productSuggestions: string[]
  notes: string
}

export interface CalorieSummary {
  totalCalories: number
  totalCarbsGrams: number
  bikeCalories: number
  bikeCarbsGrams: number
  runCalories: number
  runCarbsGrams: number
}

export interface NutritionPlan {
  preRace: PreRaceNutrition
  raceMorning: RaceMorningNutrition
  swim: string
  bike: SegmentNutrition
  run: SegmentNutrition
  summary: CalorieSummary
}

// ---------------------------------------------------------------------------
// Equipment plan
// ---------------------------------------------------------------------------

export interface EquipmentItem {
  name: string
  category: ChecklistCategory
}

export interface RaceWeekTimeline {
  daysOut: number
  label: string
  tasks: string[]
}

export interface EquipmentPlan {
  checklist: EquipmentItem[]
  raceWeekTimeline: RaceWeekTimeline[]
}

// ---------------------------------------------------------------------------
// Mindset plan
// ---------------------------------------------------------------------------

export interface MindsetPlan {
  mantras: string[]
  visualizationScript: string
  processGoals: string[]
  duringRaceStrategies: string[]
  raceWeekTips: string[]
  proTactics: string[] | null
}

// ---------------------------------------------------------------------------
// Fitness snapshot
// ---------------------------------------------------------------------------

export interface FitnessSnapshot {
  estimatedFTP: number | null
  estimatedCSS: number | null
  estimatedLTHR: { swim: number | null; bike: number | null; run: number | null }
  maxHR: number | null
  restingHR: number | null
  weeklyVolumeHours: number | null
  recentRacePace: { swim: number | null; bike: number | null; run: number | null }
  weight_kg: number | null
  konaStandardMultiplier: number | null
  ageGradedEstimate: number | null
}

// ---------------------------------------------------------------------------
// Race Course (pre-populated course database)
// ---------------------------------------------------------------------------

export interface RaceCourse {
  id: string
  user_id: string | null
  name: string
  location_city: string
  location_country: string
  race_series: RaceSeries
  race_distance: RaceDistance
  swim_distance_m: number | null
  bike_distance_km: number | null
  run_distance_km: number | null
  course_profile: CourseProfile
  course_type: CourseType
  water_type: WaterType
  typical_water_temp_f: number | null
  typical_temp_low_f: number | null
  typical_temp_high_f: number | null
  typical_humidity_pct: number | null
  altitude_ft: number | null
  typical_wind: WindCondition
  wetsuit_legal: boolean | null
  typical_race_month: number | null
  notable_features: string | null
  is_kona_qualifier: boolean
  is_703_worlds_qualifier: boolean
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Database row types
// ---------------------------------------------------------------------------

export interface RacePlan {
  id: string
  user_id: string
  race_name: string
  race_date: string | null
  race_series: RaceSeries
  athlete_classification: AthleteClassification
  age_group: AgeGroup | null
  gender: Gender | null
  race_distance: RaceDistance
  custom_swim_distance_m: number | null
  custom_bike_distance_km: number | null
  custom_run_distance_km: number | null
  goal_type: GoalType
  goal_time_seconds: number | null
  qualification_target: QualificationTarget | null
  conditions: RaceConditions | null
  pacing_plan: PacingPlan | null
  nutrition_plan: NutritionPlan | null
  equipment_plan: EquipmentPlan | null
  mindset_plan: MindsetPlan | null
  fitness_snapshot: FitnessSnapshot | null
  estimated_finish_seconds: number | null
  estimated_finish_optimistic: number | null
  estimated_finish_conservative: number | null
  estimated_qualification_competitive: boolean | null
  created_at: string
  updated_at: string
}

export interface RacePlanChecklist {
  id: string
  race_plan_id: string
  item_name: string
  category: ChecklistCategory
  is_checked: boolean
  notes: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Form input type (before generation)
// ---------------------------------------------------------------------------

export interface RaceDetailsInput {
  race_name: string
  race_date: string
  race_series: RaceSeries
  athlete_classification: AthleteClassification
  age_group: string
  gender: string
  race_distance: RaceDistance
  custom_swim_distance_m: string
  custom_bike_distance_km: string
  custom_run_distance_km: string
  goal_type: string
  goal_time_seconds: string
  temp_low_f: string
  temp_high_f: string
  humidity_pct: string
  altitude_ft: string
  course_profile: CourseProfile
  water_temp_f: string
  water_type: WaterType
  wetsuit_legal: string
  wind: WindCondition
  course_type: CourseType
}

// Helpers
export function isQualificationGoal(goal: string): boolean {
  return [
    'qualify_im_703_worlds',
    'qualify_im_kona',
    'qualify_wt_ag_worlds',
    'qualify_usat_nationals',
    'pro_card_qualification',
    'im_pro_slot',
  ].includes(goal)
}

export function isDraftLegal(distance: RaceDistance): boolean {
  return distance === 'wt_sprint' || distance === 'wt_standard'
}
