-- Add weight_unit preference to equipment_profiles
ALTER TABLE equipment_profiles ADD COLUMN IF NOT EXISTS weight_unit text NOT NULL DEFAULT 'kg'
  CHECK (weight_unit IN ('kg', 'lbs'));
