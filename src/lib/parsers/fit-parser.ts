import { ParsedWorkout } from './types'

interface FitSession {
  sport?: string
  sub_sport?: string
  timestamp?: string
  start_time?: string
  total_elapsed_time?: number
  total_timer_time?: number
  total_distance?: number
  avg_heart_rate?: number
  max_heart_rate?: number
  avg_power?: number
  normalized_power?: number
  training_stress_score?: number
  avg_cadence?: number
  avg_speed?: number
  total_ascent?: number
  total_calories?: number
  pool_length?: number
  avg_stroke_count?: number
}

function mapSport(fitSport?: string): ParsedWorkout['sport'] {
  if (!fitSport) return null
  const s = fitSport.toLowerCase()
  if (s === 'running' || s === 'trail_running') return 'run'
  if (s === 'cycling' || s === 'virtual_cycling') return 'bike'
  if (s === 'swimming' || s === 'open_water_swimming' || s === 'lap_swimming') return 'swim'
  if (s === 'multisport' || s === 'triathlon') return 'brick'
  return null
}

function formatDate(ts?: string): string | null {
  if (!ts) return null
  try {
    return new Date(ts).toISOString().split('T')[0]
  } catch {
    return null
  }
}

function sessionToWorkout(session: FitSession, fileName: string): ParsedWorkout {
  const sport = mapSport(session.sport)

  // Compute pace for running
  let avgPace: number | null = null
  if (sport === 'run' && session.avg_speed && session.avg_speed > 0) {
    avgPace = Math.round(1000 / session.avg_speed)
  }

  return {
    sport,
    title: session.sport
      ? `${session.sport.charAt(0).toUpperCase()}${session.sport.slice(1).toLowerCase()} Workout`
      : null,
    date: formatDate(session.start_time || session.timestamp),
    duration_seconds: session.total_timer_time
      ? Math.round(session.total_timer_time)
      : session.total_elapsed_time
        ? Math.round(session.total_elapsed_time)
        : null,
    distance_meters: session.total_distance ? Math.round(session.total_distance) : null,
    avg_hr: session.avg_heart_rate ?? null,
    max_hr: session.max_heart_rate ?? null,
    calories: session.total_calories ?? null,
    rpe: null,
    notes: null,
    pool_length_meters: session.pool_length ? session.pool_length / 100 : null,
    swolf: session.avg_stroke_count ?? null,
    avg_power_watts: session.avg_power ?? null,
    normalized_power: session.normalized_power ?? null,
    tss: session.training_stress_score ? Math.round(session.training_stress_score) : null,
    avg_cadence_rpm: sport === 'bike' ? (session.avg_cadence ?? null) : null,
    elevation_gain_meters: session.total_ascent ?? null,
    avg_pace_sec_per_km: avgPace,
    avg_cadence_spm:
      sport === 'run' && session.avg_cadence ? session.avg_cadence * 2 : null,
    source_file: fileName,
    source_format: 'fit',
  }
}

export async function parseFitFile(file: File): Promise<ParsedWorkout[]> {
  const { default: FitParser } = await import('fit-file-parser')
  const parser = new FitParser({ force: true, mode: 'list' })

  const buffer = await file.arrayBuffer()
  const data = await parser.parseAsync(buffer)

  const sessions = data.sessions || data.activity?.sessions || []
  if (sessions.length === 0) {
    throw new Error('No workout sessions found in FIT file')
  }

  return (sessions as FitSession[]).map((s) => sessionToWorkout(s, file.name))
}
