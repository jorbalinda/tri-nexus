-- ---------------------------------------------------------------------------
-- Add next_race_date to race_courses and populate 2026 race dates
-- ---------------------------------------------------------------------------

ALTER TABLE race_courses ADD COLUMN IF NOT EXISTS next_race_date DATE;

-- ==========================================================================
-- IRONMAN 140.6 — 2026 dates
-- ==========================================================================

UPDATE race_courses SET next_race_date = '2026-10-10' WHERE name = 'IRONMAN World Championship Kona';
UPDATE race_courses SET next_race_date = '2026-06-28' WHERE name = 'IRONMAN World Championship Nice';
UPDATE race_courses SET next_race_date = '2026-06-28' WHERE name = 'IRONMAN Frankfurt';
UPDATE race_courses SET next_race_date = '2026-06-14' WHERE name = 'IRONMAN Cairns';
UPDATE race_courses SET next_race_date = '2026-07-19' WHERE name = 'IRONMAN Lake Placid';
UPDATE race_courses SET next_race_date = '2026-09-13' WHERE name = 'IRONMAN Wisconsin';
UPDATE race_courses SET next_race_date = '2026-11-07' WHERE name = 'IRONMAN Florida';
-- IRONMAN Arizona: discontinued after Nov 2025
UPDATE race_courses SET next_race_date = '2026-11-22' WHERE name = 'IRONMAN Cozumel';
UPDATE race_courses SET next_race_date = '2026-04-18' WHERE name = 'IRONMAN Texas';
-- IRONMAN Tulsa: discontinued after May 2023
UPDATE race_courses SET next_race_date = '2026-09-19' WHERE name = 'IRONMAN Maryland';
UPDATE race_courses SET next_race_date = '2026-10-18' WHERE name = 'IRONMAN California';
UPDATE race_courses SET next_race_date = '2026-03-07' WHERE name = 'IRONMAN New Zealand';
UPDATE race_courses SET next_race_date = '2026-04-19' WHERE name = 'IRONMAN South Africa';
UPDATE race_courses SET next_race_date = '2026-08-16' WHERE name = 'IRONMAN Copenhagen';
-- IRONMAN Bolton: full 140.6 discontinued after 2023 (70.3 only now)
UPDATE race_courses SET next_race_date = '2026-10-04' WHERE name = 'IRONMAN Barcelona';
UPDATE race_courses SET next_race_date = '2026-07-12' WHERE name = 'IRONMAN Vitoria-Gasteiz';
UPDATE race_courses SET next_race_date = '2026-06-07' WHERE name = 'IRONMAN Hamburg';
UPDATE race_courses SET next_race_date = '2026-05-23' WHERE name = 'IRONMAN Lanzarote';
UPDATE race_courses SET next_race_date = '2026-04-12' WHERE name = 'IRONMAN Taiwan';
UPDATE race_courses SET next_race_date = '2026-12-06' WHERE name = 'IRONMAN Western Australia';
UPDATE race_courses SET next_race_date = '2026-09-20' WHERE name = 'IRONMAN Italy Emilia Romagna';
-- IRONMAN Alaska: discontinued after 2022

-- ==========================================================================
-- IRONMAN 70.3 — 2026 dates
-- ==========================================================================

UPDATE race_courses SET next_race_date = '2026-05-17' WHERE name = 'IRONMAN 70.3 Chattanooga';
UPDATE race_courses SET next_race_date = '2026-03-28' WHERE name = 'IRONMAN 70.3 Oceanside';
UPDATE race_courses SET next_race_date = '2026-05-09' WHERE name = 'IRONMAN 70.3 Gulf Coast';
UPDATE race_courses SET next_race_date = '2026-07-26' WHERE name = 'IRONMAN 70.3 Maine';
UPDATE race_courses SET next_race_date = '2026-06-14' WHERE name = 'IRONMAN 70.3 Eagleman';
UPDATE race_courses SET next_race_date = '2026-07-19' WHERE name = 'IRONMAN 70.3 Ohio';
-- IRONMAN 70.3 Steelhead: discontinued after 2023
UPDATE race_courses SET next_race_date = '2026-09-27' WHERE name = 'IRONMAN 70.3 Augusta';
UPDATE race_courses SET next_race_date = '2026-12-06' WHERE name = 'IRONMAN 70.3 Indian Wells';
UPDATE race_courses SET next_race_date = '2026-06-21' WHERE name = 'IRONMAN 70.3 Coeur d''Alene';
UPDATE race_courses SET next_race_date = '2026-09-13' WHERE name = 'IRONMAN 70.3 Santa Cruz';
-- IRONMAN 70.3 Marbella: discontinued, replaced by IRONMAN 70.3 Malaga
UPDATE race_courses SET next_race_date = '2026-03-09' WHERE name = 'IRONMAN 70.3 Dubai';
UPDATE race_courses SET next_race_date = '2026-03-07' WHERE name = 'IRONMAN 70.3 Taupo';
UPDATE race_courses SET next_race_date = '2026-09-13' WHERE name = 'IRONMAN 70.3 Sunshine Coast';
UPDATE race_courses SET next_race_date = '2026-03-22' WHERE name = 'IRONMAN 70.3 Geelong';
-- IRONMAN 70.3 Lubbock: discontinued after 2022
UPDATE race_courses SET next_race_date = '2026-05-24' WHERE name = 'IRONMAN 70.3 Victoria';
UPDATE race_courses SET next_race_date = '2026-06-21' WHERE name = 'IRONMAN 70.3 Mont-Tremblant';
-- IRONMAN 70.3 Davos: does not exist as IRONMAN event
UPDATE race_courses SET next_race_date = '2026-10-17' WHERE name = 'IRONMAN 70.3 Cascais';
UPDATE race_courses SET next_race_date = '2026-03-15' WHERE name = 'IRONMAN 70.3 Puerto Rico';
UPDATE race_courses SET next_race_date = '2026-11-29' WHERE name = 'IRONMAN 70.3 Cartagena';
UPDATE race_courses SET next_race_date = '2026-06-07' WHERE name = 'IRONMAN 70.3 South Africa';
UPDATE race_courses SET next_race_date = '2026-11-15' WHERE name = 'IRONMAN 70.3 Bahrain';
UPDATE race_courses SET next_race_date = '2026-07-12' WHERE name = 'IRONMAN 70.3 Musselman';
UPDATE race_courses SET next_race_date = '2026-06-13' WHERE name = 'IRONMAN 70.3 Boulder';
UPDATE race_courses SET next_race_date = '2026-10-04' WHERE name = 'IRONMAN 70.3 Waco';
UPDATE race_courses SET next_race_date = '2026-06-07' WHERE name = 'IRONMAN 70.3 Des Moines';
UPDATE race_courses SET next_race_date = '2026-07-19' WHERE name = 'IRONMAN 70.3 Oregon';

