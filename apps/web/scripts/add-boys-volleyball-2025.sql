-- Boys Volleyball Spring 2025 Standings
-- Source: ScoringLive.com
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  v_sport_id UUID;
  v_school_id UUID;
BEGIN
  SELECT id INTO v_sport_id FROM sports WHERE code = 'boys-volleyball' LIMIT 1;

  IF v_sport_id IS NULL THEN
    RAISE NOTICE 'boys-volleyball sport not found';
    RETURN;
  END IF;

  -- ============================================
  -- OIA EAST
  -- ============================================
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Moanalua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 14, 0, 16, 1) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Castle' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 11, 3, 11, 3) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kahuku' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 11, 4, 11, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Roosevelt' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 7, 5, 7, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kalani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 7, 7, 7, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Farrington' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 6, 5, 6, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kaiser' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 5, 6, 5, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kalaheo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 5, 6, 5, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kailua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 4, 8, 4, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'McKinley' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 3, 8, 3, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kaimuki' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 1, 10, 1, 10) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Anuenue' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 0, 11, 0, 11) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- OIA WEST
  -- ============================================
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Aiea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 12, 1, 12, 2) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Campbell' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 10, 4, 12, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Radford' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 6, 4, 11, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mililani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 9, 4, 9, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Pearl City' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 5, 5, 8, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waipahu' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 7, 4, 7, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Leilehua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 6, 7, 6, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapolei' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 3, 7, 4, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Nanakuli' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 2, 8, 2, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waianae' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 2, 8, 2, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waialua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 0, 11, 0, 11) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- ILH D1
  -- ============================================
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Punahou' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 15, 0, 18, 0) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 12, 6, 15, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'University Lab' OR short_name = 'University' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 10, 6, 13, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hawaii Baptist' OR short_name = 'HBA' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 7, 8, 7, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name ILIKE '%Iolani%' AND short_name NOT LIKE '%II%' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 5, 10, 5, 10) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mid-Pacific' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 4, 10, 4, 10) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Saint Louis' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 1, 14, 1, 14) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- ILH D2
  -- ============================================
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Le Jardin' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 15, 0, 17, 1) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maryknoll' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 11, 4, 11, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Damien' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 10, 5, 10, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hanalani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 6, 9, 6, 9) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- BIIF D1
  -- ============================================
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hilo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 14, 0, 14, 2) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Konawaena' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 12, 2, 13, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha Hawaii' OR short_name = 'KS-Hawaii' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 12, 4, 12, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waiakea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 10, 3, 10, 3) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kealakehe' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 8, 3, 9, 3) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Keaau' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 4, 11, 4, 11) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- BIIF D2
  -- ============================================
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hawaii Prep' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D2', 6, 4, 13, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kau' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D2', 8, 5, 9, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Parker' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D2', 7, 4, 9, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Pahoa' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D2', 6, 8, 7, 9) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Honokaa' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D2', 3, 7, 3, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kohala' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D2', 1, 9, 1, 10) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- MIL D1
  -- ============================================
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maui High' OR short_name = 'Maui' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 14, 0, 15, 2) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Baldwin' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 8, 7, 8, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha Maui' OR short_name = 'KS-Maui' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 7, 7, 7, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kekaulike' OR short_name = 'King Kekaulike' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 6, 8, 6, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Lahainaluna' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 0, 13, 0, 13) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- MIL D2
  -- ============================================
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Seabury Hall' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D2', 7, 2, 8, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Lanai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D2', 4, 5, 4, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Molokai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D2', 3, 7, 3, 7) ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE 'Boys Volleyball 2025 standings added successfully';
END $$;

-- Verification query
SELECT 'BOYS VOLLEYBALL 2025 SUMMARY' as section;
SELECT ss.league, COUNT(*) as teams
FROM season_standings ss
JOIN sports s ON ss.sport_id = s.id
WHERE s.code = 'boys-volleyball' AND ss.season_year = 2025
GROUP BY ss.league
ORDER BY ss.league;
