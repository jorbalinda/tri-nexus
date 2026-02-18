-- TRI-NEXUS Supabase Schema
-- Run this in the Supabase SQL Editor

-- ========================================
-- PROFILES (auto-created on signup)
-- ========================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  unit_system text DEFAULT 'imperial' CHECK (unit_system IN ('imperial', 'metric')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========================================
-- WORKOUTS
-- ========================================
CREATE TABLE workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE DEFAULT auth.uid(),
  sport text NOT NULL CHECK (sport IN ('swim', 'bike', 'run', 'brick')),
  title text NOT NULL,
  date date NOT NULL,
  duration_seconds integer,
  distance_meters numeric,
  -- Swim
  pool_length_meters numeric,
  stroke_type text,
  swolf numeric,
  -- Bike
  avg_power_watts numeric,
  normalized_power numeric,
  tss numeric,
  avg_cadence_rpm numeric,
  elevation_gain_meters numeric,
  -- Run
  avg_pace_sec_per_km numeric,
  avg_cadence_spm numeric,
  -- Universal
  avg_hr integer,
  max_hr integer,
  calories integer,
  rpe numeric CHECK (rpe >= 1 AND rpe <= 10),
  notes text,
  blocks jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- SESSION METRICS (time-series)
-- ========================================
CREATE TABLE session_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE,
  timestamp_offset_seconds integer NOT NULL,
  heart_rate integer,
  power_watts numeric,
  pace_sec_per_km numeric,
  cadence numeric,
  speed_mps numeric
);

ALTER TABLE session_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own session metrics"
  ON session_metrics FOR SELECT USING (
    EXISTS (SELECT 1 FROM workouts WHERE workouts.id = session_metrics.workout_id AND workouts.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own session metrics"
  ON session_metrics FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM workouts WHERE workouts.id = session_metrics.workout_id AND workouts.user_id = auth.uid())
  );

-- ========================================
-- MANUAL LOGS
-- ========================================
CREATE TABLE manual_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE DEFAULT auth.uid(),
  workout_id uuid REFERENCES workouts(id) ON DELETE SET NULL,
  date date NOT NULL,
  category text NOT NULL CHECK (category IN ('metabolic', 'physiological', 'environmental')),
  log_type text NOT NULL,
  value numeric NOT NULL,
  unit text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE manual_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own manual logs"
  ON manual_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own manual logs"
  ON manual_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own manual logs"
  ON manual_logs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own manual logs"
  ON manual_logs FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- UPLOADED FILES
-- ========================================
CREATE TABLE uploaded_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE DEFAULT auth.uid(),
  file_name text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('fit', 'csv', 'pdf')),
  file_size_bytes integer,
  storage_path text,
  status text DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'parsed', 'error')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files"
  ON uploaded_files FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files"
  ON uploaded_files FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX idx_workouts_user_date ON workouts(user_id, date DESC);
CREATE INDEX idx_workouts_user_sport ON workouts(user_id, sport);
CREATE INDEX idx_manual_logs_user_date ON manual_logs(user_id, date DESC);
CREATE INDEX idx_session_metrics_workout ON session_metrics(workout_id, timestamp_offset_seconds);
