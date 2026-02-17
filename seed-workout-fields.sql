-- =====================================================================
-- Backfill missing workout-level fields (calories, distance, swolf, etc.)
-- Run this in Supabase SQL Editor to populate all aggregate metrics
-- =====================================================================

-- ========================================
-- SWIM WORKOUTS — fill any NULLs
-- ========================================
UPDATE workouts SET
  distance_meters   = COALESCE(distance_meters, 3200),
  pool_length_meters = COALESCE(pool_length_meters, 25),
  swolf             = COALESCE(swolf, 29),
  avg_hr            = COALESCE(avg_hr, 158),
  max_hr            = COALESCE(max_hr, 180),
  calories          = COALESCE(calories, 550),
  rpe               = COALESCE(rpe, 8)
WHERE sport = 'swim' AND title = 'Speed Endurance' AND date = '2026-02-13'
  AND user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';

UPDATE workouts SET
  distance_meters   = COALESCE(distance_meters, 3600),
  pool_length_meters = COALESCE(pool_length_meters, 25),
  swolf             = COALESCE(swolf, 33),
  avg_hr            = COALESCE(avg_hr, 138),
  max_hr            = COALESCE(max_hr, 155),
  calories          = COALESCE(calories, 580),
  rpe               = COALESCE(rpe, 5)
WHERE sport = 'swim' AND title = 'Easy Long' AND date = '2026-02-10'
  AND user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';

UPDATE workouts SET
  distance_meters   = COALESCE(distance_meters, 3400),
  pool_length_meters = COALESCE(pool_length_meters, 25),
  swolf             = COALESCE(swolf, 30),
  avg_hr            = COALESCE(avg_hr, 152),
  max_hr            = COALESCE(max_hr, 174),
  calories          = COALESCE(calories, 570),
  rpe               = COALESCE(rpe, 8)
WHERE sport = 'swim' AND title = 'Build Set' AND date = '2026-02-06'
  AND user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';

-- Backfill ALL swim workouts that might have NULLs
UPDATE workouts SET
  distance_meters    = COALESCE(distance_meters, 3000),
  pool_length_meters = COALESCE(pool_length_meters, 25),
  swolf              = COALESCE(swolf, 32),
  avg_hr             = COALESCE(avg_hr, 142),
  max_hr             = COALESCE(max_hr, 162),
  calories           = COALESCE(calories, 480),
  rpe                = COALESCE(rpe, 6)
WHERE sport = 'swim'
  AND user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28'
  AND (distance_meters IS NULL OR swolf IS NULL OR avg_hr IS NULL
       OR max_hr IS NULL OR calories IS NULL OR rpe IS NULL);

-- ========================================
-- BIKE WORKOUTS — fill any NULLs
-- ========================================
UPDATE workouts SET
  distance_meters       = COALESCE(distance_meters, 43000),
  avg_power_watts       = COALESCE(avg_power_watts, 228),
  normalized_power      = COALESCE(normalized_power, 240),
  tss                   = COALESCE(tss, 92),
  avg_cadence_rpm       = COALESCE(avg_cadence_rpm, 90),
  elevation_gain_meters = COALESCE(elevation_gain_meters, 320),
  avg_hr                = COALESCE(avg_hr, 155),
  max_hr                = COALESCE(max_hr, 176),
  calories              = COALESCE(calories, 890),
  rpe                   = COALESCE(rpe, 8)
WHERE sport = 'bike' AND title = 'Threshold' AND date = '2026-02-14'
  AND user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';

UPDATE workouts SET
  distance_meters       = COALESCE(distance_meters, 102000),
  avg_power_watts       = COALESCE(avg_power_watts, 180),
  normalized_power      = COALESCE(normalized_power, 194),
  tss                   = COALESCE(tss, 128),
  avg_cadence_rpm       = COALESCE(avg_cadence_rpm, 85),
  elevation_gain_meters = COALESCE(elevation_gain_meters, 780),
  avg_hr                = COALESCE(avg_hr, 140),
  max_hr                = COALESCE(max_hr, 164),
  calories              = COALESCE(calories, 1720),
  rpe                   = COALESCE(rpe, 6)
WHERE sport = 'bike' AND title = 'Long Ride' AND date = '2026-02-12'
  AND user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';

