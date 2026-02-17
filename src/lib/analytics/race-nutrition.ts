import type {
  RaceDistance,
  RaceConditions,
  NutritionPlan,
  PreRaceNutrition,
  RaceMorningNutrition,
  SegmentNutrition,
  CalorieSummary,
  AthleteClassification,
} from '@/lib/types/race-plan'
import { STANDARD_DISTANCES } from '@/lib/types/race-plan'

// ---------------------------------------------------------------------------
// Pacing bucket helper
// ---------------------------------------------------------------------------

function bucket(rd: RaceDistance): string {
  switch (rd) {
    case 'super_sprint': case 'sprint': case 'wt_sprint': return 'sprint'
    case 'olympic': case 'wt_standard': return 'olympic'
    case '70.3': return '70.3'
    case '140.6': return '140.6'
    default: return 'olympic'
  }
}

// ---------------------------------------------------------------------------
// Nutrition plan generator
// ---------------------------------------------------------------------------

export function generateNutritionPlan(
  raceDistance: RaceDistance,
  weightKg: number | null,
  conditions: RaceConditions | null,
  sweatRateLPerHr: number | null,
  bikeSplitSeconds: number,
  runSplitSeconds: number,
  classification: AthleteClassification,
  customDistances?: { swim?: number | null; bike?: number | null; run?: number | null }
): NutritionPlan {
  const w = weightKg || 70
  const isHot = (conditions?.temp_high_f ?? 70) > 80
  const isPro = classification === 'professional'
  const b = bucket(raceDistance)

  return {
    preRace: generatePreRace(b, w),
    raceMorning: generateRaceMorning(w),
    swim: 'No nutrition needed during the swim. Pre-race fueling carries you through.',
    bike: generateBikeNutrition(b, w, isHot, sweatRateLPerHr, bikeSplitSeconds, isPro),
    run: generateRunNutrition(b, w, isHot, sweatRateLPerHr, runSplitSeconds, isPro),
    summary: generateCalorieSummary(b, w, bikeSplitSeconds, runSplitSeconds, isPro),
  }
}

function generatePreRace(b: string, weightKg: number): PreRaceNutrition {
  const isLong = b === '140.6' || b === '70.3'
  const carbTarget = isLong
    ? `${Math.round(weightKg * 8)}-${Math.round(weightKg * 12)}g carbs/day for 24-48 hours before race`
    : `${Math.round(weightKg * 6)}-${Math.round(weightKg * 8)}g carbs/day the day before`

  return {
    carbLoadingTarget: carbTarget,
    hydrationTarget: 'Sip water consistently. Target pale yellow urine color.',
    foodsToAvoid: [
      'High-fiber foods (beans, broccoli, whole grains)',
      'High-fat or greasy foods',
      'Spicy foods',
      'Anything you haven\'t eaten before',
      'Excessive alcohol or caffeine',
    ],
    lastBigMeal: '10-12 hours before race start. Keep dinner simple: rice, pasta, chicken, bread.',
  }
}

function generateRaceMorning(weightKg: number): RaceMorningNutrition {
  return {
    mealTarget: `${Math.round(weightKg * 1)}-${Math.round(weightKg * 2)}g carbs, 2-3 hours before start`,
    exampleMeals: [
      'Toast with honey and banana', 'Oatmeal with maple syrup', 'White rice with honey', 'Bagel with peanut butter and jam',
    ],
    caffeine: `${Math.round(weightKg * 3)}-${Math.round(weightKg * 6)}mg caffeine, 60-90 min before start`,
    hydration: '500-750ml water with electrolytes, sipped over 2 hours before start',
  }
}

