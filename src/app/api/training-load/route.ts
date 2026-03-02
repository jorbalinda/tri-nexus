import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, handleApiError } from '@/lib/api/utils'
import {
  calculateCTL,
  calculateATL,
  calculateTSB,
  calculateDisciplineSeries,
  projectTrainingLoad,
  type AthleteThresholds,
} from '@/lib/analytics/training-stress'
import type { Workout } from '@/lib/types/database'

export async function GET(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await authenticateRequest()
    if (authError) return authError

    const view = request.nextUrl.searchParams.get('view')
    const targetDate = request.nextUrl.searchParams.get('target_date')

    // Fetch all workouts
    const { data: allWorkouts } = await supabase
      .from('workouts')
      .select('id, date, sport, duration_seconds, distance_meters, tss, avg_hr, avg_power_watts, intensity_factor, rpe')
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .gte('date', new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false })

    const workouts = (allWorkouts as Workout[]) || []

    // Fetch profile thresholds
    const { data: profile } = await supabase
      .from('profiles')
      .select('ftp_watts, threshold_pace_swim, threshold_pace_run, resting_heart_rate, max_heart_rate')
      .eq('id', user!.id)
      .single()

    const thresholds: AthleteThresholds | null = profile ? {
      ftp_watts: profile.ftp_watts,
      threshold_pace_swim: profile.threshold_pace_swim,
      threshold_pace_run: profile.threshold_pace_run,
      resting_heart_rate: profile.resting_heart_rate,
      max_heart_rate: profile.max_heart_rate,
    } : null

    if (view === 'current') {
      return NextResponse.json({
        ctl: calculateCTL(workouts, thresholds),
        atl: calculateATL(workouts, thresholds),
        tsb: calculateTSB(workouts, thresholds),
      })
    }

    if (view === 'projection') {
      if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
        return NextResponse.json(
          { error: 'target_date is required in YYYY-MM-DD format' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        current: {
          ctl: calculateCTL(workouts, thresholds),
          atl: calculateATL(workouts, thresholds),
          tsb: calculateTSB(workouts, thresholds),
        },
        projection: projectTrainingLoad(workouts, targetDate, thresholds),
      })
    }

    // Default: full discipline series
    const series = calculateDisciplineSeries(workouts, thresholds)
    return NextResponse.json(series)
  } catch (err) {
    return handleApiError(err)
  }
}
