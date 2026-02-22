-- Align database with full Race Day spec
-- Adds: equipment_profiles, sleep_logs, gear_items, nutrition_plans,
--        fueling_timeline, timeline_events, race_results
-- Updates: target_races (race_type, water_type, wetsuit, gun_start_time),
--          profiles (sweat_rate_lph, profile_public)

-- ============================================================
-- 1. Update profiles with spec fields
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sweat_rate_lph numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_public boolean DEFAULT true;

-- ============================================================
-- 2. Update target_races with spec fields
-- ============================================================
ALTER TABLE target_races ADD COLUMN IF NOT EXISTS race_type text DEFAULT 'triathlon' CHECK (race_type IN ('triathlon', 'duathlon', 'aquabike'));
ALTER TABLE target_races ADD COLUMN IF NOT EXISTS water_type text CHECK (water_type IN ('open_water', 'pool'));
ALTER TABLE target_races ADD COLUMN IF NOT EXISTS wetsuit boolean DEFAULT false;
ALTER TABLE target_races ADD COLUMN IF NOT EXISTS expected_temp_f integer;
ALTER TABLE target_races ADD COLUMN IF NOT EXISTS gun_start_time timestamptz;

-- ============================================================
-- 3. Equipment profiles (per race)
-- ============================================================
CREATE TABLE IF NOT EXISTS equipment_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id uuid REFERENCES target_races(id) ON DELETE CASCADE,
  bike_weight_kg numeric,
  bottle_weight_kg numeric,
  race_nutrition_weight_kg numeric,
  tire_pressure_front numeric,
  tire_pressure_rear numeric,
  cda numeric,
  cda_source text CHECK (cda_source IN ('wind_tunnel', 'estimated')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE equipment_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own equipment profiles" ON equipment_profiles
  FOR SELECT USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own equipment profiles" ON equipment_profiles
  FOR INSERT WITH CHECK (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own equipment profiles" ON equipment_profiles
  FOR UPDATE USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own equipment profiles" ON equipment_profiles
  FOR DELETE USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

-- ============================================================
-- 4. Sleep logs
-- ============================================================
CREATE TABLE IF NOT EXISTS sleep_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE DEFAULT auth.uid(),
  log_date date NOT NULL,
  sleep_score integer,
  duration_hours numeric,
  source text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sleep logs" ON sleep_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep logs" ON sleep_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep logs" ON sleep_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep logs" ON sleep_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, log_date DESC);

-- ============================================================
-- 5. Gear items (per race)
-- ============================================================
CREATE TABLE IF NOT EXISTS gear_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id uuid REFERENCES target_races(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('swim', 'bike', 'run', 'transition', 'post_race')),
  is_packed boolean DEFAULT false,
  is_required boolean DEFAULT true,
  is_custom boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gear_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gear items" ON gear_items
  FOR SELECT USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own gear items" ON gear_items
  FOR INSERT WITH CHECK (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own gear items" ON gear_items
  FOR UPDATE USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own gear items" ON gear_items
  FOR DELETE USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_gear_items_race ON gear_items(race_id);

-- ============================================================
-- 6. Nutrition plans (per race, per segment)
-- ============================================================
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id uuid REFERENCES target_races(id) ON DELETE CASCADE,
  segment text NOT NULL CHECK (segment IN ('bike', 'run')),
  carbs_per_hour_g integer,
  sodium_per_hour_mg integer,
  fluid_per_hour_oz integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nutrition plans" ON nutrition_plans
  FOR SELECT USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own nutrition plans" ON nutrition_plans
  FOR INSERT WITH CHECK (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own nutrition plans" ON nutrition_plans
  FOR UPDATE USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own nutrition plans" ON nutrition_plans
  FOR DELETE USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

-- ============================================================
-- 7. Fueling timeline entries
-- ============================================================
CREATE TABLE IF NOT EXISTS fueling_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrition_plan_id uuid REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  time_offset_minutes integer NOT NULL,
  instruction text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fueling_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fueling timeline" ON fueling_timeline
  FOR SELECT USING (nutrition_plan_id IN (
    SELECT np.id FROM nutrition_plans np
    JOIN target_races tr ON np.race_id = tr.id
    WHERE tr.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own fueling timeline" ON fueling_timeline
  FOR INSERT WITH CHECK (nutrition_plan_id IN (
    SELECT np.id FROM nutrition_plans np
    JOIN target_races tr ON np.race_id = tr.id
    WHERE tr.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own fueling timeline" ON fueling_timeline
  FOR UPDATE USING (nutrition_plan_id IN (
    SELECT np.id FROM nutrition_plans np
    JOIN target_races tr ON np.race_id = tr.id
    WHERE tr.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own fueling timeline" ON fueling_timeline
  FOR DELETE USING (nutrition_plan_id IN (
    SELECT np.id FROM nutrition_plans np
    JOIN target_races tr ON np.race_id = tr.id
    WHERE tr.user_id = auth.uid()
  ));

-- ============================================================
-- 8. Race week timeline events
-- ============================================================
CREATE TABLE IF NOT EXISTS timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id uuid REFERENCES target_races(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  scheduled_time timestamptz NOT NULL,
  event_type text CHECK (event_type IN ('logistics', 'nutrition', 'action')),
  is_custom boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own timeline events" ON timeline_events
  FOR SELECT USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own timeline events" ON timeline_events
  FOR INSERT WITH CHECK (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own timeline events" ON timeline_events
  FOR UPDATE USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own timeline events" ON timeline_events
  FOR DELETE USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_timeline_events_race ON timeline_events(race_id, scheduled_time);

-- ============================================================
-- 9. Race results (post-race)
-- ============================================================
CREATE TABLE IF NOT EXISTS race_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id uuid REFERENCES target_races(id) ON DELETE CASCADE UNIQUE,
  actual_swim_seconds integer,
  actual_t1_seconds integer,
  actual_bike_seconds integer,
  actual_t2_seconds integer,
  actual_run_seconds integer,
  actual_total_seconds integer,
  weather_notes text,
  mechanical_notes text,
  nutrition_notes text,
  overall_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own race results" ON race_results
  FOR SELECT USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own race results" ON race_results
  FOR INSERT WITH CHECK (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own race results" ON race_results
  FOR UPDATE USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own race results" ON race_results
  FOR DELETE USING (race_id IN (SELECT id FROM target_races WHERE user_id = auth.uid()));
