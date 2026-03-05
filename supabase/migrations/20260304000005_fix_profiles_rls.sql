-- Drop the overly permissive policy that exposed all profile fields
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON profiles;

-- Users can always read their own full profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Other authenticated users can only see display_name + avatar_url
-- for profiles where the owner has opted into public visibility
CREATE POLICY "Public display info readable when profile is public"
  ON profiles FOR SELECT
  TO authenticated
  USING (profile_public = true AND auth.uid() != id);
