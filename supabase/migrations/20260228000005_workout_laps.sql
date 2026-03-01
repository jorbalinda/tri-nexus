-- Lap splits per workout
CREATE TABLE workout_laps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  lap_number int NOT NULL,
  start_offset_seconds numeric,
  duration_seconds numeric,
  distance_meters numeric,
  avg_hr int,
  max_hr int,
  avg_power_watts numeric,
  avg_pace_sec_per_km numeric,
  avg_cadence numeric,
  elevation_gain_meters numeric,
  UNIQUE(workout_id, lap_number)
);

CREATE INDEX idx_laps_workout ON workout_laps(workout_id);

-- RLS via workouts ownership
ALTER TABLE workout_laps ENABLE ROW LEVEL SECURITY;

CREATE POLICY laps_select ON workout_laps FOR SELECT
  USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY laps_insert ON workout_laps FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY laps_update ON workout_laps FOR UPDATE
  USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY laps_delete ON workout_laps FOR DELETE
  USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_id AND workouts.user_id = auth.uid()));
