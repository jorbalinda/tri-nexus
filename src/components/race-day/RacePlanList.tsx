'use client'

import { Calendar, Target, Clock, ChevronRight, Users, Trophy } from 'lucide-react'
import type { RacePlan } from '@/lib/types/race-plan'

interface RacePlanListProps {
  plans: RacePlan[]
  onSelect: (plan: RacePlan) => void
}

function formatTime(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '--:--:--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function daysUntil(dateStr: string | null): string | null {
  if (!dateStr) return null
  const now = new Date()
  const race = new Date(dateStr + 'T00:00:00')
  const diff = Math.ceil((race.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Completed'
  if (diff === 0) return 'Today!'
  return `${diff}d away`
}

const distanceLabels: Record<string, string> = {
  super_sprint: 'Super Sprint',
  sprint: 'Sprint',
  olympic: 'Olympic',
  wt_sprint: 'WT Sprint',
  wt_standard: 'WT Standard',
  '70.3': '70.3',
  '140.6': '140.6',
  custom: 'Custom',
}

const distanceColors: Record<string, string> = {
  super_sprint: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',
  sprint: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  olympic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  wt_sprint: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400',
  wt_standard: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
  '70.3': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  '140.6': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  custom: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
}

const goalLabels: Record<string, string> = {
  finish: 'Finish',
  pr: 'PR',
  ag_podium: 'AG Podium',
  ag_win: 'AG Win',
  qualify_im_703_worlds: '70.3 Worlds',
  qualify_im_kona: 'Kona',
  qualify_wt_ag_worlds: 'WT AG Worlds',
  qualify_usat_nationals: 'USAT Nationals',
  legacy_qualification: 'Legacy',
  win_podium: 'Win/Podium',
  pro_card_qualification: 'Pro Card',
  im_pro_slot: 'Pro Slot',
  pto_ranking_points: 'PTO Points',
  wt_series_points: 'WT Points',
  prize_money: 'Prize $',
  course_record: 'CR',
}

export default function RacePlanList({ plans, onSelect }: RacePlanListProps) {
  if (plans.length === 0) {
    return (
      <div className="card-squircle p-12 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          No race plans yet. Create your first one above.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
        Saved Race Plans
      </p>
      {plans.map((plan) => {
        const countdown = daysUntil(plan.race_date)
        const isPro = plan.athlete_classification === 'professional'
        return (
          <button
            key={plan.id}
            onClick={() => onSelect(plan)}
            className="card-squircle p-6 flex items-center justify-between hover:shadow-lg transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${distanceColors[plan.race_distance] || distanceColors.custom}`}
              >
                {distanceLabels[plan.race_distance] || plan.race_distance}
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{plan.race_name}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {plan.race_date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(plan.race_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Target size={12} />
                    {goalLabels[plan.goal_type] || plan.goal_type}
                  </span>
                  {isPro && (
                    <span className="flex items-center gap-1 text-red-400">
                      <Users size={12} />
                      Pro
                    </span>
                  )}
                  {plan.estimated_finish_seconds && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Est. {formatTime(plan.estimated_finish_seconds)}
                    </span>
                  )}
                  {plan.estimated_qualification_competitive === true && (
                    <span className="flex items-center gap-1 text-green-500">
                      <Trophy size={12} />
                      Qual. Ready
                    </span>
                  )}
                  {plan.estimated_qualification_competitive === false && (
                    <span className="flex items-center gap-1 text-amber-500">
                      <Trophy size={12} />
                      Qual. Gap
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {countdown && (
                <span className="text-xs font-semibold text-blue-500 dark:text-blue-400">
                  {countdown}
                </span>
              )}
              <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
            </div>
          </button>
        )
      })}
    </div>
  )
}
