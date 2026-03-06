import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import NutritionClient from './nutrition-client'
import type { TargetRace } from '@/lib/types/target-race'
import type { Profile } from '@/lib/types/database'

export default async function NutritionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [{ data: race }, { data: profile }] = await Promise.all([
    supabase.from('target_races').select('*').eq('id', id).single(),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  if (!race) notFound()

  return <NutritionClient race={race as TargetRace} profile={profile as Profile | null} />
}
