-- =====================================================================
-- TRI-NEXUS: Complete Seed Data
-- Auto-detects your user ID from the profiles table.
-- Run this in the Supabase SQL Editor (one shot, does everything).
-- =====================================================================

DO $$
DECLARE
  uid uuid;
BEGIN
  -- Find your user ID automatically
  SELECT id INTO uid FROM profiles ORDER BY created_at LIMIT 1;

  IF uid IS NULL THEN
    RAISE EXCEPTION 'No user found in profiles table. Sign up first, then run this.';
  END IF;

  RAISE NOTICE 'Seeding data for user: %', uid;

  -- ========================================
  -- SWIM WORKOUTS
  -- ========================================
  INSERT INTO workouts (user_id, sport, title, date, duration_seconds, distance_meters, pool_length_meters, swolf, avg_hr, max_hr, calories, rpe, notes) VALUES
  (uid, 'swim', 'Morning Drill Set',    '2025-11-18', 3600, 3000, 25, 34, 138, 158, 480, 6, 'Focused on catch and pull drills'),
  (uid, 'swim', 'Threshold Swim',       '2025-11-21', 4200, 3800, 25, 32, 152, 172, 620, 7, 'Main set: 10x200 on 3:15'),
  (uid, 'swim', 'Easy Swim',            '2025-11-25', 2700, 2200, 25, 36, 128, 145, 350, 4, 'Recovery day, focus on technique'),
  (uid, 'swim', 'Speed Work',           '2025-11-28', 3600, 3200, 25, 31, 155, 178, 540, 8, '8x100 all out with 60s rest'),
  (uid, 'swim', 'Endurance Swim',       '2025-12-02', 4500, 4000, 25, 33, 142, 162, 680, 6, 'Steady state 4km continuous'),
  (uid, 'swim', 'Drill + Pull',         '2025-12-05', 3000, 2500, 25, 35, 132, 148, 400, 5, 'Paddles and pull buoy work'),
  (uid, 'swim', 'Race Pace',            '2025-12-09', 3600, 3400, 25, 30, 158, 180, 580, 8, '3x1000 at race pace'),
  (uid, 'swim', 'Easy Recovery',        '2025-12-12', 2400, 1800, 25, 37, 125, 140, 280, 3, 'Just loosening up'),
  (uid, 'swim', 'Threshold Intervals',  '2025-12-16', 4200, 3600, 25, 31, 150, 170, 600, 7, '12x150 threshold'),
  (uid, 'swim', 'OWS Simulation',       '2025-12-19', 3600, 3000, 50, 33, 145, 168, 520, 7, 'Simulated open water sighting'),
  (uid, 'swim', 'Technique Focus',      '2025-12-23', 3000, 2400, 25, 34, 130, 148, 380, 5, 'Catch-up drill + fingertip drag'),
  (uid, 'swim', 'New Year Build',       '2025-12-30', 4200, 3800, 25, 31, 148, 168, 610, 7, 'Building back after holidays'),
  (uid, 'swim', 'Threshold Test',       '2026-01-02', 3600, 3200, 25, 30, 155, 175, 560, 8, 'CSS test: new threshold 1:32/100m'),
  (uid, 'swim', 'Aerobic Swim',         '2026-01-06', 3600, 3000, 25, 33, 140, 155, 490, 6, 'Steady aerobic effort'),
  (uid, 'swim', 'Sprint Set',           '2026-01-09', 3000, 2800, 25, 29, 160, 182, 500, 9, '16x50 max effort'),
  (uid, 'swim', 'Pull Set',             '2026-01-13', 3600, 3200, 25, 32, 135, 152, 480, 5, 'All pull buoy, building feel'),
  (uid, 'swim', 'Race Prep',            '2026-01-16', 4200, 3800, 25, 30, 150, 172, 620, 7, 'Race simulation 3.8km'),
  (uid, 'swim', 'Lactate Set',          '2026-01-23', 3600, 3400, 25, 29, 162, 185, 580, 9, '5x200 above threshold'),
  (uid, 'swim', 'Steady State',         '2026-01-27', 4500, 4000, 25, 32, 142, 160, 680, 6, 'Continuous aerobic swim'),
  (uid, 'swim', 'Intervals',            '2026-01-30', 3600, 3200, 25, 31, 148, 168, 540, 7, '8x200 descending'),
  (uid, 'swim', 'Build Set',            '2026-02-06', 3600, 3400, 25, 30, 152, 174, 570, 8, '4x800 building each 200'),
  (uid, 'swim', 'Easy Long',            '2026-02-10', 4200, 3600, 25, 33, 138, 155, 580, 5, 'Easy distance work'),
  (uid, 'swim', 'Speed Endurance',      '2026-02-13', 3600, 3200, 25, 29, 158, 180, 550, 8, '6x300 at race pace');

  -- ========================================
  -- BIKE WORKOUTS
  -- ========================================
  INSERT INTO workouts (user_id, sport, title, date, duration_seconds, distance_meters, avg_power_watts, normalized_power, tss, avg_cadence_rpm, elevation_gain_meters, avg_hr, max_hr, calories, rpe, notes) VALUES
  (uid, 'bike', 'Endurance Ride',   '2025-11-17', 7200,  56000,  185, 195, 75,  85, 380, 135, 152, 980,  5, 'Zone 2 steady ride'),
  (uid, 'bike', 'Sweet Spot',       '2025-11-19', 5400,  42000,  215, 228, 85,  88, 290, 148, 168, 850,  7, '3x20min sweet spot'),
  (uid, 'bike', 'VO2 Intervals',    '2025-11-24', 4800,  38000,  230, 255, 95,  92, 340, 158, 182, 780,  9, '5x4min VO2max'),
  (uid, 'bike', 'Long Ride',        '2025-11-26', 10800, 85000,  180, 192, 110, 84, 680, 138, 158, 1450, 6, '3hr endurance with hills'),
  (uid, 'bike', 'Threshold',        '2025-12-06', 5400,  43000,  220, 232, 88,  89, 310, 152, 172, 870,  7, '2x20min FTP intervals'),
  (uid, 'bike', 'Long Endurance',   '2025-12-13', 12600, 100000, 178, 190, 125, 85, 750, 140, 162, 1680, 6, '3.5hr long ride'),
  (uid, 'bike', 'Threshold Test',   '2025-12-31', 5400,  42000,  225, 238, 90,  90, 300, 155, 175, 880,  8, 'New Year FTP test: 238W'),
  (uid, 'bike', 'Over Unders',      '2026-01-05', 5400,  42000,  220, 235, 88,  88, 280, 152, 175, 860,  7, '4x12min over-under'),
  (uid, 'bike', 'Long Ride',        '2026-01-10', 10800, 86000,  182, 195, 112, 84, 700, 139, 160, 1460, 6, '3hr with tempo finish'),
  (uid, 'bike', 'Hill Climbs',      '2026-01-26', 4800,  33000,  228, 252, 85,  76, 650, 156, 180, 760,  8, '5x6min climbing'),
  (uid, 'bike', 'VO2 Work',         '2026-02-01', 4800,  38000,  238, 265, 100, 94, 340, 162, 188, 810,  9, '5x5min VO2max'),
  (uid, 'bike', 'Sweet Spot',       '2026-02-07', 5400,  44000,  222, 234, 88,  89, 300, 150, 170, 860,  7, '3x20min sweet spot'),
  (uid, 'bike', 'Long Ride',        '2026-02-12', 12600, 102000, 180, 194, 128, 85, 780, 140, 164, 1720, 6, '3.5hr with climbing'),
  (uid, 'bike', 'Threshold',        '2026-02-14', 5400,  43000,  228, 240, 92,  90, 320, 155, 176, 890,  8, '2x20min at 240W');

  -- ========================================
  -- RUN WORKOUTS
  -- ========================================
  INSERT INTO workouts (user_id, sport, title, date, duration_seconds, distance_meters, avg_pace_sec_per_km, avg_cadence_spm, avg_hr, max_hr, calories, rpe, notes) VALUES
  (uid, 'run', 'Easy Run',        '2025-11-18', 3600, 8500,  424, 172, 138, 152, 520,  5, 'Zone 2 easy running'),
  (uid, 'run', 'Tempo Run',       '2025-11-20', 3000, 7800,  385, 178, 158, 175, 520,  7, '20min tempo in the middle'),
  (uid, 'run', 'Long Run',        '2025-11-23', 5400, 13000, 415, 170, 142, 162, 850,  6, 'Long slow distance'),
  (uid, 'run', 'Intervals',       '2025-11-27', 3600, 9200,  391, 182, 162, 185, 620,  8, '6x800m at 5K pace'),
  (uid, 'run', 'Threshold',       '2025-12-02', 3600, 9000,  400, 176, 155, 172, 600,  7, '2x15min at threshold'),
  (uid, 'run', 'Long Run',        '2025-12-04', 6000, 14200, 423, 170, 144, 165, 920,  6, 'Long run with strides'),
  (uid, 'run', 'Track Session',   '2025-12-09', 3600, 9500,  379, 184, 165, 188, 650,  9, '5x1000m at race pace'),
  (uid, 'run', 'Tempo',           '2025-12-14', 3600, 9200,  391, 178, 156, 172, 610,  7, '25min continuous tempo'),
  (uid, 'run', 'Long Run',        '2025-12-16', 6600, 15500, 426, 171, 145, 168, 1020, 6, 'Progressive long run'),
  (uid, 'run', 'Fartlek',         '2025-12-21', 3600, 9000,  400, 176, 152, 175, 580,  7, 'Fartlek: 1min hard / 2min easy'),
  (uid, 'run', 'Intervals',       '2026-01-04', 3600, 9600,  375, 183, 164, 188, 660,  9, '8x600m at 3K pace'),
  (uid, 'run', 'Threshold',       '2026-01-08', 3600, 9200,  391, 177, 156, 174, 610,  7, '20min threshold effort'),
  (uid, 'run', 'Long Run',        '2026-01-11', 7200, 17000, 424, 170, 144, 166, 1100, 6, '2hr long run'),
  (uid, 'run', 'Track Workout',   '2026-01-15', 3600, 9800,  367, 185, 166, 190, 680,  9, '4x1200m race pace'),
  (uid, 'run', 'Tempo',           '2026-01-20', 3600, 9400,  383, 178, 157, 174, 620,  7, '30min continuous tempo'),
  (uid, 'run', 'Long Run',        '2026-01-22', 6000, 14000, 429, 170, 143, 164, 900,  6, 'Long with negative split'),
  (uid, 'run', 'Brick Run',       '2026-01-24', 2700, 6500,  415, 174, 158, 175, 440,  7, 'Off the bike — heavy legs'),
  (uid, 'run', 'Intervals',       '2026-01-29', 3600, 9500,  379, 184, 165, 188, 650,  8, '6x1000m at 10K pace'),
  (uid, 'run', 'Threshold',       '2026-02-03', 3600, 9200,  391, 178, 155, 172, 610,  7, '2x15min threshold'),
  (uid, 'run', 'Long Run',        '2026-02-06', 7200, 17200, 419, 171, 145, 168, 1120, 6, '2hr progressive long run'),
  (uid, 'run', 'Track Session',   '2026-02-11', 3600, 9800,  367, 186, 168, 192, 680,  9, '5x1000m PR attempt'),
  (uid, 'run', 'Easy Run',        '2026-02-13', 3600, 8600,  419, 173, 134, 148, 520,  4, 'Easy run, feeling good');

  -- ========================================
  -- MANUAL LOGS
  -- ========================================
  INSERT INTO manual_logs (user_id, date, category, log_type, value, unit) VALUES
  (uid, '2025-11-26', 'metabolic',      'carbs_g_per_hr',  65, 'g/hr'),
  (uid, '2025-12-04', 'metabolic',      'carbs_g_per_hr',  70, 'g/hr'),
  (uid, '2025-12-13', 'metabolic',      'carbs_g_per_hr',  80, 'g/hr'),
  (uid, '2026-01-10', 'metabolic',      'carbs_g_per_hr',  85, 'g/hr'),
  (uid, '2026-01-22', 'metabolic',      'carbs_g_per_hr',  90, 'g/hr'),
  (uid, '2026-02-06', 'metabolic',      'carbs_g_per_hr',  92, 'g/hr'),
  (uid, '2026-02-12', 'metabolic',      'carbs_g_per_hr',  90, 'g/hr'),
  (uid, '2025-11-26', 'metabolic',      'sodium_mg_per_hr', 600, 'mg/hr'),
  (uid, '2025-12-13', 'metabolic',      'sodium_mg_per_hr', 720, 'mg/hr'),
  (uid, '2026-01-10', 'metabolic',      'sodium_mg_per_hr', 800, 'mg/hr'),
  (uid, '2026-02-12', 'metabolic',      'sodium_mg_per_hr', 920, 'mg/hr'),
  (uid, '2025-11-18', 'physiological',  'morning_hrv',      48, 'ms'),
  (uid, '2025-11-22', 'physiological',  'morning_hrv',      52, 'ms'),
  (uid, '2025-12-02', 'physiological',  'morning_hrv',      50, 'ms'),
  (uid, '2025-12-13', 'physiological',  'morning_hrv',      38, 'ms'),
  (uid, '2026-01-06', 'physiological',  'morning_hrv',      55, 'ms'),
  (uid, '2026-01-20', 'physiological',  'morning_hrv',      56, 'ms'),
  (uid, '2026-02-03', 'physiological',  'morning_hrv',      53, 'ms'),
  (uid, '2026-02-14', 'physiological',  'morning_hrv',      55, 'ms'),
  (uid, '2025-11-18', 'physiological',  'sleep_quality',    7,  '1-10'),
  (uid, '2025-12-09', 'physiological',  'sleep_quality',    6,  '1-10'),
  (uid, '2026-01-03', 'physiological',  'sleep_quality',    7,  '1-10'),
  (uid, '2026-01-15', 'physiological',  'sleep_quality',    5,  '1-10'),
  (uid, '2026-02-03', 'physiological',  'sleep_quality',    8,  '1-10'),
  (uid, '2026-02-14', 'physiological',  'sleep_quality',    8,  '1-10'),
  (uid, '2025-11-18', 'environmental',  'life_stress',      3,  '1-10'),
  (uid, '2025-12-13', 'environmental',  'life_stress',      7,  '1-10'),
  (uid, '2026-01-15', 'environmental',  'life_stress',      7,  '1-10'),
  (uid, '2026-02-06', 'environmental',  'life_stress',      4,  '1-10'),
  (uid, '2026-02-14', 'environmental',  'life_stress',      3,  '1-10');

