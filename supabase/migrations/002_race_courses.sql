-- ---------------------------------------------------------------------------
-- Race Courses Database — pre-populated worldwide triathlon courses
-- ---------------------------------------------------------------------------

CREATE TABLE race_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_country TEXT NOT NULL,
  race_series TEXT NOT NULL,
  race_distance TEXT NOT NULL,
  swim_distance_m INTEGER,
  bike_distance_km NUMERIC,
  run_distance_km NUMERIC,
  course_profile TEXT NOT NULL DEFAULT 'rolling',
  course_type TEXT NOT NULL DEFAULT 'loop',
  water_type TEXT NOT NULL DEFAULT 'lake',
  typical_water_temp_f INTEGER,
  typical_temp_low_f INTEGER,
  typical_temp_high_f INTEGER,
  typical_humidity_pct INTEGER,
  altitude_ft INTEGER,
  typical_wind TEXT NOT NULL DEFAULT 'calm',
  wetsuit_legal BOOLEAN,
  typical_race_month INTEGER,
  notable_features TEXT,
  is_kona_qualifier BOOLEAN NOT NULL DEFAULT FALSE,
  is_703_worlds_qualifier BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row level security
ALTER TABLE race_courses ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read global courses (user_id IS NULL)
CREATE POLICY "Authenticated users can read global courses"
  ON race_courses FOR SELECT
  USING (user_id IS NULL AND auth.role() = 'authenticated');

-- Users can read their own courses
CREATE POLICY "Users can read own courses"
  ON race_courses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own courses
CREATE POLICY "Users can create own courses"
  ON race_courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own courses
CREATE POLICY "Users can update own courses"
  ON race_courses FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own courses
