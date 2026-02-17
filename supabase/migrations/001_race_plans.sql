-- Race plans table
CREATE TABLE race_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Race identity
  race_name TEXT NOT NULL,
  race_date DATE,
  race_series TEXT NOT NULL DEFAULT 'local',

  -- Athlete classification
  athlete_classification TEXT NOT NULL DEFAULT 'age_grouper',
  age_group TEXT,
  gender TEXT,

  -- Race distance
  race_distance TEXT NOT NULL,
  custom_swim_distance_m INTEGER,
  custom_bike_distance_km NUMERIC,
  custom_run_distance_km NUMERIC,

  -- Goal
  goal_type TEXT NOT NULL,
  goal_time_seconds INTEGER,

  -- Qualification specifics
  qualification_target JSONB,

  -- Conditions
  conditions JSONB,

  -- Generated plan data
  pacing_plan JSONB,
  nutrition_plan JSONB,
  equipment_plan JSONB,
  mindset_plan JSONB,

  -- Fitness snapshot at time of generation
  fitness_snapshot JSONB,

  estimated_finish_seconds INTEGER,
  estimated_finish_optimistic INTEGER,
  estimated_finish_conservative INTEGER,
  estimated_qualification_competitive BOOLEAN,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Qualification standards reference table (updated annually)
CREATE TABLE qualification_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  championship TEXT NOT NULL,
  qualifying_year INTEGER NOT NULL,
  gender TEXT NOT NULL,
  age_group TEXT NOT NULL,
  standard_multiplier NUMERIC,
  benchmark_time_seconds INTEGER,
  estimated_cutoff_seconds INTEGER,
  source_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historical qualification data
CREATE TABLE qualification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_name TEXT NOT NULL,
  race_date DATE NOT NULL,
  championship TEXT NOT NULL,
  gender TEXT NOT NULL,
  age_group TEXT NOT NULL,
  qualifying_time_seconds INTEGER,
  winner_time_seconds INTEGER,
  slots_available INTEGER,
  slots_accepted INTEGER,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment checklist tracking