END $$;

-- ========================================
-- SESSION METRICS: Swim — Speed Endurance (Feb 13), 60min
-- ========================================
INSERT INTO session_metrics (workout_id, timestamp_offset_seconds, heart_rate, pace_sec_per_km, cadence, speed_mps)
SELECT w.id, gs.t,
  CASE
    WHEN gs.t < 600 THEN 120 + (gs.t * 25 / 600)
    WHEN gs.t > 3300 THEN 170 - ((gs.t - 3300) * 40 / 300)
    ELSE 148 + (sin(gs.t::float / 120) * 12)::int + (random() * 6)::int
  END,
  CASE
    WHEN gs.t < 600 THEN 700 - (gs.t * 80 / 600)
    WHEN gs.t > 3300 THEN 620 + ((gs.t - 3300) * 100 / 300)
    ELSE 580 + (sin(gs.t::float / 150) * 30)::int + (random() * 20)::int
  END,
  CASE
    WHEN gs.t < 600 THEN 24 + (gs.t * 4 / 600)
    WHEN gs.t > 3300 THEN 28 - ((gs.t - 3300) * 4 / 300)
    ELSE 28 + (sin(gs.t::float / 100) * 3)::int + (random() * 2)::int
  END,
  CASE
    WHEN gs.t < 600 THEN 1000.0 / (700 - (gs.t * 80 / 600))
    WHEN gs.t > 3300 THEN 1000.0 / (620 + ((gs.t - 3300) * 100 / 300))
    ELSE 1000.0 / (580 + (sin(gs.t::float / 150) * 30)::int + (random() * 20)::int)
  END
