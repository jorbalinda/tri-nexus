-- Add status to follows: pending (awaiting approval) or accepted
ALTER TABLE follows ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'accepted'
  CHECK (status IN ('pending', 'accepted'));

CREATE INDEX IF NOT EXISTS follows_status_idx ON follows(following_id, status);

-- ── Update RLS on data tables to require accepted follows ─────────────────────

-- fitness_snapshots
DROP POLICY IF EXISTS "Users can view own snapshots" ON fitness_snapshots;
CREATE POLICY "Users can view own snapshots"
  ON fitness_snapshots FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM follows
      WHERE follower_id = auth.uid()
        AND following_id = fitness_snapshots.user_id
        AND status = 'accepted'
    )
  );

-- activity_feed
DROP POLICY IF EXISTS "Users can view own and followed activity" ON activity_feed;
CREATE POLICY "Users can view own and followed activity"
  ON activity_feed FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM follows
      WHERE follower_id = auth.uid()
        AND following_id = activity_feed.user_id
        AND status = 'accepted'
    )
  );

-- target_races (social view for leaderboard)
DROP POLICY IF EXISTS "Followers can view followed users target races" ON target_races;
CREATE POLICY "Followers can view followed users target races"
  ON target_races FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM follows
      WHERE follower_id = auth.uid()
        AND following_id = target_races.user_id
        AND status = 'accepted'
    )
  );

-- follows: users can see their own sent requests AND incoming pending requests
DROP POLICY IF EXISTS "Users can view follows they are party to" ON follows;
CREATE POLICY "Users can view follows they are party to"
  ON follows FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- follows: allow updating status (for accepting/rejecting)
CREATE POLICY "Users can update incoming follow requests"
  ON follows FOR UPDATE
  USING (auth.uid() = following_id);
