/**
 * Subscription gating.
 * Free: 1 race, no reveal.
 * Pro: unlimited races, full reveal + race day plan.
 */

import { createClient } from '@/lib/supabase/client'

export type SubscriptionTier = 'free' | 'pro'

export interface SubscriptionStatus {
  tier: SubscriptionTier
  isActive: boolean
  expiresAt: string | null
  canAddRace: boolean
  canReveal: boolean
  raceCount: number
}

const FREE_RACE_LIMIT = 1

export async function checkSubscription(): Promise<SubscriptionStatus> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { tier: 'free', isActive: false, expiresAt: null, canAddRace: false, canReveal: false, raceCount: 0 }
  }

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from('profiles').select('subscription_tier, subscription_expires_at').eq('id', user.id).single(),
    supabase.from('target_races').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const tier = (profile?.subscription_tier as SubscriptionTier) || 'free'
  const expiresAt = profile?.subscription_expires_at || null
  const raceCount = count || 0

  const isActive = tier === 'pro' && (!expiresAt || new Date(expiresAt) > new Date())

  return {
    tier: isActive ? 'pro' : 'free',
    isActive,
    expiresAt,
    canAddRace: isActive || raceCount < FREE_RACE_LIMIT,
    canReveal: isActive,
    raceCount,
  }
}

export function getUpgradeMessage(action: 'add_race' | 'reveal'): string {
  switch (action) {
    case 'add_race':
      return 'Free accounts are limited to 1 race. Upgrade to Pro for unlimited races.'
    case 'reveal':
      return 'Race week reveal is a Pro feature. Upgrade to see your projected finish time and full race day plan.'
  }
}
