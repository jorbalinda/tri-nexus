import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, handleApiError } from '@/lib/api/utils'

const ALLOWED_FIELDS = ['heart_rate', 'power_watts', 'pace_sec_per_km', 'cadence', 'speed_mps', 'latitude', 'longitude', 'altitude_meters', 'temperature_c']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user, supabase, error: authError } = await authenticateRequest()
    if (authError) return authError

    // Verify workout ownership
    const { data: workout } = await supabase
      .from('workouts')
      .select('id')
      .eq('id', id)
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .single()

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    // Determine which fields to select
    const fieldsParam = request.nextUrl.searchParams.get('fields')
    let selectFields = 'id, workout_id, timestamp_offset_seconds'

    if (fieldsParam) {
      const requested = fieldsParam.split(',').filter((f) => ALLOWED_FIELDS.includes(f.trim()))
      if (requested.length > 0) {
        selectFields += ', ' + requested.join(', ')
      }
    } else {
      selectFields += ', ' + ALLOWED_FIELDS.join(', ')
    }

    const { data, error } = await supabase
      .from('session_metrics')
      .select(selectFields)
      .eq('workout_id', id)
      .order('timestamp_offset_seconds')

    if (error) return handleApiError(error)

    return NextResponse.json(data || [])
  } catch (err) {
    return handleApiError(err)
  }
}
