-- ---------------------------------------------------------------------------
-- Backfill missing race dates + mark discontinued races
-- ---------------------------------------------------------------------------

-- ==========================================================================
-- Challenge Family — confirmed 2026 dates
-- ==========================================================================

UPDATE race_courses SET next_race_date = '2026-07-05' WHERE name = 'Challenge Roth';
UPDATE race_courses SET next_race_date = '2026-06-28' WHERE name = 'Challenge Walchsee';
UPDATE race_courses SET next_race_date = '2026-05-31' WHERE name = 'Challenge St. Polten';
UPDATE race_courses SET next_race_date = '2026-06-21' WHERE name = 'Challenge Gdansk';

-- Challenge Wanaka full 140.6 moved to Feb 2027; half was Feb 21 2026
-- Using the next full-distance date
UPDATE race_courses SET next_race_date = '2027-02-21' WHERE name = 'Challenge Wanaka';

-- Challenge Shepparton — typically Labour Day weekend (2nd Mon of March in VIC)
UPDATE race_courses SET next_race_date = '2026-03-08' WHERE name = 'Challenge Shepparton';

-- ==========================================================================
-- Rebranded races — update to CLASH Endurance branding + add dates
-- ==========================================================================

-- Challenge Daytona → now CLASH Endurance Daytona
UPDATE race_courses SET name = 'CLASH Endurance Daytona', next_race_date = '2026-12-04' WHERE name = 'Challenge Daytona';

-- Challenge Miami → now CLASH Endurance Miami
UPDATE race_courses SET name = 'CLASH Endurance Miami', next_race_date = '2026-03-27' WHERE name = 'Challenge Miami';

-- ==========================================================================
-- Discontinued — mark with notable_features so users know
-- ==========================================================================

-- Challenge Cancun: discontinued as of 2026
UPDATE race_courses SET notable_features = notable_features || ' [DISCONTINUED]' WHERE name = 'Challenge Cancun' AND notable_features NOT LIKE '%DISCONTINUED%';

-- Challenge Cape Town: discontinued
UPDATE race_courses SET notable_features = notable_features || ' [DISCONTINUED]' WHERE name = 'Challenge Cape Town' AND notable_features NOT LIKE '%DISCONTINUED%';

-- ==========================================================================
-- SOS Triathlon — correct location (New Paltz, NY not Clermont, FL)
-- ==========================================================================

UPDATE race_courses SET next_race_date = '2026-09-10', location_city = 'New Paltz', location_country = 'United States' WHERE name = 'SOS Triathlon';

-- ==========================================================================
-- Alcatraz Sprint — no separate 2026 event (main Escape from Alcatraz is June 7)
-- Leave NULL; the full Escape from Alcatraz already has its date
-- ==========================================================================

-- ==========================================================================
-- Mark all discontinued IRONMAN/70.3 races too
-- ==========================================================================

UPDATE race_courses SET notable_features = notable_features || ' [DISCONTINUED after 2025]' WHERE name = 'IRONMAN Arizona' AND notable_features NOT LIKE '%DISCONTINUED%';
UPDATE race_courses SET notable_features = notable_features || ' [DISCONTINUED after 2023]' WHERE name = 'IRONMAN Tulsa' AND notable_features NOT LIKE '%DISCONTINUED%';
UPDATE race_courses SET notable_features = notable_features || ' [DISCONTINUED 140.6 after 2023]' WHERE name = 'IRONMAN Bolton' AND notable_features NOT LIKE '%DISCONTINUED%';
UPDATE race_courses SET notable_features = notable_features || ' [DISCONTINUED after 2022]' WHERE name = 'IRONMAN Alaska' AND notable_features NOT LIKE '%DISCONTINUED%';
UPDATE race_courses SET notable_features = notable_features || ' [DISCONTINUED after 2023]' WHERE name = 'IRONMAN 70.3 Steelhead' AND notable_features NOT LIKE '%DISCONTINUED%';
UPDATE race_courses SET notable_features = notable_features || ' [DISCONTINUED after 2022]' WHERE name = 'IRONMAN 70.3 Lubbock' AND notable_features NOT LIKE '%DISCONTINUED%';
UPDATE race_courses SET notable_features = notable_features || ' [DISCONTINUED - replaced by 70.3 Malaga]' WHERE name = 'IRONMAN 70.3 Marbella' AND notable_features NOT LIKE '%DISCONTINUED%';
UPDATE race_courses SET notable_features = notable_features || ' [DISCONTINUED - not an IRONMAN event]' WHERE name = 'IRONMAN 70.3 Davos' AND notable_features NOT LIKE '%DISCONTINUED%';
UPDATE race_courses SET notable_features = notable_features || ' [DISCONTINUED after 2022]' WHERE name = 'Buffalo Springs Lake 70.3' AND notable_features NOT LIKE '%DISCONTINUED%';
UPDATE race_courses SET notable_features = notable_features || ' [DISCONTINUED after 2022]' WHERE name = 'Timberman 70.3' AND notable_features NOT LIKE '%DISCONTINUED%';

-- ==========================================================================
-- Remove races that are not happening — no 2026 (or 2027) date exists
-- ==========================================================================

-- WTCS races not on 2026 calendar
DELETE FROM race_courses WHERE name = 'World Triathlon Championship Series Montreal' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'World Triathlon Championship Series Leeds' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'World Triathlon Championship Series Paris' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'World Triathlon Championship Series Bermuda' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'World Triathlon Championship Series Cagliari' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'World Triathlon Championship Series Sunderland' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'World Triathlon Championship Series Valencia' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'World Triathlon Series Miyazaki' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'World Triathlon Series Tongyeong' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'World Triathlon Series Cape Town' AND user_id IS NULL;

-- T100 races replaced/removed for 2026
DELETE FROM race_courses WHERE name = 'T100 Triathlon World Tour Las Vegas' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'T100 Triathlon World Tour London' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'T100 Triathlon World Tour Ibiza' AND user_id IS NULL;

-- Alcatraz Sprint — no separate event
DELETE FROM race_courses WHERE name = 'Alcatraz Triathlon (Sprint)' AND user_id IS NULL;

-- Discontinued races — remove entirely
DELETE FROM race_courses WHERE name = 'IRONMAN Arizona' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'IRONMAN Tulsa' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'IRONMAN Bolton' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'IRONMAN Alaska' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'IRONMAN 70.3 Steelhead' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'IRONMAN 70.3 Lubbock' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'IRONMAN 70.3 Marbella' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'IRONMAN 70.3 Davos' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'Buffalo Springs Lake 70.3' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'Timberman 70.3' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'Challenge Cancun' AND user_id IS NULL;
DELETE FROM race_courses WHERE name = 'Challenge Cape Town' AND user_id IS NULL;
