import { ParsedWorkout } from './types'

function mapSport(tcxSport: string): ParsedWorkout['sport'] {
  const s = tcxSport.toLowerCase()
  if (s === 'running') return 'run'
  if (s === 'biking' || s === 'cycling') return 'bike'
  if (s === 'swimming') return 'swim'
  if (s === 'multisport') return 'brick'
  return null
}

function getTextContent(el: Element, tag: string): string | null {
  const child = el.getElementsByTagName(tag)[0]
  return child?.textContent ?? null
}

function getNumber(el: Element, tag: string): number | null {
  const text = getTextContent(el, tag)
  if (!text) return null
  const n = parseFloat(text)
  return isNaN(n) ? null : n
}

export function parseTcxFile(file: File): Promise<ParsedWorkout[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(reader.result as string, 'text/xml')
        const activities = doc.getElementsByTagName('Activity')
        const workouts: ParsedWorkout[] = []

        for (let a = 0; a < activities.length; a++) {
          const activity = activities[a]
          const sportAttr = activity.getAttribute('Sport') || ''
          const sport = mapSport(sportAttr)
          const laps = activity.getElementsByTagName('Lap')

          let totalDuration = 0
          let totalDistance = 0
          let totalCalories = 0
          let hrSum = 0
          let hrCount = 0
          let maxHr = 0
          let cadenceSum = 0
          let cadenceCount = 0
          let powerSum = 0
          let powerCount = 0
          let startTime: string | null = null

          for (let l = 0; l < laps.length; l++) {
            const lap = laps[l]

            if (l === 0) {
              startTime = lap.getAttribute('StartTime')
            }

            const duration = getNumber(lap, 'TotalTimeSeconds')
            if (duration) totalDuration += duration

            const distance = getNumber(lap, 'DistanceMeters')
            if (distance) totalDistance += distance

            const cals = getNumber(lap, 'Calories')
            if (cals) totalCalories += cals

            const avgHr = getNumber(lap, 'AverageHeartRateBpm')
            if (avgHr) {
              // TCX wraps HR in <Value> child
              const hrEl = lap.getElementsByTagName('AverageHeartRateBpm')[0]
              const hrVal = hrEl ? getNumber(hrEl, 'Value') : avgHr
              if (hrVal) {
                hrSum += hrVal * (duration || 1)
                hrCount += duration || 1
              }
            }

            const maxHrEl = lap.getElementsByTagName('MaximumHeartRateBpm')[0]
            if (maxHrEl) {
              const val = getNumber(maxHrEl, 'Value')
              if (val && val > maxHr) maxHr = val
            }

            const cadence = getNumber(lap, 'Cadence')
            if (cadence) {
              cadenceSum += cadence * (duration || 1)
              cadenceCount += duration || 1
            }

            // Look for power in extensions
            const extensions = lap.getElementsByTagName('Extensions')
            for (let e = 0; e < extensions.length; e++) {
              const avgWatts = getNumber(extensions[e], 'AvgWatts')
              if (avgWatts) {
                powerSum += avgWatts * (duration || 1)
                powerCount += duration || 1
              }
            }
          }

          const avgHrCalc = hrCount > 0 ? Math.round(hrSum / hrCount) : null
          const avgCadence = cadenceCount > 0 ? Math.round(cadenceSum / cadenceCount) : null
          const avgPower = powerCount > 0 ? Math.round(powerSum / powerCount) : null

          let date: string | null = null
          if (startTime) {
            try {
              date = new Date(startTime).toISOString().split('T')[0]
            } catch { /* ignore */ }
          }

          // Compute pace for running
          let avgPace: number | null = null
          if (sport === 'run' && totalDistance > 0 && totalDuration > 0) {
            avgPace = Math.round((totalDuration / totalDistance) * 1000)
          }

          workouts.push({
            sport,
            title: sportAttr
              ? `${sportAttr.charAt(0).toUpperCase()}${sportAttr.slice(1).toLowerCase()} Workout`
              : null,
            date,
            duration_seconds: totalDuration ? Math.round(totalDuration) : null,
            distance_meters: totalDistance ? Math.round(totalDistance) : null,
            avg_hr: avgHrCalc,
            max_hr: maxHr > 0 ? maxHr : null,
            calories: totalCalories > 0 ? totalCalories : null,
            rpe: null,
            notes: null,
            pool_length_meters: null,
            swolf: null,
            avg_power_watts: avgPower,
            normalized_power: null,
            tss: null,
            avg_cadence_rpm: sport === 'bike' ? avgCadence : null,
            elevation_gain_meters: null,
            avg_pace_sec_per_km: avgPace,
            avg_cadence_spm: sport === 'run' && avgCadence ? avgCadence * 2 : null,
            source_file: file.name,
            source_format: 'tcx',
          })
        }

        if (workouts.length === 0) {
          reject(new Error('No activities found in TCX file'))
          return
        }

        resolve(workouts)
      } catch (err) {
        reject(new Error(`Failed to parse TCX file: ${err instanceof Error ? err.message : err}`))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read TCX file'))
    reader.readAsText(file)
  })
}
