-- Phase 1: Add new profile columns for Race Day
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight_kg numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'non_binary'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/New_York';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
