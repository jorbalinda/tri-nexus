import { ParsedWorkout } from './types'

type FieldKey = keyof Omit<ParsedWorkout, 'source_file' | 'source_format'>

const HEADER_ALIASES: Record<string, FieldKey> = {
  // Sport
  sport: 'sport',
  activity: 'sport',
  'activity type': 'sport',
  type: 'sport',
  // Title
  title: 'title',
  name: 'title',
  'workout name': 'title',
  'activity name': 'title',
  // Date
  date: 'date',
  'start date': 'date',
  'activity date': 'date',
  // Duration
  duration: 'duration_seconds',
  'duration (s)': 'duration_seconds',
  'duration (seconds)': 'duration_seconds',
  'elapsed time': 'duration_seconds',
  'total time': 'duration_seconds',
  'moving time': 'duration_seconds',
  time: 'duration_seconds',
  // Distance
  distance: 'distance_meters',
  'distance (m)': 'distance_meters',
  'distance (meters)': 'distance_meters',
  'distance (km)': 'distance_meters',
  'distance (mi)': 'distance_meters',
  'distance (miles)': 'distance_meters',
  'total distance': 'distance_meters',
  // HR
  'avg hr': 'avg_hr',
  'avg heart rate': 'avg_hr',
  'average heart rate': 'avg_hr',
  'average hr': 'avg_hr',
  'heart rate': 'avg_hr',
  'max hr': 'max_hr',
  'max heart rate': 'max_hr',
  'maximum heart rate': 'max_hr',
  // Calories
  calories: 'calories',
  'total calories': 'calories',
  cal: 'calories',
  // RPE
  rpe: 'rpe',
  'perceived exertion': 'rpe',
  // Notes
  notes: 'notes',
  description: 'notes',
  comment: 'notes',
  // Swim
  'pool length': 'pool_length_meters',
  'pool length (m)': 'pool_length_meters',
  swolf: 'swolf',
  // Bike
  'avg power': 'avg_power_watts',
  'avg power (w)': 'avg_power_watts',
  'average power': 'avg_power_watts',
  power: 'avg_power_watts',
  'normalized power': 'normalized_power',
  np: 'normalized_power',
  tss: 'tss',
  'training stress score': 'tss',
  'cadence (rpm)': 'avg_cadence_rpm',
  'avg cadence': 'avg_cadence_rpm',
  'elevation gain': 'elevation_gain_meters',
  'elevation gain (m)': 'elevation_gain_meters',
  'total ascent': 'elevation_gain_meters',
  elevation: 'elevation_gain_meters',
  // Run
  'avg pace': 'avg_pace_sec_per_km',
  'avg pace (min/km)': 'avg_pace_sec_per_km',
  pace: 'avg_pace_sec_per_km',
  'cadence (spm)': 'avg_cadence_spm',
  'run cadence': 'avg_cadence_spm',
}

function detectDelimiter(firstLine: string): string {
  const counts = {
    ',': (firstLine.match(/,/g) || []).length,
    ';': (firstLine.match(/;/g) || []).length,
    '\t': (firstLine.match(/\t/g) || []).length,
  }
  if (counts['\t'] > counts[','] && counts['\t'] > counts[';']) return '\t'
  if (counts[';'] > counts[',']) return ';'
  return ','
}

function parseDuration(value: string): number | null {
  // HH:MM:SS or MM:SS format
  if (value.includes(':')) {
    const parts = value.split(':').map(Number)
    if (parts.some(isNaN)) return null
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    return null
  }
  const n = parseFloat(value)
  return isNaN(n) ? null : n
}

function parseSport(value: string): ParsedWorkout['sport'] {
  const v = value.toLowerCase().trim()
  if (v === 'run' || v === 'running') return 'run'
  if (v === 'bike' || v === 'cycling' || v === 'biking' || v === 'ride') return 'bike'
  if (v === 'swim' || v === 'swimming') return 'swim'
  if (v === 'brick' || v === 'multisport' || v === 'triathlon') return 'brick'
  return null
}

