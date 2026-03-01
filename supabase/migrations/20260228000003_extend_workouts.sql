-- Extend workouts with additional fields
ALTER TABLE workouts
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS moving_time_seconds int,
  ADD COLUMN IF NOT EXISTS is_indoor boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS gear_id uuid REFERENCES gear(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS weather_temp_c numeric,
  ADD COLUMN IF NOT EXISTS weather_conditions text,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS max_power_watts numeric,
  ADD COLUMN IF NOT EXISTS intensity_factor numeric,
  ADD COLUMN IF NOT EXISTS avg_speed_mps numeric,
  ADD COLUMN IF NOT EXISTS max_speed_mps numeric,
  ADD COLUMN IF NOT EXISTS max_cadence numeric,
  ADD COLUMN IF NOT EXISTS total_descent_meters numeric,
  ADD COLUMN IF NOT EXISTS avg_stride_length_cm numeric,
  ADD COLUMN IF NOT EXISTS avg_ground_contact_ms numeric,
  ADD COLUMN IF NOT EXISTS avg_vertical_oscillation_cm numeric;

-- Index for active workouts (excludes soft-deleted)
CREATE INDEX idx_workouts_active ON workouts(user_id, date DESC) WHERE deleted_at IS NULL;

-- Deduplication index for external imports
CREATE UNIQUE INDEX idx_workouts_external_dedup ON workouts(user_id, source, external_id) WHERE external_id IS NOT NULL;
