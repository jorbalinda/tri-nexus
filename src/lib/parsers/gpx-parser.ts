import { ParsedWorkout } from './types'

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000 // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getExtensionValue(trkpt: Element, tagNames: string[]): number | null {
  const extensions = trkpt.getElementsByTagName('extensions')[0]
    || trkpt.getElementsByTagName('Extensions')[0]
  if (!extensions) return null

  for (const tag of tagNames) {
    // Search all child elements including namespaced ones
    const allChildren = extensions.getElementsByTagName('*')
    for (let i = 0; i < allChildren.length; i++) {
      const localName = allChildren[i].localName || allChildren[i].tagName.split(':').pop()
      if (localName?.toLowerCase() === tag.toLowerCase() && allChildren[i].textContent) {
        const val = parseFloat(allChildren[i].textContent)
        if (!isNaN(val)) return val
      }
    }
  }
  return null
}

export function parseGpxFile(file: File): Promise<ParsedWorkout[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(reader.result as string, 'text/xml')
        const tracks = doc.getElementsByTagName('trk')

        if (tracks.length === 0) {
          reject(new Error('No tracks found in GPX file'))
          return
        }

        const workouts: ParsedWorkout[] = []

        for (let t = 0; t < tracks.length; t++) {
          const track = tracks[t]
          const nameEl = track.getElementsByTagName('name')[0]
          const title = nameEl?.textContent || null
          const typeEl = track.getElementsByTagName('type')[0]
          const trackType = typeEl?.textContent?.toLowerCase() || ''

          const trkpts = track.getElementsByTagName('trkpt')
          if (trkpts.length === 0) continue

          let totalDistance = 0
          let elevationGain = 0
          let prevLat: number | null = null
          let prevLon: number | null = null
          let prevEle: number | null = null
          let startTime: Date | null = null
          let endTime: Date | null = null
          let hrSum = 0
          let hrCount = 0
          let maxHr = 0
          let cadenceSum = 0
          let cadenceCount = 0
          let powerSum = 0
          let powerCount = 0

          for (let p = 0; p < trkpts.length; p++) {
            const pt = trkpts[p]
            const lat = parseFloat(pt.getAttribute('lat') || '')
            const lon = parseFloat(pt.getAttribute('lon') || '')

            // Time
            const timeEl = pt.getElementsByTagName('time')[0]
            if (timeEl?.textContent) {
              const time = new Date(timeEl.textContent)
              if (!startTime) startTime = time
              endTime = time
            }

            // Distance
            if (prevLat !== null && prevLon !== null && !isNaN(lat) && !isNaN(lon)) {
              totalDistance += haversineDistance(prevLat, prevLon, lat, lon)
            }
            if (!isNaN(lat)) prevLat = lat
            if (!isNaN(lon)) prevLon = lon

            // Elevation
            const eleEl = pt.getElementsByTagName('ele')[0]
            if (eleEl?.textContent) {
              const ele = parseFloat(eleEl.textContent)
              if (!isNaN(ele)) {
                if (prevEle !== null) {
                  const diff = ele - prevEle
                  if (diff > 1) elevationGain += diff // Noise filter: >1m
                }
                prevEle = ele
              }
            }

            // HR from extensions
            const hr = getExtensionValue(pt, ['hr', 'heartrate', 'HeartRateBpm'])
            if (hr) {
              hrSum += hr
              hrCount++
              if (hr > maxHr) maxHr = hr
            }

            // Cadence from extensions
            const cad = getExtensionValue(pt, ['cad', 'cadence', 'RunCadence'])
            if (cad) {
              cadenceSum += cad
              cadenceCount++
            }

            // Power from extensions
            const pwr = getExtensionValue(pt, ['power', 'watts', 'PowerInWatts'])
            if (pwr) {
              powerSum += pwr
              powerCount++
            }
          }

          const durationSeconds =
            startTime && endTime
              ? Math.round((endTime.getTime() - startTime.getTime()) / 1000)
              : null

          const date = startTime ? startTime.toISOString().split('T')[0] : null

          // Sport detection heuristics
          let sport: ParsedWorkout['sport'] = null
          if (trackType.includes('run')) sport = 'run'
          else if (trackType.includes('bike') || trackType.includes('cycl')) sport = 'bike'
          else if (trackType.includes('swim')) sport = 'swim'
          else if (powerCount > 0) sport = 'bike'
          else if (cadenceCount > 0 && cadenceSum / cadenceCount > 120) sport = 'run'
          else sport = 'run' // Default fallback

          const avgCadence = cadenceCount > 0 ? Math.round(cadenceSum / cadenceCount) : null
          const avgPower = powerCount > 0 ? Math.round(powerSum / powerCount) : null

          // Pace for running
          let avgPace: number | null = null
          if (sport === 'run' && totalDistance > 0 && durationSeconds) {
            avgPace = Math.round((durationSeconds / totalDistance) * 1000)
          }

          workouts.push({
            sport,
            title,
            date,
            duration_seconds: durationSeconds,
            distance_meters: totalDistance > 0 ? Math.round(totalDistance) : null,
            avg_hr: hrCount > 0 ? Math.round(hrSum / hrCount) : null,
            max_hr: maxHr > 0 ? maxHr : null,
            calories: null,
            rpe: null,
            notes: null,
            pool_length_meters: null,
            swolf: null,
            avg_power_watts: avgPower,
            normalized_power: null,
            tss: null,
            avg_cadence_rpm: sport === 'bike' ? avgCadence : null,
            elevation_gain_meters: elevationGain > 0 ? Math.round(elevationGain) : null,
            avg_pace_sec_per_km: avgPace,
            avg_cadence_spm: sport === 'run' ? avgCadence : null,
            source_file: file.name,
            source_format: 'gpx',
          })
        }

        if (workouts.length === 0) {
          reject(new Error('No valid tracks found in GPX file'))
          return
        }

        resolve(workouts)
      } catch (err) {
        reject(new Error(`Failed to parse GPX file: ${err instanceof Error ? err.message : err}`))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read GPX file'))
    reader.readAsText(file)
  })
}
