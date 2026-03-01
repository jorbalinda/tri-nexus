'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Utensils, Zap, Droplets, FlaskConical, Plus, Trash2 } from 'lucide-react'
import { useNutritionPlan } from '@/hooks/useNutritionPlan'
import { createClient } from '@/lib/supabase/client'
import { calculateNutrition, generateFuelingTimeline } from '@/lib/nutrition/calculator'
import type { TargetRace } from '@/lib/types/target-race'
import type { Profile } from '@/lib/types/database'

const INPUT_CLASS = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'
const LABEL_CLASS = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

const SEGMENT_DURATIONS: Record<string, { bike: number; run: number }> = {
  sprint: { bike: 36, run: 21 },
  olympic: { bike: 72, run: 45 },
  '70.3': { bike: 168, run: 108 },
  '140.6': { bike: 330, run: 240 },
  custom: { bike: 120, run: 90 },
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export default function NutritionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { plans, timeline, loading, savePlan, addTimelineEntry, removeTimelineEntry, refetch } = useNutritionPlan(id)
  const supabaseRef = useRef(createClient())

  const [race, setRace] = useState<TargetRace | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: raceData } = await supabaseRef.current
        .from('target_races')
        .select('*')
        .eq('id', id)
        .single()
      setRace(raceData as TargetRace | null)

      const { data: { user } } = await supabaseRef.current.auth.getUser()
      if (user) {
        const { data: profileData } = await supabaseRef.current
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData as Profile | null)
      }
    }
    load()
  }, [id])

  const handleGenerate = async () => {
    if (!race || !profile?.weight_kg) return
    setGenerating(true)

    try {
      const nutrition = calculateNutrition({
        weight_kg: profile.weight_kg,
        race_distance: race.race_distance,
        sweat_rate_lph: profile.sweat_rate_lph,
        expected_temp_f: race.expected_temp_f,
      })

      // Save bike plan
      const bikePlan = await savePlan('bike', {
        carbs_per_hour_g: nutrition.bike.carbs_per_hour_g,
        sodium_per_hour_mg: nutrition.bike.sodium_per_hour_mg,
        fluid_per_hour_oz: nutrition.bike.fluid_per_hour_oz,
      })

      // Save run plan
      const runPlan = await savePlan('run', {
        carbs_per_hour_g: nutrition.run.carbs_per_hour_g,
        sodium_per_hour_mg: nutrition.run.sodium_per_hour_mg,
        fluid_per_hour_oz: nutrition.run.fluid_per_hour_oz,
      })

      // Generate fueling timeline entries
      const durations = SEGMENT_DURATIONS[race.race_distance] || SEGMENT_DURATIONS.custom

      // Clear existing timeline entries first
      for (const entry of timeline) {
        await removeTimelineEntry(entry.id)
      }

      const bikeTimeline = generateFuelingTimeline('bike', nutrition.bike, durations.bike)
      for (const entry of bikeTimeline) {
        await addTimelineEntry(bikePlan.id, entry)
      }

      const runTimeline = generateFuelingTimeline('run', nutrition.run, durations.run)
      for (const entry of runTimeline) {
        await addTimelineEntry(runPlan.id, entry)
      }

      await refetch()
    } finally {
      setGenerating(false)
    }
  }

  const bikePlan = plans.find((p) => p.segment === 'bike')
  const runPlan = plans.find((p) => p.segment === 'run')
  const bikeTimeline = timeline.filter((t) => bikePlan && t.nutrition_plan_id === bikePlan.id)
  const runTimeline = timeline.filter((t) => runPlan && t.nutrition_plan_id === runPlan.id)

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        {[1, 2].map((i) => (
          <div key={i} className="card-squircle p-6 h-32 animate-pulse bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/dashboard/races/${id}`)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
            Nutrition
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Race Nutrition Plan
          </h1>
        </div>
      </div>

      {/* Generate button */}
      {plans.length === 0 && (
        <div className="card-squircle p-8 text-center">
          <Utensils size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No nutrition plan yet.</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
            {profile?.weight_kg
              ? 'Generate a plan based on your weight, race distance, and conditions.'
              : 'Add your weight in your profile first to generate a nutrition plan.'}
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating || !profile?.weight_kg}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Zap size={16} />
            {generating ? 'Generating...' : 'Generate Nutrition Plan'}
          </button>
        </div>
      )}

      {/* Bike nutrition */}
      {bikePlan && (
        <div className="card-squircle p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bike Nutrition</h2>
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-orange-500">Per Hour</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-center">
              <Zap size={18} className="text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{bikePlan.carbs_per_hour_g}g</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Carbs</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-center">
              <Droplets size={18} className="text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{bikePlan.fluid_per_hour_oz} oz</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Fluid</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-center">
              <FlaskConical size={18} className="text-purple-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{bikePlan.sodium_per_hour_mg} mg</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Sodium</p>
            </div>
          </div>

          {bikeTimeline.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
                Fueling Timeline
              </p>
              <div className="flex flex-col gap-2">
                {bikeTimeline.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 min-w-[60px]">
                      {formatMinutes(entry.time_offset_minutes)}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{entry.instruction}</span>
                    <button
                      onClick={() => removeTimelineEntry(entry.id)}
                      className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} className="text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Run nutrition */}
      {runPlan && (
        <div className="card-squircle p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Run Nutrition</h2>
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-green-500">Per Hour</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-center">
              <Zap size={18} className="text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{runPlan.carbs_per_hour_g}g</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Carbs</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-center">
              <Droplets size={18} className="text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{runPlan.fluid_per_hour_oz} oz</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Fluid</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-center">
              <FlaskConical size={18} className="text-purple-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{runPlan.sodium_per_hour_mg} mg</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Sodium</p>
            </div>
          </div>

          {runTimeline.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
                Fueling Timeline
              </p>
              <div className="flex flex-col gap-2">
                {runTimeline.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs font-mono font-semibold text-green-600 dark:text-green-400 min-w-[60px]">
                      {formatMinutes(entry.time_offset_minutes)}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{entry.instruction}</span>
                    <button
                      onClick={() => removeTimelineEntry(entry.id)}
                      className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} className="text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Regenerate */}
      {plans.length > 0 && (
        <button
          onClick={handleGenerate}
          disabled={generating || !profile?.weight_kg}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
        >
          <Zap size={16} />
          {generating ? 'Regenerating...' : 'Regenerate Plan'}
        </button>
      )}
    </div>
  )
}