CREATE TABLE race_plan_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_plan_id UUID REFERENCES race_plans(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row level security
ALTER TABLE race_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_plan_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualification_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualification_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own race plans"
  ON race_plans FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD their own checklist items"
  ON race_plan_checklist FOR ALL
  USING (
    race_plan_id IN (
      SELECT id FROM race_plans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can read qualification standards"
  ON qualification_standards FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read qualification history"
  ON qualification_history FOR SELECT
  USING (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Seed: 2026 IRONMAN Kona Standards (age-grading multipliers)
-- Source: Rolling 5-year average of top 20% finishers per AG at Kona 2021-2025
-- ---------------------------------------------------------------------------
INSERT INTO qualification_standards (championship, qualifying_year, gender, age_group, standard_multiplier, benchmark_time_seconds, estimated_cutoff_seconds, source_note) VALUES
-- Male Kona
('kona', 2026, 'male', '18-24', 1.000, 32400, 34200, 'Rolling 5yr avg top 20% M18-24 Kona'),
('kona', 2026, 'male', '25-29', 1.000, 32400, 34200, 'Rolling 5yr avg top 20% M25-29 Kona'),
('kona', 2026, 'male', '30-34', 1.005, 32800, 34600, 'Rolling 5yr avg top 20% M30-34 Kona'),
('kona', 2026, 'male', '35-39', 1.020, 33200, 35000, 'Rolling 5yr avg top 20% M35-39 Kona'),
('kona', 2026, 'male', '40-44', 1.045, 34000, 35800, 'Rolling 5yr avg top 20% M40-44 Kona'),
('kona', 2026, 'male', '45-49', 1.075, 35100, 37000, 'Rolling 5yr avg top 20% M45-49 Kona'),
('kona', 2026, 'male', '50-54', 1.115, 36600, 38400, 'Rolling 5yr avg top 20% M50-54 Kona'),
('kona', 2026, 'male', '55-59', 1.165, 38400, 40200, 'Rolling 5yr avg top 20% M55-59 Kona'),
('kona', 2026, 'male', '60-64', 1.230, 40800, 42600, 'Rolling 5yr avg top 20% M60-64 Kona'),
('kona', 2026, 'male', '65-69', 1.310, 43800, 45600, 'Rolling 5yr avg top 20% M65-69 Kona'),
('kona', 2026, 'male', '70-74', 1.410, 47400, 49200, 'Rolling 5yr avg top 20% M70-74 Kona'),
('kona', 2026, 'male', '75-79', 1.530, 52200, 54000, 'Rolling 5yr avg top 20% M75-79 Kona'),
-- Female Kona
('kona', 2026, 'female', '18-24', 1.000, 36000, 37800, 'Rolling 5yr avg top 20% F18-24 Kona'),
('kona', 2026, 'female', '25-29', 1.000, 36000, 37800, 'Rolling 5yr avg top 20% F25-29 Kona'),
('kona', 2026, 'female', '30-34', 1.005, 36400, 38200, 'Rolling 5yr avg top 20% F30-34 Kona'),
('kona', 2026, 'female', '35-39', 1.020, 36900, 38700, 'Rolling 5yr avg top 20% F35-39 Kona'),
('kona', 2026, 'female', '40-44', 1.045, 37800, 39600, 'Rolling 5yr avg top 20% F40-44 Kona'),
('kona', 2026, 'female', '45-49', 1.075, 39000, 40800, 'Rolling 5yr avg top 20% F45-49 Kona'),
('kona', 2026, 'female', '50-54', 1.115, 40500, 42300, 'Rolling 5yr avg top 20% F50-54 Kona'),
('kona', 2026, 'female', '55-59', 1.165, 42600, 44400, 'Rolling 5yr avg top 20% F55-59 Kona'),
('kona', 2026, 'female', '60-64', 1.230, 45000, 46800, 'Rolling 5yr avg top 20% F60-64 Kona'),
('kona', 2026, 'female', '65-69', 1.310, 48600, 50400, 'Rolling 5yr avg top 20% F65-69 Kona'),
('kona', 2026, 'female', '70-74', 1.410, 52800, 54600, 'Rolling 5yr avg top 20% F70-74 Kona'),
('kona', 2026, 'female', '75-79', 1.530, 57600, 59400, 'Rolling 5yr avg top 20% F75-79 Kona'),
-- Male 70.3 Worlds
('70.3_worlds', 2026, 'male', '18-24', 1.000, 15600, 16500, 'Rolling 5yr avg top 20% M18-24 70.3 Worlds'),
('70.3_worlds', 2026, 'male', '25-29', 1.000, 15600, 16500, 'Rolling 5yr avg top 20% M25-29 70.3 Worlds'),
('70.3_worlds', 2026, 'male', '30-34', 1.005, 15800, 16700, 'Rolling 5yr avg top 20% M30-34 70.3 Worlds'),
('70.3_worlds', 2026, 'male', '35-39', 1.015, 16000, 16900, 'Rolling 5yr avg top 20% M35-39 70.3 Worlds'),
('70.3_worlds', 2026, 'male', '40-44', 1.035, 16400, 17300, 'Rolling 5yr avg top 20% M40-44 70.3 Worlds'),
('70.3_worlds', 2026, 'male', '45-49', 1.060, 16900, 17800, 'Rolling 5yr avg top 20% M45-49 70.3 Worlds'),
('70.3_worlds', 2026, 'male', '50-54', 1.095, 17500, 18400, 'Rolling 5yr avg top 20% M50-54 70.3 Worlds'),
('70.3_worlds', 2026, 'male', '55-59', 1.140, 18300, 19200, 'Rolling 5yr avg top 20% M55-59 70.3 Worlds'),
('70.3_worlds', 2026, 'male', '60-64', 1.200, 19500, 20400, 'Rolling 5yr avg top 20% M60-64 70.3 Worlds'),
('70.3_worlds', 2026, 'male', '65-69', 1.275, 21000, 21900, 'Rolling 5yr avg top 20% M65-69 70.3 Worlds'),
('70.3_worlds', 2026, 'male', '70-74', 1.370, 22800, 23700, 'Rolling 5yr avg top 20% M70-74 70.3 Worlds'),
('70.3_worlds', 2026, 'male', '75-79', 1.480, 25200, 26100, 'Rolling 5yr avg top 20% M75-79 70.3 Worlds'),
-- Female 70.3 Worlds
('70.3_worlds', 2026, 'female', '18-24', 1.000, 17400, 18300, 'Rolling 5yr avg top 20% F18-24 70.3 Worlds'),
('70.3_worlds', 2026, 'female', '25-29', 1.000, 17400, 18300, 'Rolling 5yr avg top 20% F25-29 70.3 Worlds'),
('70.3_worlds', 2026, 'female', '30-34', 1.005, 17600, 18500, 'Rolling 5yr avg top 20% F30-34 70.3 Worlds'),
('70.3_worlds', 2026, 'female', '35-39', 1.015, 17800, 18700, 'Rolling 5yr avg top 20% F35-39 70.3 Worlds'),
('70.3_worlds', 2026, 'female', '40-44', 1.035, 18200, 19100, 'Rolling 5yr avg top 20% F40-44 70.3 Worlds'),
('70.3_worlds', 2026, 'female', '45-49', 1.060, 18700, 19600, 'Rolling 5yr avg top 20% F45-49 70.3 Worlds'),
('70.3_worlds', 2026, 'female', '50-54', 1.095, 19500, 20400, 'Rolling 5yr avg top 20% F50-54 70.3 Worlds'),
('70.3_worlds', 2026, 'female', '55-59', 1.140, 20400, 21300, 'Rolling 5yr avg top 20% F55-59 70.3 Worlds'),
('70.3_worlds', 2026, 'female', '60-64', 1.200, 21600, 22500, 'Rolling 5yr avg top 20% F60-64 70.3 Worlds'),
('70.3_worlds', 2026, 'female', '65-69', 1.275, 23400, 24300, 'Rolling 5yr avg top 20% F65-69 70.3 Worlds'),
('70.3_worlds', 2026, 'female', '70-74', 1.370, 25200, 26100, 'Rolling 5yr avg top 20% F70-74 70.3 Worlds'),
('70.3_worlds', 2026, 'female', '75-79', 1.480, 27600, 28500, 'Rolling 5yr avg top 20% F75-79 70.3 Worlds'),
-- World Triathlon AG Worlds (Sprint) estimated cutoffs
('wt_ag_sprint', 2026, 'male', '18-24', NULL, 3600, 3780, 'Est. top-18 cutoff USAT AG Nationals Sprint M18-24'),
('wt_ag_sprint', 2026, 'male', '25-29', NULL, 3600, 3780, 'Est. top-18 cutoff Sprint M25-29'),
('wt_ag_sprint', 2026, 'male', '30-34', NULL, 3660, 3840, 'Est. top-18 cutoff Sprint M30-34'),
('wt_ag_sprint', 2026, 'male', '35-39', NULL, 3720, 3900, 'Est. top-18 cutoff Sprint M35-39'),
('wt_ag_sprint', 2026, 'male', '40-44', NULL, 3840, 4020, 'Est. top-18 cutoff Sprint M40-44'),
('wt_ag_sprint', 2026, 'male', '45-49', NULL, 3960, 4200, 'Est. top-18 cutoff Sprint M45-49'),
('wt_ag_sprint', 2026, 'male', '50-54', NULL, 4200, 4440, 'Est. top-18 cutoff Sprint M50-54'),
('wt_ag_sprint', 2026, 'male', '55-59', NULL, 4500, 4740, 'Est. top-18 cutoff Sprint M55-59'),
('wt_ag_sprint', 2026, 'male', '60-64', NULL, 4800, 5100, 'Est. top-18 cutoff Sprint M60-64'),
('wt_ag_sprint', 2026, 'female', '18-24', NULL, 4200, 4380, 'Est. top-18 cutoff Sprint F18-24'),
('wt_ag_sprint', 2026, 'female', '25-29', NULL, 4200, 4380, 'Est. top-18 cutoff Sprint F25-29'),
('wt_ag_sprint', 2026, 'female', '30-34', NULL, 4260, 4440, 'Est. top-18 cutoff Sprint F30-34'),
('wt_ag_sprint', 2026, 'female', '35-39', NULL, 4320, 4500, 'Est. top-18 cutoff Sprint F35-39'),
('wt_ag_sprint', 2026, 'female', '40-44', NULL, 4500, 4680, 'Est. top-18 cutoff Sprint F40-44'),
('wt_ag_sprint', 2026, 'female', '45-49', NULL, 4680, 4920, 'Est. top-18 cutoff Sprint F45-49'),
('wt_ag_sprint', 2026, 'female', '50-54', NULL, 4920, 5160, 'Est. top-18 cutoff Sprint F50-54'),
('wt_ag_sprint', 2026, 'female', '55-59', NULL, 5280, 5520, 'Est. top-18 cutoff Sprint F55-59'),
('wt_ag_sprint', 2026, 'female', '60-64', NULL, 5640, 5940, 'Est. top-18 cutoff Sprint F60-64'),
-- World Triathlon AG Worlds (Standard/Olympic)
('wt_ag_standard', 2026, 'male', '18-24', NULL, 7200, 7560, 'Est. top-18 cutoff Standard M18-24'),
('wt_ag_standard', 2026, 'male', '25-29', NULL, 7200, 7560, 'Est. top-18 cutoff Standard M25-29'),
('wt_ag_standard', 2026, 'male', '30-34', NULL, 7320, 7680, 'Est. top-18 cutoff Standard M30-34'),
('wt_ag_standard', 2026, 'male', '35-39', NULL, 7500, 7860, 'Est. top-18 cutoff Standard M35-39'),
('wt_ag_standard', 2026, 'male', '40-44', NULL, 7800, 8160, 'Est. top-18 cutoff Standard M40-44'),
('wt_ag_standard', 2026, 'male', '45-49', NULL, 8100, 8460, 'Est. top-18 cutoff Standard M45-49'),
('wt_ag_standard', 2026, 'male', '50-54', NULL, 8460, 8820, 'Est. top-18 cutoff Standard M50-54'),
('wt_ag_standard', 2026, 'male', '55-59', NULL, 9000, 9360, 'Est. top-18 cutoff Standard M55-59'),
('wt_ag_standard', 2026, 'male', '60-64', NULL, 9600, 10020, 'Est. top-18 cutoff Standard M60-64'),
('wt_ag_standard', 2026, 'female', '18-24', NULL, 8400, 8760, 'Est. top-18 cutoff Standard F18-24'),
('wt_ag_standard', 2026, 'female', '25-29', NULL, 8400, 8760, 'Est. top-18 cutoff Standard F25-29'),
('wt_ag_standard', 2026, 'female', '30-34', NULL, 8520, 8880, 'Est. top-18 cutoff Standard F30-34'),
('wt_ag_standard', 2026, 'female', '35-39', NULL, 8700, 9060, 'Est. top-18 cutoff Standard F35-39'),
('wt_ag_standard', 2026, 'female', '40-44', NULL, 9000, 9360, 'Est. top-18 cutoff Standard F40-44'),
('wt_ag_standard', 2026, 'female', '45-49', NULL, 9360, 9720, 'Est. top-18 cutoff Standard F45-49'),
('wt_ag_standard', 2026, 'female', '50-54', NULL, 9780, 10200, 'Est. top-18 cutoff Standard F50-54'),
('wt_ag_standard', 2026, 'female', '55-59', NULL, 10500, 10920, 'Est. top-18 cutoff Standard F55-59'),
('wt_ag_standard', 2026, 'female', '60-64', NULL, 11400, 11820, 'Est. top-18 cutoff Standard F60-64');
