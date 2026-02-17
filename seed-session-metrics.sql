-- =====================================================================
-- SESSION METRICS for BIKE and RUN workouts (and additional swim data)
-- Run this AFTER seed-data-live.sql
-- Adds time-series telemetry so all chart metrics populate
-- =====================================================================

-- ========================================
-- BIKE: Threshold (Feb 14) — 5400s, 2x20min at 240W
-- ========================================
INSERT INTO session_metrics (workout_id, timestamp_offset_seconds, heart_rate, power_watts, pace_sec_per_km, cadence, speed_mps)
SELECT w.id, gs.t,
  -- HR: warm up 110→140, intervals spike 148-176, recovery dips, cool down
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
  -- Power: warm up 120→180, intervals ~220-260W, recovery 140W, cool down
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
  -- Pace (sec/km): derived from power-speed relationship ~125-165 sec/km for bike
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
  -- Cadence (RPM): warm up 75, intervals 86-96, cool down
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
  -- Speed (m/s): ~7-8.5 m/s on flat road bike
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
WHERE w.title = 'Threshold' AND w.date = '2026-02-14' AND w.sport = 'bike'
  AND w.user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';

-- ========================================
-- BIKE: Sweet Spot (Feb 7) — 5400s, 3x20min sweet spot
-- ========================================
INSERT INTO session_metrics (workout_id, timestamp_offset_seconds, heart_rate, power_watts, pace_sec_per_km, cadence, speed_mps)
SELECT w.id, gs.t,
  -- HR: steady state with 3 blocks
  CASE
    WHEN gs.t < 480  THEN 108 + (gs.t * 30 / 480)
    WHEN gs.t > 5100 THEN 158 - ((gs.t - 5100) * 30 / 300)
    ELSE 138 + (gs.t::float / 5400 * 15)::int + (sin(gs.t::float / 100) * 10)::int + (random() * 5)::int
  END,
  -- Power: 3 blocks at ~210-230W with short recoveries
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
  -- Pace (sec/km)
  CASE
    WHEN gs.t < 480  THEN 175 - (gs.t * 30 / 480)
    WHEN gs.t > 5100 THEN 145 + ((gs.t - 5100) * 25 / 300)
    ELSE 130 + (sin(gs.t::float / 90) * 10)::int + (random() * 6)::int
  END,
  -- Cadence
  CASE
    WHEN gs.t < 480  THEN 74 + (gs.t * 14 / 480)
    WHEN gs.t > 5100 THEN 86 - ((gs.t - 5100) * 8 / 300)
    ELSE 86 + (sin(gs.t::float / 80) * 3)::int + (random() * 3)::int
  END,
  -- Speed
  CASE
    WHEN gs.t < 480  THEN 5.5 + (gs.t * 2.3 / 480)
    WHEN gs.t > 5100 THEN 7.2 - ((gs.t - 5100) * 1.5 / 300)
    ELSE 7.5 + sin(gs.t::float / 90) * 0.5 + random() * 0.3
  END
FROM workouts w, generate_series(0, 5400, 30) AS gs(t)
WHERE w.title = 'Sweet Spot' AND w.date = '2026-02-07' AND w.sport = 'bike'
  AND w.user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';

-- ========================================
-- RUN: Track Session (Feb 11) — 3600s, 5x1000m PR attempt
-- ========================================
INSERT INTO session_metrics (workout_id, timestamp_offset_seconds, heart_rate, pace_sec_per_km, cadence, speed_mps)
SELECT w.id, gs.t,
  -- HR: warm up, 5 hard intervals with jog recovery, cool down
  CASE
    WHEN gs.t < 600  THEN 105 + (gs.t * 40 / 600)
    WHEN gs.t > 3300 THEN 175 - ((gs.t - 3300) * 45 / 300)
    -- Intervals pattern (hard 200s, jog 120s, repeating)
    WHEN (gs.t - 600) % 320 < 200 THEN 165 + (sin(gs.t::float / 50) * 8)::int + (random() * 6)::int
    ELSE 142 + (random() * 8)::int
  END,
  -- Pace: warm up ~480, intervals ~340-360, jog ~450, cool down
  CASE
    WHEN gs.t < 600  THEN 480 - (gs.t * 80 / 600)
    WHEN gs.t > 3300 THEN 380 + ((gs.t - 3300) * 100 / 300)
    WHEN (gs.t - 600) % 320 < 200 THEN 345 + (sin(gs.t::float / 40) * 12)::int + (random() * 8)::int
    ELSE 440 + (random() * 20)::int
  END,
  -- Cadence (SPM): easy ~170, hard ~186-192
  CASE
    WHEN gs.t < 600  THEN 166 + (gs.t * 8 / 600)
    WHEN gs.t > 3300 THEN 182 - ((gs.t - 3300) * 12 / 300)
    WHEN (gs.t - 600) % 320 < 200 THEN 186 + (random() * 5)::int
    ELSE 172 + (random() * 4)::int
  END,
  -- Speed (m/s): derived from pace
  CASE
    WHEN gs.t < 600  THEN 1000.0 / (480 - (gs.t * 80 / 600))
    WHEN gs.t > 3300 THEN 1000.0 / (380 + ((gs.t - 3300) * 100 / 300))
    WHEN (gs.t - 600) % 320 < 200 THEN 1000.0 / (345 + (sin(gs.t::float / 40) * 12)::int + (random() * 8)::int)
    ELSE 1000.0 / (440 + (random() * 20)::int)
  END