FROM workouts w, generate_series(0, 3600, 30) AS gs(t)
WHERE w.title = 'Speed Endurance' AND w.date = '2026-02-13' AND w.sport = 'swim';

-- ========================================
-- SESSION METRICS: Swim — Build Set (Feb 6), 60min
-- ========================================
INSERT INTO session_metrics (workout_id, timestamp_offset_seconds, heart_rate, pace_sec_per_km, cadence, speed_mps)
SELECT w.id, gs.t,
  CASE
    WHEN gs.t < 600 THEN 118 + (gs.t * 22 / 600)
    WHEN gs.t > 3300 THEN 165 - ((gs.t - 3300) * 35 / 300)
    ELSE 140 + (gs.t::float / 3600 * 20)::int + (sin(gs.t::float / 100) * 8)::int + (random() * 5)::int
  END,
  CASE
    WHEN gs.t < 600 THEN 720 - (gs.t * 100 / 600)
    WHEN gs.t > 3300 THEN 600 + ((gs.t - 3300) * 120 / 300)
    ELSE 620 - (gs.t::float / 3600 * 40)::int + (sin(gs.t::float / 120) * 25)::int
  END,
  CASE
    WHEN gs.t < 600 THEN 24
    WHEN gs.t > 3300 THEN 26
    ELSE 26 + (gs.t::float / 3600 * 4)::int + (random() * 2)::int
  END,
  CASE
    WHEN gs.t < 600 THEN 1000.0 / (720 - (gs.t * 100 / 600))
    WHEN gs.t > 3300 THEN 1000.0 / (600 + ((gs.t - 3300) * 120 / 300))
    ELSE 1000.0 / (620 - (gs.t::float / 3600 * 40)::int + (sin(gs.t::float / 120) * 25)::int)
  END
