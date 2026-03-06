import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RaceDetailClient from './race-detail-client'
import type { TargetRace } from '@/lib/types/target-race'
import type { ManualLog, Workout } from '@/lib/types/database'
import type { RaceProjection } from '@/lib/types/projection'
import type { RaceCourse, RaceWeather } from '@/lib/types/race-plan'

export default async function RaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // Fetch race first — needed to know race_course_id for the course lookup
  const { data: race } = await supabase.from('target_races').select('*').eq('id', id).single()
  if (!race) notFound()

  // Parallel fetch everything else
  const [
    { data: logs },
    { data: workouts },
    { data: projection },
    courseResult,
    { data: weather },
  ] = await Promise.all([
    supabase.from('manual_logs').select('*').eq('user_id', user.id),
    supabase.from('workouts').select('*').is('deleted_at', null).order('date'),
    supabase.from('projections').select('*').eq('target_race_id', id).order('projected_at', { ascending: false }).limit(1).maybeSingle(),
    race.race_course_id
      ? supabase.from('race_courses').select('*').eq('id', race.race_course_id).single()
      : Promise.resolve({ data: null }),
    supabase.from('race_weather').select('*').eq('target_race_id', id).maybeSingle(),
  ])

  return (
    <RaceDetailClient
      initialRace={race as TargetRace}
      initialLogs={(logs as ManualLog[]) ?? []}
      initialWorkouts={(workouts as Workout[]) ?? []}
      initialProjection={(projection as RaceProjection) ?? null}
      initialCourse={(courseResult.data as RaceCourse) ?? null}
      initialWeather={(weather as RaceWeather) ?? null}
    />
  )
}
