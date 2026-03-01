-- Extend session_metrics with location and environment data
ALTER TABLE session_metrics
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  ADD COLUMN IF NOT EXISTS altitude_meters numeric,
  ADD COLUMN IF NOT EXISTS temperature_c numeric;
