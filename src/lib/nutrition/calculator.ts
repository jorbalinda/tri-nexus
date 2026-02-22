/**
 * Race nutrition calculator
 * Calculates carbs, sodium, and fluid needs per hour for bike and run segments.
 */

interface NutritionInput {
  weight_kg: number
  race_distance: 'sprint' | 'olympic' | '70.3' | '140.6' | 'custom'
  sweat_rate_lph?: number | null  // liters per hour from sweat test
  expected_temp_f?: number | null
}

interface SegmentNutrition {
  carbs_per_hour_g: number
  sodium_per_hour_mg: number
  fluid_per_hour_oz: number
}

interface NutritionPlanResult {
  bike: SegmentNutrition
  run: SegmentNutrition
  pre_race: { carbs_g: number; fluid_oz: number; timing_hours_before: number }
  race_morning: { carbs_g: number; fluid_oz: number; timing_hours_before: number }
}

// Estimated segment durations in hours for fueling calculation
const SEGMENT_DURATIONS: Record<string, { bike: number; run: number }> = {
  sprint: { bike: 0.6, run: 0.35 },
  olympic: { bike: 1.2, run: 0.75 },
  '70.3': { bike: 2.8, run: 1.8 },
  '140.6': { bike: 5.5, run: 4.0 },
  custom: { bike: 2.0, run: 1.5 },
}

export function calculateNutrition(input: NutritionInput): NutritionPlanResult {
  const { weight_kg, race_distance, sweat_rate_lph, expected_temp_f } = input

  // Base carb targets: 60-90g/hr depending on duration
  const durations = SEGMENT_DURATIONS[race_distance] || SEGMENT_DURATIONS.custom
  const isLong = durations.bike >= 2.5

  // Bike: higher carb tolerance (gut is more stable on bike)
  const bikeCarbsBase = isLong ? 80 : 60
  // Run: slightly lower (GI stress increases)
  const runCarbsBase = isLong ? 60 : 45

  // Heat adjustment: +10% carbs, +20% fluid, +15% sodium if hot
  const isHot = expected_temp_f != null && expected_temp_f > 80
  const heatMultiplier = isHot ? 1.1 : 1.0
  const fluidHeatMultiplier = isHot ? 1.2 : 1.0
  const sodiumHeatMultiplier = isHot ? 1.15 : 1.0

  // Base fluid: use sweat rate if available, otherwise estimate from weight
  const baseFluidLph = sweat_rate_lph || (weight_kg * 0.012) // ~0.84 L/hr for 70kg athlete
  const baseFluidOzPerHour = baseFluidLph * 33.814 // convert L to oz

  // Sodium: 500-1000mg/hr, scale with sweat rate
  const baseSodiumMg = sweat_rate_lph ? sweat_rate_lph * 700 : 600

  const bike: SegmentNutrition = {
    carbs_per_hour_g: Math.round(bikeCarbsBase * heatMultiplier),
    sodium_per_hour_mg: Math.round(baseSodiumMg * sodiumHeatMultiplier),
    fluid_per_hour_oz: Math.round(baseFluidOzPerHour * fluidHeatMultiplier),
  }

  const run: SegmentNutrition = {
    carbs_per_hour_g: Math.round(runCarbsBase * heatMultiplier),
    sodium_per_hour_mg: Math.round(baseSodiumMg * sodiumHeatMultiplier * 0.9), // slightly less on run
    fluid_per_hour_oz: Math.round(baseFluidOzPerHour * fluidHeatMultiplier * 0.85), // less intake tolerance on run
  }

  // Pre-race day: 8-10g carbs per kg body weight
  const preRaceCarbs = Math.round(weight_kg * 9)

  // Race morning: 1-2g carbs per kg, 3-4 hours before
  const raceMorningCarbs = Math.round(weight_kg * 1.5)

  return {
    bike,
    run,
    pre_race: {
      carbs_g: preRaceCarbs,
      fluid_oz: 64, // general target
      timing_hours_before: 24,
    },
    race_morning: {
      carbs_g: raceMorningCarbs,
      fluid_oz: 16,
      timing_hours_before: 3,
    },
  }
}

/**
 * Generate fueling timeline entries for a given segment
 */
export function generateFuelingTimeline(
  segment: 'bike' | 'run',
  nutrition: SegmentNutrition,
  estimatedDurationMinutes: number
): Array<{ time_offset_minutes: number; instruction: string }> {
  const entries: Array<{ time_offset_minutes: number; instruction: string }> = []
  const intervalMinutes = segment === 'bike' ? 20 : 25 // more frequent on bike
  const carbsPerServing = segment === 'bike' ? 25 : 20 // gel = ~25g, chew = ~20g

  // First fueling at 15-20 min into segment
  const firstFueling = segment === 'bike' ? 15 : 20

  for (let offset = firstFueling; offset < estimatedDurationMinutes; offset += intervalMinutes) {
    const isFluidOnly = offset % (intervalMinutes * 2) !== firstFueling % (intervalMinutes * 2)

    if (isFluidOnly && segment === 'bike') {
      entries.push({
        time_offset_minutes: offset,
        instruction: `Drink ${Math.round(nutrition.fluid_per_hour_oz / 3)} oz water or sports drink`,
      })
    } else {
      const carbSource = carbsPerServing >= 25 ? '1 gel' : '2 chews'
      entries.push({
        time_offset_minutes: offset,
        instruction: `Take ${carbSource} (${carbsPerServing}g carbs) + ${Math.round(nutrition.fluid_per_hour_oz / 3)} oz fluid`,
      })
    }
  }

  return entries
}