FROM workouts w, generate_series(0, 3600, 30) AS gs(t)
WHERE w.title = 'Build Set' AND w.date = '2026-02-06' AND w.sport = 'swim';

-- ========================================
-- SESSION METRICS: Bike — Threshold (Feb 14), 90min
-- ========================================
INSERT INTO session_metrics (workout_id, timestamp_offset_seconds, heart_rate, power_watts, pace_sec_per_km, cadence, speed_mps)
SELECT w.id, gs.t,
  CASE
    WHEN gs.t < 600  THEN 110 + (gs.t * 30 / 600)
    WHEN gs.t > 5100 THEN 170 - ((gs.t - 5100) * 40 / 300)
    WHEN gs.t BETWEEN 600  AND 1800 THEN 148 + (sin(gs.t::float / 80) * 14)::int + (random() * 6)::int
    WHEN gs.t BETWEEN 1800 AND 2100 THEN 135 + (random() * 5)::int
    WHEN gs.t BETWEEN 2100 AND 3300 THEN 150 + (sin(gs.t::float / 80) * 13)::int + (random() * 6)::int
    WHEN gs.t BETWEEN 3300 AND 3600 THEN 138 + (random() * 5)::int
    WHEN gs.t BETWEEN 3600 AND 4800 THEN 155 + (sin(gs.t::float / 80) * 12)::int + (random() * 6)::int
    ELSE 140 + (random() * 8)::int
  END,
  CASE
    WHEN gs.t < 600  THEN 120 + (gs.t * 60 / 600)
    WHEN gs.t > 5100 THEN 180 - ((gs.t - 5100) * 60 / 300)
    WHEN gs.t BETWEEN 600  AND 1800 THEN 220 + (sin(gs.t::float / 60) * 20)::int + (random() * 15)::int
    WHEN gs.t BETWEEN 1800 AND 2100 THEN 140 + (random() * 15)::int
    WHEN gs.t BETWEEN 2100 AND 3300 THEN 230 + (sin(gs.t::float / 60) * 18)::int + (random() * 15)::int
    WHEN gs.t BETWEEN 3300 AND 3600 THEN 145 + (random() * 15)::int
    WHEN gs.t BETWEEN 3600 AND 4800 THEN 235 + (sin(gs.t::float / 60) * 15)::int + (random() * 15)::int
    ELSE 160 + (random() * 20)::int
  END,
  CASE
    WHEN gs.t < 600  THEN 180 - (gs.t * 30 / 600)
    WHEN gs.t > 5100 THEN 150 + ((gs.t - 5100) * 30 / 300)
    WHEN gs.t BETWEEN 600  AND 1800 THEN 125 + (sin(gs.t::float / 80) * 8)::int + (random() * 5)::int
    WHEN gs.t BETWEEN 1800 AND 2100 THEN 155 + (random() * 8)::int
    WHEN gs.t BETWEEN 2100 AND 3300 THEN 122 + (sin(gs.t::float / 80) * 8)::int + (random() * 5)::int
    WHEN gs.t BETWEEN 3300 AND 3600 THEN 152 + (random() * 8)::int
    WHEN gs.t BETWEEN 3600 AND 4800 THEN 120 + (sin(gs.t::float / 80) * 7)::int + (random() * 5)::int
    ELSE 145 + (random() * 10)::int
  END,
  CASE
    WHEN gs.t < 600  THEN 75 + (gs.t * 13 / 600)
    WHEN gs.t > 5100 THEN 88 - ((gs.t - 5100) * 10 / 300)
    WHEN gs.t BETWEEN 600  AND 1800 THEN 88 + (sin(gs.t::float / 90) * 4)::int + (random() * 3)::int
    WHEN gs.t BETWEEN 1800 AND 2100 THEN 80 + (random() * 4)::int
    WHEN gs.t BETWEEN 2100 AND 3300 THEN 90 + (sin(gs.t::float / 90) * 4)::int + (random() * 3)::int
    WHEN gs.t BETWEEN 3300 AND 3600 THEN 82 + (random() * 4)::int
    WHEN gs.t BETWEEN 3600 AND 4800 THEN 91 + (sin(gs.t::float / 90) * 3)::int + (random() * 3)::int
    ELSE 84 + (random() * 4)::int
  END,
  CASE
    WHEN gs.t < 600  THEN 5.5 + (gs.t * 2.0 / 600)
    WHEN gs.t > 5100 THEN 7.5 - ((gs.t - 5100) * 2.0 / 300)
    WHEN gs.t BETWEEN 600  AND 1800 THEN 7.8 + sin(gs.t::float / 80) * 0.5 + random() * 0.3
    WHEN gs.t BETWEEN 1800 AND 2100 THEN 6.5 + random() * 0.4
    WHEN gs.t BETWEEN 2100 AND 3300 THEN 8.0 + sin(gs.t::float / 80) * 0.5 + random() * 0.3
    WHEN gs.t BETWEEN 3300 AND 3600 THEN 6.6 + random() * 0.4
    WHEN gs.t BETWEEN 3600 AND 4800 THEN 8.2 + sin(gs.t::float / 80) * 0.4 + random() * 0.3
    ELSE 7.0 + random() * 0.5
  END
