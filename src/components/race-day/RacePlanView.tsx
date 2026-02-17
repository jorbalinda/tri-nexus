'use client'

import { useRef } from 'react'
import PacingCard from './PacingCard'
import NutritionCard from './NutritionCard'
import EquipmentCard from './EquipmentCard'
import MindsetCard from './MindsetCard'
import QualificationCard from './QualificationCard'
import ExportPDF from './ExportPDF'
import type { RacePlan, RacePlanChecklist, QualificationReadiness } from '@/lib/types/race-plan'
import { ArrowLeft, Calendar, Target, Mountain, Thermometer, Users, Trophy } from 'lucide-react'

interface RacePlanViewProps {
  plan: RacePlan
  checklistItems: RacePlanChecklist[]
  onToggleChecklist: (itemId: string, checked: boolean) => void
  onBack: () => void
  onRegenerate: () => void
  onDelete: () => void
  regenerating: boolean
  useImperial: boolean
  qualificationReadiness: QualificationReadiness | null
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No date set'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function daysUntil(dateStr: string | null): string | null {
  if (!dateStr) return null
  const now = new Date()
  const race = new Date(dateStr + 'T00:00:00')
  const diff = Math.ceil((race.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Race completed'
  if (diff === 0) return 'Race day!'
  return `${diff} days away`
}

const distanceLabels: Record<string, string> = {
  super_sprint: 'Super Sprint',
  sprint: 'Sprint',
  olympic: 'Olympic',
  wt_sprint: 'WT Sprint (Draft-Legal)',
  wt_standard: 'WT Standard (Draft-Legal)',
  '70.3': 'Half Ironman 70.3',
  '140.6': 'Ironman 140.6',
  custom: 'Custom',
}

const goalLabels: Record<string, string> = {
  finish: 'Finish',
  pr: 'Personal Record',
  ag_podium: 'Age Group Podium',
  ag_win: 'Age Group Win',
  qualify_im_703_worlds: 'Qualify 70.3 Worlds',
  qualify_im_kona: 'Qualify Kona',
  qualify_wt_ag_worlds: 'Qualify WT AG Worlds',
  qualify_usat_nationals: 'Qualify USAT Nationals',
  legacy_qualification: 'Legacy Qualification',
  win_podium: 'Win / Podium',
  pro_card_qualification: 'Pro Card Qualification',
  im_pro_slot: 'IM Pro Slot',
  pto_ranking_points: 'PTO Points',
  wt_series_points: 'WT Series Points',
  prize_money: 'Prize Money',
  course_record: 'Course Record',
}

export default function RacePlanView({
  plan,
  checklistItems,
  onToggleChecklist,
  onBack,
  onRegenerate,
  onDelete,
  regenerating,
  useImperial,
  qualificationReadiness,
}: RacePlanViewProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const countdown = daysUntil(plan.race_date)
  const isPro = plan.athlete_classification === 'professional'

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors mb-3 cursor-pointer"
          >
            <ArrowLeft size={16} />
            All Race Plans
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{plan.race_name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(plan.race_date)}
            </span>
            <span className="flex items-center gap-1">
              <Target size={14} />
              {distanceLabels[plan.race_distance] || plan.race_distance}
            </span>
            <span className="flex items-center gap-1">
              <Trophy size={14} />
              {goalLabels[plan.goal_type] || plan.goal_type}
            </span>
            {plan.athlete_classification && (
              <span className={`flex items-center gap-1 ${isPro ? 'text-red-500' : 'text-blue-500'}`}>
                <Users size={14} />
                {isPro ? 'Professional' : 'Age Grouper'}
                {plan.age_group && ` (${plan.age_group})`}
              </span>
            )}
            {plan.conditions?.temp_high_f && (
              <span className="flex items-center gap-1">
                <Thermometer size={14} />
                {plan.conditions.temp_low_f && `${plan.conditions.temp_low_f}-`}
                {plan.conditions.temp_high_f}°F
              </span>
            )}
            {plan.conditions?.course_profile && (
              <span className="flex items-center gap-1">
                <Mountain size={14} />
                {plan.conditions.course_profile}
              </span>
            )}
          </div>
          {countdown && (
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
              {countdown}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ExportPDF plan={plan} contentRef={printRef} />
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Fitness snapshot */}
      {plan.fitness_snapshot && (
        <div className="card-squircle p-6">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
            Fitness Snapshot at Generation
          </p>
          <div className="grid grid-cols-4 gap-4">
            {plan.fitness_snapshot.estimatedFTP && (
              <MiniStat label="Est. FTP" value={`${plan.fitness_snapshot.estimatedFTP}W`} />
            )}
            {plan.fitness_snapshot.estimatedCSS && (
              <MiniStat
                label="Est. CSS"
                value={`${Math.floor(plan.fitness_snapshot.estimatedCSS / 60)}:${String(plan.fitness_snapshot.estimatedCSS % 60).padStart(2, '0')} /100m`}
              />
            )}
            {plan.fitness_snapshot.maxHR && (
              <MiniStat label="Max HR" value={`${plan.fitness_snapshot.maxHR} bpm`} />
            )}
            {plan.fitness_snapshot.restingHR && (
              <MiniStat label="Resting HR" value={`${plan.fitness_snapshot.restingHR} bpm`} />
            )}
            {plan.fitness_snapshot.weeklyVolumeHours && (
              <MiniStat label="Avg Weekly Vol" value={`${plan.fitness_snapshot.weeklyVolumeHours} hrs`} />
            )}
            {plan.fitness_snapshot.weight_kg && (
              <MiniStat label="Weight" value={`${plan.fitness_snapshot.weight_kg} kg`} />
            )}
            {plan.fitness_snapshot.estimatedLTHR.bike && (
              <MiniStat label="LTHR Bike" value={`${plan.fitness_snapshot.estimatedLTHR.bike} bpm`} />
            )}
            {plan.fitness_snapshot.estimatedLTHR.run && (
              <MiniStat label="LTHR Run" value={`${plan.fitness_snapshot.estimatedLTHR.run} bpm`} />
            )}
            {plan.fitness_snapshot.konaStandardMultiplier && (
              <MiniStat label="AG Multiplier" value={plan.fitness_snapshot.konaStandardMultiplier.toFixed(4)} />
            )}
            {plan.fitness_snapshot.ageGradedEstimate && (
              <MiniStat
                label="Age-Graded Est."
                value={formatTime(plan.fitness_snapshot.ageGradedEstimate)}
              />
            )}
          </div>
        </div>
      )}

      {/* Qualification readiness */}
      {qualificationReadiness && plan.qualification_target && plan.pacing_plan && (
        <QualificationCard
          readiness={qualificationReadiness}
          target={plan.qualification_target}
          qualificationPacing={plan.pacing_plan.qualificationPacing}
          competitive={plan.estimated_qualification_competitive}
        />
      )}

      {/* Plan sections */}
      <div ref={printRef} className="flex flex-col gap-6">
        {plan.pacing_plan && (
          <PacingCard pacing={plan.pacing_plan} useImperial={useImperial} />
        )}
        {plan.nutrition_plan && (
          <NutritionCard nutrition={plan.nutrition_plan} />
        )}
        {plan.equipment_plan && (
          <EquipmentCard
            equipment={plan.equipment_plan}
            checklistItems={checklistItems}
            onToggle={onToggleChecklist}
          />
        )}
        {plan.mindset_plan && (
          <MindsetCard mindset={plan.mindset_plan} />
        )}
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '--:--:--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{value}</p>
    </div>
  )
}
