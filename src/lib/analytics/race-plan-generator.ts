import type { Workout, ManualLog } from '@/lib/types/database'
import type {
  RaceDistance,
  GoalType,
  RaceConditions,
  PacingPlan,
  NutritionPlan,
  EquipmentPlan,
  MindsetPlan,
  FitnessSnapshot,
  AthleteClassification,
  QualificationTarget,
  QualificationStandard,
  QualificationReadiness,
} from '@/lib/types/race-plan'
import { isQualificationGoal } from '@/lib/types/race-plan'
import {
  estimateCSSFromWorkouts,
  estimateFTPFromWorkouts,
  estimateLTHR,
  generatePacingPlan,
} from './race-pacing'
import { generateNutritionPlan } from './race-nutrition'
import { generateEquipmentPlan } from './race-equipment'
import { generateMindsetPlan } from './race-mindset'
import { deriveMaxHR, deriveRestingHR } from './lactate-threshold'
import { weeklyVolume } from './training-stress'
import {
  goalToChampionship,
  findStandard,
  buildQualificationTarget,
  assessQualificationReadiness,
  calculateAgeGradedTime,
} from './race-qualification'

// ---------------------------------------------------------------------------
// Build fitness snapshot from all available data
// ---------------------------------------------------------------------------

export function buildFitnessSnapshot(
  workouts: Workout[],
  logs: ManualLog[],
  qualificationStandard: QualificationStandard | null
): FitnessSnapshot {
  const maxHR = deriveMaxHR(workouts)
  const restingHR = deriveRestingHR(logs)
  const ftp = estimateFTPFromWorkouts(workouts)
  const css = estimateCSSFromWorkouts(workouts, maxHR)
  const lthrSwim = estimateLTHR(workouts, 'swim')
  const lthrBike = estimateLTHR(workouts, 'bike')
  const lthrRun = estimateLTHR(workouts, 'run')

  const volumes = weeklyVolume(workouts)
  const recent8 = volumes.slice(-8)
  const avgHours =
    recent8.length > 0
      ? Number((recent8.reduce((s, v) => s + v.hours, 0) / recent8.length).toFixed(1))
      : null

  const weightLog = logs
    .filter((l) => l.log_type === 'body_weight_kg')
    .sort((a, b) => b.date.localeCompare(a.date))
  const weight = weightLog.length > 0 ? weightLog[0].value : null

  const konaMultiplier = qualificationStandard?.standard_multiplier ?? null

  return {
    estimatedFTP: ftp,
    estimatedCSS: css ? Math.round(css) : null,
    estimatedLTHR: { swim: lthrSwim, bike: lthrBike, run: lthrRun },
    maxHR,
    restingHR,
    weeklyVolumeHours: avgHours,
    recentRacePace: { swim: null, bike: null, run: null },
    weight_kg: weight,
    konaStandardMultiplier: konaMultiplier,
    ageGradedEstimate: null, // set after pacing is calculated
  }
}

// ---------------------------------------------------------------------------
// Generate complete race plan
// ---------------------------------------------------------------------------

export interface GeneratedPlan {
  pacing_plan: PacingPlan
  nutrition_plan: NutritionPlan
  equipment_plan: EquipmentPlan
  mindset_plan: MindsetPlan
  fitness_snapshot: FitnessSnapshot
  estimated_finish_seconds: number
  estimated_finish_optimistic: number
  estimated_finish_conservative: number
  qualification_target: QualificationTarget | null
  estimated_qualification_competitive: boolean | null
  qualification_readiness: QualificationReadiness | null
}

export function generateFullRacePlan(
  workouts: Workout[],
  logs: ManualLog[],
  raceDistance: RaceDistance,
  goalType: GoalType,
  raceName: string,
  conditions: RaceConditions | null,
  classification: AthleteClassification,
  qualificationStandards: QualificationStandard[],
  gender: string | null,
  ageGroup: string | null,
  customDistances?: { swim?: number | null; bike?: number | null; run?: number | null }
): GeneratedPlan {
  // Find qualification standard if applicable
  let standard: QualificationStandard | null = null
  let qualTarget: QualificationTarget | null = null
  const championship = goalToChampionship(goalType)
  if (championship && gender && ageGroup) {
    standard = findStandard(
      qualificationStandards,
      championship,
      gender as 'male' | 'female',
      ageGroup as typeof import('@/lib/types/race-plan').AGE_GROUPS[number]
    )
    qualTarget = buildQualificationTarget(standard)
  }

  const snapshot = buildFitnessSnapshot(workouts, logs, standard)

  // Pacing
  const pacing = generatePacingPlan(
    raceDistance,
    conditions,
    workouts,
    {
      css: snapshot.estimatedCSS,
      ftp: snapshot.estimatedFTP,
      lthrBike: snapshot.estimatedLTHR.bike,
      lthrRun: snapshot.estimatedLTHR.run,
    },
    classification,
    qualTarget,
    snapshot,
    customDistances
  )

  // Update age-graded estimate in snapshot
  if (standard?.standard_multiplier && pacing.totalEstimate.realisticSeconds > 0) {
    snapshot.ageGradedEstimate = calculateAgeGradedTime(
      pacing.totalEstimate.realisticSeconds,
      standard.standard_multiplier
    )
  }

  // Qualification readiness
  let qualReadiness: QualificationReadiness | null = null
  let qualCompetitive: boolean | null = null
  if (isQualificationGoal(goalType) && pacing.totalEstimate.realisticSeconds > 0) {
    qualReadiness = assessQualificationReadiness(
      pacing.totalEstimate.realisticSeconds,
      standard,
      snapshot
    )
    qualCompetitive = qualReadiness.ready
  }

  // Sweat rate from logs
  const sweatLog = logs.filter((l) => l.log_type === 'sweat_rate').sort((a, b) => b.date.localeCompare(a.date))
  const sweatRate = sweatLog.length > 0 ? sweatLog[0].value : null

  // Nutrition
  const nutrition = generateNutritionPlan(
    raceDistance,
    snapshot.weight_kg,
    conditions,
    sweatRate,
    pacing.bike.estimatedSplitSeconds,
    pacing.run.estimatedSplitSeconds,
    classification,
    customDistances
  )

  // Equipment
  const equipment = generateEquipmentPlan(raceDistance, conditions)

  // Mindset
  const mindset = generateMindsetPlan(goalType, raceDistance, raceName, classification)

  return {
    pacing_plan: pacing,
    nutrition_plan: nutrition,
    equipment_plan: equipment,
    mindset_plan: mindset,
    fitness_snapshot: snapshot,
    estimated_finish_seconds: pacing.totalEstimate.realisticSeconds,
    estimated_finish_optimistic: pacing.totalEstimate.optimisticSeconds,
    estimated_finish_conservative: pacing.totalEstimate.conservativeSeconds,
    qualification_target: qualTarget,
    estimated_qualification_competitive: qualCompetitive,
    qualification_readiness: qualReadiness,
  }
}
