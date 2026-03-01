import { NextResponse } from 'next/server'
import { authenticateRequest, handleApiError } from '@/lib/api/utils'
import { calculateCTL, calculateATL, calculateTSB } from '@/lib/analytics/training-stress'
import { addImperialFields } from '@/lib/api/calculations'
import type { Workout } from '@/lib/types/database'
import type { UnitSystem } from '@/lib/units'

export async function GET() {
  try {
    const { user, supabase, error: authError } = await authenticateRequest()
    if (authError) return authError

    // Get all active workouts for stress calculations + this week's volume
    const { data: allWorkouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .order('date', { ascending: false })

    const workouts = (allWorkouts as Workout[]) || []

    // This week's volume by sport
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + mondayOffset)
    monday.setHours(0, 0, 0, 0)
    const mondayStr = monday.toISOString().split('T')[0]

    const weekWorkouts = workouts.filter((w) => w.date >= mondayStr)
    const volumeBySport: Record<string, { count: number; duration_seconds: number; distance_meters: number }> = {}

    for (const w of weekWorkouts) {
      if (!volumeBySport[w.sport]) {
        volumeBySport[w.sport] = { count: 0, duration_seconds: 0, distance_meters: 0 }
      }
      volumeBySport[w.sport].count++
      volumeBySport[w.sport].duration_seconds += w.duration_seconds || 0
      volumeBySport[w.sport].distance_meters += w.distance_meters || 0
    }

    // Fetch user profile for thresholds + unit preference
    const { data: profile } = await supabase
      .from('profiles')
      .select('unit_system, ftp_watts, threshold_pace_swim, threshold_pace_run, resting_heart_rate, max_heart_rate')
      .eq('id', user!.id)
      .single()

    const units = (profile?.unit_system || 'metric') as UnitSystem
    const thresholds = profile ? {
      ftp_watts: profile.ftp_watts,
      threshold_pace_swim: profile.threshold_pace_swim,
      threshold_pace_run: profile.threshold_pace_run,
      resting_heart_rate: profile.resting_heart_rate,
      max_heart_rate: profile.max_heart_rate,
    } : null

    // Training load metrics
    const ctl = calculateCTL(workouts, thresholds)
    const atl = calculateATL(workouts, thresholds)
    const tsb = calculateTSB(workouts, thresholds)

    // Recent workouts (last 10)
    const recentWorkouts = workouts.slice(0, 10)

    return NextResponse.json({
      this_week: volumeBySport,
      training_load: { ctl, atl, tsb },
      recent_workouts: recentWorkouts.map((w) => addImperialFields(w as unknown as Record<string, unknown>, units)),
      units,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
