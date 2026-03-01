ALTER TABLE workouts ADD COLUMN IF NOT EXISTS tss_source text
  CHECK (tss_source IN ('device', 'power', 'pace', 'hr', 'rpe'));