-- ==========================================================================
-- World Triathlon Championship Series — 2026 dates (from WT API)
-- ==========================================================================

UPDATE race_courses SET next_race_date = '2026-03-28' WHERE name = 'World Triathlon Championship Series Abu Dhabi';
UPDATE race_courses SET next_race_date = '2026-05-16' WHERE name = 'World Triathlon Championship Series Yokohama';
UPDATE race_courses SET next_race_date = '2026-07-11' WHERE name = 'World Triathlon Championship Series Hamburg';
-- WTCS Montreal: not on 2026 calendar
-- WTCS Leeds: not on 2026 calendar
-- WTCS Paris: not on 2026 calendar
-- WTCS Bermuda: not on 2026 calendar
-- WTCS Cagliari: not on 2026 calendar
-- WTCS Sunderland: not on 2026 calendar
-- WTCS Valencia: not on 2026 calendar
UPDATE race_courses SET next_race_date = '2026-09-23' WHERE name = 'World Triathlon Championship Series Pontevedra';
UPDATE race_courses SET next_race_date = '2026-09-23' WHERE name = 'World Triathlon Championship Finals';
-- WTS Miyazaki: not on 2026 calendar
-- WTS Tongyeong: not on 2026 calendar
-- WTS Cape Town: not on 2026 calendar

-- ==========================================================================
-- T100 Triathlon World Tour — 2026 dates (from WT API)
-- ==========================================================================

UPDATE race_courses SET next_race_date = '2026-04-25' WHERE name = 'T100 Triathlon World Tour Singapore';
UPDATE race_courses SET next_race_date = '2026-06-06' WHERE name = 'T100 Triathlon World Tour San Francisco';
-- T100 Las Vegas: not on 2026 calendar
-- T100 London: not on 2026 calendar (replaced by T100 Vancouver/French Riviera)
-- T100 Ibiza: not on 2026 calendar (replaced by T100 Spain)

-- ==========================================================================
-- Challenge Family — 2026 dates
-- ==========================================================================

UPDATE race_courses SET next_race_date = '2026-09-12' WHERE name = 'Challenge Almere-Amsterdam';
-- Challenge Roth, Daytona, Cancun, Miami, Wanaka, Shepparton, Walchsee, St. Polten, Gdansk:
-- not in WT API dataset — leave NULL for user to fill in

-- ==========================================================================
-- Other Notable Races — 2026 dates
-- ==========================================================================

UPDATE race_courses SET next_race_date = '2026-06-07' WHERE name = 'Escape from Alcatraz Triathlon';
UPDATE race_courses SET next_race_date = '2026-07-26' WHERE name = 'NYC Triathlon';
UPDATE race_courses SET next_race_date = '2026-05-02' WHERE name = 'Wildflower Triathlon';
UPDATE race_courses SET next_race_date = '2026-04-25' WHERE name = 'St. Anthony''s Triathlon';
UPDATE race_courses SET next_race_date = '2026-07-09' WHERE name = 'Vineman Triathlon';
-- Buffalo Springs Lake 70.3: discontinued after 2022
UPDATE race_courses SET next_race_date = '2026-05-25' WHERE name = 'LifeTime Tri Cap Tex';
UPDATE race_courses SET next_race_date = '2026-07-11' WHERE name = 'Door County Triathlon';
-- Alcatraz Triathlon Sprint: no 2026 event found
UPDATE race_courses SET next_race_date = '2026-11-01' WHERE name = 'Noosa Triathlon';
UPDATE race_courses SET next_race_date = '2026-01-30' WHERE name = 'Israman Triathlon';
UPDATE race_courses SET next_race_date = '2026-10-10' WHERE name = 'XTERRA World Championship';
UPDATE race_courses SET next_race_date = '2026-09-12' WHERE name = 'Ironman 70.3 World Championship';
UPDATE race_courses SET next_race_date = '2026-08-23' WHERE name = 'Chicago Triathlon';
-- SOS Triathlon: 2026 date not confirmed
UPDATE race_courses SET next_race_date = '2026-09-20' WHERE name = 'Malibu Triathlon';
UPDATE race_courses SET next_race_date = '2026-05-30' WHERE name = 'Honu Half Triathlon';
-- Timberman 70.3: discontinued after 2022
UPDATE race_courses SET next_race_date = '2026-11-08' WHERE name = 'Ironman 70.3 Campeche';
-- Challenge Cape Town: discontinued
