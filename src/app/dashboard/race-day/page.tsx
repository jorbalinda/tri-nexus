'use client'

import { useState, useCallback, useMemo } from 'react'
import RaceDetailsForm from '@/components/race-day/RaceDetailsForm'
import RacePlanList from '@/components/race-day/RacePlanList'
import RacePlanView from '@/components/race-day/RacePlanView'
import { useRacePlans } from '@/hooks/useRacePlans'
import { useRacePlanChecklist } from '@/hooks/useRacePlanChecklist'
import { useQualificationStandards } from '@/hooks/useQualificationStandards'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useManualLogs } from '@/hooks/useManualLogs'
import { useUnits } from '@/hooks/useUnits'
import { useRaceCourses } from '@/hooks/useRaceCourses'
import { generateFullRacePlan } from '@/lib/analytics/race-plan-generator'
import { assessQualificationReadiness } from '@/lib/analytics/race-qualification'
import { isQualificationGoal } from '@/lib/types/race-plan'
import type {
  RacePlan,
  RaceDetailsInput,
  RaceConditions,
  GoalType,
  AthleteClassification,
  QualificationReadiness,
  CourseProfile,
  WaterType,
  WindCondition,
  CourseType,
  RaceSeries,
} from '@/lib/types/race-plan'

export default function RaceDayPage() {
  const { plans, loading: plansLoading, create, update, remove } = useRacePlans()
  const { standards } = useQualificationStandards()
  const { workouts } = useWorkouts()
  const { logs } = useManualLogs()
  const { speedUnit } = useUnits()
  const useImperial = speedUnit === 'miles'
  const { courses, globalCourses, userCourses, createUserCourse } = useRaceCourses()
  const [selectedPlan, setSelectedPlan] = useState<RacePlan | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { items: checklistItems, initializeChecklist, toggle: toggleChecklist } =
    useRacePlanChecklist(selectedPlan?.id ?? null)

  // Compute qualification readiness for the selected plan
  const qualificationReadiness: QualificationReadiness | null = useMemo(() => {
    if (!selectedPlan) return null
    if (!isQualificationGoal(selectedPlan.goal_type)) return null
    if (!selectedPlan.estimated_finish_seconds || !selectedPlan.fitness_snapshot) return null

    // Find standard from stored qualification_target
    const standard = selectedPlan.qualification_target
      ? {
          id: '',
          championship: selectedPlan.qualification_target.championship,
          qualifying_year: selectedPlan.qualification_target.ag_standard_source_year,
          gender: (selectedPlan.gender || 'male') as 'male' | 'female',
          age_group: (selectedPlan.age_group || '30-34') as typeof import('@/lib/types/race-plan').AGE_GROUPS[number],
          standard_multiplier: selectedPlan.qualification_target.standard_multiplier,
          benchmark_time_seconds: null,
          estimated_cutoff_seconds: selectedPlan.qualification_target.estimated_qualifying_time,
          source_note: null,
        }
      : null

    return assessQualificationReadiness(
      selectedPlan.estimated_finish_seconds,
      standard,
      selectedPlan.fitness_snapshot
    )
  }, [selectedPlan])

  const handleGenerate = useCallback(
    async (details: RaceDetailsInput) => {
      setGenerating(true)
      setError(null)
      try {
        const hasConditions =
          details.temp_low_f || details.temp_high_f || details.humidity_pct || details.altitude_ft || details.water_temp_f

        const conditions: RaceConditions | null = hasConditions
          ? {
              temp_low_f: details.temp_low_f ? Number(details.temp_low_f) : null,
              temp_high_f: details.temp_high_f ? Number(details.temp_high_f) : null,
              humidity_pct: details.humidity_pct ? Number(details.humidity_pct) : null,
              altitude_ft: details.altitude_ft ? Number(details.altitude_ft) : null,
              course_profile: details.course_profile as CourseProfile,
              water_temp_f: details.water_temp_f ? Number(details.water_temp_f) : null,
              water_type: details.water_type as WaterType,
              wetsuit_legal: details.wetsuit_legal === '' ? null : details.wetsuit_legal === 'true',
              wind: details.wind as WindCondition,
              course_type: details.course_type as CourseType,
            }
          : null

        const customDistances =
          details.race_distance === 'custom'
            ? {
                swim: details.custom_swim_distance_m ? Number(details.custom_swim_distance_m) : null,
                bike: details.custom_bike_distance_km ? Number(details.custom_bike_distance_km) : null,
                run: details.custom_run_distance_km ? Number(details.custom_run_distance_km) : null,
              }
            : undefined

        const generated = generateFullRacePlan(
          workouts,
          logs,
          details.race_distance,
          details.goal_type as GoalType,
          details.race_name,
          conditions,
          details.athlete_classification as AthleteClassification,
          standards,
          details.gender || null,
          details.age_group || null,
          customDistances
        )

        const saved = await create({
          race_name: details.race_name,
          race_date: details.race_date || null,
          race_series: details.race_series as RaceSeries,
          athlete_classification: details.athlete_classification as AthleteClassification,
          age_group: (details.age_group || null) as RacePlan['age_group'],
          gender: (details.gender || null) as RacePlan['gender'],
          race_distance: details.race_distance,
          custom_swim_distance_m: details.custom_swim_distance_m ? Number(details.custom_swim_distance_m) : null,
          custom_bike_distance_km: details.custom_bike_distance_km ? Number(details.custom_bike_distance_km) : null,
          custom_run_distance_km: details.custom_run_distance_km ? Number(details.custom_run_distance_km) : null,
          goal_type: details.goal_type as GoalType,
          goal_time_seconds: details.goal_time_seconds ? Number(details.goal_time_seconds) * 60 : null,
          qualification_target: generated.qualification_target,
          conditions,
          pacing_plan: generated.pacing_plan,
          nutrition_plan: generated.nutrition_plan,
          equipment_plan: generated.equipment_plan,
          mindset_plan: generated.mindset_plan,
          fitness_snapshot: generated.fitness_snapshot,
          estimated_finish_seconds: generated.estimated_finish_seconds,
          estimated_finish_optimistic: generated.estimated_finish_optimistic,
          estimated_finish_conservative: generated.estimated_finish_conservative,
          estimated_qualification_competitive: generated.estimated_qualification_competitive,
        })

        setSelectedPlan(saved)
        setShowForm(false)
      } catch (err) {
        console.error('Failed to generate race plan:', err)
        setError(err instanceof Error ? err.message : 'Failed to generate race plan. Check the browser console for details.')
      } finally {
        setGenerating(false)
      }
    },
    [workouts, logs, standards, create]
  )

  const handleRegenerate = useCallback(async () => {
    if (!selectedPlan) return
    setGenerating(true)
    try {
      const conditions = selectedPlan.conditions
      const customDistances =
        selectedPlan.race_distance === 'custom'
          ? {
              swim: selectedPlan.custom_swim_distance_m,
              bike: selectedPlan.custom_bike_distance_km,
              run: selectedPlan.custom_run_distance_km,
            }
          : undefined

      const generated = generateFullRacePlan(
        workouts,
        logs,
        selectedPlan.race_distance,
        selectedPlan.goal_type,
        selectedPlan.race_name,
        conditions,
        selectedPlan.athlete_classification,
        standards,
        selectedPlan.gender,
        selectedPlan.age_group,
        customDistances
      )

      const updated = await update(selectedPlan.id, {
        pacing_plan: generated.pacing_plan,
        nutrition_plan: generated.nutrition_plan,
        equipment_plan: generated.equipment_plan,
        mindset_plan: generated.mindset_plan,
        fitness_snapshot: generated.fitness_snapshot,
        estimated_finish_seconds: generated.estimated_finish_seconds,
        estimated_finish_optimistic: generated.estimated_finish_optimistic,
        estimated_finish_conservative: generated.estimated_finish_conservative,
        qualification_target: generated.qualification_target,
        estimated_qualification_competitive: generated.estimated_qualification_competitive,
      })

      setSelectedPlan(updated)
    } catch (err) {
      console.error('Failed to regenerate race plan:', err)
    } finally {
      setGenerating(false)
    }
  }, [selectedPlan, workouts, logs, standards, update])

  const handleDelete = useCallback(async () => {
    if (!selectedPlan) return
    await remove(selectedPlan.id)
    setSelectedPlan(null)
  }, [selectedPlan, remove])

  // Loading state
  if (plansLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading race plans...</p>
      </div>
    )
  }

  // Viewing a specific plan
  if (selectedPlan) {
    return (
      <RacePlanView
        plan={selectedPlan}
        checklistItems={checklistItems}
        onToggleChecklist={toggleChecklist}
        onBack={() => setSelectedPlan(null)}
        onRegenerate={handleRegenerate}
        onDelete={handleDelete}
        regenerating={generating}
        useImperial={useImperial}
        qualificationReadiness={qualificationReadiness}
      />
    )
  }

  // Main dashboard
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
          Race Day
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Race Day Intelligence
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Generate a personalized race plan from your training data across pacing, nutrition, equipment, and mindset.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* New plan form toggle */}
      {showForm ? (
        <div className="flex flex-col gap-4">
          <RaceDetailsForm
            onSubmit={handleGenerate}
            generating={generating}
            courses={courses}
            globalCourses={globalCourses}
            userCourses={userCourses}
            onSaveCourse={createUserCourse}
          />
          <button
            onClick={() => setShowForm(false)}
            className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="card-squircle p-6 text-center hover:shadow-lg transition-all cursor-pointer border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
        >
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            + Create New Race Plan
          </p>
        </button>
      )}

      {/* Saved plans list */}
      <RacePlanList plans={plans} onSelect={setSelectedPlan} />
    </div>
  )
}
