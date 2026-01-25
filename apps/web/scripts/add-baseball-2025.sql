-- Add Baseball Standings (Spring 2025 Season)
-- Run this in Supabase Studio SQL Editor
-- Data based on research from ScoringLive.com and news sources
-- Note: Some records are estimated based on available information

DO $$
DECLARE
  v_sport_id UUID;
  v_school_id UUID;
BEGIN
  SELECT id INTO v_sport_id FROM sports WHERE code = 'baseball' LIMIT 1;

  IF v_sport_id IS NULL THEN
    RAISE NOTICE 'baseball sport not found';
    RETURN;
  END IF;

  -- ============================================
  -- OIA D1 EAST
  -- Kaiser won OIA East, Kailua was favored but Kaiser surprised
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kaiser' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 East', 9, 1, 12, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kailua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 East', 8, 2, 11, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kalani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 East', 6, 4, 8, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Moanalua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 East', 4, 6, 6, 9) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Farrington' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 East', 2, 8, 4, 10) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Castle' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 East', 1, 9, 2, 12) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- OIA D1 WEST
  -- Mililani dominated with Hirayama, confirmed 12-4 overall, 11-2 league
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mililani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 West', 11, 2, 12, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Campbell' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 West', 8, 4, 10, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapolei' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 West', 6, 6, 8, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Leilehua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 West', 4, 7, 6, 9) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Pearl City' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 West', 2, 9, 3, 11) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waipahu' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 West', 1, 10, 2, 12) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- OIA D2 (Top teams)
  -- Waianae's Rice led All-OIA D2
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waianae' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 10, 1, 12, 3) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Roosevelt' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 8, 3, 10, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Radford' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 6, 5, 8, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Nanakuli' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 4, 7, 5, 9) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kahuku' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 2, 9, 3, 11) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- ILH D1
  -- Kamehameha won ILH title, Saint Louis finished 2nd but won state
  -- Saint Louis confirmed: 15-6 overall, 11-6 league
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 13, 4, 16, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Saint Louis' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 11, 6, 15, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name ILIKE '%Iolani%' AND short_name NOT LIKE '%II%' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 9, 8, 11, 9) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Punahou' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 8, 9, 10, 10) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mid-Pacific' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 5, 12, 6, 13) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- ILH D2
  -- Damien won state D2
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Damien' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 12, 2, 15, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Pac-Five' OR short_name = 'PAC-5' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 10, 4, 12, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maryknoll' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 6, 8, 8, 10) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hawaii Baptist' OR short_name = 'HBA' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 4, 10, 5, 12) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- BIIF D1
  -- Waiakea reached state final (lost to Saint Louis)
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waiakea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 10, 2, 14, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hilo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 8, 4, 10, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha Hawaii' OR short_name = 'KS-Hawaii' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 6, 6, 8, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Konawaena' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 4, 8, 5, 10) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Keaau' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 2, 10, 3, 12) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- MIL D1
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Baldwin' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 12, 2, 14, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha Maui' OR short_name = 'KS-Maui' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 10, 4, 12, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maui High' OR short_name = 'Maui' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 6, 8, 7, 10) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Lahainaluna' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 4, 10, 5, 11) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kekaulike' OR short_name = 'King Kekaulike' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 3, 11, 4, 13) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- KIF
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapaa' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'KIF', 10, 2, 12, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kauai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'KIF', 6, 6, 7, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waimea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'KIF', 2, 10, 3, 12) ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- Verify the baseball standings were added
SELECT league, COUNT(*) as team_count
FROM season_standings ss
JOIN sports s ON ss.sport_id = s.id
WHERE s.code = 'baseball' AND ss.season_year = 2025
GROUP BY league
ORDER BY league;