FROM workouts w, generate_series(0, 5400, 30) AS gs(t)
WHERE w.title = 'Threshold' AND w.date = '2026-02-14' AND w.sport = 'bike';

-- ========================================
-- SESSION METRICS: Bike — Sweet Spot (Feb 7), 90min
-- ========================================
INSERT INTO session_metrics (workout_id, timestamp_offset_seconds, heart_rate, power_watts, pace_sec_per_km, cadence, speed_mps)
SELECT w.id, gs.t,
  CASE
    WHEN gs.t < 480  THEN 108 + (gs.t * 30 / 480)
    WHEN gs.t > 5100 THEN 158 - ((gs.t - 5100) * 30 / 300)
    ELSE 138 + (gs.t::float / 5400 * 15)::int + (sin(gs.t::float / 100) * 10)::int + (random() * 5)::int
  END,
  CASE
    WHEN gs.t < 480  THEN 115 + (gs.t * 55 / 480)
    WHEN gs.t > 5100 THEN 170 - ((gs.t - 5100) * 50 / 300)
    WHEN gs.t BETWEEN 480  AND 1680 THEN 210 + (sin(gs.t::float / 70) * 12)::int + (random() * 10)::int
    WHEN gs.t BETWEEN 1680 AND 1920 THEN 130 + (random() * 12)::int
    WHEN gs.t BETWEEN 1920 AND 3120 THEN 218 + (sin(gs.t::float / 70) * 10)::int + (random() * 10)::int
    WHEN gs.t BETWEEN 3120 AND 3360 THEN 132 + (random() * 12)::int
    WHEN gs.t BETWEEN 3360 AND 4560 THEN 225 + (sin(gs.t::float / 70) * 10)::int + (random() * 10)::int
    ELSE 155 + (random() * 15)::int
  END,
  CASE
    WHEN gs.t < 480  THEN 175 - (gs.t * 30 / 480)
    WHEN gs.t > 5100 THEN 145 + ((gs.t - 5100) * 25 / 300)
    ELSE 130 + (sin(gs.t::float / 90) * 10)::int + (random() * 6)::int
  END,
  CASE
    WHEN gs.t < 480  THEN 74 + (gs.t * 14 / 480)
    WHEN gs.t > 5100 THEN 86 - ((gs.t - 5100) * 8 / 300)
    ELSE 86 + (sin(gs.t::float / 80) * 3)::int + (random() * 3)::int
  END,
  CASE
    WHEN gs.t < 480  THEN 5.5 + (gs.t * 2.3 / 480)
    WHEN gs.t > 5100 THEN 7.2 - ((gs.t - 5100) * 1.5 / 300)
    ELSE 7.5 + sin(gs.t::float / 90) * 0.5 + random() * 0.3
  END
