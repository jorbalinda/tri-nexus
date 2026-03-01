-- Fix water_type constraint on target_races.
-- The original migration (20260222000002) created the column with
-- CHECK (water_type IN ('open_water', 'pool')), which is too restrictive.
-- The later migration (20260228000009) tried to add the correct constraint
-- but used ADD COLUMN IF NOT EXISTS, so the old constraint persisted.
-- This migration drops the old constraint and adds the correct one.

ALTER TABLE target_races DROP CONSTRAINT IF EXISTS target_races_water_type_check;
ALTER TABLE target_races ADD CONSTRAINT target_races_water_type_check
  CHECK (water_type IN ('pool', 'lake', 'river', 'bay', 'ocean'));
