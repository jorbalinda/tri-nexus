-- Phase 2: Add source tracking to workouts
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual' CHECK (source IN ('manual', 'garmin', 'file_upload', 'strava'));
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS external_url text;
