-- Social Features Migration
-- Adds follow system, activity feed, fitness snapshots, age group benchmarks,
-- race catalogue, and user target races linking table

-- 1. Follows
CREATE TABLE IF NOT EXISTS follows (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS follows_follower_idx  ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_idx ON follows(following_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view follows they are party to"
  ON follows FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- 2. Activity Feed
CREATE TABLE IF NOT EXISTS activity_feed (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('swim', 'bike', 'run', 'brick', 'race_registered', 'pr')),
  workout_id    uuid REFERENCES workouts(id) ON DELETE SET NULL,
  metadata      jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_feed_user_idx    ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS activity_feed_created_idx ON activity_feed(created_at DESC);

ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Users see their own feed and feed of people they follow
CREATE POLICY "Users can view own and followed activity"
  ON activity_feed FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM follows
      WHERE follower_id = auth.uid()
        AND following_id = activity_feed.user_id
    )
  );

CREATE POLICY "Users can insert own activity"
  ON activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity"
  ON activity_feed FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Fitness Snapshots
CREATE TABLE IF NOT EXISTS fitness_snapshots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date   date NOT NULL DEFAULT CURRENT_DATE,
  css_sec_per_100m numeric(6,2),  -- Critical Swim Speed (sec per 100m)
  ftp_watts       integer,         -- Functional Threshold Power
  run_pace_sec_per_km numeric(6,2), -- Threshold run pace (sec per km)
  ctl             numeric(6,2),    -- Chronic Training Load
  atl             numeric(6,2),    -- Acute Training Load
  tsb             numeric(6,2),    -- Training Stress Balance
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS fitness_snapshots_user_idx ON fitness_snapshots(user_id, snapshot_date DESC);

ALTER TABLE fitness_snapshots ENABLE ROW LEVEL SECURITY;

-- Own snapshots always visible; followers can see snapshots
CREATE POLICY "Users can view own snapshots"
  ON fitness_snapshots FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM follows
      WHERE follower_id = auth.uid()
        AND following_id = fitness_snapshots.user_id
    )
  );

CREATE POLICY "Users can upsert own snapshots"
  ON fitness_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own snapshots"
  ON fitness_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Age Group Benchmarks
-- Reference data seeded below; no user writes
CREATE TABLE IF NOT EXISTS age_group_benchmarks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gender       text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  age_group    text NOT NULL,  -- e.g. '25-29', '30-34'
  discipline   text NOT NULL CHECK (discipline IN ('swim', 'bike', 'run')),
  p25          numeric(8,4),
  p50          numeric(8,4),
  p75          numeric(8,4),
  p90          numeric(8,4),
  unit         text NOT NULL,  -- 'sec_per_100m', 'watts', 'sec_per_km'
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (gender, age_group, discipline)
);

ALTER TABLE age_group_benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Benchmarks are publicly readable" ON age_group_benchmarks FOR SELECT USING (true);

-- 5. Races Catalogue (global race reference, distinct from user's target_races)
CREATE TABLE IF NOT EXISTS races_catalogue (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  location     text,
  country_code char(2),
  race_date    date,
  distance     text NOT NULL CHECK (distance IN ('sprint', 'olympic', 'half', 'full')),
  swim_m       integer,
  bike_km      numeric(6,2),
  run_km       numeric(6,2),
  website_url  text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS races_catalogue_date_idx ON races_catalogue(race_date);

ALTER TABLE races_catalogue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Race catalogue is publicly readable" ON races_catalogue FOR SELECT USING (true);

-- 6. User Target Races (links user to race catalogue for leaderboard)
CREATE TABLE IF NOT EXISTS user_target_races (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  race_id         uuid NOT NULL REFERENCES races_catalogue(id) ON DELETE CASCADE,
  goal_finish_sec integer,   -- user's personal goal finish time in seconds
  registered_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, race_id)
);

CREATE INDEX IF NOT EXISTS user_target_races_user_idx ON user_target_races(user_id);
CREATE INDEX IF NOT EXISTS user_target_races_race_idx ON user_target_races(race_id);

ALTER TABLE user_target_races ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations and friends registrations"
  ON user_target_races FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM follows
      WHERE follower_id = auth.uid()
        AND following_id = user_target_races.user_id
    )
  );

CREATE POLICY "Users can register for races"
  ON user_target_races FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unregister"
  ON user_target_races FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Seed Age Group Benchmarks ───────────────────────────────────────────────
-- CSS in sec/100m (lower = faster), FTP in watts (higher = better), run pace sec/km (lower = faster)
-- Values are representative age-group triathlete benchmarks