FROM workouts w, generate_series(0, 3600, 30) AS gs(t)
WHERE w.title = 'Track Session' AND w.date = '2026-02-11' AND w.sport = 'run'
  AND w.user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';

-- ========================================
-- RUN: Easy Run (Feb 13) — 3600s, easy Zone 2
-- ========================================
INSERT INTO session_metrics (workout_id, timestamp_offset_seconds, heart_rate, pace_sec_per_km, cadence, speed_mps)
SELECT w.id, gs.t,
  -- HR: gentle warm up, steady ~130-140, slight drift
  CASE
    WHEN gs.t < 600  THEN 100 + (gs.t * 32 / 600)
    WHEN gs.t > 3300 THEN 138 - ((gs.t - 3300) * 15 / 300)
    ELSE 130 + (gs.t::float / 3600 * 8)::int + (sin(gs.t::float / 150) * 5)::int + (random() * 4)::int
  END,
  -- Pace: easy ~415-430 sec/km, very steady
  CASE
    WHEN gs.t < 600  THEN 460 - (gs.t * 35 / 600)
    WHEN gs.t > 3300 THEN 425 + ((gs.t - 3300) * 30 / 300)
    ELSE 418 + (sin(gs.t::float / 200) * 8)::int + (random() * 6)::int
  END,
  -- Cadence: easy ~170-174
  CASE
    WHEN gs.t < 600  THEN 168 + (gs.t * 4 / 600)
    WHEN gs.t > 3300 THEN 172 - ((gs.t - 3300) * 3 / 300)
    ELSE 171 + (sin(gs.t::float / 120) * 2)::int + (random() * 2)::int
  END,
  -- Speed
  CASE
    WHEN gs.t < 600  THEN 1000.0 / (460 - (gs.t * 35 / 600))
    WHEN gs.t > 3300 THEN 1000.0 / (425 + ((gs.t - 3300) * 30 / 300))
    ELSE 1000.0 / (418 + (sin(gs.t::float / 200) * 8)::int + (random() * 6)::int)
  END
FROM workouts w, generate_series(0, 3600, 30) AS gs(t)
WHERE w.title = 'Easy Run' AND w.date = '2026-02-13' AND w.sport = 'run'
  AND w.user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';

-- ========================================
-- RUN: Long Run (Feb 6) — 7200s, progressive long run
-- ========================================
INSERT INTO session_metrics (workout_id, timestamp_offset_seconds, heart_rate, pace_sec_per_km, cadence, speed_mps)
SELECT w.id, gs.t,
  -- HR: slow progressive rise from 120→165 over 2hrs
  CASE
    WHEN gs.t < 600  THEN 108 + (gs.t * 18 / 600)
    WHEN gs.t > 6900 THEN 162 - ((gs.t - 6900) * 25 / 300)
    ELSE 126 + (gs.t::float / 7200 * 36)::int + (sin(gs.t::float / 180) * 6)::int + (random() * 4)::int
  END,
  -- Pace: negative split, starts ~430 ends ~395
  CASE
    WHEN gs.t < 600  THEN 470 - (gs.t * 40 / 600)
    WHEN gs.t > 6900 THEN 400 + ((gs.t - 6900) * 50 / 300)
    ELSE 430 - (gs.t::float / 7200 * 35)::int + (sin(gs.t::float / 200) * 10)::int + (random() * 8)::int
  END,
  -- Cadence: gradually increases 168→175
  CASE
    WHEN gs.t < 600  THEN 165 + (gs.t * 3 / 600)
    WHEN gs.t > 6900 THEN 174 - ((gs.t - 6900) * 4 / 300)
    ELSE 168 + (gs.t::float / 7200 * 7)::int + (random() * 2)::int
  END,
  -- Speed
  CASE
    WHEN gs.t < 600  THEN 1000.0 / (470 - (gs.t * 40 / 600))
    WHEN gs.t > 6900 THEN 1000.0 / (400 + ((gs.t - 6900) * 50 / 300))
    ELSE 1000.0 / (430 - (gs.t::float / 7200 * 35)::int + (sin(gs.t::float / 200) * 10)::int + (random() * 8)::int)
  END
FROM workouts w, generate_series(0, 7200, 30) AS gs(t)
WHERE w.title = 'Long Run' AND w.date = '2026-02-06' AND w.sport = 'run'
  AND w.user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';

