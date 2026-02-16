import type { SessionMetric } from '@/lib/types/database'

/**
 * Aerobic Decoupling: Split session at midpoint, compare pace-to-HR ratio
 * between the two halves.
 *
 * Decoupling = ((first_half_ratio - second_half_ratio) / first_half_ratio) * 100
 *
 * < 5% = well coupled (good aerobic fitness)
 * 5-10% = mild decoupling
 * > 10% = significant decoupling (aerobic endurance needs work)
 */
export function calculateDecoupling(metrics: SessionMetric[]): number | null {
  if (metrics.length < 10) return null

  const sorted = [...metrics].sort(
    (a, b) => a.timestamp_offset_seconds - b.timestamp_offset_seconds
  )

  const midpoint = Math.floor(sorted.length / 2)
  const firstHalf = sorted.slice(0, midpoint)
  const secondHalf = sorted.slice(midpoint)

  const ratio = (segment: SessionMetric[]) => {
    const validPoints = segment.filter(
      (m) => m.heart_rate && m.heart_rate > 0 && (m.power_watts || m.pace_sec_per_km || m.speed_mps)
    )

    if (validPoints.length === 0) return null

    const avgHr =
      validPoints.reduce((sum, m) => sum + (m.heart_rate || 0), 0) / validPoints.length

    // Use power if available, otherwise pace
    const avgOutput =
      validPoints.reduce((sum, m) => {
        if (m.power_watts) return sum + m.power_watts
        if (m.speed_mps) return sum + m.speed_mps * 100
        if (m.pace_sec_per_km && m.pace_sec_per_km > 0)
          return sum + (1000 / m.pace_sec_per_km) * 100
        return sum
      }, 0) / validPoints.length

    if (avgHr === 0) return null
    return avgOutput / avgHr
  }

  const firstRatio = ratio(firstHalf)
  const secondRatio = ratio(secondHalf)

  if (firstRatio === null || secondRatio === null || firstRatio === 0) return null

  return Number(
    (((firstRatio - secondRatio) / firstRatio) * 100).toFixed(1)
  )
}

export function decouplingLabel(pct: number): string {
  if (pct < 5) return 'Well coupled'
  if (pct < 10) return 'Mild decoupling'
  return 'Significant decoupling'
}

export function decouplingColor(pct: number): string {
  if (pct < 5) return 'text-green-600'
  if (pct < 10) return 'text-yellow-600'
  return 'text-red-600'
}