FROM workouts w, generate_series(0, 5400, 30) AS gs(t)
WHERE w.title = 'Sweet Spot' AND w.date = '2026-02-07' AND w.sport = 'bike';

-- ========================================
-- SESSION METRICS: Bike — Long Ride (Feb 12), 3.5hr (sampled every 60s)
-- ========================================
INSERT INTO session_metrics (workout_id, timestamp_offset_seconds, heart_rate, power_watts, pace_sec_per_km, cadence, speed_mps)
SELECT w.id, gs.t,
  CASE
    WHEN gs.t < 900  THEN 105 + (gs.t * 30 / 900)
    WHEN gs.t > 12000 THEN 152 - ((gs.t - 12000) * 25 / 600)
    WHEN gs.t BETWEEN 3300 AND 4200 THEN 152 + (sin((gs.t - 3300)::float / 60) * 10)::int + (random() * 5)::int
    WHEN gs.t BETWEEN 6900 AND 7800 THEN 155 + (sin((gs.t - 6900)::float / 60) * 10)::int + (random() * 5)::int
    WHEN gs.t BETWEEN 10200 AND 11100 THEN 158 + (sin((gs.t - 10200)::float / 60) * 8)::int + (random() * 5)::int
    ELSE 135 + (gs.t::float / 12600 * 10)::int + (sin(gs.t::float / 200) * 6)::int + (random() * 4)::int
  END,
  CASE
    WHEN gs.t < 900  THEN 110 + (gs.t * 65 / 900)
    WHEN gs.t > 12000 THEN 175 - ((gs.t - 12000) * 55 / 600)
    WHEN gs.t BETWEEN 3300 AND 4200 THEN 230 + (sin((gs.t - 3300)::float / 50) * 20)::int + (random() * 12)::int
    WHEN gs.t BETWEEN 6900 AND 7800 THEN 240 + (sin((gs.t - 6900)::float / 50) * 18)::int + (random() * 12)::int
    WHEN gs.t BETWEEN 10200 AND 11100 THEN 245 + (sin((gs.t - 10200)::float / 50) * 15)::int + (random() * 12)::int
    ELSE 175 + (sin(gs.t::float / 150) * 12)::int + (random() * 10)::int
  END,
  CASE
    WHEN gs.t < 900  THEN 190 - (gs.t * 45 / 900)
    WHEN gs.t > 12000 THEN 145 + ((gs.t - 12000) * 35 / 600)
    WHEN gs.t BETWEEN 3300 AND 4200 THEN 175 + (sin((gs.t - 3300)::float / 60) * 15)::int + (random() * 8)::int
    WHEN gs.t BETWEEN 6900 AND 7800 THEN 180 + (sin((gs.t - 6900)::float / 60) * 12)::int + (random() * 8)::int
    WHEN gs.t BETWEEN 10200 AND 11100 THEN 185 + (sin((gs.t - 10200)::float / 60) * 10)::int + (random() * 8)::int
    ELSE 140 + (sin(gs.t::float / 180) * 8)::int + (random() * 6)::int
  END,
  CASE
    WHEN gs.t < 900  THEN 72 + (gs.t * 13 / 900)
    WHEN gs.t > 12000 THEN 84 - ((gs.t - 12000) * 8 / 600)
    WHEN gs.t BETWEEN 3300 AND 4200 THEN 74 + (random() * 4)::int
    WHEN gs.t BETWEEN 6900 AND 7800 THEN 72 + (random() * 4)::int
    WHEN gs.t BETWEEN 10200 AND 11100 THEN 73 + (random() * 4)::int
    ELSE 84 + (sin(gs.t::float / 100) * 3)::int + (random() * 2)::int
  END,
  CASE
    WHEN gs.t < 900  THEN 5.0 + (gs.t * 2.3 / 900)
    WHEN gs.t > 12000 THEN 7.0 - ((gs.t - 12000) * 1.5 / 600)
    WHEN gs.t BETWEEN 3300 AND 4200 THEN 5.5 + sin((gs.t - 3300)::float / 60) * 0.5 + random() * 0.3
    WHEN gs.t BETWEEN 6900 AND 7800 THEN 5.3 + sin((gs.t - 6900)::float / 60) * 0.5 + random() * 0.3
    WHEN gs.t BETWEEN 10200 AND 11100 THEN 5.2 + sin((gs.t - 10200)::float / 60) * 0.4 + random() * 0.3
    ELSE 7.0 + sin(gs.t::float / 180) * 0.4 + random() * 0.3
  END
