-- Add unique username field to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text;

-- Unique index (case-insensitive, nulls not counted as duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
  ON profiles (lower(username))
  WHERE username IS NOT NULL;

-- Format constraint: 3–20 chars, lowercase letters/numbers/underscores only
ALTER TABLE profiles
  ADD CONSTRAINT profiles_username_format
  CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,20}$');

-- Public RPC function to check availability from the browser (no auth needed)
CREATE OR REPLACE FUNCTION is_username_available(p_username text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM profiles WHERE lower(username) = lower(p_username)
  )
$$;

GRANT EXECUTE ON FUNCTION is_username_available TO authenticated, anon;