CREATE POLICY "Users can delete own courses"
  ON race_courses FOR DELETE
  USING (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX idx_race_courses_user_id ON race_courses(user_id);
CREATE INDEX idx_race_courses_series ON race_courses(race_series);
CREATE INDEX idx_race_courses_distance ON race_courses(race_distance);

-- ---------------------------------------------------------------------------
-- Seed: 100+ worldwide triathlon courses (user_id = NULL = global)
-- ---------------------------------------------------------------------------

-- ==========================================================================
-- IRONMAN 140.6 (~25 courses)
-- ==========================================================================

INSERT INTO race_courses (user_id, name, location_city, location_country, race_series, race_distance, swim_distance_m, bike_distance_km, run_distance_km, course_profile, course_type, water_type, typical_water_temp_f, typical_temp_low_f, typical_temp_high_f, typical_humidity_pct, altitude_ft, typical_wind, wetsuit_legal, typical_race_month, notable_features, is_kona_qualifier, is_703_worlds_qualifier) VALUES
(NULL, 'IRONMAN World Championship Kona', 'Kailua-Kona', 'United States', 'ironman', '140.6', 3800, 180, 42.2, 'rolling', 'out_and_back', 'ocean', 78, 72, 90, 65, 10, 'strong', FALSE, 10, 'Lava fields, Hawi turnaround crosswinds, Queen K Highway heat radiation, Energy Lab', FALSE, FALSE),
(NULL, 'IRONMAN World Championship Nice', 'Nice', 'France', 'ironman', '140.6', 3800, 180, 42.2, 'mountainous', 'loop', 'ocean', 72, 65, 82, 55, 50, 'moderate', TRUE, 9, 'Mediterranean swim, Col de Vence climb (1000m+), Promenade des Anglais run', FALSE, FALSE),
(NULL, 'IRONMAN Frankfurt', 'Frankfurt', 'Germany', 'ironman', '140.6', 3800, 180, 42.2, 'flat', 'loop', 'lake', 70, 58, 80, 60, 340, 'light', TRUE, 6, 'Langener Waldsee swim, flat fast bike through Taunus foothills, city center finish', TRUE, FALSE),
(NULL, 'IRONMAN Cairns', 'Cairns', 'Australia', 'ironman', '140.6', 3800, 180, 42.2, 'rolling', 'out_and_back', 'ocean', 75, 68, 82, 75, 10, 'moderate', FALSE, 6, 'Palm Cove ocean swim, Captain Cook Highway bike, tropical humidity', TRUE, FALSE),
(NULL, 'IRONMAN Lake Placid', 'Lake Placid', 'United States', 'ironman', '140.6', 3800, 180, 42.2, 'hilly', 'loop', 'lake', 68, 55, 78, 65, 1860, 'light', TRUE, 7, 'Mirror Lake swim, Adirondack mountain bike with steep climbs, two-loop run', TRUE, FALSE),
(NULL, 'IRONMAN Wisconsin', 'Madison', 'United States', 'ironman', '140.6', 3800, 180, 42.2, 'rolling', 'loop', 'lake', 70, 52, 75, 65, 860, 'moderate', TRUE, 9, 'Lake Monona swim, rolling farmland bike, campus run along Capitol Square', TRUE, FALSE),
(NULL, 'IRONMAN Florida', 'Panama City Beach', 'United States', 'ironman', '140.6', 3800, 180, 42.2, 'flat', 'out_and_back', 'ocean', 72, 55, 72, 65, 10, 'moderate', TRUE, 11, 'Gulf of Mexico swim, flat coastal bike, beach-side run, typically fast course', TRUE, FALSE),
(NULL, 'IRONMAN Arizona', 'Tempe', 'United States', 'ironman', '140.6', 3800, 180, 42.2, 'flat', 'loop', 'lake', 65, 50, 78, 20, 1160, 'light', TRUE, 11, 'Tempe Town Lake swim, Beeline Highway bike, flat and fast, low humidity', TRUE, FALSE),
(NULL, 'IRONMAN Cozumel', 'Cozumel', 'Mexico', 'ironman', '140.6', 3800, 180, 42.2, 'flat', 'loop', 'ocean', 82, 75, 88, 75, 10, 'moderate', FALSE, 11, 'Caribbean ocean swim with current assist, flat island bike, tropical heat', TRUE, FALSE),
(NULL, 'IRONMAN Texas', 'The Woodlands', 'United States', 'ironman', '140.6', 3800, 180, 42.2, 'flat', 'out_and_back', 'lake', 72, 62, 85, 70, 130, 'moderate', TRUE, 4, 'Lake Woodlands swim, flat Texas roads, humid spring conditions', TRUE, FALSE),
(NULL, 'IRONMAN Tulsa', 'Tulsa', 'United States', 'ironman', '140.6', 3800, 180, 42.2, 'rolling', 'out_and_back', 'lake', 72, 60, 85, 65, 680, 'moderate', TRUE, 5, 'Keystone Lake swim, rolling Oklahoma hills, riverside run through Tulsa', TRUE, FALSE),
(NULL, 'IRONMAN Maryland', 'Cambridge', 'United States', 'ironman', '140.6', 3800, 180, 42.2, 'flat', 'loop', 'river', 68, 52, 72, 65, 10, 'moderate', TRUE, 10, 'Choptank River swim, flat Eastern Shore bike, small-town run', TRUE, FALSE),
(NULL, 'IRONMAN California', 'Sacramento', 'United States', 'ironman', '140.6', 3800, 180, 42.2, 'flat', 'out_and_back', 'river', 65, 48, 72, 50, 30, 'light', TRUE, 10, 'American River swim, flat Sacramento Valley bike, river path run', TRUE, FALSE),
(NULL, 'IRONMAN New Zealand', 'Taupo', 'New Zealand', 'ironman', '140.6', 3800, 180, 42.2, 'rolling', 'loop', 'lake', 65, 50, 72, 60, 1180, 'moderate', TRUE, 3, 'Lake Taupo swim, rolling volcanic plateau bike, scenic lakeside run', TRUE, FALSE),
(NULL, 'IRONMAN South Africa', 'Port Elizabeth', 'South Africa', 'ironman', '140.6', 3800, 180, 42.2, 'rolling', 'out_and_back', 'ocean', 66, 58, 75, 60, 30, 'strong', TRUE, 4, 'Hobie Beach ocean swim, N2 highway bike with crosswinds, beachfront run', TRUE, FALSE),
(NULL, 'IRONMAN Copenhagen', 'Copenhagen', 'Denmark', 'ironman', '140.6', 3800, 180, 42.2, 'flat', 'loop', 'ocean', 64, 55, 70, 65, 10, 'moderate', TRUE, 8, 'Amager Beach swim, flat Danish countryside bike, city center run', TRUE, FALSE),
(NULL, 'IRONMAN Bolton', 'Bolton', 'United Kingdom', 'ironman', '140.6', 3800, 180, 42.2, 'hilly', 'loop', 'lake', 60, 50, 65, 70, 500, 'moderate', TRUE, 7, 'Pennington Flash lake swim, challenging Pennine hills, Rivington Pike', TRUE, FALSE),
(NULL, 'IRONMAN Barcelona', 'Calella', 'Spain', 'ironman', '140.6', 3800, 180, 42.2, 'rolling', 'loop', 'ocean', 72, 62, 80, 60, 30, 'light', TRUE, 10, 'Mediterranean sea swim, Catalan coast bike, beachfront run in Calella', TRUE, FALSE),
(NULL, 'IRONMAN Vitoria-Gasteiz', 'Vitoria-Gasteiz', 'Spain', 'ironman', '140.6', 3800, 180, 42.2, 'hilly', 'loop', 'lake', 66, 55, 78, 50, 1700, 'light', TRUE, 7, 'Lake swim at altitude, Basque Country mountain bike, compact city run', TRUE, FALSE),
(NULL, 'IRONMAN Hamburg', 'Hamburg', 'Germany', 'ironman', '140.6', 3800, 180, 42.2, 'flat', 'loop', 'lake', 68, 55, 72, 65, 30, 'moderate', TRUE, 6, 'Alster Lake swim, flat north German bike, city run through Hamburg', TRUE, FALSE),
(NULL, 'IRONMAN Lanzarote', 'Puerto del Carmen', 'Spain', 'ironman', '140.6', 3800, 180, 42.2, 'mountainous', 'loop', 'ocean', 68, 62, 78, 55, 30, 'strong', TRUE, 5, 'Atlantic ocean swim, volcanic terrain bike with 2500m+ climbing, fierce winds', TRUE, FALSE),
(NULL, 'IRONMAN Taiwan', 'Penghu', 'Taiwan', 'ironman', '140.6', 3800, 180, 42.2, 'flat', 'loop', 'ocean', 78, 72, 85, 80, 10, 'moderate', FALSE, 4, 'Penghu archipelago ocean swim, flat island bike, tropical heat and humidity', TRUE, FALSE),
(NULL, 'IRONMAN Western Australia', 'Busselton', 'Australia', 'ironman', '140.6', 3800, 180, 42.2, 'flat', 'out_and_back', 'ocean', 68, 55, 75, 50, 10, 'moderate', TRUE, 12, 'Geographe Bay calm ocean swim, flat coastal bike, fast course, summer heat', TRUE, FALSE),
(NULL, 'IRONMAN Italy Emilia Romagna', 'Cervia', 'Italy', 'ironman', '140.6', 3800, 180, 42.2, 'flat', 'loop', 'ocean', 72, 60, 80, 60, 10, 'light', TRUE, 9, 'Adriatic Sea swim, flat Emilia Romagna roads, Italian Riviera finish', TRUE, FALSE),
(NULL, 'IRONMAN Alaska', 'Juneau', 'United States', 'ironman', '140.6', 3800, 180, 42.2, 'hilly', 'out_and_back', 'lake', 55, 48, 62, 65, 50, 'moderate', TRUE, 8, 'Auke Lake swim, scenic coastal bike, mountain views, cool temperatures', TRUE, FALSE),

-- ==========================================================================
-- IRONMAN 70.3 (~30 courses)
-- ==========================================================================

(NULL, 'IRONMAN 70.3 Chattanooga', 'Chattanooga', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'out_and_back', 'river', 70, 58, 80, 65, 680, 'light', TRUE, 5, 'Tennessee River downstream swim (current-assisted), Lookout Mountain bike, riverfront run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Oceanside', 'Oceanside', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'out_and_back', 'ocean', 62, 55, 68, 60, 30, 'moderate', TRUE, 4, 'Pacific ocean swim at harbor, Camp Pendleton bike, coastal run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Gulf Coast', 'Panama City Beach', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'flat', 'out_and_back', 'ocean', 72, 60, 78, 65, 10, 'moderate', TRUE, 5, 'Gulf of Mexico swim, flat coastal roads, beach-side run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Maine', 'Old Orchard Beach', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'loop', 'ocean', 62, 55, 72, 60, 30, 'moderate', TRUE, 8, 'Atlantic ocean swim, scenic Maine countryside bike, coastal village run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Eagleman', 'Cambridge', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'flat', 'out_and_back', 'river', 72, 62, 85, 70, 10, 'moderate', TRUE, 6, 'Choptank River swim, flat Eastern Shore bike, hot and humid', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Ohio', 'Delaware', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'loop', 'lake', 72, 58, 82, 65, 880, 'light', TRUE, 7, 'Delaware Lake swim, rolling central Ohio bike, shaded park run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Steelhead', 'Benton Harbor', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'out_and_back', 'lake', 68, 58, 78, 65, 620, 'moderate', TRUE, 8, 'Lake Michigan swim, rolling southwest Michigan bike, vineyard run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Augusta', 'Augusta', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'loop', 'river', 72, 60, 85, 65, 150, 'light', TRUE, 9, 'Savannah River downstream swim, rolling Georgia roads, Augusta Canal run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Indian Wells', 'Indian Wells', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'flat', 'out_and_back', 'lake', 72, 60, 95, 15, 30, 'moderate', FALSE, 12, 'Lake Cahuilla swim, flat desert roads, extreme dry heat possible', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Coeur d''Alene', 'Coeur d''Alene', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'hilly', 'out_and_back', 'lake', 65, 50, 78, 40, 2180, 'light', TRUE, 6, 'Lake Coeur d''Alene swim, rolling Idaho hills, lakeside run at altitude', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Santa Cruz', 'Santa Cruz', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'hilly', 'loop', 'ocean', 58, 52, 70, 65, 30, 'moderate', TRUE, 9, 'Monterey Bay swim, Santa Cruz Mountains bike, coastal boardwalk run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Marbella', 'Marbella', 'Spain', 'ironman_703', '70.3', 1900, 90, 21.1, 'hilly', 'loop', 'ocean', 68, 60, 80, 50, 30, 'light', TRUE, 4, 'Mediterranean sea swim, Andalusian hills bike, Costa del Sol run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Dubai', 'Dubai', 'United Arab Emirates', 'ironman_703', '70.3', 1900, 90, 21.1, 'flat', 'loop', 'ocean', 75, 65, 85, 60, 10, 'moderate', FALSE, 2, 'Persian Gulf swim, flat desert roads, Jumeirah Beach run, early season heat', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Taupo', 'Taupo', 'New Zealand', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'loop', 'lake', 65, 50, 70, 60, 1180, 'moderate', TRUE, 12, 'Lake Taupo swim, volcanic plateau bike, scenic lakeside run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Sunshine Coast', 'Mooloolaba', 'Australia', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'loop', 'ocean', 72, 62, 80, 70, 30, 'moderate', FALSE, 9, 'Pacific ocean swim, Sunshine Coast hinterland bike, beachfront run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Geelong', 'Geelong', 'Australia', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'loop', 'ocean', 65, 55, 72, 55, 30, 'moderate', TRUE, 2, 'Corio Bay swim, Great Ocean Road bike, waterfront run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Lubbock', 'Lubbock', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'flat', 'out_and_back', 'lake', 72, 58, 88, 30, 3240, 'strong', TRUE, 6, 'Buffalo Springs Lake swim, flat West Texas roads, wind and altitude', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Victoria', 'Victoria', 'Canada', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'loop', 'ocean', 55, 50, 65, 60, 30, 'light', TRUE, 6, 'Elk Lake swim, rolling Vancouver Island bike, scenic oceanside run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Mont-Tremblant', 'Mont-Tremblant', 'Canada', 'ironman_703', '70.3', 1900, 90, 21.1, 'hilly', 'loop', 'lake', 68, 55, 78, 60, 790, 'light', TRUE, 6, 'Lac Tremblant swim, Laurentian Mountains bike, ski resort village run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Davos', 'Davos', 'Switzerland', 'ironman_703', '70.3', 1900, 90, 21.1, 'mountainous', 'loop', 'lake', 60, 48, 68, 50, 5120, 'light', TRUE, 8, 'Lake Davos swim, Alpine passes bike with major climbing, high altitude run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Cascais', 'Cascais', 'Portugal', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'loop', 'ocean', 66, 60, 75, 60, 30, 'moderate', TRUE, 9, 'Atlantic ocean swim, rolling Portuguese coast bike, Estoril seafront run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Puerto Rico', 'San Juan', 'Puerto Rico', 'ironman_703', '70.3', 1900, 90, 21.1, 'flat', 'loop', 'ocean', 82, 75, 88, 75, 10, 'moderate', FALSE, 3, 'Caribbean ocean swim, flat coastal bike, tropical heat and humidity', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Cartagena', 'Cartagena', 'Colombia', 'ironman_703', '70.3', 1900, 90, 21.1, 'flat', 'loop', 'ocean', 82, 78, 90, 80, 10, 'moderate', FALSE, 12, 'Caribbean Sea swim, flat coastal roads, extreme tropical heat', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 South Africa', 'Durban', 'South Africa', 'ironman_703', '70.3', 1900, 90, 21.1, 'hilly', 'loop', 'ocean', 72, 65, 82, 70, 30, 'moderate', FALSE, 1, 'Indian Ocean swim, rolling KwaZulu-Natal hills, beachfront run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Bahrain', 'Manama', 'Bahrain', 'ironman_703', '70.3', 1900, 90, 21.1, 'flat', 'loop', 'ocean', 78, 72, 90, 65, 10, 'moderate', FALSE, 12, 'Persian Gulf swim, flat desert roads, F1 circuit bike section', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Musselman', 'Geneva', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'hilly', 'loop', 'lake', 68, 55, 78, 60, 780, 'light', TRUE, 7, 'Seneca Lake swim, rolling Finger Lakes wine country bike, lakeside run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Boulder', 'Boulder', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'loop', 'lake', 68, 52, 82, 25, 5340, 'light', TRUE, 8, 'Boulder Reservoir swim, foothills bike, high altitude running', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Waco', 'Waco', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'flat', 'out_and_back', 'lake', 72, 58, 85, 60, 500, 'moderate', TRUE, 10, 'Lake Waco swim, flat Texas roads, Baylor University area run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Des Moines', 'Des Moines', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'flat', 'loop', 'lake', 72, 58, 82, 65, 960, 'moderate', TRUE, 6, 'Gray''s Lake swim, flat Iowa farmland bike, downtown Des Moines run', FALSE, TRUE),
(NULL, 'IRONMAN 70.3 Oregon', 'Salem', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'loop', 'lake', 68, 52, 78, 50, 200, 'light', TRUE, 7, 'Hagg Lake swim, rolling Willamette Valley bike, riverside run', FALSE, TRUE),

-- ==========================================================================
-- World Triathlon Championship Series (~15 courses)
-- ==========================================================================

(NULL, 'World Triathlon Championship Series Abu Dhabi', 'Abu Dhabi', 'United Arab Emirates', 'world_triathlon', 'olympic', 1500, 40, 10, 'flat', 'loop', 'ocean', 75, 68, 88, 60, 10, 'moderate', FALSE, 3, 'Yas Marina swim, flat city circuit bike (draft-legal), F1 circuit run', FALSE, FALSE),
(NULL, 'World Triathlon Championship Series Yokohama', 'Yokohama', 'Japan', 'world_triathlon', 'olympic', 1500, 40, 10, 'flat', 'loop', 'ocean', 66, 58, 72, 65, 10, 'light', TRUE, 5, 'Yamashita Park bay swim, flat harbor bike, waterfront run', FALSE, FALSE),
(NULL, 'World Triathlon Championship Series Hamburg', 'Hamburg', 'Germany', 'world_triathlon', 'sprint', 750, 20, 5, 'flat', 'loop', 'lake', 68, 55, 72, 65, 30, 'moderate', TRUE, 7, 'Binnenalster lake swim, city center sprint bike, fast flat run, huge crowds', FALSE, FALSE),
(NULL, 'World Triathlon Championship Series Montreal', 'Montreal', 'Canada', 'world_triathlon', 'olympic', 1500, 40, 10, 'flat', 'loop', 'lake', 72, 60, 80, 65, 100, 'light', TRUE, 6, 'Parc Jean-Drapeau swim, flat island bike, scenic park run', FALSE, FALSE),
(NULL, 'World Triathlon Championship Series Leeds', 'Leeds', 'United Kingdom', 'world_triathlon', 'olympic', 1500, 40, 10, 'hilly', 'loop', 'lake', 60, 50, 65, 70, 200, 'moderate', TRUE, 6, 'Roundhay Park lake swim, hilly city bike, challenging park run', FALSE, FALSE),
(NULL, 'World Triathlon Championship Series Paris', 'Paris', 'France', 'world_triathlon', 'olympic', 1500, 40, 10, 'flat', 'loop', 'river', 68, 58, 78, 60, 100, 'light', TRUE, 6, 'Seine River swim, Champs-Elysees bike, Pont Alexandre run', FALSE, FALSE),
(NULL, 'World Triathlon Championship Series Bermuda', 'Hamilton', 'Bermuda', 'world_triathlon', 'olympic', 1500, 40, 10, 'hilly', 'loop', 'ocean', 75, 72, 82, 70, 30, 'moderate', FALSE, 10, 'Hamilton Harbour swim, hilly island bike, Front Street run', FALSE, FALSE),
(NULL, 'World Triathlon Championship Series Cagliari', 'Cagliari', 'Italy', 'world_triathlon', 'olympic', 1500, 40, 10, 'rolling', 'loop', 'ocean', 72, 62, 80, 55, 30, 'moderate', TRUE, 5, 'Poetto Beach swim, Sardinian coastal bike, waterfront run', FALSE, FALSE),
(NULL, 'World Triathlon Championship Series Sunderland', 'Sunderland', 'United Kingdom', 'world_triathlon', 'olympic', 1500, 40, 10, 'rolling', 'loop', 'ocean', 58, 50, 62, 70, 30, 'strong', TRUE, 7, 'Roker Beach North Sea swim, coastal road bike, stadium finish', FALSE, FALSE),
(NULL, 'World Triathlon Championship Series Valencia', 'Valencia', 'Spain', 'world_triathlon', 'olympic', 1500, 40, 10, 'flat', 'loop', 'ocean', 72, 62, 82, 55, 10, 'light', TRUE, 10, 'Mediterranean swim, Ciudad de las Artes bike, flat coastal run', FALSE, FALSE),
(NULL, 'World Triathlon Championship Series Pontevedra', 'Pontevedra', 'Spain', 'world_triathlon', 'olympic', 1500, 40, 10, 'rolling', 'loop', 'river', 64, 55, 72, 60, 30, 'light', TRUE, 5, 'Lerez River swim, Galician hills bike, old town run', FALSE, FALSE),
(NULL, 'World Triathlon Championship Finals', 'Various', 'Various', 'world_triathlon', 'olympic', 1500, 40, 10, 'rolling', 'loop', 'ocean', 70, 60, 78, 60, 30, 'moderate', TRUE, 10, 'Season-ending Grand Final, rotating location, world titles decided', FALSE, FALSE),
(NULL, 'World Triathlon Series Miyazaki', 'Miyazaki', 'Japan', 'world_triathlon', 'olympic', 1500, 40, 10, 'flat', 'loop', 'ocean', 72, 65, 78, 70, 10, 'moderate', TRUE, 10, 'Pacific Ocean swim, flat coastal bike, palm-lined run', FALSE, FALSE),
(NULL, 'World Triathlon Series Tongyeong', 'Tongyeong', 'South Korea', 'world_triathlon', 'olympic', 1500, 40, 10, 'hilly', 'loop', 'ocean', 72, 62, 78, 65, 30, 'moderate', TRUE, 10, 'Harbor swim, hilly Korean peninsula bike, coastal village run', FALSE, FALSE),
(NULL, 'World Triathlon Series Cape Town', 'Cape Town', 'South Africa', 'world_triathlon', 'olympic', 1500, 40, 10, 'rolling', 'loop', 'ocean', 62, 55, 72, 50, 30, 'strong', TRUE, 2, 'Atlantic ocean swim, Table Mountain backdrop, V&A Waterfront run', FALSE, FALSE),

-- ==========================================================================
-- Challenge Family (~10 courses)
-- ==========================================================================

(NULL, 'Challenge Roth', 'Roth', 'Germany', 'challenge', '140.6', 3800, 180, 42.2, 'rolling', 'loop', 'lake', 68, 55, 78, 60, 1100, 'light', TRUE, 6, 'Main-Donau-Kanal swim, rolling Franconian bike, legendary Solar Hill crowd support', FALSE, FALSE),
(NULL, 'Challenge Daytona', 'Daytona Beach', 'United States', 'challenge', '70.3', 1900, 90, 21.1, 'flat', 'loop', 'ocean', 68, 58, 75, 65, 10, 'moderate', TRUE, 12, 'Daytona Beach ocean swim, Daytona Speedway bike, boardwalk run', FALSE, FALSE),
(NULL, 'Challenge Cancun', 'Cancun', 'Mexico', 'challenge', '70.3', 1900, 90, 21.1, 'flat', 'out_and_back', 'ocean', 80, 75, 88, 75, 10, 'moderate', FALSE, 11, 'Caribbean turquoise water swim, flat hotel zone bike, beach run', FALSE, FALSE),
(NULL, 'Challenge Miami', 'Miami', 'United States', 'challenge', '70.3', 1900, 90, 21.1, 'flat', 'loop', 'ocean', 75, 68, 82, 70, 10, 'moderate', FALSE, 3, 'Biscayne Bay swim, flat Miami roads, tropical humidity', FALSE, FALSE),
(NULL, 'Challenge Wanaka', 'Wanaka', 'New Zealand', 'challenge', '140.6', 3800, 180, 42.2, 'mountainous', 'loop', 'lake', 62, 48, 72, 50, 1000, 'moderate', TRUE, 2, 'Lake Wanaka crystal clear swim, Southern Alps bike, stunning mountain run', FALSE, FALSE),
(NULL, 'Challenge Almere-Amsterdam', 'Almere', 'Netherlands', 'challenge', '140.6', 3800, 180, 42.2, 'flat', 'loop', 'lake', 64, 52, 68, 70, 10, 'strong', TRUE, 9, 'Gooimeer lake swim, dead flat polder bike, strong headwinds common', FALSE, FALSE),
(NULL, 'Challenge Shepparton', 'Shepparton', 'Australia', 'challenge', '140.6', 3800, 180, 42.2, 'flat', 'loop', 'lake', 72, 58, 88, 40, 370, 'moderate', TRUE, 11, 'Victoria Lake swim, flat Victorian country roads, dry heat', FALSE, FALSE),
(NULL, 'Challenge Walchsee', 'Walchsee', 'Austria', 'challenge', '70.3', 1900, 90, 21.1, 'mountainous', 'loop', 'lake', 68, 52, 75, 50, 2200, 'light', TRUE, 6, 'Alpine lake swim, Austrian mountain passes bike, Tyrolean valley run', FALSE, FALSE),
(NULL, 'Challenge St. Polten', 'St. Polten', 'Austria', 'challenge', '70.3', 1900, 90, 21.1, 'rolling', 'loop', 'lake', 68, 52, 75, 55, 890, 'light', TRUE, 5, 'Viehofner See lake swim, rolling Austrian hills, city center run', FALSE, FALSE),
(NULL, 'Challenge Gdansk', 'Gdansk', 'Poland', 'challenge', '140.6', 3800, 180, 42.2, 'flat', 'loop', 'ocean', 64, 55, 70, 65, 10, 'moderate', TRUE, 8, 'Baltic Sea swim, flat Polish coast bike, historic old town run', FALSE, FALSE),

-- ==========================================================================
-- PTO / T100 (~5 courses)
-- ==========================================================================

(NULL, 'T100 Triathlon World Tour Singapore', 'Singapore', 'Singapore', 'pto_t100', 'olympic', 1500, 40, 10, 'flat', 'loop', 'ocean', 82, 78, 90, 85, 10, 'light', FALSE, 3, 'Marina Bay swim, flat city bike, Gardens by the Bay run, extreme humidity', FALSE, FALSE),
(NULL, 'T100 Triathlon World Tour San Francisco', 'San Francisco', 'United States', 'pto_t100', 'olympic', 1500, 40, 10, 'hilly', 'loop', 'ocean', 58, 52, 65, 70, 30, 'strong', TRUE, 7, 'Alcatraz area swim, hilly SF streets bike, Golden Gate views run', FALSE, FALSE),
(NULL, 'T100 Triathlon World Tour Las Vegas', 'Las Vegas', 'United States', 'pto_t100', 'olympic', 1500, 40, 10, 'flat', 'loop', 'lake', 68, 55, 85, 15, 2000, 'moderate', TRUE, 11, 'Lake Las Vegas swim, desert bike, Strip finish run, dry heat', FALSE, FALSE),
(NULL, 'T100 Triathlon World Tour London', 'London', 'United Kingdom', 'pto_t100', 'olympic', 1500, 40, 10, 'flat', 'loop', 'lake', 62, 52, 68, 65, 30, 'light', TRUE, 8, 'Serpentine swim in Hyde Park, central London bike, Buckingham Palace run', FALSE, FALSE),
(NULL, 'T100 Triathlon World Tour Ibiza', 'Ibiza', 'Spain', 'pto_t100', 'olympic', 1500, 40, 10, 'rolling', 'loop', 'ocean', 74, 65, 82, 55, 30, 'moderate', TRUE, 10, 'Mediterranean swim, scenic Balearic island bike, Ibiza town run', FALSE, FALSE),

-- ==========================================================================
-- Other Notable Races (~20 courses)
-- ==========================================================================

(NULL, 'Escape from Alcatraz Triathlon', 'San Francisco', 'United States', 'other', 'olympic', 2400, 29, 13, 'hilly', 'point_to_point', 'ocean', 55, 50, 62, 70, 30, 'strong', TRUE, 6, '2.4km open water swim from Alcatraz Island, hilly SF bike, sand ladder run stairs', FALSE, FALSE),
(NULL, 'NYC Triathlon', 'New York', 'United States', 'usat', 'olympic', 1500, 40, 10, 'flat', 'loop', 'river', 72, 68, 85, 70, 10, 'light', FALSE, 7, 'Hudson River current-assisted swim, Henry Hudson Pkwy bike, Central Park run', FALSE, FALSE),
(NULL, 'Wildflower Triathlon', 'Bradley', 'United States', 'other', 'olympic', 1500, 40, 10, 'mountainous', 'loop', 'lake', 65, 50, 85, 30, 1100, 'moderate', TRUE, 5, 'Lake San Antonio swim, extremely hilly bike (Lynch Hill), hot valley run', FALSE, FALSE),
(NULL, 'St. Anthony''s Triathlon', 'St. Petersburg', 'United States', 'usat', 'olympic', 1500, 40, 10, 'flat', 'loop', 'ocean', 72, 65, 82, 70, 10, 'moderate', FALSE, 4, 'Tampa Bay swim, flat Florida roads, downtown St. Pete waterfront run', FALSE, FALSE),
(NULL, 'Vineman Triathlon', 'Sonoma County', 'United States', 'other', '70.3', 1900, 90, 21.1, 'rolling', 'out_and_back', 'river', 62, 50, 85, 40, 200, 'light', TRUE, 7, 'Russian River swim, Sonoma wine country rolling bike, beautiful valley run', FALSE, FALSE),
(NULL, 'Buffalo Springs Lake 70.3', 'Lubbock', 'United States', 'other', '70.3', 1900, 90, 21.1, 'rolling', 'out_and_back', 'lake', 72, 60, 92, 30, 3240, 'strong', TRUE, 6, 'Buffalo Springs Lake swim, Texas wind and heat, altitude challenge', FALSE, FALSE),
(NULL, 'LifeTime Tri Cap Tex', 'Austin', 'United States', 'other', 'olympic', 1500, 40, 10, 'rolling', 'loop', 'lake', 72, 62, 88, 60, 500, 'moderate', TRUE, 5, 'Lady Bird Lake swim, rolling Austin hills, downtown Capitol run', FALSE, FALSE),
(NULL, 'Door County Triathlon', 'Ephraim', 'United States', 'usat', 'olympic', 1500, 40, 10, 'hilly', 'loop', 'lake', 62, 52, 72, 60, 600, 'moderate', TRUE, 7, 'Eagle Harbor Lake Michigan swim, hilly Door Peninsula bike, scenic village run', FALSE, FALSE),
(NULL, 'Alcatraz Triathlon (Sprint)', 'San Francisco', 'United States', 'other', 'sprint', 750, 20, 5, 'hilly', 'point_to_point', 'ocean', 55, 50, 62, 70, 30, 'strong', TRUE, 8, 'Aquatic Park swim, Crissy Field to Golden Gate bike, Presidio run', FALSE, FALSE),
(NULL, 'Noosa Triathlon', 'Noosa', 'Australia', 'other', 'olympic', 1500, 40, 10, 'rolling', 'loop', 'ocean', 74, 68, 82, 65, 30, 'light', FALSE, 11, 'Noosa Main Beach swim, Sunshine Coast hinterland bike, Hastings St run', FALSE, FALSE),
(NULL, 'Israman Triathlon', 'Eilat', 'Israel', 'other', '140.6', 3800, 180, 42.2, 'rolling', 'out_and_back', 'ocean', 72, 55, 78, 25, 30, 'moderate', FALSE, 1, 'Red Sea swim, Negev Desert bike through Arava Valley, desert running', FALSE, FALSE),
(NULL, 'XTERRA World Championship', 'Kapalua', 'United States', 'other', 'olympic', 1500, 32, 11, 'mountainous', 'loop', 'ocean', 78, 72, 85, 65, 30, 'moderate', FALSE, 10, 'Off-road triathlon: ocean swim, mountain bike on trails, trail run at Kapalua', FALSE, FALSE),
(NULL, 'Ironman 70.3 World Championship', 'Various', 'Various', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'loop', 'ocean', 70, 58, 80, 60, 30, 'moderate', TRUE, 10, '70.3 World Championship, rotating location annually, world titles decided', FALSE, TRUE),
(NULL, 'Chicago Triathlon', 'Chicago', 'United States', 'usat', 'olympic', 1500, 40, 10, 'flat', 'loop', 'lake', 68, 58, 78, 65, 590, 'moderate', TRUE, 8, 'Lake Michigan swim, flat Lake Shore Drive bike, downtown skyline run', FALSE, FALSE),
(NULL, 'SOS Triathlon', 'Clermont', 'United States', 'usat', 'olympic', 1500, 40, 10, 'hilly', 'loop', 'lake', 72, 62, 85, 70, 100, 'light', TRUE, 10, 'Lake Minneola swim, Clermont hills (Florida climbing), challenging run', FALSE, FALSE),
(NULL, 'Malibu Triathlon', 'Malibu', 'United States', 'usat', 'olympic', 1500, 40, 10, 'rolling', 'out_and_back', 'ocean', 65, 58, 75, 60, 30, 'moderate', TRUE, 9, 'Zuma Beach Pacific swim, PCH bike, celebrity-popular coastal run', FALSE, FALSE),
(NULL, 'Honu Half Triathlon', 'Kohala Coast', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'rolling', 'out_and_back', 'ocean', 78, 72, 88, 60, 30, 'strong', FALSE, 6, 'Hapuna Beach swim, Queen K Highway bike, Kona preview course, lava winds', FALSE, TRUE),
(NULL, 'Timberman 70.3', 'Gilford', 'United States', 'ironman_703', '70.3', 1900, 90, 21.1, 'hilly', 'loop', 'lake', 72, 55, 80, 60, 500, 'light', TRUE, 8, 'Lake Winnipesaukee swim, New Hampshire hills bike, scenic lake run', FALSE, TRUE),
(NULL, 'Ironman 70.3 Campeche', 'Campeche', 'Mexico', 'ironman_703', '70.3', 1900, 90, 21.1, 'flat', 'out_and_back', 'ocean', 82, 75, 90, 80, 10, 'moderate', FALSE, 10, 'Gulf of Mexico warm swim, flat Yucatan roads, historic walled city run', FALSE, TRUE),
(NULL, 'Challenge Cape Town', 'Cape Town', 'South Africa', 'challenge', '70.3', 1900, 90, 21.1, 'hilly', 'loop', 'ocean', 62, 55, 72, 50, 30, 'strong', TRUE, 2, 'Atlantic swim, Chapman''s Peak stunning coastal bike, Sea Point run', FALSE, FALSE);
