import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, validateBody, handleApiError } from '@/lib/api/utils'
import { WorkoutUpdateSchema } from '@/lib/validation/schemas'
import { computeDerivedFields, addImperialFields } from '@/lib/api/calculations'
import type { UnitSystem } from '@/lib/units'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user, supabase, error: authError } = await authenticateRequest()
    if (authError) return authError

    const { data: workout, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .single()

    if (error || !workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    // Fetch related data in parallel
    const [hrZones, powerZones, laps] = await Promise.all([
      supabase
        .from('workout_hr_zones')
        .select('*')
        .eq('workout_id', id)
        .order('zone_number'),
      supabase
        .from('workout_power_zones')
        .select('*')
        .eq('workout_id', id)
        .order('zone_number'),
      supabase
        .from('workout_laps')
        .select('*')
        .eq('workout_id', id)
        .order('lap_number'),
    ])

    // Fetch user's unit preference for imperial conversion
    const { data: profile } = await supabase
      .from('profiles')
      .select('unit_system')
      .eq('id', user!.id)
      .single()

    const units = (profile?.unit_system || 'metric') as UnitSystem

    return NextResponse.json({
      ...addImperialFields(workout, units),
      hr_zones: hrZones.data || [],
      power_zones: powerZones.data || [],
      laps: (laps.data || []).map((l: Record<string, unknown>) => addImperialFields(l, units)),
      units,
    })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user, supabase, error: authError } = await authenticateRequest()
    if (authError) return authError

    // Verify ownership
    const { data: existing } = await supabase
      .from('workouts')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    const body = await request.json()
    const { data: validated, error: valError } = validateBody(body, WorkoutUpdateSchema)
    if (valError) return valError

    // Recompute derived fields if relevant inputs changed
    const { data: profile } = await supabase
      .from('profiles')
      .select('ftp_watts, threshold_pace_swim, threshold_pace_run, resting_heart_rate, max_heart_rate')
      .eq('id', user!.id)
      .single()

    const derived = computeDerivedFields({
      sport: validated!.sport || 'run',
      duration_seconds: validated!.duration_seconds,
      distance_meters: validated!.distance_meters,
      avg_power_watts: validated!.avg_power_watts,
      normalized_power: validated!.normalized_power,
      avg_pace_sec_per_km: validated!.avg_pace_sec_per_km,
      avg_hr: validated!.avg_hr,
      rpe: validated!.rpe,
      tss: validated!.tss,
      ftp_watts: profile?.ftp_watts,
      threshold_pace_swim: profile?.threshold_pace_swim,
      threshold_pace_run: profile?.threshold_pace_run,
      resting_heart_rate: profile?.resting_heart_rate,
      max_heart_rate: profile?.max_heart_rate,
    })

    const updateData = {
      ...validated,
      avg_speed_mps: validated!.avg_speed_mps ?? derived.avg_speed_mps,
      avg_pace_sec_per_km: validated!.avg_pace_sec_per_km ?? derived.avg_pace_sec_per_km,
      intensity_factor: derived.intensity_factor ?? undefined,
      tss: validated!.tss ?? derived.tss,
      tss_source: derived.tss_source,
    }

    // Remove undefined keys
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined)
    )

    const { data, error } = await supabase
      .from('workouts')
      .update(cleanData)
      .eq('id', id)
      .select()
      .single()

    if (error) return handleApiError(error)

    return NextResponse.json(data)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user, supabase, error: authError } = await authenticateRequest()
    if (authError) return authError

    // Soft delete
    const { data, error } = await supabase
      .from('workouts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Workout deleted' })
  } catch (err) {
    return handleApiError(err)
  }
}
