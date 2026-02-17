'use client'

import { useState, useMemo, useCallback } from 'react'
import type {
  RaceDetailsInput,
  RaceCourse,
  CourseProfile,
  WaterType,
  WindCondition,
  CourseType,
  RaceSeries,
  RaceDistance,
} from '@/lib/types/race-plan'
import {
  DISTANCE_OPTIONS,
  AGE_GROUPER_GOALS,
  PRO_GOALS,
  RACE_SERIES_OPTIONS,
  AGE_GROUPS,
  isQualificationGoal,
} from '@/lib/types/race-plan'
import { getQualificationExplainer } from '@/lib/analytics/race-qualification'
import CourseSearchCombobox from './CourseSearchCombobox'

interface RaceDetailsFormProps {
  onSubmit: (details: RaceDetailsInput) => void
  generating: boolean
  courses: RaceCourse[]
  globalCourses: RaceCourse[]
  userCourses: RaceCourse[]
  onSaveCourse: (course: Omit<RaceCourse, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<RaceCourse>
}

const courseProfileOptions: { value: CourseProfile; label: string }[] = [
  { value: 'flat', label: 'Flat' },
  { value: 'rolling', label: 'Rolling' },
  { value: 'hilly', label: 'Hilly' },
  { value: 'mountainous', label: 'Mountainous' },
]

const waterOptions: { value: WaterType; label: string }[] = [
  { value: 'pool', label: 'Pool' },
  { value: 'lake', label: 'Lake' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'river', label: 'River' },
]

const windOptions: { value: WindCondition; label: string }[] = [
  { value: 'calm', label: 'Calm' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'strong', label: 'Strong' },
]

const courseTypeOptions: { value: CourseType; label: string }[] = [
  { value: 'loop', label: 'Loop' },
  { value: 'multi_loop', label: 'Multi-Loop' },
  { value: 'out_and_back', label: 'Out & Back' },
  { value: 'point_to_point', label: 'Point to Point' },
]

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-Binary' },
]

