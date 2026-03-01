import { z } from 'zod'

const sportEnum = z.enum(['swim', 'bike', 'run', 'brick'])
const sourceEnum = z.enum(['manual', 'garmin', 'file_upload', 'strava'])

export const WorkoutCreateSchema = z.object({
  sport: sportEnum,
  title: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duration_seconds: z.number().int().positive().nullable().optional(),
  distance_meters: z.number().positive().nullable().optional(),
  // Swim
  pool_length_meters: z.number().positive().nullable().optional(),
  swolf: z.number().positive().nullable().optional(),
  // Bike
  avg_power_watts: z.number().positive().nullable().optional(),
  normalized_power: z.number().positive().nullable().optional(),
  avg_cadence_rpm: z.number().int().min(0).max(300).nullable().optional(),
  elevation_gain_meters: z.number().min(0).nullable().optional(),
  // Run
  avg_pace_sec_per_km: z.number().positive().nullable().optional(),
  avg_cadence_spm: z.number().int().min(0).max(300).nullable().optional(),
  // Universal
  avg_hr: z.number().int().min(30).max(250).nullable().optional(),
  max_hr: z.number().int().min(30).max(250).nullable().optional(),
  calories: z.number().int().min(0).nullable().optional(),
  rpe: z.number().min(1).max(10).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  blocks: z.array(z.object({
    label: z.string(),
    distance_meters: z.number().nullable().optional(),
    zone: z.union([z.number(), z.string()]).nullable().optional(),
    rpe: z.number().nullable().optional(),
    duration_minutes: z.number().nullable().optional(),
    notes: z.string().nullable().optional(),
  })).nullable().optional(),
  source: sourceEnum.optional().default('manual'),
  external_id: z.string().nullable().optional(),
  external_url: z.string().url().nullable().optional(),
  // New fields
  started_at: z.string().nullable().optional(),
  moving_time_seconds: z.number().int().positive().nullable().optional(),
  is_indoor: z.boolean().optional(),
  gear_id: z.string().uuid().nullable().optional(),
  weather_temp_c: z.number().nullable().optional(),
  weather_conditions: z.string().max(200).nullable().optional(),
  max_power_watts: z.number().positive().nullable().optional(),
  avg_speed_mps: z.number().positive().nullable().optional(),
  max_speed_mps: z.number().positive().nullable().optional(),
  max_cadence: z.number().min(0).nullable().optional(),
  total_descent_meters: z.number().min(0).nullable().optional(),
  tss: z.number().min(0).nullable().optional(),
  tss_source: z.enum(['device', 'power', 'pace', 'hr', 'rpe']).nullable().optional(),
})

export const WorkoutUpdateSchema = WorkoutCreateSchema.partial().omit({ source: true, external_id: true })

export const WorkoutQuerySchema = z.object({
  sport: sportEnum.optional(),
  source: sourceEnum.optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
})

export const ProfileUpdateSchema = z.object({
  display_name: z.string().max(100).nullable().optional(),
  weight_kg: z.number().positive().max(500).nullable().optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  gender: z.enum(['male', 'female', 'non_binary']).nullable().optional(),
  unit_system: z.enum(['imperial', 'metric']).optional(),
  timezone: z.string().max(50).optional(),
  resting_heart_rate: z.number().int().min(25).max(120).nullable().optional(),
  max_heart_rate: z.number().int().min(100).max(250).nullable().optional(),
  ftp_watts: z.number().int().positive().nullable().optional(),
  threshold_pace_swim: z.number().positive().nullable().optional(),
  threshold_pace_run: z.number().positive().nullable().optional(),
  height_cm: z.number().min(50).max(300).nullable().optional(),
  sweat_rate_lph: z.number().positive().nullable().optional(),
  max_hr_source: z.enum(['none', 'manual', 'age_formula', 'workout_derived']).optional(),
  lthr_swim: z.number().int().min(80).max(220).nullable().optional(),
  lthr_bike: z.number().int().min(80).max(220).nullable().optional(),
  lthr_run: z.number().int().min(80).max(220).nullable().optional(),
})

export type WorkoutCreateInput = z.infer<typeof WorkoutCreateSchema>
export type WorkoutUpdateInput = z.infer<typeof WorkoutUpdateSchema>
export type WorkoutQueryInput = z.infer<typeof WorkoutQuerySchema>
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>
