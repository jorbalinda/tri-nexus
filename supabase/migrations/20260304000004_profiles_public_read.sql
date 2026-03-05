-- Allow any authenticated user to read public profile fields
-- Required for social features (display names, avatars in feeds/leaderboards)
CREATE POLICY "Public profiles are readable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);
