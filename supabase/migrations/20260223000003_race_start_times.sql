-- ---------------------------------------------------------------------------
-- Add typical start time and timezone to race_courses
-- ---------------------------------------------------------------------------

ALTER TABLE race_courses ADD COLUMN IF NOT EXISTS typical_start_time TEXT;
ALTER TABLE race_courses ADD COLUMN IF NOT EXISTS timezone TEXT;

-- ---------------------------------------------------------------------------
-- Backfill verified start times and timezones
-- Sources: official athlete guides, TRI247, Triathlete.com, local tourism
-- boards, race websites. NULL = not verified, user must fill in.
-- Start times are first-athlete-in-water (typically pro men rolling start).
-- ---------------------------------------------------------------------------

-- ==========================================================================
-- IRONMAN 140.6
-- ==========================================================================

UPDATE race_courses SET typical_start_time = '06:25', timezone = 'Pacific/Honolulu'
  WHERE name = 'IRONMAN World Championship Kona' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:50', timezone = 'Europe/Paris'
  WHERE name = 'IRONMAN World Championship Nice' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:25', timezone = 'Europe/Berlin'
  WHERE name = 'IRONMAN Frankfurt' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:40', timezone = 'Australia/Brisbane'
  WHERE name = 'IRONMAN Cairns' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:30', timezone = 'America/New_York'
  WHERE name = 'IRONMAN Lake Placid' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:00', timezone = 'America/Chicago'
  WHERE name = 'IRONMAN Wisconsin' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:40', timezone = 'America/Chicago'
  WHERE name = 'IRONMAN Florida' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:40', timezone = 'America/Phoenix'
  WHERE name = 'IRONMAN Arizona' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:00', timezone = 'America/Cancun'
  WHERE name = 'IRONMAN Cozumel' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:25', timezone = 'America/Chicago'
  WHERE name = 'IRONMAN Texas' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:40', timezone = 'America/Chicago'
  WHERE name = 'IRONMAN Tulsa' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:35', timezone = 'America/New_York'
  WHERE name = 'IRONMAN Maryland' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:35', timezone = 'America/Los_Angeles'
  WHERE name = 'IRONMAN California' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:47', timezone = 'Pacific/Auckland'
  WHERE name = 'IRONMAN New Zealand' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:30', timezone = 'Africa/Johannesburg'
  WHERE name = 'IRONMAN South Africa' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:00', timezone = 'Europe/Copenhagen'
  WHERE name = 'IRONMAN Copenhagen' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:15', timezone = 'Europe/London'
  WHERE name = 'IRONMAN Bolton' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:55', timezone = 'Europe/Madrid'
  WHERE name = 'IRONMAN Barcelona' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '08:00', timezone = 'Europe/Madrid'
  WHERE name = 'IRONMAN Vitoria-Gasteiz' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:15', timezone = 'Europe/Berlin'
  WHERE name = 'IRONMAN Hamburg' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:00', timezone = 'Atlantic/Canary'
  WHERE name = 'IRONMAN Lanzarote' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '05:55', timezone = 'Asia/Taipei'
  WHERE name = 'IRONMAN Taiwan' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:45', timezone = 'Australia/Perth'
  WHERE name = 'IRONMAN Western Australia' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:30', timezone = 'Europe/Rome'
  WHERE name = 'IRONMAN Italy Emilia Romagna' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:00', timezone = 'America/Anchorage'
  WHERE name = 'IRONMAN Alaska' AND user_id IS NULL;

-- ==========================================================================
-- IRONMAN 70.3
-- ==========================================================================

UPDATE race_courses SET typical_start_time = '06:50', timezone = 'America/New_York'
  WHERE name = 'IRONMAN 70.3 Chattanooga' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:40', timezone = 'America/Los_Angeles'
  WHERE name = 'IRONMAN 70.3 Oceanside' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:00', timezone = 'America/Chicago'
  WHERE name = 'IRONMAN 70.3 Gulf Coast' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:00', timezone = 'America/New_York'
  WHERE name = 'IRONMAN 70.3 Maine' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:00', timezone = 'America/New_York'
  WHERE name = 'IRONMAN 70.3 Eagleman' AND user_id IS NULL;

-- IRONMAN 70.3 Ohio: NOT FOUND — left NULL for user

