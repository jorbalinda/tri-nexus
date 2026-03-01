-- Extend profiles with training threshold fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS resting_heart_rate int,
  ADD COLUMN IF NOT EXISTS max_heart_rate int,
  ADD COLUMN IF NOT EXISTS ftp_watts int,
  ADD COLUMN IF NOT EXISTS threshold_pace_swim numeric,   -- seconds per 100m
  ADD COLUMN IF NOT EXISTS threshold_pace_run numeric,    -- seconds per km
  ADD COLUMN IF NOT EXISTS height_cm numeric;

-- Constraints
ALTER TABLE profiles
  ADD CONSTRAINT chk_resting_hr CHECK (resting_heart_rate IS NULL OR (resting_heart_rate >= 25 AND resting_heart_rate <= 120)),
  ADD CONSTRAINT chk_max_hr CHECK (max_heart_rate IS NULL OR (max_heart_rate >= 100 AND max_heart_rate <= 250)),
  ADD CONSTRAINT chk_ftp CHECK (ftp_watts IS NULL OR ftp_watts > 0),
  ADD CONSTRAINT chk_swim_pace CHECK (threshold_pace_swim IS NULL OR threshold_pace_swim > 0),
  ADD CONSTRAINT chk_run_pace CHECK (threshold_pace_run IS NULL OR threshold_pace_run > 0),
  ADD CONSTRAINT chk_height CHECK (height_cm IS NULL OR (height_cm >= 50 AND height_cm <= 300));
