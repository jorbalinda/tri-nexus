-- Phase 7: Subscriptions and equipment
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS equipment_details jsonb;