-- ========================================
-- BIKE: Long Ride (Feb 12) — 12600s, 3.5hr with climbing
-- Sample every 60s to keep row count reasonable for long ride
-- ========================================
INSERT INTO session_metrics (workout_id, timestamp_offset_seconds, heart_rate, power_watts, pace_sec_per_km, cadence, speed_mps)
SELECT w.id, gs.t,
  -- HR: long steady endurance with occasional climbs
  CASE
    WHEN gs.t < 900  THEN 105 + (gs.t * 30 / 900)
    WHEN gs.t > 12000 THEN 152 - ((gs.t - 12000) * 25 / 600)
    -- Simulate 3 hill efforts (around 3600, 7200, 10800)
    WHEN gs.t BETWEEN 3300 AND 4200 THEN 152 + (sin((gs.t - 3300)::float / 60) * 10)::int + (random() * 5)::int
    WHEN gs.t BETWEEN 6900 AND 7800 THEN 155 + (sin((gs.t - 6900)::float / 60) * 10)::int + (random() * 5)::int
    WHEN gs.t BETWEEN 10200 AND 11100 THEN 158 + (sin((gs.t - 10200)::float / 60) * 8)::int + (random() * 5)::int
    ELSE 135 + (gs.t::float / 12600 * 10)::int + (sin(gs.t::float / 200) * 6)::int + (random() * 4)::int
  END,
  -- Power: endurance ~170-190W, climbs spike to 220-260W
  CASE
    WHEN gs.t < 900  THEN 110 + (gs.t * 65 / 900)
    WHEN gs.t > 12000 THEN 175 - ((gs.t - 12000) * 55 / 600)
    WHEN gs.t BETWEEN 3300 AND 4200 THEN 230 + (sin((gs.t - 3300)::float / 50) * 20)::int + (random() * 12)::int
    WHEN gs.t BETWEEN 6900 AND 7800 THEN 240 + (sin((gs.t - 6900)::float / 50) * 18)::int + (random() * 12)::int
    WHEN gs.t BETWEEN 10200 AND 11100 THEN 245 + (sin((gs.t - 10200)::float / 50) * 15)::int + (random() * 12)::int
    ELSE 175 + (sin(gs.t::float / 150) * 12)::int + (random() * 10)::int
  END,
  -- Pace: endurance ~140-150, climbs ~170-200 (slower uphill)
  CASE
    WHEN gs.t < 900  THEN 190 - (gs.t * 45 / 900)
    WHEN gs.t > 12000 THEN 145 + ((gs.t - 12000) * 35 / 600)
    WHEN gs.t BETWEEN 3300 AND 4200 THEN 175 + (sin((gs.t - 3300)::float / 60) * 15)::int + (random() * 8)::int
    WHEN gs.t BETWEEN 6900 AND 7800 THEN 180 + (sin((gs.t - 6900)::float / 60) * 12)::int + (random() * 8)::int
    WHEN gs.t BETWEEN 10200 AND 11100 THEN 185 + (sin((gs.t - 10200)::float / 60) * 10)::int + (random() * 8)::int
    ELSE 140 + (sin(gs.t::float / 180) * 8)::int + (random() * 6)::int
  END,
  -- Cadence: endurance 82-88, climbs drop to 72-78
  CASE
    WHEN gs.t < 900  THEN 72 + (gs.t * 13 / 900)
    WHEN gs.t > 12000 THEN 84 - ((gs.t - 12000) * 8 / 600)
    WHEN gs.t BETWEEN 3300 AND 4200 THEN 74 + (random() * 4)::int
    WHEN gs.t BETWEEN 6900 AND 7800 THEN 72 + (random() * 4)::int
    WHEN gs.t BETWEEN 10200 AND 11100 THEN 73 + (random() * 4)::int
    ELSE 84 + (sin(gs.t::float / 100) * 3)::int + (random() * 2)::int
  END,
  -- Speed: endurance ~7-7.5 m/s, climbs ~5-6 m/s
  CASE
    WHEN gs.t < 900  THEN 5.0 + (gs.t * 2.3 / 900)
    WHEN gs.t > 12000 THEN 7.0 - ((gs.t - 12000) * 1.5 / 600)
    WHEN gs.t BETWEEN 3300 AND 4200 THEN 5.5 + sin((gs.t - 3300)::float / 60) * 0.5 + random() * 0.3
    WHEN gs.t BETWEEN 6900 AND 7800 THEN 5.3 + sin((gs.t - 6900)::float / 60) * 0.5 + random() * 0.3
    WHEN gs.t BETWEEN 10200 AND 11100 THEN 5.2 + sin((gs.t - 10200)::float / 60) * 0.4 + random() * 0.3
    ELSE 7.0 + sin(gs.t::float / 180) * 0.4 + random() * 0.3
  END
FROM workouts w, generate_series(0, 12600, 60) AS gs(t)
WHERE w.title = 'Long Ride' AND w.date = '2026-02-12' AND w.sport = 'bike'
  AND w.user_id = '2968d8dd-4d9c-4f28-a3de-e435bf01cd28';
