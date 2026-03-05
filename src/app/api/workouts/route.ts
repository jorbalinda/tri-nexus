import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, validateBody, validateQuery, handleApiError } from '@/lib/api/utils'
import { WorkoutCreateSchema, WorkoutQuerySchema } from '@/lib/validation/schemas'
import { computeDerivedFields, addImperialFields } from '@/lib/api/calculations'
import type { UnitSystem } from '@/lib/units'
import { refreshFitnessSnapshot, postActivityToFeed } from '@/lib/social/snapshot'

export async function GET(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await authenticateRequest()
    if (authError) return authError

    const params = Object.fromEntries(request.nextUrl.searchParams)
    const { data: query, error: valError } = validateQuery(params, WorkoutQuerySchema)
    if (valError) return valError

    let q = supabase
      .from('workouts')
      .select('*', { count: 'exact' })
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .range(query!.offset, query!.offset + query!.limit - 1)

    if (query!.sport) q = q.eq('sport', query!.sport)
    if (query!.source) q = q.eq('source', query!.source)
    if (query!.date_from) q = q.gte('date', query!.date_from)
    if (query!.date_to) q = q.lte('date', query!.date_to)

    const { data, count, error } = await q
    if (error) return handleApiError(error)

    // Fetch user's unit preference for imperial conversion
    const { data: profile } = await supabase
      .from('profiles')
      .select('unit_system')
      .eq('id', user!.id)
      .single()

    const units = (profile?.unit_system || 'metric') as UnitSystem
    const enriched = (data || []).map((w: Record<string, unknown>) => addImperialFields(w, units))

    return NextResponse.json({ data: enriched, total: count, limit: query!.limit, offset: query!.offset, units })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await authenticateRequest()
    if (authError) return authError

    const body = await request.json()
    const { data: validated, error: valError } = validateBody(body, WorkoutCreateSchema)
    if (valError) return valError

    // Fetch user profile for threshold-based calculations
    const { data: profile } = await supabase
      .from('profiles')
      .select('ftp_watts, threshold_pace_swim, threshold_pace_run, resting_heart_rate, max_heart_rate')
      .eq('id', user!.id)
      .single()

    const derived = computeDerivedFields({
      sport: validated!.sport,
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

    const workoutData = {
      ...validated,
      ...derived,
      // Don't overwrite explicit values with computed ones
      avg_speed_mps: validated!.avg_speed_mps ?? derived.avg_speed_mps,
      avg_pace_sec_per_km: validated!.avg_pace_sec_per_km ?? derived.avg_pace_sec_per_km,
      intensity_factor: derived.intensity_factor,
      tss: validated!.tss ?? derived.tss,
      tss_source: derived.tss_source,
      user_id: user!.id,
    }

    const { data, error } = await supabase
      .from('workouts')
      .insert(workoutData)
      .select()
      .single()

    if (error) return handleApiError(error)

    // Fire-and-forget social updates (don't block response)
    Promise.all([
      refreshFitnessSnapshot(user!.id),
      postActivityToFeed(data.sport, data.id, user!.id),
    ]).catch(console.error)

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
