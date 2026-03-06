import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RevealClient from './reveal-client'
import type { TargetRace } from '@/lib/types/target-race'

export default async function RevealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: race } = await supabase
    .from('target_races')
    .select('*')
    .eq('id', id)
    .single()

  if (!race) notFound()

  return <RevealClient initialRace={race as TargetRace} />
}