FROM workouts w, generate_series(0, 12600, 60) AS gs(t)
WHERE w.title = 'Long Ride' AND w.date = '2026-02-12' AND w.sport = 'bike';

-- ========================================
-- SESSION METRICS: Run — Track Session (Feb 11), 60min
-- ========================================
INSERT INTO session_metrics (workout_id, timestamp_offset_seconds, heart_rate, pace_sec_per_km, cadence, speed_mps)
SELECT w.id, gs.t,
  CASE
    WHEN gs.t < 600  THEN 105 + (gs.t * 40 / 600)
    WHEN gs.t > 3300 THEN 175 - ((gs.t - 3300) * 45 / 300)
    WHEN (gs.t - 600) % 320 < 200 THEN 165 + (sin(gs.t::float / 50) * 8)::int + (random() * 6)::int
    ELSE 142 + (random() * 8)::int
  END,
  CASE
    WHEN gs.t < 600  THEN 480 - (gs.t * 80 / 600)
    WHEN gs.t > 3300 THEN 380 + ((gs.t - 3300) * 100 / 300)
    WHEN (gs.t - 600) % 320 < 200 THEN 345 + (sin(gs.t::float / 40) * 12)::int + (random() * 8)::int
    ELSE 440 + (random() * 20)::int
  END,
  CASE
    WHEN gs.t < 600  THEN 166 + (gs.t * 8 / 600)
    WHEN gs.t > 3300 THEN 182 - ((gs.t - 3300) * 12 / 300)
    WHEN (gs.t - 600) % 320 < 200 THEN 186 + (random() * 5)::int
    ELSE 172 + (random() * 4)::int
  END,
  CASE
    WHEN gs.t < 600  THEN 1000.0 / (480 - (gs.t * 80 / 600))
    WHEN gs.t > 3300 THEN 1000.0 / (380 + ((gs.t - 3300) * 100 / 300))
    WHEN (gs.t - 600) % 320 < 200 THEN 1000.0 / (345 + (sin(gs.t::float / 40) * 12)::int + (random() * 8)::int)
    ELSE 1000.0 / (440 + (random() * 20)::int)
  END