UPDATE race_courses SET typical_start_time = '06:30', timezone = 'America/Detroit'
  WHERE name = 'IRONMAN 70.3 Steelhead' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:00', timezone = 'America/New_York'
  WHERE name = 'IRONMAN 70.3 Augusta' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:00', timezone = 'America/Los_Angeles'
  WHERE name = 'IRONMAN 70.3 Indian Wells' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:00', timezone = 'America/Boise'
  WHERE name = 'IRONMAN 70.3 Coeur d''Alene' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:00', timezone = 'America/Los_Angeles'
  WHERE name = 'IRONMAN 70.3 Santa Cruz' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:50', timezone = 'Europe/Madrid'
  WHERE name = 'IRONMAN 70.3 Marbella' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:00', timezone = 'Asia/Dubai'
  WHERE name = 'IRONMAN 70.3 Dubai' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:00', timezone = 'Pacific/Auckland'
  WHERE name = 'IRONMAN 70.3 Taupo' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:00', timezone = 'Australia/Brisbane'
  WHERE name = 'IRONMAN 70.3 Sunshine Coast' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:30', timezone = 'Australia/Melbourne'
  WHERE name = 'IRONMAN 70.3 Geelong' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:30', timezone = 'America/Chicago'
  WHERE name = 'IRONMAN 70.3 Lubbock' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:00', timezone = 'America/Vancouver'
  WHERE name = 'IRONMAN 70.3 Victoria' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:50', timezone = 'America/Toronto'
  WHERE name = 'IRONMAN 70.3 Mont-Tremblant' AND user_id IS NULL;

-- IRONMAN 70.3 Davos: NOT FOUND — left NULL for user

UPDATE race_courses SET typical_start_time = '07:40', timezone = 'Europe/Lisbon'
  WHERE name = 'IRONMAN 70.3 Cascais' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:50', timezone = 'America/Puerto_Rico'
  WHERE name = 'IRONMAN 70.3 Puerto Rico' AND user_id IS NULL;

-- IRONMAN 70.3 Cartagena: NOT FOUND — left NULL for user
UPDATE race_courses SET timezone = 'America/Bogota'
  WHERE name = 'IRONMAN 70.3 Cartagena' AND user_id IS NULL;

-- IRONMAN 70.3 South Africa: NOT FOUND start time — timezone only
UPDATE race_courses SET timezone = 'Africa/Johannesburg'
  WHERE name = 'IRONMAN 70.3 South Africa' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:20', timezone = 'Asia/Bahrain'
  WHERE name = 'IRONMAN 70.3 Bahrain' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:00', timezone = 'America/New_York'
  WHERE name = 'IRONMAN 70.3 Musselman' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:05', timezone = 'America/Denver'
  WHERE name = 'IRONMAN 70.3 Boulder' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:30', timezone = 'America/Chicago'
  WHERE name = 'IRONMAN 70.3 Waco' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:30', timezone = 'America/Chicago'
  WHERE name = 'IRONMAN 70.3 Des Moines' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:15', timezone = 'America/Los_Angeles'
  WHERE name = 'IRONMAN 70.3 Oregon' AND user_id IS NULL;

-- ==========================================================================
-- World Triathlon Championship Series
-- Note: WTCS events have varied start times (afternoon/evening common for
-- TV broadcast). Times listed are first elite wave of the day.
-- ==========================================================================

UPDATE race_courses SET typical_start_time = '14:00', timezone = 'Asia/Dubai'
  WHERE name = 'World Triathlon Championship Series Abu Dhabi' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '10:15', timezone = 'Asia/Tokyo'
  WHERE name = 'World Triathlon Championship Series Yokohama' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '16:35', timezone = 'Europe/Berlin'
  WHERE name = 'World Triathlon Championship Series Hamburg' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '11:36', timezone = 'America/Toronto'
  WHERE name = 'World Triathlon Championship Series Montreal' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '14:00', timezone = 'Europe/London'
  WHERE name = 'World Triathlon Championship Series Leeds' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '08:00', timezone = 'Europe/Paris'
  WHERE name = 'World Triathlon Championship Series Paris' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '11:00', timezone = 'Atlantic/Bermuda'
  WHERE name = 'World Triathlon Championship Series Bermuda' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '11:00', timezone = 'Europe/Rome'
  WHERE name = 'World Triathlon Championship Series Cagliari' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '14:00', timezone = 'Europe/London'
  WHERE name = 'World Triathlon Championship Series Sunderland' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '17:00', timezone = 'Europe/Madrid'
  WHERE name = 'World Triathlon Championship Series Valencia' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '16:45', timezone = 'Europe/Madrid'
  WHERE name = 'World Triathlon Championship Series Pontevedra' AND user_id IS NULL;

-- WTC Grand Final: varies by host city, setting most recent (Torremolinos)
UPDATE race_courses SET typical_start_time = '15:15', timezone = 'Europe/Madrid'
  WHERE name = 'World Triathlon Championship Finals' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '08:00', timezone = 'Asia/Tokyo'
  WHERE name = 'World Triathlon Series Miyazaki' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '08:00', timezone = 'Asia/Seoul'
  WHERE name = 'World Triathlon Series Tongyeong' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '14:00', timezone = 'Africa/Johannesburg'
  WHERE name = 'World Triathlon Series Cape Town' AND user_id IS NULL;

-- ==========================================================================
-- Challenge Family
-- ==========================================================================

