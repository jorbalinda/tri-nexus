import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ResultsClient from './results-client'
import type { TargetRace } from '@/lib/types/target-race'

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: race } = await supabase
    .from('target_races')
    .select('*')
    .eq('id', id)
    .single()

  if (!race) notFound()

  return <ResultsClient initialRace={race as TargetRace} />
}
