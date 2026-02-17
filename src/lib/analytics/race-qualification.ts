import type {
  GoalType,
  AgeGroup,
  Gender,
  Championship,
  QualificationStandard,
  QualificationTarget,
  QualificationReadiness,
  QualificationPacingPlan,
  FitnessSnapshot,
  RaceDistances,
} from '@/lib/types/race-plan'

// ---------------------------------------------------------------------------
// Map goal types to championship keys
// ---------------------------------------------------------------------------

export function goalToChampionship(goalType: GoalType): Championship | null {
  switch (goalType) {
    case 'qualify_im_kona':
      return 'kona'
    case 'qualify_im_703_worlds':
      return '70.3_worlds'
    case 'qualify_wt_ag_worlds':
      return 'wt_ag_standard' // default, caller can override
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Age-graded time calculation
// ---------------------------------------------------------------------------

/**
 * Calculate age-graded finish time for IRONMAN qualification
 * age_graded_time = finish_time × standard_multiplier
 * Lower = more competitive
 */
export function calculateAgeGradedTime(
  finishTimeSeconds: number,
  multiplier: number
): number {
  return Math.round(finishTimeSeconds * multiplier)
}

// ---------------------------------------------------------------------------
// Estimate qualification cutoff from standards
// ---------------------------------------------------------------------------

export function findStandard(
  standards: QualificationStandard[],
  championship: Championship,
  gender: Gender,
  ageGroup: AgeGroup
): QualificationStandard | null {
  return (
    standards.find(
      (s) =>
        s.championship === championship &&
        s.gender === gender &&
        s.age_group === ageGroup
    ) || null
  )
}

export function buildQualificationTarget(
  standard: QualificationStandard | null
): QualificationTarget | null {
  if (!standard) return null
  return {
    championship: standard.championship,
    standard_multiplier: standard.standard_multiplier,
    estimated_qualifying_time: standard.estimated_cutoff_seconds,
    ag_standard_source_year: standard.qualifying_year,
  }
}

// ---------------------------------------------------------------------------
// Qualification readiness assessment
// ---------------------------------------------------------------------------

export function assessQualificationReadiness(
  estimatedFinishSeconds: number,
  standard: QualificationStandard | null,
  snapshot: FitnessSnapshot
): QualificationReadiness {
  if (!standard || !standard.estimated_cutoff_seconds) {
    return {
      ready: false,
      gap_seconds: 0,
      confidence: 'low',
      age_graded_time: null,
      target_time: null,
      recommendations: ['Qualification standards not available for this age group.'],
      explanation: 'Unable to assess qualification readiness without standards data.',
    }
  }

  const targetTime = standard.estimated_cutoff_seconds
  const multiplier = standard.standard_multiplier || 1
  const ageGraded = calculateAgeGradedTime(estimatedFinishSeconds, multiplier)
  const gap = estimatedFinishSeconds - targetTime

  // Confidence based on data availability
  let confidence: 'low' | 'medium' | 'high' = 'low'
  const hasData = [
    snapshot.estimatedFTP,
    snapshot.estimatedCSS,
    snapshot.estimatedLTHR.run,
    snapshot.weeklyVolumeHours,
  ].filter(Boolean).length
  if (hasData >= 3) confidence = 'high'
  else if (hasData >= 2) confidence = 'medium'

  const ready = gap <= 0
  const recommendations: string[] = []

  if (gap > 0) {
    const gapMin = Math.round(gap / 60)
    recommendations.push(
      `You need to improve your estimated finish by approximately ${gapMin} minute${gapMin !== 1 ? 's' : ''}.`
    )

    // Sport-specific recommendations
    if (snapshot.estimatedFTP) {
      const neededWattsImprovement = Math.round(gap / 120) // rough: ~2min per watt at long distance
      if (neededWattsImprovement > 0) {
        recommendations.push(`Bike: aim to increase FTP by ~${Math.min(neededWattsImprovement, 30)}W.`)
      }
    } else {
      recommendations.push('Bike: add power meter data to get specific FTP targets.')
    }

    if (snapshot.estimatedLTHR.run) {
      const neededPaceImprovement = Math.round(gap / 42) // rough sec/km improvement for marathon
      if (neededPaceImprovement > 0) {
        recommendations.push(`Run: improve pace by ~${neededPaceImprovement} sec/km.`)
      }
    } else {
      recommendations.push('Run: add more run workouts with HR data for specific pace targets.')
    }

    if (!snapshot.weeklyVolumeHours || snapshot.weeklyVolumeHours < 10) {
      recommendations.push('Volume: consider increasing weekly training to 10-14 hours.')
    }
  } else {
    recommendations.push('Your current fitness supports this qualification goal!')
    if (gap < -600) {
      recommendations.push('You have a comfortable buffer. Focus on execution and race-specific preparation.')
    }
  }

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return `${h}:${String(m).padStart(2, '0')}`
  }

  const explanation = ready
    ? `Your estimated finish of ${formatTime(estimatedFinishSeconds)} is approximately ${Math.round(Math.abs(gap) / 60)} minutes faster than the typical qualifying cutoff of ${formatTime(targetTime)} for your age group. Confidence: ${confidence.toUpperCase()}.`
    : `Your estimated finish of ${formatTime(estimatedFinishSeconds)} is approximately ${Math.round(gap / 60)} minutes slower than recent qualifying times of ${formatTime(targetTime)} for your age group. Confidence: ${confidence.toUpperCase()}.`

  return {
    ready,
    gap_seconds: gap,
    confidence,
    age_graded_time: ageGraded,
    target_time: targetTime,
    recommendations,
    explanation,
  }
}

// ---------------------------------------------------------------------------
// Pro card eligibility assessment
// ---------------------------------------------------------------------------

export function calculateProCardEligibility(
  estimatedFinishSeconds: number,
  estimatedWinnerTimeSeconds: number
): { eligible: boolean; percentageOfWinner: number; explanation: string } {
  const pct = ((estimatedFinishSeconds - estimatedWinnerTimeSeconds) / estimatedWinnerTimeSeconds) * 100
  const eligible = pct <= 15

  const explanation = eligible
    ? `Your estimated finish is within ${pct.toFixed(1)}% of the projected winner time. This is competitive for pro card consideration.`
    : `Your estimated finish is ${pct.toFixed(1)}% behind the projected winner time. Pro card typically requires finishing within 10-15% of the winner.`

  return { eligible, percentageOfWinner: pct, explanation }
}

// ---------------------------------------------------------------------------
// Reverse-engineer qualification pacing
// ---------------------------------------------------------------------------

/**
 * Work BACKWARDS from a target qualifying time to split targets
 * Factors in athlete's relative strengths
 */
export function generateQualificationPacing(
  targetFinishSeconds: number,
  distances: RaceDistances,
  snapshot: FitnessSnapshot,
  currentEstimatedFinish: number
): QualificationPacingPlan {
  // Default split distribution for full Ironman: swim 10%, T1 1%, bike 50%, T2 0.5%, run 38.5%
  // Adjust based on distance
  const totalKm = distances.swim_m / 1000 + distances.bike_km + distances.run_km
  const swimFraction = (distances.swim_m / 1000) / totalKm * 1.8 // swim is slower per km
  const bikeFraction = distances.bike_km / totalKm * 0.85
  const runFraction = distances.run_km / totalKm * 1.2 // run is slower than bike per km

  const totalFraction = swimFraction + bikeFraction + runFraction
  const t1 = Math.round(Math.min(180, targetFinishSeconds * 0.005))
  const t2 = Math.round(Math.min(120, targetFinishSeconds * 0.003))
  const raceTime = targetFinishSeconds - t1 - t2

  const swimTarget = Math.round(raceTime * (swimFraction / totalFraction))
  const bikeTarget = Math.round(raceTime * (bikeFraction / totalFraction))
  const runTarget = Math.round(raceTime * (runFraction / totalFraction))

  const gap = currentEstimatedFinish - targetFinishSeconds
  const recommendations: string[] = []

  if (gap > 0) {
    const swimPace = Math.round(swimTarget / (distances.swim_m / 100))
    const bikePaceKph = distances.bike_km / (bikeTarget / 3600)
    const runPaceSecKm = Math.round(runTarget / distances.run_km)
    const runPaceMin = Math.floor(runPaceSecKm / 60)
    const runPaceSec = runPaceSecKm % 60

    recommendations.push(
      `Swim: target ${Math.floor(swimPace / 60)}:${String(swimPace % 60).padStart(2, '0')}/100m for a ${Math.floor(swimTarget / 60)}min swim.`,
      `Bike: target ${bikePaceKph.toFixed(1)} km/h average for a ${Math.floor(bikeTarget / 3600)}h${String(Math.floor((bikeTarget % 3600) / 60)).padStart(2, '0')}min bike.`,
      `Run: target ${runPaceMin}:${String(runPaceSec).padStart(2, '0')}/km for a ${Math.floor(runTarget / 3600)}h${String(Math.floor((runTarget % 3600) / 60)).padStart(2, '0')}min run.`
    )
  }

  return {
    targetFinishSeconds,
    swimSplitTarget: swimTarget,
    bikeSplitTarget: bikeTarget,
    runSplitTarget: runTarget,
    t1Target: t1,
    t2Target: t2,
    gapToCurrentFitness: gap,
    recommendations,
  }
}

// ---------------------------------------------------------------------------
// IRONMAN qualification system explainer
// ---------------------------------------------------------------------------

export const KONA_QUALIFICATION_EXPLAINER =
  'IRONMAN uses a performance-based age-graded qualification system. Your finish time is multiplied by your age group\'s "Kona Standard" multiplier (based on the average of the top 20% of finishers in your AG over the past 5 years of Kona racing). The resulting age-graded time is ranked against ALL athletes in the race regardless of age or gender. Slots go to age group winners first (rolling to 3rd), then remaining slots fill from the performance pool.'

export const IM703_QUALIFICATION_EXPLAINER =
  'IRONMAN 70.3 uses the same age-graded system as Kona but with "70.3 Standard" benchmarks. 70.3 Worlds qualifies men and women separately (different race days). Your finish time × your AG multiplier = your age-graded time, ranked against all athletes.'

export const WT_AG_QUALIFICATION_EXPLAINER =
  'Qualification for World Triathlon Age Group Worlds is typically through national championships (e.g., USA Triathlon AG Nationals). Top 18 per age group at nationals, rolling to 30th place.'

export function getQualificationExplainer(goalType: string): string | null {
  switch (goalType) {
    case 'qualify_im_kona':
      return KONA_QUALIFICATION_EXPLAINER
    case 'qualify_im_703_worlds':
      return IM703_QUALIFICATION_EXPLAINER
    case 'qualify_wt_ag_worlds':
      return WT_AG_QUALIFICATION_EXPLAINER
    default:
      return null
  }
}