INSERT INTO age_group_benchmarks (gender, age_group, discipline, p25, p50, p75, p90, unit) VALUES
-- Male swim CSS (sec per 100m)
('male', '18-24', 'swim', 105, 95, 85, 78, 'sec_per_100m'),
('male', '25-29', 'swim', 107, 97, 87, 80, 'sec_per_100m'),
('male', '30-34', 'swim', 110, 100, 90, 82, 'sec_per_100m'),
('male', '35-39', 'swim', 113, 103, 93, 85, 'sec_per_100m'),
('male', '40-44', 'swim', 116, 106, 96, 88, 'sec_per_100m'),
('male', '45-49', 'swim', 120, 110, 100, 92, 'sec_per_100m'),
('male', '50-54', 'swim', 125, 115, 105, 96, 'sec_per_100m'),
('male', '55-59', 'swim', 130, 120, 110, 100, 'sec_per_100m'),
-- Male bike FTP (watts)
('male', '18-24', 'bike', 200, 240, 280, 320, 'watts'),
('male', '25-29', 'bike', 210, 250, 290, 330, 'watts'),
('male', '30-34', 'bike', 205, 245, 285, 325, 'watts'),
('male', '35-39', 'bike', 200, 240, 278, 318, 'watts'),
('male', '40-44', 'bike', 193, 233, 270, 310, 'watts'),
('male', '45-49', 'bike', 185, 225, 262, 300, 'watts'),
('male', '50-54', 'bike', 176, 215, 252, 290, 'watts'),
('male', '55-59', 'bike', 167, 205, 240, 278, 'watts'),
-- Male run pace (sec per km) — lower = faster
('male', '18-24', 'run', 290, 270, 250, 235, 'sec_per_km'),
('male', '25-29', 'run', 295, 275, 255, 238, 'sec_per_km'),
('male', '30-34', 'run', 300, 280, 260, 242, 'sec_per_km'),
('male', '35-39', 'run', 308, 288, 268, 250, 'sec_per_km'),
('male', '40-44', 'run', 316, 296, 276, 258, 'sec_per_km'),
('male', '45-49', 'run', 326, 306, 286, 268, 'sec_per_km'),
('male', '50-54', 'run', 338, 318, 298, 280, 'sec_per_km'),
('male', '55-59', 'run', 352, 332, 312, 294, 'sec_per_km'),
-- Female swim CSS (sec per 100m)
('female', '18-24', 'swim', 115, 105, 95, 87, 'sec_per_100m'),
('female', '25-29', 'swim', 117, 107, 97, 89, 'sec_per_100m'),
('female', '30-34', 'swim', 120, 110, 100, 92, 'sec_per_100m'),
('female', '35-39', 'swim', 123, 113, 103, 95, 'sec_per_100m'),
('female', '40-44', 'swim', 126, 116, 106, 98, 'sec_per_100m'),
('female', '45-49', 'swim', 130, 120, 110, 102, 'sec_per_100m'),
('female', '50-54', 'swim', 135, 125, 115, 106, 'sec_per_100m'),
('female', '55-59', 'swim', 140, 130, 120, 111, 'sec_per_100m'),
-- Female bike FTP (watts)
('female', '18-24', 'bike', 155, 185, 220, 255, 'watts'),
('female', '25-29', 'bike', 160, 192, 228, 263, 'watts'),
('female', '30-34', 'bike', 158, 190, 225, 260, 'watts'),
('female', '35-39', 'bike', 154, 185, 220, 254, 'watts'),
('female', '40-44', 'bike', 149, 178, 213, 246, 'watts'),
('female', '45-49', 'bike', 143, 172, 205, 237, 'watts'),
('female', '50-54', 'bike', 136, 164, 196, 227, 'watts'),
('female', '55-59', 'bike', 129, 156, 187, 217, 'watts'),
-- Female run pace (sec per km)
('female', '18-24', 'run', 325, 305, 285, 268, 'sec_per_km'),
('female', '25-29', 'run', 330, 310, 290, 272, 'sec_per_km'),
('female', '30-34', 'run', 336, 316, 296, 278, 'sec_per_km'),
('female', '35-39', 'run', 344, 324, 304, 286, 'sec_per_km'),
('female', '40-44', 'run', 354, 334, 314, 296, 'sec_per_km'),
('female', '45-49', 'run', 365, 345, 325, 307, 'sec_per_km'),
('female', '50-54', 'run', 378, 358, 338, 320, 'sec_per_km'),
('female', '55-59', 'run', 393, 373, 353, 335, 'sec_per_km'),
-- Other/non-binary (midpoint of male/female)
('other', '18-24', 'swim', 110, 100, 90, 83, 'sec_per_100m'),
('other', '25-29', 'swim', 112, 102, 92, 85, 'sec_per_100m'),
('other', '30-34', 'swim', 115, 105, 95, 87, 'sec_per_100m'),
('other', '35-39', 'swim', 118, 108, 98, 90, 'sec_per_100m'),
('other', '40-44', 'swim', 121, 111, 101, 93, 'sec_per_100m'),
('other', '45-49', 'swim', 125, 115, 105, 97, 'sec_per_100m'),
('other', '50-54', 'swim', 130, 120, 110, 101, 'sec_per_100m'),
('other', '55-59', 'swim', 135, 125, 115, 106, 'sec_per_100m'),
('other', '18-24', 'bike', 178, 213, 250, 288, 'watts'),
('other', '25-29', 'bike', 185, 221, 259, 297, 'watts'),
('other', '30-34', 'bike', 182, 218, 255, 293, 'watts'),
('other', '35-39', 'bike', 177, 213, 249, 286, 'watts'),
('other', '40-44', 'bike', 171, 206, 242, 278, 'watts'),
('other', '45-49', 'bike', 164, 199, 234, 269, 'watts'),
('other', '50-54', 'bike', 156, 190, 224, 259, 'watts'),
('other', '55-59', 'bike', 148, 181, 214, 248, 'watts'),
('other', '18-24', 'run', 308, 288, 268, 252, 'sec_per_km'),
('other', '25-29', 'run', 313, 293, 273, 255, 'sec_per_km'),
('other', '30-34', 'run', 318, 298, 278, 260, 'sec_per_km'),
('other', '35-39', 'run', 326, 306, 286, 268, 'sec_per_km'),
('other', '40-44', 'run', 335, 315, 295, 277, 'sec_per_km'),
('other', '45-49', 'run', 346, 326, 306, 288, 'sec_per_km'),
('other', '50-54', 'run', 358, 338, 318, 300, 'sec_per_km'),
('other', '55-59', 'run', 373, 353, 333, 315, 'sec_per_km')
ON CONFLICT (gender, age_group, discipline) DO NOTHING;
