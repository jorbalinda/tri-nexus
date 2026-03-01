-- ---------------------------------------------------------------------------
-- Drop unused workout columns — never written or read anywhere
-- ---------------------------------------------------------------------------

ALTER TABLE workouts DROP COLUMN IF EXISTS avg_stride_length_cm;
ALTER TABLE workouts DROP COLUMN IF EXISTS avg_ground_contact_ms;
ALTER TABLE workouts DROP COLUMN IF EXISTS avg_vertical_oscillation_cm;
ALTER TABLE workouts DROP COLUMN IF EXISTS stroke_type;