UPDATE workouts SET
  distance_meters       = COALESCE(distance_meters, 44000),
  avg_power_watts       = COALESCE(avg_power_watts, 222),
  normalized_power      = COALESCE(normalized_power, 234),
  tss                   = COALESCE(tss, 88),
  avg_cadence_rpm       = COALESCE(avg_cadence_rpm, 89),
  elevation_gain_meters = COALESCE(elevation_gain_meters, 300),
  avg_hr                = COALESCE(avg_hr, 150),
  max_hr                = COALESCE(max_hr, 170),
  calories              = COALESCE(calories, 860),
  rpe                   = COALESCE(rpe, 7)
WHERE sport = 'bike' AND title = 'Sweet Spot' AND date = '2026-02-07'
  AND user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';

-- Backfill ALL bike workouts that might have NULLs
UPDATE workouts SET
  distance_meters       = COALESCE(distance_meters, 42000),
  avg_power_watts       = COALESCE(avg_power_watts, 200),
  normalized_power      = COALESCE(normalized_power, 215),
  tss                   = COALESCE(tss, 80),
  avg_cadence_rpm       = COALESCE(avg_cadence_rpm, 86),
  elevation_gain_meters = COALESCE(elevation_gain_meters, 350),
  avg_hr                = COALESCE(avg_hr, 145),
  max_hr                = COALESCE(max_hr, 168),
  calories              = COALESCE(calories, 820),
  rpe                   = COALESCE(rpe, 6)
WHERE sport = 'bike'
  AND user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28'
  AND (distance_meters IS NULL OR avg_power_watts IS NULL OR normalized_power IS NULL
       OR tss IS NULL OR avg_cadence_rpm IS NULL OR elevation_gain_meters IS NULL
       OR avg_hr IS NULL OR max_hr IS NULL OR calories IS NULL OR rpe IS NULL);

-- ========================================
-- RUN WORKOUTS — fill any NULLs
-- ========================================
UPDATE workouts SET
  distance_meters     = COALESCE(distance_meters, 9800),
  avg_pace_sec_per_km = COALESCE(avg_pace_sec_per_km, 367),
  avg_cadence_spm     = COALESCE(avg_cadence_spm, 186),
  avg_hr              = COALESCE(avg_hr, 168),
  max_hr              = COALESCE(max_hr, 192),
  calories            = COALESCE(calories, 680),
  rpe                 = COALESCE(rpe, 9)
WHERE sport = 'run' AND title = 'Track Session' AND date = '2026-02-11'
  AND user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';

UPDATE workouts SET
  distance_meters     = COALESCE(distance_meters, 8600),
  avg_pace_sec_per_km = COALESCE(avg_pace_sec_per_km, 419),
  avg_cadence_spm     = COALESCE(avg_cadence_spm, 173),
  avg_hr              = COALESCE(avg_hr, 134),
  max_hr              = COALESCE(max_hr, 148),
  calories            = COALESCE(calories, 520),
  rpe                 = COALESCE(rpe, 4)
WHERE sport = 'run' AND title = 'Easy Run' AND date = '2026-02-13'
  AND user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';

UPDATE workouts SET
  distance_meters     = COALESCE(distance_meters, 17200),
  avg_pace_sec_per_km = COALESCE(avg_pace_sec_per_km, 419),
  avg_cadence_spm     = COALESCE(avg_cadence_spm, 171),
  avg_hr              = COALESCE(avg_hr, 145),
  max_hr              = COALESCE(max_hr, 168),
  calories            = COALESCE(calories, 1120),
  rpe                 = COALESCE(rpe, 6)
WHERE sport = 'run' AND title = 'Long Run' AND date = '2026-02-06'
  AND user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';

-- Backfill ALL run workouts that might have NULLs
UPDATE workouts SET
  distance_meters     = COALESCE(distance_meters, 9000),
  avg_pace_sec_per_km = COALESCE(avg_pace_sec_per_km, 400),
  avg_cadence_spm     = COALESCE(avg_cadence_spm, 176),
  avg_hr              = COALESCE(avg_hr, 150),
  max_hr              = COALESCE(max_hr, 172),
  calories            = COALESCE(calories, 600),
  rpe                 = COALESCE(rpe, 6)
WHERE sport = 'run'
  AND user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28'
  AND (distance_meters IS NULL OR avg_pace_sec_per_km IS NULL OR avg_cadence_spm IS NULL
       OR avg_hr IS NULL OR max_hr IS NULL OR calories IS NULL OR rpe IS NULL);
