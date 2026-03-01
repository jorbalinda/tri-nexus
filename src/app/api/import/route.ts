import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, handleApiError } from '@/lib/api/utils'
import { computeDerivedFields } from '@/lib/api/calculations'

export async function POST(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await authenticateRequest()
    if (authError) return authError

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Server-side file size limit (50 MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 413 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !['fit', 'tcx', 'gpx', 'csv'].includes(ext)) {
      return NextResponse.json({ error: 'Unsupported file format. Use .fit, .tcx, .gpx, or .csv' }, { status: 400 })
    }

    // Dynamically import the appropriate parser
    let parsedWorkouts
    switch (ext) {
      case 'fit': {
        const { parseFitFile } = await import('@/lib/parsers/fit-parser')
        parsedWorkouts = await parseFitFile(file)
        break
      }
      case 'tcx': {
        const { parseTcxFile } = await import('@/lib/parsers/tcx-parser')
        parsedWorkouts = await parseTcxFile(file)
        break
      }
      case 'gpx': {
        const { parseGpxFile } = await import('@/lib/parsers/gpx-parser')
        parsedWorkouts = await parseGpxFile(file)
        break
      }
      case 'csv': {
        const { parseCsvFile } = await import('@/lib/parsers/csv-parser')
        parsedWorkouts = await parseCsvFile(file)
        break
      }
    }

    if (!parsedWorkouts || parsedWorkouts.length === 0) {
      return NextResponse.json({ error: 'No workouts found in file' }, { status: 400 })
    }

    // Fetch user profile for calculations
    const { data: profile } = await supabase
      .from('profiles')
      .select('ftp_watts, threshold_pace_swim, threshold_pace_run, resting_heart_rate, max_heart_rate')
      .eq('id', user!.id)
      .single()

    const createdWorkouts = []
    const errors: string[] = []

    for (const parsed of parsedWorkouts) {
      if (!parsed.sport || !parsed.date) continue

      const derived = computeDerivedFields({
        sport: parsed.sport,
        duration_seconds: parsed.duration_seconds,
        distance_meters: parsed.distance_meters,
        avg_power_watts: parsed.avg_power_watts,
        normalized_power: parsed.normalized_power,
        avg_pace_sec_per_km: parsed.avg_pace_sec_per_km,
        avg_hr: parsed.avg_hr,
        rpe: parsed.rpe,
        tss: parsed.tss,
        ftp_watts: profile?.ftp_watts,
        threshold_pace_swim: profile?.threshold_pace_swim,
        threshold_pace_run: profile?.threshold_pace_run,
        resting_heart_rate: profile?.resting_heart_rate,
        max_heart_rate: profile?.max_heart_rate,
      })

      const { data: workout, error } = await supabase
        .from('workouts')
        .insert({
          user_id: user!.id,
          sport: parsed.sport,
          title: parsed.title || `${parsed.sport.charAt(0).toUpperCase() + parsed.sport.slice(1)} Workout`,
          date: parsed.date,
          duration_seconds: parsed.duration_seconds,
          distance_meters: parsed.distance_meters,
          avg_hr: parsed.avg_hr,
          max_hr: parsed.max_hr,
          calories: parsed.calories,
          rpe: parsed.rpe,
          notes: parsed.notes,
          pool_length_meters: parsed.pool_length_meters,
          swolf: parsed.swolf,
          avg_power_watts: parsed.avg_power_watts,
          normalized_power: parsed.normalized_power,
          tss: parsed.tss ?? derived.tss,
          avg_cadence_rpm: parsed.avg_cadence_rpm,
          elevation_gain_meters: parsed.elevation_gain_meters,
          avg_pace_sec_per_km: parsed.avg_pace_sec_per_km ?? derived.avg_pace_sec_per_km,
          avg_cadence_spm: parsed.avg_cadence_spm,
          avg_speed_mps: derived.avg_speed_mps,
          intensity_factor: derived.intensity_factor,
          source: 'file_upload',
        })
        .select()
        .single()

      if (error) {
        console.error('Workout insert error:', error)
        if (errors.length < 3) {
          errors.push('Failed to save one workout')
        }
      }
      if (!error && workout) {
        createdWorkouts.push(workout)
      }
    }

    return NextResponse.json({
      workouts: createdWorkouts,
      count: createdWorkouts.length,
      parsed_count: parsedWorkouts.length,
      ...(errors.length > 0 ? { insert_errors: errors } : {}),
    }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