FROM workouts w, generate_series(0, 3600, 30) AS gs(t)
WHERE w.title = 'Track Session' AND w.date = '2026-02-11' AND w.sport = 'run';

-- ========================================
-- SESSION METRICS: Run — Easy Run (Feb 13), 60min
-- ========================================
INSERT INTO session_metrics (workout_id, timestamp_offset_seconds, heart_rate, pace_sec_per_km, cadence, speed_mps)
SELECT w.id, gs.t,
  CASE
    WHEN gs.t < 600  THEN 100 + (gs.t * 32 / 600)
    WHEN gs.t > 3300 THEN 138 - ((gs.t - 3300) * 15 / 300)
    ELSE 130 + (gs.t::float / 3600 * 8)::int + (sin(gs.t::float / 150) * 5)::int + (random() * 4)::int
  END,
  CASE
    WHEN gs.t < 600  THEN 460 - (gs.t * 35 / 600)
    WHEN gs.t > 3300 THEN 425 + ((gs.t - 3300) * 30 / 300)
    ELSE 418 + (sin(gs.t::float / 200) * 8)::int + (random() * 6)::int
  END,
  CASE
    WHEN gs.t < 600  THEN 168 + (gs.t * 4 / 600)
    WHEN gs.t > 3300 THEN 172 - ((gs.t - 3300) * 3 / 300)
    ELSE 171 + (sin(gs.t::float / 120) * 2)::int + (random() * 2)::int
  END,
  CASE
    WHEN gs.t < 600  THEN 1000.0 / (460 - (gs.t * 35 / 600))
    WHEN gs.t > 3300 THEN 1000.0 / (425 + ((gs.t - 3300) * 30 / 300))
    ELSE 1000.0 / (418 + (sin(gs.t::float / 200) * 8)::int + (random() * 6)::int)
  END
FROM workouts w, generate_series(0, 3600, 30) AS gs(t)
WHERE w.title = 'Easy Run' AND w.date = '2026-02-13' AND w.sport = 'run';

-- ========================================
-- SESSION METRICS: Run — Long Run (Feb 6), 2hr
-- ========================================
INSERT INTO session_metrics (workout_id, timestamp_offset_seconds, heart_rate, pace_sec_per_km, cadence, speed_mps)
SELECT w.id, gs.t,
  CASE
    WHEN gs.t < 600  THEN 108 + (gs.t * 18 / 600)
    WHEN gs.t > 6900 THEN 162 - ((gs.t - 6900) * 25 / 300)
    ELSE 126 + (gs.t::float / 7200 * 36)::int + (sin(gs.t::float / 180) * 6)::int + (random() * 4)::int
  END,
  CASE
    WHEN gs.t < 600  THEN 470 - (gs.t * 40 / 600)
    WHEN gs.t > 6900 THEN 400 + ((gs.t - 6900) * 50 / 300)
    ELSE 430 - (gs.t::float / 7200 * 35)::int + (sin(gs.t::float / 200) * 10)::int + (random() * 8)::int
  END,
  CASE
    WHEN gs.t < 600  THEN 165 + (gs.t * 3 / 600)
    WHEN gs.t > 6900 THEN 174 - ((gs.t - 6900) * 4 / 300)
    ELSE 168 + (gs.t::float / 7200 * 7)::int + (random() * 2)::int
  END,
  CASE
    WHEN gs.t < 600  THEN 1000.0 / (470 - (gs.t * 40 / 600))
    WHEN gs.t > 6900 THEN 1000.0 / (400 + ((gs.t - 6900) * 50 / 300))
    ELSE 1000.0 / (430 - (gs.t::float / 7200 * 35)::int + (sin(gs.t::float / 200) * 10)::int + (random() * 8)::int)
  END
FROM workouts w, generate_series(0, 7200, 30) AS gs(t)
WHERE w.title = 'Long Run' AND w.date = '2026-02-06' AND w.sport = 'run';
