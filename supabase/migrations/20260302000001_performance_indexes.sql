-- Performance indexes for frequently queried columns

-- target_races: user_id is queried on every request
CREATE INDEX IF NOT EXISTS idx_target_races_user_id ON target_races(user_id);

-- target_races: race_date used in weather cron and range queries
CREATE INDEX IF NOT EXISTS idx_target_races_race_date ON target_races(race_date);

-- nutrition_plans: race_id used in RLS policies and queries
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_race_id ON nutrition_plans(race_id);

-- device_connections: user_id used in list queries
CREATE INDEX IF NOT EXISTS idx_device_connections_user_id ON device_connections(user_id);

-- race_plan_checklist: race_plan_id foreign key
CREATE INDEX IF NOT EXISTS idx_race_plan_checklist_race_plan_id ON race_plan_checklist(race_plan_id);

-- workout_hr_zones: compound index for zone lookups
CREATE INDEX IF NOT EXISTS idx_hr_zones_workout_zone ON workout_hr_zones(workout_id, zone_number);

-- workout_power_zones: compound index for zone lookups
CREATE INDEX IF NOT EXISTS idx_power_zones_workout_zone ON workout_power_zones(workout_id, zone_number);

-- timeline_events: partial index for incomplete events
CREATE INDEX IF NOT EXISTS idx_timeline_events_incomplete
  ON timeline_events(race_id, scheduled_time)
  WHERE is_completed = false;
