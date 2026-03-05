-- Allow followers to view the target races of people they follow
-- (needed for the race leaderboard feature)
CREATE POLICY "Followers can view followed users target races"
  ON target_races FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM follows
      WHERE follower_id = auth.uid()
        AND following_id = target_races.user_id
    )
  );
