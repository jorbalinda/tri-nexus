-- HR Integration: Add LTHR per sport and max HR source tracking to profiles
-- Also add hr_adjustment JSONB column to projections

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS max_hr_source TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS lthr_swim INTEGER,
  ADD COLUMN IF NOT EXISTS lthr_bike INTEGER,
  ADD COLUMN IF NOT EXISTS lthr_run INTEGER;

ALTER TABLE projections
  ADD COLUMN IF NOT EXISTS hr_adjustment JSONB;
