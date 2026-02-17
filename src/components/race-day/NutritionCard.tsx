'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { NutritionPlan } from '@/lib/types/race-plan'

interface NutritionCardProps {
  nutrition: NutritionPlan
}

export default function NutritionCard({ nutrition }: NutritionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { preRace, raceMorning, swim, bike, run, summary } = nutrition

  return (
    <div className="card-squircle p-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
            Nutrition Plan
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {summary.totalCarbsGrams}g carbs &middot; {summary.totalCalories} cal
          </p>
        </div>
        {expanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="mt-6 flex flex-col gap-6">
          {/* Calorie summary */}
          <div className="grid grid-cols-3 gap-4">
            <SummaryBox label="Total Race" carbs={summary.totalCarbsGrams} cals={summary.totalCalories} color="blue" />
            <SummaryBox label="Bike Segment" carbs={summary.bikeCarbsGrams} cals={summary.bikeCalories} color="orange" />
            <SummaryBox label="Run Segment" carbs={summary.runCarbsGrams} cals={summary.runCalories} color="green" />
          </div>

          {/* Pre-Race */}
          <TimingSection title="24-48 Hours Before" color="purple">
            <Row label="Carb Loading" value={preRace.carbLoadingTarget} />
            <Row label="Hydration" value={preRace.hydrationTarget} />
            <Row label="Last Big Meal" value={preRace.lastBigMeal} />
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Foods to Avoid</p>
              <ul className="text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
                {preRace.foodsToAvoid.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>
          </TimingSection>

          {/* Race Morning */}
          <TimingSection title="Race Morning (2-3 hrs before)" color="blue">
            <Row label="Meal" value={raceMorning.mealTarget} />
            <Row label="Caffeine" value={raceMorning.caffeine} />
            <Row label="Hydration" value={raceMorning.hydration} />
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Example Meals</p>
              <ul className="text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
                {raceMorning.exampleMeals.map((m, i) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            </div>
          </TimingSection>

          {/* Swim */}
          <TimingSection title="During Swim" color="blue">
            <p className="text-xs text-gray-500 dark:text-gray-400">{swim}</p>
          </TimingSection>

          {/* Bike */}
          <TimingSection title="During Bike" color="orange">
            <Row label="Carbs" value={bike.carbsPerHour} />
            <Row label="Hydration" value={bike.hydrationPerHour} />
            <Row label="Electrolytes" value={bike.electrolytesPerHour} />
            <Row label="Timing" value={bike.timing} />
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Products</p>
              <ul className="text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
                {bike.productSuggestions.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            </div>
            <Note text={bike.notes} />
          </TimingSection>

          {/* Run */}
          <TimingSection title="During Run" color="green">
            <Row label="Carbs" value={run.carbsPerHour} />
            <Row label="Hydration" value={run.hydrationPerHour} />
            <Row label="Electrolytes" value={run.electrolytesPerHour} />
            <Row label="Timing" value={run.timing} />
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Products</p>
              <ul className="text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
                {run.productSuggestions.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            </div>
            <Note text={run.notes} />
          </TimingSection>
        </div>
      )}
    </div>
  )
}

function SummaryBox({
  label,
  carbs,
  cals,
  color,
}: {
  label: string
  carbs: number
  cals: number
  color: string
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30',
    orange: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/30',
    green: 'bg-green-50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30',
  }
  const textMap: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400',
    orange: 'text-orange-600 dark:text-orange-400',
    green: 'text-green-600 dark:text-green-400',
  }
  return (
    <div className={`rounded-2xl p-4 border ${colorMap[color]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${textMap[color]}`}>{carbs}g</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{cals} calories</p>
    </div>
  )
}

function TimingSection({
  title,
  color,
  children,
}: {
  title: string
  color: string
  children: React.ReactNode
}) {
  const colorMap: Record<string, string> = {
    blue: 'border-l-blue-500',
    orange: 'border-l-orange-500',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
  }
  return (
    <div className={`border-l-4 ${colorMap[color] || 'border-l-gray-300'} pl-4`}>
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-right max-w-[60%]">{value}</span>
    </div>
  )
}

function Note({ text }: { text: string }) {
  if (!text) return null
  return <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">{text}</p>
}