function generateBikeNutrition(
  b: string, weightKg: number, isHot: boolean, sweatRate: number | null, splitSeconds: number, isPro: boolean
): SegmentNutrition {
  const carbRanges: Record<string, [number, number]> = {
    sprint: [0, 30], olympic: [30, 60], '70.3': [60, 90], '140.6': [80, 120],
  }
  let [lo, hi] = carbRanges[b] || [40, 70]
  if (isPro) { lo = Math.round(lo * 1.15); hi = Math.round(hi * 1.15) }
  const hydration = isHot ? '750-1000ml/hour' : '500-750ml/hour'
  const sodium = isHot ? '750-1000mg/hour' : '500-750mg/hour'
  const sweatNote = sweatRate ? ` (your sweat rate: ${sweatRate}L/hr — adjust accordingly)` : ''
  const bikeHours = splitSeconds / 3600

  const products: string[] = []
  if (b === '140.6') {
    products.push('Drink mix in bottles (primary carb source)', 'Gels every 30-45 min as supplement',
      'Real food first 2 hours (rice cakes, bars) if tolerated', 'Salt tabs every 45-60 min in heat')
  } else if (b === '70.3') {
    products.push('Drink mix in bottles', '2-3 gels spaced evenly', 'Salt tabs if hot')
  } else {
    products.push('Drink mix or 1-2 gels', 'Water at aid stations')
  }

  return {
    carbsPerHour: `${lo}-${hi}g/hour${isPro ? ' (pro-level intake)' : ''}`,
    hydrationPerHour: hydration + sweatNote,
    electrolytesPerHour: sodium,
    timing: 'Start fueling within the first 15 minutes on the bike. Take nutrition every 15-20 minutes.',
    productSuggestions: products,
    notes: bikeHours > 3
      ? 'For rides over 3 hours, gut training is essential. Practice race nutrition in training.'
      : 'Keep nutrition simple. Don\'t overdo it on shorter courses.',
  }
}

function generateRunNutrition(
  b: string, weightKg: number, isHot: boolean, sweatRate: number | null, splitSeconds: number, isPro: boolean
): SegmentNutrition {
  const carbRanges: Record<string, [number, number]> = {
    sprint: [0, 0], olympic: [20, 40], '70.3': [40, 60], '140.6': [60, 90],
  }
  let [lo, hi] = carbRanges[b] || [20, 50]
  if (isPro && b !== 'sprint') { lo = Math.round(lo * 1.1); hi = Math.round(hi * 1.1) }
  const hydration = isHot ? '500-750ml/hour' : '400-600ml/hour'
  const sodium = isHot ? '500-750mg/hour' : '300-500mg/hour'

  const products: string[] = []
  if (b === '140.6') {
    products.push('Gels every 20-30 min', 'Cola at aid stations in the second half (caffeine + sugar)',
      'Water and electrolyte drink at every aid station', 'Pretzels or salt if craving solid food')
  } else if (b === '70.3') {
    products.push('2-3 gels spaced evenly', 'Water at every aid station', 'Cola in the last 5K if needed')
  } else {
    products.push('Water at aid stations', 'A gel at halfway if needed')
  }

  return {
    carbsPerHour: lo === 0 ? 'Minimal — pre-race fueling sufficient' : `${lo}-${hi}g/hour`,
    hydrationPerHour: hydration,
    electrolytesPerHour: sodium,
    timing: b === 'sprint' ? 'Grab water at aid stations. No major fueling needed.' : 'Take something at every aid station. Small sips, small bites.',
    productSuggestions: products,
    notes: 'If you feel GI distress, slow down slightly, switch to water only, and sip cola for easy calories.',
  }
}

function generateCalorieSummary(b: string, weightKg: number, bikeSplitSeconds: number, runSplitSeconds: number, isPro: boolean): CalorieSummary {
  const carbBike: Record<string, number> = { sprint: 15, olympic: 45, '70.3': 75, '140.6': 100 }
  const carbRun: Record<string, number> = { sprint: 0, olympic: 30, '70.3': 50, '140.6': 75 }
  const proFactor = isPro ? 1.15 : 1
  const bikeHours = bikeSplitSeconds / 3600
  const runHours = runSplitSeconds / 3600
  const bikeCarbsGrams = Math.round((carbBike[b] || 55) * bikeHours * proFactor)
  const runCarbsGrams = Math.round((carbRun[b] || 35) * runHours * proFactor)
  return {
    totalCalories: (bikeCarbsGrams + runCarbsGrams) * 4,
    totalCarbsGrams: bikeCarbsGrams + runCarbsGrams,
    bikeCalories: bikeCarbsGrams * 4, bikeCarbsGrams, runCalories: runCarbsGrams * 4, runCarbsGrams,
  }
}