UPDATE race_courses SET typical_start_time = '06:30', timezone = 'Europe/Berlin'
  WHERE name = 'Challenge Roth' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:05', timezone = 'America/New_York'
  WHERE name = 'Challenge Daytona' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:30', timezone = 'America/Cancun'
  WHERE name = 'Challenge Cancun' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '13:15', timezone = 'America/New_York'
  WHERE name = 'Challenge Miami' AND user_id IS NULL;

-- Challenge Wanaka: NOT FOUND — left NULL for user
UPDATE race_courses SET timezone = 'Pacific/Auckland'
  WHERE name = 'Challenge Wanaka' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:10', timezone = 'Europe/Amsterdam'
  WHERE name = 'Challenge Almere-Amsterdam' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:20', timezone = 'Australia/Melbourne'
  WHERE name = 'Challenge Shepparton' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '08:30', timezone = 'Europe/Vienna'
  WHERE name = 'Challenge Walchsee' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:00', timezone = 'Europe/Vienna'
  WHERE name = 'Challenge St. Polten' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '08:00', timezone = 'Europe/Warsaw'
  WHERE name = 'Challenge Gdansk' AND user_id IS NULL;

-- ==========================================================================
-- PTO / T100
-- ==========================================================================

UPDATE race_courses SET typical_start_time = '15:15', timezone = 'Asia/Singapore'
  WHERE name = 'T100 Triathlon World Tour Singapore' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:00', timezone = 'America/Los_Angeles'
  WHERE name = 'T100 Triathlon World Tour San Francisco' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '08:15', timezone = 'America/Los_Angeles'
  WHERE name = 'T100 Triathlon World Tour Las Vegas' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '14:00', timezone = 'Europe/London'
  WHERE name = 'T100 Triathlon World Tour London' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '08:00', timezone = 'Europe/Madrid'
  WHERE name = 'T100 Triathlon World Tour Ibiza' AND user_id IS NULL;

-- ==========================================================================
-- Other Notable Races
-- ==========================================================================

UPDATE race_courses SET typical_start_time = '07:15', timezone = 'America/Los_Angeles'
  WHERE name = 'Escape from Alcatraz Triathlon' AND user_id IS NULL;

-- NYC Triathlon: NOT FOUND (race format changed significantly) — left NULL
UPDATE race_courses SET timezone = 'America/New_York'
  WHERE name = 'NYC Triathlon' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '08:00', timezone = 'America/Los_Angeles'
  WHERE name = 'Wildflower Triathlon' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:50', timezone = 'America/New_York'
  WHERE name = 'St. Anthony''s Triathlon' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:25', timezone = 'America/Los_Angeles'
  WHERE name = 'Vineman Triathlon' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:30', timezone = 'America/Chicago'
  WHERE name = 'Buffalo Springs Lake 70.3' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:45', timezone = 'America/Chicago'
  WHERE name = 'LifeTime Tri Cap Tex' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '08:00', timezone = 'America/Chicago'
  WHERE name = 'Door County Triathlon' AND user_id IS NULL;

-- Alcatraz Sprint: NOT FOUND — left NULL
UPDATE race_courses SET timezone = 'America/Los_Angeles'
  WHERE name = 'Alcatraz Triathlon (Sprint)' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:15', timezone = 'Australia/Brisbane'
  WHERE name = 'Noosa Triathlon' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:30', timezone = 'Asia/Jerusalem'
  WHERE name = 'Israman Triathlon' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '08:00', timezone = 'Pacific/Honolulu'
  WHERE name = 'XTERRA World Championship' AND user_id IS NULL;

-- 70.3 World Championship: varies by host city, using most recent
UPDATE race_courses SET typical_start_time = '07:00', timezone = 'Pacific/Auckland'
  WHERE name = 'Ironman 70.3 World Championship' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:00', timezone = 'America/Chicago'
  WHERE name = 'Chicago Triathlon' AND user_id IS NULL;

-- SOS Triathlon: NOT FOUND — left NULL
UPDATE race_courses SET timezone = 'America/New_York'
  WHERE name = 'SOS Triathlon' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '07:00', timezone = 'America/Los_Angeles'
  WHERE name = 'Malibu Triathlon' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:30', timezone = 'Pacific/Honolulu'
  WHERE name = 'Honu Half Triathlon' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:45', timezone = 'America/New_York'
  WHERE name = 'Timberman 70.3' AND user_id IS NULL;

UPDATE race_courses SET typical_start_time = '06:10', timezone = 'America/Merida'
  WHERE name = 'Ironman 70.3 Campeche' AND user_id IS NULL;

-- Challenge Cape Town: NOT FOUND (discontinued) — left NULL
UPDATE race_courses SET timezone = 'Africa/Johannesburg'
  WHERE name = 'Challenge Cape Town' AND user_id IS NULL;
