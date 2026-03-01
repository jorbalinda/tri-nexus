-- HR zones per workout
CREATE TABLE workout_hr_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  zone_number int NOT NULL CHECK (zone_number >= 1 AND zone_number <= 5),
  min_hr int NOT NULL,
  max_hr int NOT NULL,
  time_in_zone_seconds int NOT NULL DEFAULT 0,
  percent_of_total numeric NOT NULL DEFAULT 0,
  UNIQUE(workout_id, zone_number)
);

CREATE INDEX idx_hr_zones_workout ON workout_hr_zones(workout_id);

-- Power zones per workout
CREATE TABLE workout_power_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  zone_number int NOT NULL CHECK (zone_number >= 1 AND zone_number <= 7),
  min_watts int NOT NULL,
  max_watts int NOT NULL,
  time_in_zone_seconds int NOT NULL DEFAULT 0,
  percent_of_total numeric NOT NULL DEFAULT 0,
  UNIQUE(workout_id, zone_number)
);

CREATE INDEX idx_power_zones_workout ON workout_power_zones(workout_id);

-- RLS via workouts ownership
ALTER TABLE workout_hr_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_power_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY hr_zones_select ON workout_hr_zones FOR SELECT
  USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY hr_zones_insert ON workout_hr_zones FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY hr_zones_update ON workout_hr_zones FOR UPDATE
  USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY hr_zones_delete ON workout_hr_zones FOR DELETE
  USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_id AND workouts.user_id = auth.uid()));

CREATE POLICY power_zones_select ON workout_power_zones FOR SELECT
  USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY power_zones_insert ON workout_power_zones FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY power_zones_update ON workout_power_zones FOR UPDATE
  USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY power_zones_delete ON workout_power_zones FOR DELETE
  USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_id AND workouts.user_id = auth.uid()));
