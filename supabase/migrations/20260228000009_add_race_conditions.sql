-- ---------------------------------------------------------------------------
-- Add race conditions columns to target_races
-- These columns were in the TypeScript interface but missing from the DB,
-- plus new fields for Projection Engine V2.
-- ---------------------------------------------------------------------------

-- Columns already in TS type but missing from DB
ALTER TABLE target_races ADD COLUMN IF NOT EXISTS race_type text DEFAULT 'triathlon'
  CHECK (race_type IN ('triathlon', 'duathlon', 'aquabike'));
ALTER TABLE target_races ADD COLUMN IF NOT EXISTS water_type text
  CHECK (water_type IN ('pool', 'lake', 'river', 'bay', 'ocean'));
ALTER TABLE target_races ADD COLUMN IF NOT EXISTS wetsuit boolean DEFAULT false;
ALTER TABLE target_races ADD COLUMN IF NOT EXISTS expected_temp_f numeric;
ALTER TABLE target_races ADD COLUMN IF NOT EXISTS gun_start_time timestamptz;

-- New V2 columns for race conditions
ALTER TABLE target_races ADD COLUMN IF NOT EXISTS altitude_ft numeric;
ALTER TABLE target_races ADD COLUMN IF NOT EXISTS course_profile text
  CHECK (course_profile IN ('flat', 'rolling', 'hilly', 'mountainous'));
ALTER TABLE target_races ADD COLUMN IF NOT EXISTS swim_type text
  CHECK (swim_type IN ('pool', 'lake', 'river', 'bay', 'ocean'));
