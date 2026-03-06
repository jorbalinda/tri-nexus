import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RaceDetailClient from './race-detail-client'
import type { TargetRace } from '@/lib/types/target-race'
import type { ManualLog } from '@/lib/types/database'

export default async function RaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [{ data: race }, { data: logs }] = await Promise.all([
    supabase.from('target_races').select('*').eq('id', id).single(),
    supabase.from('manual_logs').select('*').eq('user_id', user.id),
  ])

  if (!race) notFound()

  return <RaceDetailClient initialRace={race as TargetRace} initialLogs={(logs as ManualLog[]) ?? []} />
}
