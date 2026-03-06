import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RaceDayClient from './race-day-client'
import type { TargetRace } from '@/lib/types/target-race'
import type { TimelineEvent } from '@/lib/types/database'

export default async function RaceDayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: race }, { data: events }] = await Promise.all([
    supabase.from('target_races').select('*').eq('id', id).single(),
    supabase.from('timeline_events').select('*').eq('race_id', id).order('scheduled_time'),
  ])

  if (!race) notFound()

  return <RaceDayClient initialRace={race as TargetRace} initialEvents={(events as TimelineEvent[]) ?? []} />
}
