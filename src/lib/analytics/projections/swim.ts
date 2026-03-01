/*
=== SWIM PACE ===
pace/100m = CSS + degradation[distance] + openWaterPenalty(+3) - wetsuitBonus(-2)
*/

import type { RaceDistance } from '@/lib/types/race-plan'

export interface SplitProjection {
  realistic: number
  optimistic: number
  conservative: number
}

export interface SwimProjectionResult extends SplitProjection {
  targetPacePer100m: number
}

interface SwimConditions {
  swimType?: 'pool' | 'lake' | 'river' | 'bay' | 'ocean' | null
  wetsuitLegal?: boolean | null
}

const DEGRADATION: Record<string, number> = {
  super_sprint: -3,
  sprint: -2,
  wt_sprint: -2,
  olympic: 0,
  wt_standard: 0,
  '70.3': 4,
  '140.6': 7,
  custom: 4,
}

export function projectSwimSplit(
  css: number | null,
  raceDistance: RaceDistance,
  swimDistanceM: number,
  conditions: SwimConditions | null
): SwimProjectionResult {
  // Default CSS for age grouper when no data
  const effectiveCSS = css ?? 105

  let pacePer100 = effectiveCSS + (DEGRADATION[raceDistance] ?? 4)

  // Open water adjustment: +3 sec/100m (sighting, currents, mass start)
  if (conditions?.swimType === 'ocean' || conditions?.swimType === 'bay') {
    pacePer100 += 3
  }

  // Wetsuit bonus: -2 sec/100m (buoyancy)
  if (conditions?.wetsuitLegal === true) {
    pacePer100 -= 2
  }

  const realisticSeconds = (swimDistanceM / 100) * pacePer100

  return {
    targetPacePer100m: Math.round(pacePer100),
    realistic: Math.round(realisticSeconds),
    optimistic: Math.round(realisticSeconds * 0.96),
    conservative: Math.round(realisticSeconds * 1.06),
  }
}
