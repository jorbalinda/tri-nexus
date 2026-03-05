import { createClient } from '@/lib/supabase/server'
import type { FitnessPercentiles, AgeGroupBenchmarkRow, FitnessSnapshotRow } from '@/lib/types/social'

/** Map profile gender to benchmark gender bucket */
function normalisedGender(gender: string | null | undefined): 'male' | 'female' | 'other' {
  if (gender === 'male') return 'male'
  if (gender === 'female') return 'female'
  return 'other'
}

/** Derive age group string from date of birth */
function ageGroup(dob: string | null | undefined): string | null {
  if (!dob) return null
  const today = new Date()
  const born = new Date(dob)
  let age = today.getFullYear() - born.getFullYear()
  // Adjust if birthday hasn't occurred yet this year
  if (
    today.getMonth() < born.getMonth() ||
    (today.getMonth() === born.getMonth() && today.getDate() < born.getDate())
  ) age--
  // If age is outside a plausible triathlete range, use fallback
  if (age < 18 || age > 79) return null
  const low = Math.floor(age / 5) * 5
  // Cap at 55-59 (matches seeded benchmarks)
  const capped = Math.min(low, 55)
  return `${capped}-${capped + 4}`
}

/**
 * Calculate percentile rank for a value within benchmark quartiles.
 * For pace (lower = better), invert the comparison.
 */
function percentileRank(
  value: number,
  benchmark: AgeGroupBenchmarkRow,
  higherIsBetter: boolean
): number {
  const { p25, p50, p75, p90 } = benchmark
  if (p25 == null || p50 == null || p75 == null || p90 == null) return 50

  if (higherIsBetter) {
    // FTP — higher is better
    if (value >= p90) return 90 + Math.min(10, ((value - p90) / (p90 - p75)) * 10)
    if (value >= p75) return 75 + ((value - p75) / (p90 - p75)) * 15
    if (value >= p50) return 50 + ((value - p50) / (p75 - p50)) * 25
    if (value >= p25) return 25 + ((value - p25) / (p50 - p25)) * 25
    return Math.max(1, (value / p25) * 25)
  } else {
    // CSS / run pace — lower is better (invert)
    if (value <= p90) return 90 + Math.min(10, ((p90 - value) / (p75 - p90)) * 10)
    if (value <= p75) return 75 + ((p75 - value) / (p75 - p90)) * 15
    if (value <= p50) return 50 + ((p50 - value) / (p50 - p75)) * 25
    if (value <= p25) return 25 + ((p25 - value) / (p25 - p50)) * 25
    return Math.max(1, ((p25 * 2 - value) / p25) * 25)
  }
}

/** Clamp score to [1, 99] */
function clamp(n: number): number {
  return Math.max(1, Math.min(99, Math.round(n)))
}

export async function computePercentiles(
  snapshot: FitnessSnapshotRow,
  gender: string | null,
  dob: string | null
): Promise<FitnessPercentiles> {
  const supabase = await createClient()
  const g = normalisedGender(gender)
  const ag = ageGroup(dob)

  // Fall back to 35-39 (modal age group for age-group triathletes) if no DOB set
  const resolvedAg = ag ?? '35-39'

  const { data: benchmarks } = await supabase
    .from('age_group_benchmarks')
    .select('*')
    .eq('gender', g)
    .eq('age_group', resolvedAg)

  if (!benchmarks || benchmarks.length === 0) return { swim: null, bike: null, run: null }

  const byDiscipline = (d: string) => benchmarks.find((b) => b.discipline === d) ?? null

  const swimBench = byDiscipline('swim')
  const bikeBench = byDiscipline('bike')
  const runBench  = byDiscipline('run')

  return {
    swim: snapshot.css_sec_per_100m && swimBench
      ? clamp(percentileRank(snapshot.css_sec_per_100m, swimBench, false))
      : null,
    bike: snapshot.ftp_watts && bikeBench
      ? clamp(percentileRank(snapshot.ftp_watts, bikeBench, true))
      : null,
    run: snapshot.run_pace_sec_per_km && runBench
      ? clamp(percentileRank(snapshot.run_pace_sec_per_km, runBench, false))
      : null,
  }
}
