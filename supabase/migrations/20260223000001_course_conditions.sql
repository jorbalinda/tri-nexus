-- ---------------------------------------------------------------------------
-- Course Conditions — elevation, road quality, and live weather
-- ---------------------------------------------------------------------------

-- Add new columns to race_courses
ALTER TABLE race_courses ADD COLUMN IF NOT EXISTS elevation_gain_m INTEGER;
ALTER TABLE race_courses ADD COLUMN IF NOT EXISTS road_quality TEXT NOT NULL DEFAULT 'good'
  CHECK (road_quality IN ('excellent', 'good', 'fair', 'poor'));

-- ---------------------------------------------------------------------------
-- race_weather table — one row per target race, upserted by cron
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS race_weather (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_race_id UUID REFERENCES target_races(id) ON DELETE CASCADE UNIQUE,
  temp_low_f INTEGER,
  temp_high_f INTEGER,
  humidity_pct INTEGER,
  wind_speed_mph NUMERIC,
  wind_direction_deg NUMERIC,
  water_temp_f INTEGER,
  description TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can read weather for their own races
ALTER TABLE race_weather ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'race_weather' AND policyname = 'Users can read own race weather') THEN
    CREATE POLICY "Users can read own race weather" ON race_weather
      FOR SELECT USING (
        target_race_id IN (
          SELECT id FROM target_races WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_race_weather_target_race ON race_weather(target_race_id);

-- ---------------------------------------------------------------------------
-- Backfill elevation_gain_m and road_quality for all seeded courses
-- Real-world data from race profiles, course descriptions, and tri databases
-- ---------------------------------------------------------------------------

-- ==========================================================================
-- IRONMAN 140.6 Courses
-- ==========================================================================

-- Kona: rolling lava fields, ~1,600m bike elevation gain
UPDATE race_courses SET elevation_gain_m = 1600, road_quality = 'good'
  WHERE name = 'IRONMAN World Championship Kona' AND user_id IS NULL;

-- Nice: Col de Vence, extremely mountainous ~2,500m gain
UPDATE race_courses SET elevation_gain_m = 2500, road_quality = 'good'
  WHERE name = 'IRONMAN World Championship Nice' AND user_id IS NULL;

-- Frankfurt: flat course, ~300m gain
UPDATE race_courses SET elevation_gain_m = 300, road_quality = 'excellent'
  WHERE name = 'IRONMAN Frankfurt' AND user_id IS NULL;

-- Cairns: rolling Captain Cook Hwy, ~1,000m gain
UPDATE race_courses SET elevation_gain_m = 1000, road_quality = 'good'
  WHERE name = 'IRONMAN Cairns' AND user_id IS NULL;

-- Lake Placid: Adirondack climbs, ~1,800m gain
UPDATE race_courses SET elevation_gain_m = 1800, road_quality = 'good'
  WHERE name = 'IRONMAN Lake Placid' AND user_id IS NULL;

-- Wisconsin: rolling farmland, ~1,300m gain
UPDATE race_courses SET elevation_gain_m = 1300, road_quality = 'good'
  WHERE name = 'IRONMAN Wisconsin' AND user_id IS NULL;

-- Florida: pancake flat, ~100m gain
UPDATE race_courses SET elevation_gain_m = 100, road_quality = 'good'
  WHERE name = 'IRONMAN Florida' AND user_id IS NULL;

-- Arizona: flat desert, ~400m gain
UPDATE race_courses SET elevation_gain_m = 400, road_quality = 'excellent'
  WHERE name = 'IRONMAN Arizona' AND user_id IS NULL;

-- Cozumel: flat island loop, ~50m gain
UPDATE race_courses SET elevation_gain_m = 50, road_quality = 'good'
  WHERE name = 'IRONMAN Cozumel' AND user_id IS NULL;

-- Texas: flat, ~200m gain
UPDATE race_courses SET elevation_gain_m = 200, road_quality = 'good'
  WHERE name = 'IRONMAN Texas' AND user_id IS NULL;

-- Tulsa: rolling Oklahoma, ~900m gain
UPDATE race_courses SET elevation_gain_m = 900, road_quality = 'good'
  WHERE name = 'IRONMAN Tulsa' AND user_id IS NULL;

-- Maryland: flat Eastern Shore, ~200m gain
UPDATE race_courses SET elevation_gain_m = 200, road_quality = 'good'
  WHERE name = 'IRONMAN Maryland' AND user_id IS NULL;

-- California: flat Sacramento Valley, ~300m gain
UPDATE race_courses SET elevation_gain_m = 300, road_quality = 'good'
  WHERE name = 'IRONMAN California' AND user_id IS NULL;

-- New Zealand: rolling volcanic plateau, ~1,200m gain
UPDATE race_courses SET elevation_gain_m = 1200, road_quality = 'good'
  WHERE name = 'IRONMAN New Zealand' AND user_id IS NULL;

-- South Africa: rolling N2 highway, ~1,100m gain
UPDATE race_courses SET elevation_gain_m = 1100, road_quality = 'fair'
  WHERE name = 'IRONMAN South Africa' AND user_id IS NULL;

-- Copenhagen: flat Danish countryside, ~200m gain
UPDATE race_courses SET elevation_gain_m = 200, road_quality = 'excellent'
  WHERE name = 'IRONMAN Copenhagen' AND user_id IS NULL;

-- Bolton: Pennine hills, ~1,700m gain
UPDATE race_courses SET elevation_gain_m = 1700, road_quality = 'fair'
  WHERE name = 'IRONMAN Bolton' AND user_id IS NULL;

-- Barcelona: rolling coastal, ~600m gain
UPDATE race_courses SET elevation_gain_m = 600, road_quality = 'excellent'
  WHERE name = 'IRONMAN Barcelona' AND user_id IS NULL;

-- Vitoria-Gasteiz: Basque mountain bike, ~1,500m gain
UPDATE race_courses SET elevation_gain_m = 1500, road_quality = 'good'
  WHERE name = 'IRONMAN Vitoria-Gasteiz' AND user_id IS NULL;

-- Hamburg: flat north Germany, ~150m gain
UPDATE race_courses SET elevation_gain_m = 150, road_quality = 'excellent'
  WHERE name = 'IRONMAN Hamburg' AND user_id IS NULL;

-- Lanzarote: volcanic terrain, ~2,500m+ gain (one of the hardest)
UPDATE race_courses SET elevation_gain_m = 2600, road_quality = 'fair'
  WHERE name = 'IRONMAN Lanzarote' AND user_id IS NULL;

-- Taiwan: flat island, ~150m gain
UPDATE race_courses SET elevation_gain_m = 150, road_quality = 'good'
  WHERE name = 'IRONMAN Taiwan' AND user_id IS NULL;

-- Western Australia: flat Busselton, ~200m gain
UPDATE race_courses SET elevation_gain_m = 200, road_quality = 'excellent'
  WHERE name = 'IRONMAN Western Australia' AND user_id IS NULL;

-- Italy Emilia Romagna: flat, ~150m gain
UPDATE race_courses SET elevation_gain_m = 150, road_quality = 'good'
  WHERE name = 'IRONMAN Italy Emilia Romagna' AND user_id IS NULL;

-- Alaska: hilly coastal, ~1,200m gain
UPDATE race_courses SET elevation_gain_m = 1200, road_quality = 'fair'
  WHERE name = 'IRONMAN Alaska' AND user_id IS NULL;

-- ==========================================================================
-- IRONMAN 70.3 Courses
-- ==========================================================================

-- Chattanooga: rolling Lookout Mountain, ~750m gain
UPDATE race_courses SET elevation_gain_m = 750, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Chattanooga' AND user_id IS NULL;

-- Oceanside: rolling Camp Pendleton, ~500m gain
UPDATE race_courses SET elevation_gain_m = 500, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Oceanside' AND user_id IS NULL;

-- Gulf Coast: flat, ~50m gain
UPDATE race_courses SET elevation_gain_m = 50, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Gulf Coast' AND user_id IS NULL;

-- Maine: rolling, ~450m gain
UPDATE race_courses SET elevation_gain_m = 450, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Maine' AND user_id IS NULL;

-- Eagleman: flat Eastern Shore, ~100m gain
UPDATE race_courses SET elevation_gain_m = 100, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Eagleman' AND user_id IS NULL;

-- Ohio: rolling central Ohio, ~450m gain
UPDATE race_courses SET elevation_gain_m = 450, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Ohio' AND user_id IS NULL;

-- Steelhead: rolling Michigan, ~500m gain
UPDATE race_courses SET elevation_gain_m = 500, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Steelhead' AND user_id IS NULL;

-- Augusta: rolling Georgia, ~400m gain
UPDATE race_courses SET elevation_gain_m = 400, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Augusta' AND user_id IS NULL;

-- Indian Wells: flat desert, ~100m gain
UPDATE race_courses SET elevation_gain_m = 100, road_quality = 'excellent'
  WHERE name = 'IRONMAN 70.3 Indian Wells' AND user_id IS NULL;

-- Coeur d'Alene: hilly Idaho, ~800m gain
UPDATE race_courses SET elevation_gain_m = 800, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Coeur d''Alene' AND user_id IS NULL;

-- Santa Cruz: Santa Cruz Mountains, ~900m gain
UPDATE race_courses SET elevation_gain_m = 900, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Santa Cruz' AND user_id IS NULL;

-- Marbella: Andalusian hills, ~700m gain
UPDATE race_courses SET elevation_gain_m = 700, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Marbella' AND user_id IS NULL;

-- Dubai: flat desert, ~50m gain
UPDATE race_courses SET elevation_gain_m = 50, road_quality = 'excellent'
  WHERE name = 'IRONMAN 70.3 Dubai' AND user_id IS NULL;

-- Taupo: rolling volcanic, ~600m gain
UPDATE race_courses SET elevation_gain_m = 600, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Taupo' AND user_id IS NULL;

-- Sunshine Coast: rolling hinterland, ~500m gain
UPDATE race_courses SET elevation_gain_m = 500, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Sunshine Coast' AND user_id IS NULL;

-- Geelong: rolling Great Ocean Road, ~550m gain
UPDATE race_courses SET elevation_gain_m = 550, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Geelong' AND user_id IS NULL;

-- Lubbock: flat with wind, ~150m gain
UPDATE race_courses SET elevation_gain_m = 150, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Lubbock' AND user_id IS NULL;

-- Victoria: rolling Vancouver Island, ~550m gain
UPDATE race_courses SET elevation_gain_m = 550, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Victoria' AND user_id IS NULL;

-- Mont-Tremblant: Laurentian Mountains, ~900m gain
UPDATE race_courses SET elevation_gain_m = 900, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Mont-Tremblant' AND user_id IS NULL;

-- Davos: Alpine passes, ~1,200m gain
UPDATE race_courses SET elevation_gain_m = 1200, road_quality = 'excellent'
  WHERE name = 'IRONMAN 70.3 Davos' AND user_id IS NULL;

-- Cascais: rolling Portuguese coast, ~500m gain
UPDATE race_courses SET elevation_gain_m = 500, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Cascais' AND user_id IS NULL;

-- Puerto Rico: flat coastal, ~100m gain
UPDATE race_courses SET elevation_gain_m = 100, road_quality = 'fair'
  WHERE name = 'IRONMAN 70.3 Puerto Rico' AND user_id IS NULL;

-- Cartagena: flat coastal, ~50m gain
UPDATE race_courses SET elevation_gain_m = 50, road_quality = 'fair'
  WHERE name = 'IRONMAN 70.3 Cartagena' AND user_id IS NULL;

-- South Africa (Durban): rolling KZN hills, ~600m gain
UPDATE race_courses SET elevation_gain_m = 600, road_quality = 'fair'
  WHERE name = 'IRONMAN 70.3 South Africa' AND user_id IS NULL;

-- Bahrain: flat desert + F1, ~50m gain
UPDATE race_courses SET elevation_gain_m = 50, road_quality = 'excellent'
  WHERE name = 'IRONMAN 70.3 Bahrain' AND user_id IS NULL;

-- Musselman: rolling Finger Lakes, ~700m gain
UPDATE race_courses SET elevation_gain_m = 700, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Musselman' AND user_id IS NULL;

-- Boulder: rolling foothills, ~600m gain
UPDATE race_courses SET elevation_gain_m = 600, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Boulder' AND user_id IS NULL;

-- Waco: flat Texas, ~150m gain
UPDATE race_courses SET elevation_gain_m = 150, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Waco' AND user_id IS NULL;

-- Des Moines: flat Iowa, ~200m gain
UPDATE race_courses SET elevation_gain_m = 200, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Des Moines' AND user_id IS NULL;

-- Oregon: rolling Willamette Valley, ~500m gain
UPDATE race_courses SET elevation_gain_m = 500, road_quality = 'good'
  WHERE name = 'IRONMAN 70.3 Oregon' AND user_id IS NULL;

-- ==========================================================================
-- World Triathlon Championship Series (Olympic / Sprint)
-- Bike elevation is much lower due to shorter 40km / 20km courses
-- ==========================================================================

-- Abu Dhabi: flat city circuit, ~50m gain
UPDATE race_courses SET elevation_gain_m = 50, road_quality = 'excellent'
  WHERE name = 'World Triathlon Championship Series Abu Dhabi' AND user_id IS NULL;

-- Yokohama: flat harbor, ~50m gain
UPDATE race_courses SET elevation_gain_m = 50, road_quality = 'excellent'
  WHERE name = 'World Triathlon Championship Series Yokohama' AND user_id IS NULL;

-- Hamburg: flat sprint, ~20m gain
UPDATE race_courses SET elevation_gain_m = 20, road_quality = 'excellent'
  WHERE name = 'World Triathlon Championship Series Hamburg' AND user_id IS NULL;

-- Montreal: flat island, ~50m gain
UPDATE race_courses SET elevation_gain_m = 50, road_quality = 'excellent'
  WHERE name = 'World Triathlon Championship Series Montreal' AND user_id IS NULL;

-- Leeds: hilly city, ~200m gain
UPDATE race_courses SET elevation_gain_m = 200, road_quality = 'good'
  WHERE name = 'World Triathlon Championship Series Leeds' AND user_id IS NULL;

-- Paris: flat Seine, ~50m gain
UPDATE race_courses SET elevation_gain_m = 50, road_quality = 'excellent'
  WHERE name = 'World Triathlon Championship Series Paris' AND user_id IS NULL;

-- Bermuda: hilly island, ~250m gain
UPDATE race_courses SET elevation_gain_m = 250, road_quality = 'good'
  WHERE name = 'World Triathlon Championship Series Bermuda' AND user_id IS NULL;

-- Cagliari: rolling Sardinian coast, ~100m gain
UPDATE race_courses SET elevation_gain_m = 100, road_quality = 'good'
  WHERE name = 'World Triathlon Championship Series Cagliari' AND user_id IS NULL;

-- Sunderland: rolling coastal, ~100m gain
UPDATE race_courses SET elevation_gain_m = 100, road_quality = 'good'
  WHERE name = 'World Triathlon Championship Series Sunderland' AND user_id IS NULL;

-- Valencia: flat coastal, ~30m gain
UPDATE race_courses SET elevation_gain_m = 30, road_quality = 'excellent'
  WHERE name = 'World Triathlon Championship Series Valencia' AND user_id IS NULL;

-- Pontevedra: rolling Galician hills, ~150m gain
UPDATE race_courses SET elevation_gain_m = 150, road_quality = 'good'
  WHERE name = 'World Triathlon Championship Series Pontevedra' AND user_id IS NULL;

-- Grand Final: average rolling, ~100m gain
UPDATE race_courses SET elevation_gain_m = 100, road_quality = 'good'
  WHERE name = 'World Triathlon Championship Finals' AND user_id IS NULL;

-- Miyazaki: flat coastal, ~30m gain
UPDATE race_courses SET elevation_gain_m = 30, road_quality = 'excellent'
  WHERE name = 'World Triathlon Series Miyazaki' AND user_id IS NULL;

-- Tongyeong: hilly Korean peninsula, ~250m gain
UPDATE race_courses SET elevation_gain_m = 250, road_quality = 'good'
  WHERE name = 'World Triathlon Series Tongyeong' AND user_id IS NULL;

-- Cape Town: rolling, ~150m gain
UPDATE race_courses SET elevation_gain_m = 150, road_quality = 'good'
  WHERE name = 'World Triathlon Series Cape Town' AND user_id IS NULL;

-- ==========================================================================
-- Challenge Family
-- ==========================================================================

-- Roth: rolling Franconian, ~900m gain
UPDATE race_courses SET elevation_gain_m = 900, road_quality = 'excellent'
  WHERE name = 'Challenge Roth' AND user_id IS NULL;

-- Daytona: flat, ~50m gain
UPDATE race_courses SET elevation_gain_m = 50, road_quality = 'excellent'
  WHERE name = 'Challenge Daytona' AND user_id IS NULL;

-- Cancun: flat hotel zone, ~30m gain
UPDATE race_courses SET elevation_gain_m = 30, road_quality = 'good'
  WHERE name = 'Challenge Cancun' AND user_id IS NULL;

-- Miami: flat, ~30m gain
UPDATE race_courses SET elevation_gain_m = 30, road_quality = 'good'
  WHERE name = 'Challenge Miami' AND user_id IS NULL;

-- Wanaka: Southern Alps, ~2,000m gain
UPDATE race_courses SET elevation_gain_m = 2000, road_quality = 'good'
  WHERE name = 'Challenge Wanaka' AND user_id IS NULL;

-- Almere-Amsterdam: dead flat polders, ~50m gain
UPDATE race_courses SET elevation_gain_m = 50, road_quality = 'excellent'
  WHERE name = 'Challenge Almere-Amsterdam' AND user_id IS NULL;

-- Shepparton: flat Victorian, ~100m gain
UPDATE race_courses SET elevation_gain_m = 100, road_quality = 'good'
  WHERE name = 'Challenge Shepparton' AND user_id IS NULL;

-- Walchsee: Austrian mountain passes, ~1,300m gain
UPDATE race_courses SET elevation_gain_m = 1300, road_quality = 'excellent'
  WHERE name = 'Challenge Walchsee' AND user_id IS NULL;

-- St. Polten: rolling Austrian hills, ~500m gain
UPDATE race_courses SET elevation_gain_m = 500, road_quality = 'excellent'
  WHERE name = 'Challenge St. Polten' AND user_id IS NULL;

-- Gdansk: flat Polish coast, ~100m gain
UPDATE race_courses SET elevation_gain_m = 100, road_quality = 'good'
  WHERE name = 'Challenge Gdansk' AND user_id IS NULL;

-- ==========================================================================
-- PTO / T100
-- ==========================================================================

-- Singapore: flat city, ~30m gain
UPDATE race_courses SET elevation_gain_m = 30, road_quality = 'excellent'
  WHERE name = 'T100 Triathlon World Tour Singapore' AND user_id IS NULL;

-- San Francisco: hilly streets, ~300m gain
UPDATE race_courses SET elevation_gain_m = 300, road_quality = 'good'
  WHERE name = 'T100 Triathlon World Tour San Francisco' AND user_id IS NULL;

-- Las Vegas: flat desert, ~100m gain
UPDATE race_courses SET elevation_gain_m = 100, road_quality = 'excellent'
  WHERE name = 'T100 Triathlon World Tour Las Vegas' AND user_id IS NULL;

-- London: flat Hyde Park, ~30m gain
UPDATE race_courses SET elevation_gain_m = 30, road_quality = 'excellent'
  WHERE name = 'T100 Triathlon World Tour London' AND user_id IS NULL;

-- Ibiza: rolling island, ~200m gain
UPDATE race_courses SET elevation_gain_m = 200, road_quality = 'good'
  WHERE name = 'T100 Triathlon World Tour Ibiza' AND user_id IS NULL;

-- ==========================================================================
-- Other Notable Races
-- ==========================================================================

-- Escape from Alcatraz: hilly SF, ~400m gain (shorter bike)
UPDATE race_courses SET elevation_gain_m = 400, road_quality = 'good'
  WHERE name = 'Escape from Alcatraz Triathlon' AND user_id IS NULL;

-- NYC Tri: flat Hudson, ~50m gain
UPDATE race_courses SET elevation_gain_m = 50, road_quality = 'good'
  WHERE name = 'NYC Triathlon' AND user_id IS NULL;

-- Wildflower: extremely hilly (Lynch Hill), ~800m gain on shorter bike
UPDATE race_courses SET elevation_gain_m = 800, road_quality = 'fair'
  WHERE name = 'Wildflower Triathlon' AND user_id IS NULL;

-- St. Anthony's: flat Florida, ~30m gain
UPDATE race_courses SET elevation_gain_m = 30, road_quality = 'good'
  WHERE name = 'St. Anthony''s Triathlon' AND user_id IS NULL;

-- Vineman: rolling wine country, ~600m gain
UPDATE race_courses SET elevation_gain_m = 600, road_quality = 'good'
  WHERE name = 'Vineman Triathlon' AND user_id IS NULL;

-- Buffalo Springs Lake: rolling Texas, ~350m gain
UPDATE race_courses SET elevation_gain_m = 350, road_quality = 'good'
  WHERE name = 'Buffalo Springs Lake 70.3' AND user_id IS NULL;

-- LifeTime Tri Cap Tex: rolling Austin, ~300m gain
UPDATE race_courses SET elevation_gain_m = 300, road_quality = 'good'
  WHERE name = 'LifeTime Tri Cap Tex' AND user_id IS NULL;

-- Door County: hilly peninsula, ~400m gain
UPDATE race_courses SET elevation_gain_m = 400, road_quality = 'good'
  WHERE name = 'Door County Triathlon' AND user_id IS NULL;

-- Alcatraz Sprint: hilly SF, ~200m gain (sprint bike)
UPDATE race_courses SET elevation_gain_m = 200, road_quality = 'good'
  WHERE name = 'Alcatraz Triathlon (Sprint)' AND user_id IS NULL;

-- Noosa: rolling Sunshine Coast, ~200m gain
UPDATE race_courses SET elevation_gain_m = 200, road_quality = 'good'
  WHERE name = 'Noosa Triathlon' AND user_id IS NULL;

-- Israman: rolling Negev, ~800m gain
UPDATE race_courses SET elevation_gain_m = 800, road_quality = 'good'
  WHERE name = 'Israman Triathlon' AND user_id IS NULL;

-- XTERRA: mountain bike trails, ~600m gain (off-road)
UPDATE race_courses SET elevation_gain_m = 600, road_quality = 'poor'
  WHERE name = 'XTERRA World Championship' AND user_id IS NULL;

-- 70.3 World Championship: rolling (varies), ~500m gain
UPDATE race_courses SET elevation_gain_m = 500, road_quality = 'good'
  WHERE name = 'Ironman 70.3 World Championship' AND user_id IS NULL;

-- Chicago: flat lakefront, ~50m gain
UPDATE race_courses SET elevation_gain_m = 50, road_quality = 'good'
  WHERE name = 'Chicago Triathlon' AND user_id IS NULL;

-- SOS: Clermont hills, ~350m gain
UPDATE race_courses SET elevation_gain_m = 350, road_quality = 'good'
  WHERE name = 'SOS Triathlon' AND user_id IS NULL;

-- Malibu: rolling PCH, ~300m gain
UPDATE race_courses SET elevation_gain_m = 300, road_quality = 'good'
  WHERE name = 'Malibu Triathlon' AND user_id IS NULL;

-- Honu: rolling Queen K, ~600m gain
UPDATE race_courses SET elevation_gain_m = 600, road_quality = 'good'
  WHERE name = 'Honu Half Triathlon' AND user_id IS NULL;

-- Timberman: hilly New Hampshire, ~700m gain
UPDATE race_courses SET elevation_gain_m = 700, road_quality = 'good'
  WHERE name = 'Timberman 70.3' AND user_id IS NULL;

-- Campeche: flat Yucatan, ~50m gain
UPDATE race_courses SET elevation_gain_m = 50, road_quality = 'fair'
  WHERE name = 'Ironman 70.3 Campeche' AND user_id IS NULL;

-- Challenge Cape Town: hilly Chapman's Peak, ~800m gain
UPDATE race_courses SET elevation_gain_m = 800, road_quality = 'good'
  WHERE name = 'Challenge Cape Town' AND user_id IS NULL;
