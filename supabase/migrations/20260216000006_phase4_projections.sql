-- Phase 4: Projections table (append-only for history)
CREATE TABLE IF NOT EXISTS projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE DEFAULT auth.uid(),
  target_race_id uuid REFERENCES target_races(id) ON DELETE CASCADE,
  projected_at timestamptz DEFAULT now(),
  swim_seconds integer NOT NULL,
  t1_seconds integer NOT NULL,
  bike_seconds integer NOT NULL,
  t2_seconds integer NOT NULL,
  run_seconds integer NOT NULL,
  optimistic_seconds integer NOT NULL,
  realistic_seconds integer NOT NULL,
  conservative_seconds integer NOT NULL,
  confidence_score integer NOT NULL,
  data_points_used integer NOT NULL,
  fitness_snapshot jsonb,
  weather_adjustment jsonb,
  is_revealed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE projections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projections" ON projections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projections" ON projections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
