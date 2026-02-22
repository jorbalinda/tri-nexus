-- Phase 3: Target races table
CREATE TABLE IF NOT EXISTS target_races (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE DEFAULT auth.uid(),
  race_name text NOT NULL,
  race_date date NOT NULL,
  race_course_id uuid REFERENCES race_courses(id) ON DELETE SET NULL,
  race_distance text NOT NULL CHECK (race_distance IN ('sprint','olympic','70.3','140.6','custom')),
  priority text DEFAULT 'a' CHECK (priority IN ('a', 'b', 'c')),
  custom_swim_distance_m numeric,
  custom_bike_distance_km numeric,
  custom_run_distance_km numeric,
  gpx_course_data jsonb,
  goal_time_seconds integer,
  notes text,
  actual_finish_seconds integer,
  actual_swim_seconds integer,
  actual_bike_seconds integer,
  actual_run_seconds integer,
  actual_t1_seconds integer,
  actual_t2_seconds integer,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'race_week', 'completed', 'dns', 'dnf')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE target_races ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own target races" ON target_races
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own target races" ON target_races
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own target races" ON target_races
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own target races" ON target_races
  FOR DELETE USING (auth.uid() = user_id);