export default function RaceDetailsForm({
  onSubmit,
  generating,
  courses,
  globalCourses,
  userCourses,
  onSaveCourse,
}: RaceDetailsFormProps) {
  const [form, setForm] = useState<RaceDetailsInput>({
    race_name: '',
    race_date: '',
    race_series: 'ironman',
    athlete_classification: 'age_grouper',
    age_group: '',
    gender: '',
    race_distance: 'olympic',
    custom_swim_distance_m: '',
    custom_bike_distance_km: '',
    custom_run_distance_km: '',
    goal_type: 'finish',
    goal_time_seconds: '',
    temp_low_f: '',
    temp_high_f: '',
    humidity_pct: '',
    altitude_ft: '',
    course_profile: 'flat',
    water_temp_f: '',
    water_type: 'lake',
    wetsuit_legal: '',
    wind: 'calm',
    course_type: 'loop',
  })

  const [selectedCourse, setSelectedCourse] = useState<RaceCourse | null>(null)
  const [savingCourse, setSavingCourse] = useState(false)

  const update = (key: keyof RaceDetailsInput, value: string) =>
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // Reset goal when classification changes
      if (key === 'athlete_classification') {
        next.goal_type = value === 'professional' ? 'win_podium' : 'finish'
      }
      return next
    })

  const handleCourseSelect = useCallback((course: RaceCourse) => {
    setSelectedCourse(course)
    setForm((prev) => ({
      ...prev,
      race_name: course.name,
      race_series: course.race_series as RaceSeries,
      race_distance: course.race_distance as RaceDistance,
      course_profile: course.course_profile as CourseProfile,
      course_type: course.course_type as CourseType,
      water_type: course.water_type as WaterType,
      wind: course.typical_wind as WindCondition,
      temp_low_f: course.typical_temp_low_f != null ? String(course.typical_temp_low_f) : '',
      temp_high_f: course.typical_temp_high_f != null ? String(course.typical_temp_high_f) : '',
      humidity_pct: course.typical_humidity_pct != null ? String(course.typical_humidity_pct) : '',
      altitude_ft: course.altitude_ft != null ? String(course.altitude_ft) : '',
      water_temp_f: course.typical_water_temp_f != null ? String(course.typical_water_temp_f) : '',
      wetsuit_legal: course.wetsuit_legal == null ? '' : course.wetsuit_legal ? 'true' : 'false',
    }))
  }, [])

  const handleCourseClear = useCallback(() => {
    setSelectedCourse(null)
  }, [])

  const handleSaveAsCourse = useCallback(async () => {
    setSavingCourse(true)
    try {
      await onSaveCourse({
        name: form.race_name,
        location_city: '',
        location_country: '',
        race_series: form.race_series as RaceSeries,
        race_distance: form.race_distance as RaceDistance,
        swim_distance_m: form.custom_swim_distance_m ? Number(form.custom_swim_distance_m) : null,
        bike_distance_km: form.custom_bike_distance_km ? Number(form.custom_bike_distance_km) : null,
        run_distance_km: form.custom_run_distance_km ? Number(form.custom_run_distance_km) : null,
        course_profile: form.course_profile as CourseProfile,
        course_type: form.course_type as CourseType,
        water_type: form.water_type as WaterType,
        typical_water_temp_f: form.water_temp_f ? Number(form.water_temp_f) : null,
        typical_temp_low_f: form.temp_low_f ? Number(form.temp_low_f) : null,
        typical_temp_high_f: form.temp_high_f ? Number(form.temp_high_f) : null,
        typical_humidity_pct: form.humidity_pct ? Number(form.humidity_pct) : null,
        altitude_ft: form.altitude_ft ? Number(form.altitude_ft) : null,
        typical_wind: form.wind as WindCondition,
        wetsuit_legal: form.wetsuit_legal === '' ? null : form.wetsuit_legal === 'true',
        typical_race_month: null,
        notable_features: null,
        is_kona_qualifier: false,
        is_703_worlds_qualifier: false,
      })
    } catch (err) {
      console.error('Failed to save course:', err)
    } finally {
      setSavingCourse(false)
    }
  }, [form, onSaveCourse])

  const goalOptions = useMemo(() => {
    return form.athlete_classification === 'professional' ? PRO_GOALS : AGE_GROUPER_GOALS
  }, [form.athlete_classification])

  const qualExplainer = useMemo(() => {
    return getQualificationExplainer(form.goal_type)
  }, [form.goal_type])

  const needsAgeGroupGender = isQualificationGoal(form.goal_type)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'
  const labelClass =
    'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'
  const selectClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none'

  return (
    <form onSubmit={handleSubmit} className="card-squircle p-8">
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
        New Race Plan
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Search for a course to auto-fill conditions, or enter details manually.
      </p>

      <div className="flex flex-col gap-6">
        {/* Course search */}
        <div>
          <label className={labelClass}>Search Course Database</label>
          <CourseSearchCombobox
            globalCourses={globalCourses}
            userCourses={userCourses}
            selectedCourse={selectedCourse}
            onSelect={handleCourseSelect}
            onClear={handleCourseClear}
          />
        </div>

        {/* Race name & date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Race Name</label>
            <input
              type="text"
              value={form.race_name}
              onChange={(e) => update('race_name', e.target.value)}
              className={inputClass}
              placeholder="Ironman 70.3 Chattanooga"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Race Date</label>
            <input
              type="date"
              value={form.race_date}
              onChange={(e) => update('race_date', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Series & Classification */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Race Series / Sanctioning Body</label>
            <select
              value={form.race_series}
              onChange={(e) => update('race_series', e.target.value)}
              className={selectClass}
            >
              {RACE_SERIES_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Athlete Classification</label>
            <select
              value={form.athlete_classification}
              onChange={(e) => update('athlete_classification', e.target.value)}
              className={selectClass}
            >
              <option value="age_grouper">Age Grouper</option>
              <option value="professional">Professional</option>
            </select>
          </div>
        </div>

        {/* Distance & Goal */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Race Distance</label>
            <select
              value={form.race_distance}
              onChange={(e) => update('race_distance', e.target.value)}
              className={selectClass}
            >
              {DISTANCE_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Goal</label>
            <select
              value={form.goal_type}
              onChange={(e) => update('goal_type', e.target.value)}
              className={selectClass}
            >
              {goalOptions.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom distances */}
        {form.race_distance === 'custom' && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Swim (meters)</label>
              <input
                type="number"
                value={form.custom_swim_distance_m}
                onChange={(e) => update('custom_swim_distance_m', e.target.value)}
                className={inputClass}
                placeholder="1500"
              />
            </div>
            <div>
              <label className={labelClass}>Bike (km)</label>
              <input
                type="number"
                value={form.custom_bike_distance_km}
                onChange={(e) => update('custom_bike_distance_km', e.target.value)}
                className={inputClass}
                placeholder="40"
              />
            </div>
            <div>
              <label className={labelClass}>Run (km)</label>
              <input
                type="number"
                value={form.custom_run_distance_km}
                onChange={(e) => update('custom_run_distance_km', e.target.value)}
                className={inputClass}
                placeholder="10"
              />
            </div>
          </div>
        )}

        {/* Qualification context: gender & age group */}
        {needsAgeGroupGender && (
          <div className="rounded-2xl p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3">
              Qualification Details
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => update('gender', e.target.value)}
                  className={selectClass}
                  required
                >
                  <option value="">Select gender</option>
                  {genderOptions.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Age Group</label>
                <select
                  value={form.age_group}
                  onChange={(e) => update('age_group', e.target.value)}
                  className={selectClass}
                  required
                >
                  <option value="">Select age group</option>
                  {AGE_GROUPS.map((ag) => (
                    <option key={ag} value={ag}>
                      {ag}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {qualExplainer && (
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                {qualExplainer}
              </p>
            )}
          </div>
        )}

        {/* Target time */}
        <div className="max-w-xs">
          <label className={labelClass}>Target Finish Time (optional, in minutes)</label>
          <input
            type="number"
            value={form.goal_time_seconds}
            onChange={(e) => update('goal_time_seconds', e.target.value)}
            className={inputClass}
            placeholder="300"
          />
        </div>

        {/* Conditions */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
            Expected Conditions
          </p>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className={labelClass}>Temp Low (°F)</label>
              <input
                type="number"
                value={form.temp_low_f}
                onChange={(e) => update('temp_low_f', e.target.value)}
                className={inputClass}
                placeholder="65"
              />
            </div>
            <div>
              <label className={labelClass}>Temp High (°F)</label>
              <input
                type="number"
                value={form.temp_high_f}
                onChange={(e) => update('temp_high_f', e.target.value)}
                className={inputClass}
                placeholder="85"
              />
            </div>
            <div>
              <label className={labelClass}>Humidity (%)</label>
              <input
                type="number"
                value={form.humidity_pct}
                onChange={(e) => update('humidity_pct', e.target.value)}
                className={inputClass}
                placeholder="60"
              />
            </div>
            <div>
              <label className={labelClass}>Altitude (ft)</label>
              <input
                type="number"
                value={form.altitude_ft}
                onChange={(e) => update('altitude_ft', e.target.value)}
                className={inputClass}
                placeholder="500"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className={labelClass}>Water Temp (°F)</label>
              <input
                type="number"
                value={form.water_temp_f}
                onChange={(e) => update('water_temp_f', e.target.value)}
                className={inputClass}
                placeholder="72"
              />
            </div>
            <div>
              <label className={labelClass}>Water Type</label>
              <select
                value={form.water_type}
                onChange={(e) => update('water_type', e.target.value)}
                className={selectClass}
              >
                {waterOptions.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Wetsuit Legal</label>
              <select
                value={form.wetsuit_legal}
                onChange={(e) => update('wetsuit_legal', e.target.value)}
                className={selectClass}
              >
                <option value="">Unknown</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Wind</label>
              <select
                value={form.wind}
                onChange={(e) => update('wind', e.target.value)}
                className={selectClass}
              >
                {windOptions.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Course Profile</label>
              <select
                value={form.course_profile}
                onChange={(e) => update('course_profile', e.target.value)}
                className={selectClass}
              >
                {courseProfileOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Course Type</label>
              <select
                value={form.course_type}
                onChange={(e) => update('course_type', e.target.value)}
                className={selectClass}
              >
                {courseTypeOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save as custom course */}
        {!selectedCourse && form.race_name && (
          <button
            type="button"
            onClick={handleSaveAsCourse}
            disabled={savingCourse}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors cursor-pointer disabled:opacity-50 text-left"
          >
            {savingCourse ? 'Saving...' : 'Save as Custom Course'}
          </button>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={generating || !form.race_name}
          className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {generating ? 'Generating Plan...' : 'Generate Race Plan'}
        </button>
      </div>
    </form>
  )
}