function needsKmToMConversion(header: string): boolean {
  const h = header.toLowerCase()
  return h.includes('(km)') || h.includes('kilometers')
}

function needsMilesToMConversion(header: string): boolean {
  const h = header.toLowerCase()
  return h.includes('(mi)') || h.includes('(miles)')
}

function parsePace(value: string): number | null {
  // MM:SS format -> seconds per km
  if (value.includes(':')) {
    const parts = value.split(':').map(Number)
    if (parts.some(isNaN)) return null
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    return null
  }
  // Decimal minutes -> seconds
  const n = parseFloat(value)
  return isNaN(n) ? null : Math.round(n * 60)
}

export function parseCsvFile(file: File): Promise<ParsedWorkout[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = (reader.result as string).trim()
        const lines = text.split(/\r?\n/)
        if (lines.length < 2) {
          reject(new Error('CSV file must have a header row and at least one data row'))
          return
        }

        const delimiter = detectDelimiter(lines[0])
        const rawHeaders = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''))

        // Map headers to field keys
        const columnMap: { index: number; field: FieldKey; rawHeader: string }[] = []
        for (let i = 0; i < rawHeaders.length; i++) {
          const normalized = rawHeaders[i].toLowerCase().trim()
          const field = HEADER_ALIASES[normalized]
          if (field) {
            columnMap.push({ index: i, field, rawHeader: rawHeaders[i] })
          }
        }

        if (columnMap.length === 0) {
          reject(
            new Error(
              'No recognized columns found in CSV. Expected headers like: Sport, Date, Duration, Distance, Avg HR, etc.'
            )
          )
          return
        }

        const workouts: ParsedWorkout[] = []

        for (let r = 1; r < lines.length; r++) {
          const line = lines[r].trim()
          if (!line) continue

          const values = line.split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ''))

          const workout: ParsedWorkout = {
            sport: null,
            title: null,
            date: null,
            duration_seconds: null,
            distance_meters: null,
            avg_hr: null,
            max_hr: null,
            calories: null,
            rpe: null,
            notes: null,
            pool_length_meters: null,
            swolf: null,
            avg_power_watts: null,
            normalized_power: null,
            tss: null,
            avg_cadence_rpm: null,
            elevation_gain_meters: null,
            avg_pace_sec_per_km: null,
            avg_cadence_spm: null,
            source_file: file.name,
            source_format: 'csv',
          }

          for (const { index, field, rawHeader } of columnMap) {
            const raw = values[index]
            if (!raw || raw === '') continue

            switch (field) {
              case 'sport':
                workout.sport = parseSport(raw)
                break
              case 'title':
              case 'notes':
                workout[field] = raw
                break
              case 'date':
                // Try to normalize date
                try {
                  const d = new Date(raw)
                  if (!isNaN(d.getTime())) {
                    workout.date = d.toISOString().split('T')[0]
                  } else {
                    workout.date = raw
                  }
                } catch {
                  workout.date = raw
                }
                break
              case 'duration_seconds':
                workout.duration_seconds = parseDuration(raw)
                break
              case 'avg_pace_sec_per_km':
                workout.avg_pace_sec_per_km = parsePace(raw)
                break
              case 'distance_meters': {
                let dist = parseFloat(raw)
                if (!isNaN(dist)) {
                  if (needsKmToMConversion(rawHeader)) dist *= 1000
                  else if (needsMilesToMConversion(rawHeader)) dist *= 1609.344
                  workout.distance_meters = Math.round(dist)
                }
                break
              }
              default: {
                const num = parseFloat(raw)
                if (!isNaN(num)) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ;(workout as any)[field] = field.includes('seconds') ? Math.round(num) : num
                }
              }
            }
          }

          workouts.push(workout)
        }

        if (workouts.length === 0) {
          reject(new Error('No data rows found in CSV file'))
          return
        }

        resolve(workouts)
      } catch (err) {
        reject(new Error(`Failed to parse CSV file: ${err instanceof Error ? err.message : err}`))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read CSV file'))
    reader.readAsText(file)
  })
}
