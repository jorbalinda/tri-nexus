-- Fix RLS policy for race_courses: use auth.uid() IS NOT NULL instead of auth.role()
DROP POLICY IF EXISTS "Authenticated users can read global courses" ON race_courses;
CREATE POLICY "Authenticated users can read global courses"
  ON race_courses FOR SELECT
  USING (user_id IS NULL AND auth.uid() IS NOT NULL);
