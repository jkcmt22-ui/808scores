-- Add Girls Volleyball Standings (Fall 2025 Season)
-- Run this in Supabase Studio SQL Editor
-- Data sourced from ScoringLive.com

DO $$
DECLARE
  v_sport_id UUID;
  v_school_id UUID;
BEGIN
  SELECT id INTO v_sport_id FROM sports WHERE code = 'girls-volleyball' LIMIT 1;

  IF v_sport_id IS NULL THEN
    RAISE NOTICE 'girls-volleyball sport not found';
    RETURN;
  END IF;

  -- ============================================
  -- OIA EAST (Division I)
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kahuku' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 12, 0, 14, 2) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Moanalua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 10, 2, 13, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kalaheo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 6, 5, 7, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Farrington' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 3, 8, 4, 9) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Castle' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 2, 8, 2, 9) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kalani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 1, 10, 1, 11) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- OIA WEST (Division I)
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapolei' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 10, 2, 12, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mililani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 9, 3, 12, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Campbell' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 8, 4, 10, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Pearl City' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 4, 7, 5, 9) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Nanakuli' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 3, 7, 3, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waialua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 0, 11, 0, 11) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- OIA DIVISION II
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Roosevelt' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 11, 2, 12, 3) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Leilehua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 10, 2, 11, 3) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waianae' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 7, 4, 8, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waipahu' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 6, 5, 8, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kaiser' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 5, 4, 6, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kailua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 4, 5, 4, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Aiea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 3, 5, 3, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Radford' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 2, 6, 2, 7) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- ILH DIVISION I
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name ILIKE '%Iolani%' AND short_name NOT LIKE '%II%' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 14, 0, 17, 1) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 10, 4, 13, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Punahou' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 6, 6, 7, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mid-Pacific' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 3, 9, 5, 10) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- ILH DIVISION II
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'University Lab' OR short_name = 'University' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 10, 4, 13, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hawaii Baptist' OR short_name = 'HBA' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 10, 5, 13, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Damien' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 7, 6, 9, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maryknoll' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 6, 9, 9, 12) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Le Jardin' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 5, 9, 6, 12) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Sacred Hearts' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 5, 8, 6, 11) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- BIIF DIVISION I (Combined East/West top teams)
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha Hawaii' OR short_name = 'KS-Hawaii' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 14, 0, 20, 1) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hilo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 11, 3, 14, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Konawaena' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 10, 3, 13, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waiakea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 10, 3, 13, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kealakehe' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 6, 5, 8, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Keaau' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 5, 6, 7, 8) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- MIL DIVISION I
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha Maui' OR short_name = 'KS-Maui' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 11, 1, 13, 3) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kekaulike' OR short_name = 'King Kekaulike' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 8, 4, 10, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Baldwin' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 5, 6, 6, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maui High' OR short_name = 'Maui' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 4, 7, 5, 9) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Lahainaluna' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 0, 12, 0, 13) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- MIL DIVISION II
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Seabury Hall' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D2', 16, 0, 18, 1) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Molokai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D2', 10, 5, 13, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Lanai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D2', 9, 4, 11, 5) ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- KIF
  -- ============================================

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapaa' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'KIF', 12, 0, 15, 0) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Island School' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'KIF', 4, 5, 5, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kauai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'KIF', 3, 6, 4, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waimea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'KIF', 2, 7, 3, 9) ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- Verify the volleyball standings were added
SELECT league, COUNT(*) as team_count
FROM season_standings ss
JOIN sports s ON ss.sport_id = s.id
WHERE s.code = 'girls-volleyball' AND ss.season_year = 2025
GROUP BY league
ORDER BY league;
