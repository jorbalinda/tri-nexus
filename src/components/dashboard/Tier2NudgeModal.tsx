'use client'

import { useEffect, useRef, useState } from 'react'
import { X, TrendingUp, Waves, Bike, Footprints, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { evaluateSufficiencyFromWorkouts } from '@/lib/analytics/data-sufficiency'
import type { Workout, ManualLog } from '@/lib/types/database'

const sessionKey = (lastSignIn: string) => `tier2_nudge_shown_${lastSignIn}`

const REQUIREMENTS = [
  {
    icon: Waves,
    sport: 'Swim',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    items: ['2+ swims, 20+ min each', '2 long swims, 30+ min each'],
  },
  {
    icon: Bike,
    sport: 'Bike',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    items: ['3+ rides, 30+ min each', '2 long rides, 60+ min each'],
  },
  {
    icon: Footprints,
    sport: 'Run',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-950/20',
    items: ['3+ runs, 30+ min each', '2 long runs, 45+ min each'],
  },
  {
    icon: Zap,
    sport: 'Thresholds',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    items: ['FTP set (bike power)', 'CSS set (swim pace)', 'Run threshold pace set'],
  },
]

export default function Tier2NudgeModal() {
  const [open, setOpen] = useState(false)
  const [bursting, setBursting] = useState(false)
  const [dismissKey, setDismissKey] = useState('')
  const btnRef = useRef<HTMLButtonElement>(null)

  const PARTICLES = ['🎉', '⭐', '🏊', '🚴', '🏃', '✨', '🏅', '🎊']

  useEffect(() => {
    const supabase = createClient()

    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const key = sessionKey(user.last_sign_in_at ?? user.id)
      if (sessionStorage.getItem(key)) return
      setDismissKey(key)

      const since = new Date()
      since.setDate(since.getDate() - 56)

      const [{ data: workouts }, { data: logs }] = await Promise.all([
        supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .gte('date', since.toISOString().split('T')[0]),
        supabase
          .from('manual_logs')
          .select('*')
          .eq('user_id', user.id),
      ])

      const stubRace = {
        id: '', user_id: user.id, race_name: '', race_date: '',
        race_distance: 'olympic' as const, status: 'upcoming' as const,
        created_at: '', updated_at: '',
        race_course_id: null, priority: 'a' as const, gpx_course_data: null,
        goal_time_seconds: null, notes: null,
        actual_finish_seconds: null, actual_swim_seconds: null, actual_bike_seconds: null,
        actual_run_seconds: null, actual_t1_seconds: null, actual_t2_seconds: null,
        race_type: 'triathlon' as const, water_type: null, wetsuit: false,
        expected_temp_f: null, gun_start_time: null, altitude_ft: null,
        course_profile: null, swim_type: null,
        custom_swim_distance_m: null, custom_bike_distance_km: null, custom_run_distance_km: null,
      }

      const result = evaluateSufficiencyFromWorkouts(
        (workouts ?? []) as Workout[],
        (logs ?? []) as ManualLog[],
        stubRace
      )

      if (result.tier === 2) setOpen(true)
    }

    check()
  }, [])

  const dismiss = () => {
    if (dismissKey) sessionStorage.setItem(dismissKey, '1')
    setBursting(true)
    setTimeout(() => setOpen(false), 700)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl sm:rounded-2xl rounded-b-none sm:rounded-b-2xl shadow-2xl overflow-hidden">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Unlock Refined Prediction
              </h2>
            </div>
            <button
              onClick={dismiss}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            You're at <span className="font-semibold text-blue-600 dark:text-blue-400">Standard (Tier 2)</span>.
            Log more workouts and set your thresholds to unlock Tier 3 — the most realistic race day predictions Race Day can produce.
          </p>

          {/* Requirements */}
          <div className="space-y-2 mb-5">
            {REQUIREMENTS.map(({ icon: Icon, sport, color, bg, items }) => (
              <div key={sport} className={`flex items-start gap-3 p-3 rounded-xl ${bg}`}>
                <Icon size={15} className={`${color} shrink-0 mt-0.5`} />
                <div>
                  <p className={`text-xs font-semibold ${color} mb-0.5`}>{sport}</p>
                  {items.map((item) => (
                    <p key={item} className="text-xs text-gray-600 dark:text-gray-400">{item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            {/* Particle burst */}
            {bursting && PARTICLES.map((emoji, i) => {
              const angle = (i / PARTICLES.length) * 360
              const rad = (angle * Math.PI) / 180
              const dist = 55 + Math.random() * 30
              const tx = Math.cos(rad) * dist
              const ty = Math.sin(rad) * dist
              return (
                <span
                  key={i}
                  className="pointer-events-none absolute left-1/2 top-1/2 text-lg leading-none"
                  style={{
                    transform: 'translate(-50%, -50%)',
                    animation: `particle-fly 0.65s ease-out forwards`,
                    ['--tx' as string]: `${tx}px`,
                    ['--ty' as string]: `${ty}px`,
                    animationDelay: `${i * 18}ms`,
                  }}
                >
                  {emoji}
                </span>
              )
            })}
            <button
              ref={btnRef}
              onClick={dismiss}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors"
            >
              Got it
            </button>
          </div>

          <style>{`
            @keyframes particle-fly {
              0%   { transform: translate(-50%, -50%) scale(0.3); opacity: 1; }
              60%  { opacity: 1; }
              100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.1); opacity: 0; }
            }
          `}</style>
        </div>
      </div>
    </div>
  )
}
