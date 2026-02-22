-- Phase 5: Device connections table
CREATE TABLE IF NOT EXISTS device_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('garmin', 'strava', 'wahoo', 'coros')),
  access_token text NOT NULL,
  token_secret text,
  refresh_token text,
  token_expires_at timestamptz,
  external_user_id text,
  last_sync_at timestamptz,
  sync_status text DEFAULT 'active' CHECK (sync_status IN ('active', 'paused', 'error', 'disconnected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- RLS policies
ALTER TABLE device_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own device connections" ON device_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own device connections" ON device_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own device connections" ON device_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own device connections" ON device_connections
  FOR DELETE USING (auth.uid() = user_id);
