-- Combined Standings Script: Girls Volleyball (Fall 2025), Baseball (Spring 2025), Softball (Spring 2025)
-- Run this in Supabase Studio SQL Editor
-- Copy and paste this entire script

-- ============================================================================
-- GIRLS VOLLEYBALL - Fall 2025
-- ============================================================================

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

  -- OIA EAST (Division I)
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

  -- OIA WEST (Division I)
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

  -- OIA DIVISION II
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

  -- ILH DIVISION I
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

  -- ILH DIVISION II
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

  -- BIIF DIVISION I
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

  -- MIL DIVISION I
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

  -- MIL DIVISION II
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

  -- KIF
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

  RAISE NOTICE 'Girls Volleyball 2025 standings added';
END $$;

-- ============================================================================
-- BASEBALL - Spring 2025
-- ============================================================================

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

  -- OIA D1 EAST
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

  -- OIA D1 WEST
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

  -- OIA D2
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

  -- ILH D1
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

  -- ILH D2
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

  -- BIIF D1
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

  -- MIL D1
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

  -- KIF
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

  RAISE NOTICE 'Baseball 2025 standings added';
END $$;

-- ============================================================================
-- SOFTBALL - Spring 2025
-- ============================================================================

DO $$
DECLARE
  v_sport_id UUID;
  v_school_id UUID;
BEGIN
  SELECT id INTO v_sport_id FROM sports WHERE code = 'softball' LIMIT 1;

  IF v_sport_id IS NULL THEN
    RAISE NOTICE 'softball sport not found';
    RETURN;
  END IF;

  -- OIA D1 EAST
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kaiser' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 East', 9, 1, 12, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kalani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 East', 8, 2, 9, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Moanalua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 East', 7, 3, 11, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Castle' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 East', 4, 6, 4, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kaimuki' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 East', 2, 8, 2, 9) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Roosevelt' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 East', 0, 10, 0, 10) ON CONFLICT DO NOTHING;
  END IF;

  -- OIA D1 WEST
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mililani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 West', 9, 1, 15, 1) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Campbell' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 West', 9, 1, 14, 3) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Leilehua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 West', 5, 5, 6, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapolei' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 West', 5, 5, 6, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waianae' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 West', 2, 8, 3, 10) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Nanakuli' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D1 West', 0, 10, 0, 11) ON CONFLICT DO NOTHING;
  END IF;

  -- OIA D2
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Pearl City' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 9, 0, 13, 1) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Aiea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 7, 2, 10, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kailua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 7, 2, 11, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Radford' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 7, 2, 10, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waialua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 5, 4, 7, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kahuku' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 3, 6, 3, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kalaheo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 3, 6, 3, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Farrington' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 3, 6, 3, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waipahu' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 1, 8, 1, 8) ON CONFLICT DO NOTHING;
  END IF;

  -- ILH D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Punahou' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 12, 3, 14, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maryknoll' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 12, 4, 14, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 9, 8, 13, 9) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name ILIKE '%Iolani%' AND short_name NOT LIKE '%II%' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 6, 10, 6, 10) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mid-Pacific' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 0, 14, 0, 14) ON CONFLICT DO NOTHING;
  END IF;

  -- ILH D2
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Pac-Five' OR short_name = 'PAC-5' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 10, 2, 12, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Sacred Hearts' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 1, 11, 1, 11) ON CONFLICT DO NOTHING;
  END IF;

  -- BIIF D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hilo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 11, 0, 11, 2) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waiakea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 8, 4, 8, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kealakehe' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 5, 6, 5, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Keaau' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 1, 8, 2, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Konawaena' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 0, 7, 0, 8) ON CONFLICT DO NOTHING;
  END IF;

  -- BIIF D2
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kohala' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D2', 9, 2, 9, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha Hawaii' OR short_name = 'KS-Hawaii' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D2', 8, 3, 8, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Pahoa' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D2', 4, 6, 4, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Honokaa' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D2', 3, 7, 3, 7) ON CONFLICT DO NOTHING;
  END IF;

  -- MIL D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Baldwin' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 14, 0, 15, 2) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kekaulike' OR short_name = 'King Kekaulike' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 9, 5, 10, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maui High' OR short_name = 'Maui' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 5, 7, 5, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Lahainaluna' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 4, 9, 4, 9) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha Maui' OR short_name = 'KS-Maui' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 0, 11, 0, 11) ON CONFLICT DO NOTHING;
  END IF;

  -- MIL D2
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Lanai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D2', 8, 1, 8, 3) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Molokai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D2', 6, 4, 6, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hana' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D2', 0, 9, 0, 9) ON CONFLICT DO NOTHING;
  END IF;

  -- KIF
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapaa' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'KIF', 12, 0, 15, 0) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waimea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'KIF', 5, 7, 9, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kauai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2025, 'KIF', 1, 11, 1, 11) ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE 'Softball 2025 standings added';
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'SUMMARY' as section;
SELECT s.code as sport, ss.league, COUNT(*) as teams
FROM season_standings ss
JOIN sports s ON ss.sport_id = s.id
WHERE s.code IN ('girls-volleyball', 'baseball', 'softball')
AND ss.season_year = 2025
GROUP BY s.code, ss.league
ORDER BY s.code, ss.league;
