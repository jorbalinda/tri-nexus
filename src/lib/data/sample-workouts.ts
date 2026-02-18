// 12 weeks of realistic triathlon training data for new users to explore features
// Used when users have <5 workouts and toggle "Show sample data"

import type { Workout } from '@/lib/types/database'

function dateOffset(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

let id = 0
function sid(): string {
  return `sample-${++id}`
}

function workout(
  sport: 'swim' | 'bike' | 'run' | 'brick',
  title: string,
  daysAgo: number,
  overrides: Partial<Workout> = {}
): Workout {
  return {
    id: sid(),
    user_id: 'sample',
    sport,
    title,
    date: dateOffset(daysAgo),
    duration_seconds: null,
    distance_meters: null,
    pool_length_meters: null,
    stroke_type: null,
    swolf: null,
    avg_power_watts: null,
    normalized_power: null,
    tss: null,
    avg_cadence_rpm: null,
    elevation_gain_meters: null,
    avg_pace_sec_per_km: null,
    avg_cadence_spm: null,
    avg_hr: null,
    max_hr: null,
    calories: null,
    rpe: null,
    notes: null,
    blocks: null,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function generateSampleWorkouts(): Workout[] {
  return [
    // Week 1 (most recent)
    workout('swim', 'Morning Swim — Intervals', 1, {
      duration_seconds: 3600, distance_meters: 3000, avg_hr: 142, max_hr: 168, rpe: 6,
      calories: 480, pool_length_meters: 25, swolf: 32,
    }),
    workout('run', 'Easy Recovery Run', 1, {
      duration_seconds: 2400, distance_meters: 5000, avg_hr: 132, max_hr: 148, rpe: 3,
      calories: 320, avg_pace_sec_per_km: 288, avg_cadence_spm: 172,
    }),
    workout('bike', 'Tempo Intervals', 2, {
      duration_seconds: 4200, distance_meters: 35000, avg_hr: 155, max_hr: 172, rpe: 7,
      calories: 720, avg_power_watts: 215, normalized_power: 228, tss: 85, avg_cadence_rpm: 88, elevation_gain_meters: 320,
    }),
    workout('run', 'Threshold Run', 3, {
      duration_seconds: 3000, distance_meters: 8000, avg_hr: 162, max_hr: 178, rpe: 7,
      calories: 520, avg_pace_sec_per_km: 285, avg_cadence_spm: 178,
    }),
    workout('swim', 'CSS Test Set', 4, {
      duration_seconds: 3000, distance_meters: 2500, avg_hr: 148, max_hr: 172, rpe: 7,
      calories: 420, pool_length_meters: 25, swolf: 30,
    }),
    workout('bike', 'Long Ride', 5, {
      duration_seconds: 10800, distance_meters: 90000, avg_hr: 138, max_hr: 162, rpe: 5,
      calories: 1850, avg_power_watts: 185, normalized_power: 195, tss: 180, avg_cadence_rpm: 85, elevation_gain_meters: 780,
    }),
    workout('run', 'Long Run', 6, {
      duration_seconds: 5400, distance_meters: 15000, avg_hr: 145, max_hr: 165, rpe: 6,
      calories: 980, avg_pace_sec_per_km: 324, avg_cadence_spm: 174,
    }),

    // Week 2
    workout('swim', 'Drill & Build', 8, {
      duration_seconds: 3600, distance_meters: 2800, avg_hr: 138, max_hr: 158, rpe: 5,
      calories: 440, pool_length_meters: 25, swolf: 33,
    }),
    workout('bike', 'Sweet Spot', 9, {
      duration_seconds: 5400, distance_meters: 42000, avg_hr: 150, max_hr: 168, rpe: 6,
      calories: 880, avg_power_watts: 200, normalized_power: 212, tss: 95, avg_cadence_rpm: 87, elevation_gain_meters: 420,
    }),
    workout('run', 'Fartlek Run', 10, {
      duration_seconds: 3000, distance_meters: 7500, avg_hr: 155, max_hr: 175, rpe: 7,
      calories: 490, avg_pace_sec_per_km: 300, avg_cadence_spm: 180,
    }),
    workout('brick', 'Bike-Run Brick', 11, {
      duration_seconds: 7200, distance_meters: 55000, avg_hr: 148, max_hr: 170, rpe: 7,
      calories: 1200, avg_power_watts: 195, normalized_power: 208, tss: 120, avg_cadence_rpm: 86, elevation_gain_meters: 380,
    }),
    workout('swim', 'Open Water Sim', 12, {
      duration_seconds: 2700, distance_meters: 2000, avg_hr: 145, max_hr: 165, rpe: 6,
      calories: 380, swolf: 34,
    }),
    workout('run', 'Easy Run', 13, {
      duration_seconds: 2400, distance_meters: 6000, avg_hr: 128, max_hr: 142, rpe: 3,
      calories: 340, avg_pace_sec_per_km: 300, avg_cadence_spm: 170,
    }),

    // Week 3
    workout('bike', 'Hill Repeats', 15, {
      duration_seconds: 4800, distance_meters: 38000, avg_hr: 158, max_hr: 178, rpe: 8,
      calories: 820, avg_power_watts: 225, normalized_power: 248, tss: 110, avg_cadence_rpm: 82, elevation_gain_meters: 650,
    }),
    workout('swim', 'Lactate Set', 16, {
      duration_seconds: 3000, distance_meters: 2600, avg_hr: 152, max_hr: 174, rpe: 8,
      calories: 450, pool_length_meters: 25, swolf: 29,
    }),
    workout('run', 'Tempo Run', 17, {
      duration_seconds: 3600, distance_meters: 10000, avg_hr: 158, max_hr: 172, rpe: 7,
      calories: 620, avg_pace_sec_per_km: 270, avg_cadence_spm: 178,
    }),
    workout('bike', 'Recovery Spin', 18, {
      duration_seconds: 2700, distance_meters: 22000, avg_hr: 118, max_hr: 132, rpe: 2,
      calories: 380, avg_power_watts: 140, normalized_power: 148, tss: 30, avg_cadence_rpm: 92, elevation_gain_meters: 80,
    }),
    workout('run', 'Long Run', 19, {
      duration_seconds: 6000, distance_meters: 16000, avg_hr: 142, max_hr: 162, rpe: 6,
      calories: 1050, avg_pace_sec_per_km: 330, avg_cadence_spm: 172,
    }),
    workout('swim', 'Endurance Swim', 20, {
      duration_seconds: 4200, distance_meters: 3500, avg_hr: 135, max_hr: 155, rpe: 5,
      calories: 550, pool_length_meters: 25, swolf: 32,
    }),

    // Week 4
    workout('bike', 'Long Ride — Race Pace', 22, {
      duration_seconds: 12600, distance_meters: 100000, avg_hr: 142, max_hr: 165, rpe: 6,
      calories: 2100, avg_power_watts: 190, normalized_power: 202, tss: 200, avg_cadence_rpm: 86, elevation_gain_meters: 920,
    }),
    workout('swim', 'Speed Work', 23, {
      duration_seconds: 2700, distance_meters: 2200, avg_hr: 155, max_hr: 178, rpe: 8,
      calories: 400, pool_length_meters: 25, swolf: 28,
    }),
    workout('run', 'VO2max Intervals', 24, {
      duration_seconds: 3000, distance_meters: 8000, avg_hr: 168, max_hr: 185, rpe: 9,
      calories: 560, avg_pace_sec_per_km: 255, avg_cadence_spm: 184,
    }),
    workout('bike', 'Endurance Ride', 25, {
      duration_seconds: 7200, distance_meters: 60000, avg_hr: 135, max_hr: 152, rpe: 4,
      calories: 1150, avg_power_watts: 175, normalized_power: 182, tss: 110, avg_cadence_rpm: 88, elevation_gain_meters: 480,
    }),
    workout('run', 'Recovery Jog', 26, {
      duration_seconds: 1800, distance_meters: 4000, avg_hr: 125, max_hr: 138, rpe: 2,
      calories: 240, avg_pace_sec_per_km: 330, avg_cadence_spm: 168,
    }),

    // Week 5
    workout('swim', 'Race Pace Set', 29, {
      duration_seconds: 3000, distance_meters: 2500, avg_hr: 150, max_hr: 170, rpe: 7,
      calories: 420, pool_length_meters: 25, swolf: 30,
    }),
    workout('bike', 'Threshold Intervals', 30, {
      duration_seconds: 5400, distance_meters: 45000, avg_hr: 158, max_hr: 175, rpe: 8,
      calories: 950, avg_power_watts: 220, normalized_power: 238, tss: 130, avg_cadence_rpm: 86, elevation_gain_meters: 520,
    }),
    workout('run', 'Progressive Run', 31, {
      duration_seconds: 3600, distance_meters: 10000, avg_hr: 152, max_hr: 170, rpe: 7,
      calories: 650, avg_pace_sec_per_km: 276, avg_cadence_spm: 178,
    }),
    workout('brick', 'Race Simulation', 32, {
      duration_seconds: 9000, distance_meters: 70000, avg_hr: 148, max_hr: 172, rpe: 7,
      calories: 1500, avg_power_watts: 195, normalized_power: 210, tss: 160, avg_cadence_rpm: 86, elevation_gain_meters: 520,
    }),
    workout('swim', 'Technique Focus', 33, {
      duration_seconds: 2400, distance_meters: 1800, avg_hr: 128, max_hr: 145, rpe: 3,
      calories: 280, pool_length_meters: 25, swolf: 34,
    }),
    workout('run', 'Long Run', 34, {
      duration_seconds: 6600, distance_meters: 18000, avg_hr: 144, max_hr: 163, rpe: 6,
      calories: 1120, avg_pace_sec_per_km: 318, avg_cadence_spm: 174,
    }),

    // Week 6
    workout('bike', 'Sweet Spot', 36, {
      duration_seconds: 5400, distance_meters: 44000, avg_hr: 152, max_hr: 170, rpe: 6,
      calories: 900, avg_power_watts: 205, normalized_power: 218, tss: 100, avg_cadence_rpm: 88, elevation_gain_meters: 400,
    }),
    workout('swim', 'Pull + Kick Set', 37, {
      duration_seconds: 3600, distance_meters: 3000, avg_hr: 140, max_hr: 160, rpe: 5,
      calories: 460, pool_length_meters: 25, swolf: 31,
    }),
    workout('run', 'Hill Repeats', 38, {
      duration_seconds: 3600, distance_meters: 9000, avg_hr: 162, max_hr: 182, rpe: 8,
      calories: 600, avg_pace_sec_per_km: 288, avg_cadence_spm: 176,
    }),
    workout('bike', 'Recovery', 39, {
      duration_seconds: 2400, distance_meters: 20000, avg_hr: 115, max_hr: 128, rpe: 2,
      calories: 320, avg_power_watts: 135, normalized_power: 142, tss: 25, avg_cadence_rpm: 90, elevation_gain_meters: 60,
    }),
    workout('run', 'Tempo', 40, {
      duration_seconds: 2700, distance_meters: 7500, avg_hr: 156, max_hr: 168, rpe: 7,
      calories: 480, avg_pace_sec_per_km: 276, avg_cadence_spm: 180,
    }),

    // Weeks 7-12 (abbreviated — enough data for 12 weeks of charts)
    workout('bike', 'Long Ride', 43, {
      duration_seconds: 10800, distance_meters: 85000, avg_hr: 140, max_hr: 160, rpe: 5,
      calories: 1750, avg_power_watts: 182, normalized_power: 192, tss: 170, avg_cadence_rpm: 85, elevation_gain_meters: 700,
    }),
    workout('swim', 'Endurance', 44, {
      duration_seconds: 3600, distance_meters: 3200, avg_hr: 138, max_hr: 155, rpe: 5,
      calories: 480, pool_length_meters: 25, swolf: 32,
    }),
    workout('run', 'Long Run', 47, {
      duration_seconds: 5400, distance_meters: 14000, avg_hr: 146, max_hr: 165, rpe: 6,
      calories: 920, avg_pace_sec_per_km: 330, avg_cadence_spm: 172,
    }),
    workout('bike', 'Intervals', 50, {
      duration_seconds: 4800, distance_meters: 38000, avg_hr: 155, max_hr: 175, rpe: 7,
      calories: 800, avg_power_watts: 210, normalized_power: 225, tss: 100, avg_cadence_rpm: 86, elevation_gain_meters: 450,
    }),
    workout('swim', 'Threshold Set', 51, {
      duration_seconds: 3000, distance_meters: 2500, avg_hr: 150, max_hr: 170, rpe: 7,
      calories: 420, pool_length_meters: 25, swolf: 30,
    }),
    workout('run', 'Fartlek', 53, {
      duration_seconds: 2700, distance_meters: 7000, avg_hr: 152, max_hr: 172, rpe: 7,
      calories: 450, avg_pace_sec_per_km: 294, avg_cadence_spm: 178,
    }),
    workout('bike', 'Endurance', 57, {
      duration_seconds: 7200, distance_meters: 58000, avg_hr: 132, max_hr: 150, rpe: 4,
      calories: 1100, avg_power_watts: 170, normalized_power: 178, tss: 100, avg_cadence_rpm: 87, elevation_gain_meters: 380,
    }),
    workout('swim', 'Build Set', 58, {
      duration_seconds: 2700, distance_meters: 2200, avg_hr: 142, max_hr: 162, rpe: 6,
      calories: 380, pool_length_meters: 25, swolf: 31,
    }),
    workout('run', 'Easy', 60, {
      duration_seconds: 2400, distance_meters: 6000, avg_hr: 130, max_hr: 145, rpe: 3,
      calories: 340, avg_pace_sec_per_km: 300, avg_cadence_spm: 170,
    }),
    workout('bike', 'Tempo', 64, {
      duration_seconds: 5400, distance_meters: 42000, avg_hr: 148, max_hr: 165, rpe: 6,
      calories: 850, avg_power_watts: 198, normalized_power: 210, tss: 90, avg_cadence_rpm: 88, elevation_gain_meters: 350,
    }),
    workout('run', 'Long Run', 68, {
      duration_seconds: 5400, distance_meters: 13500, avg_hr: 142, max_hr: 160, rpe: 5,
      calories: 880, avg_pace_sec_per_km: 336, avg_cadence_spm: 172,
    }),
    workout('swim', 'Technique', 71, {
      duration_seconds: 2400, distance_meters: 1800, avg_hr: 130, max_hr: 148, rpe: 3,
      calories: 280, pool_length_meters: 25, swolf: 33,
    }),
    workout('bike', 'Hill Ride', 75, {
      duration_seconds: 5400, distance_meters: 40000, avg_hr: 152, max_hr: 172, rpe: 7,
      calories: 880, avg_power_watts: 208, normalized_power: 228, tss: 105, avg_cadence_rpm: 80, elevation_gain_meters: 680,
    }),
    workout('run', 'Threshold', 78, {
      duration_seconds: 3000, distance_meters: 8000, avg_hr: 160, max_hr: 176, rpe: 8,
      calories: 520, avg_pace_sec_per_km: 270, avg_cadence_spm: 180,
    }),
    workout('swim', 'Race Pace', 82, {
      duration_seconds: 3000, distance_meters: 2400, avg_hr: 148, max_hr: 168, rpe: 7,
      calories: 400, pool_length_meters: 25, swolf: 30,
    }),
  ]
}
