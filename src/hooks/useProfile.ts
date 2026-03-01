'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AthleteThresholds } from '@/lib/analytics/training-stress'

export function useProfile(): { profile: AthleteThresholds | null; loading: boolean } {
  const [profile, setProfile] = useState<AthleteThresholds | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    async function fetch() {
      const { data: { user } } = await supabaseRef.current.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabaseRef.current
        .from('profiles')
        .select('ftp_watts, threshold_pace_swim, threshold_pace_run, resting_heart_rate, max_heart_rate')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile({
          ftp_watts: data.ftp_watts,
          threshold_pace_swim: data.threshold_pace_swim,
          threshold_pace_run: data.threshold_pace_run,
          resting_heart_rate: data.resting_heart_rate,
          max_heart_rate: data.max_heart_rate,
        })
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { profile, loading }
}
