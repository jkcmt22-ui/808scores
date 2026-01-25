-- Update Standings with Correct League vs Overall Records
-- Run this in Supabase Studio SQL Editor to update existing records
-- This script uses UPSERT to update existing records or insert new ones

-- ============================================
-- GIRLS VOLLEYBALL - Fall 2025
-- ============================================

DO $$
DECLARE
  v_sport_id UUID;
  v_school_id UUID;
BEGIN
  SELECT id INTO v_sport_id FROM sports WHERE code = 'girls-volleyball' LIMIT 1;
  IF v_sport_id IS NULL THEN RAISE NOTICE 'girls-volleyball not found'; RETURN; END IF;

  -- OIA EAST
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kahuku' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 12, 0, 0, 14, 2, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 12, league_losses = 0, league_ties = 0,
      overall_wins = 14, overall_losses = 2, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Moanalua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 10, 2, 0, 13, 4, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 10, league_losses = 2, league_ties = 0,
      overall_wins = 13, overall_losses = 4, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kalaheo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 6, 5, 0, 7, 6, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 6, league_losses = 5, league_ties = 0,
      overall_wins = 7, overall_losses = 6, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Farrington' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 3, 8, 0, 4, 9, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 3, league_losses = 8, league_ties = 0,
      overall_wins = 4, overall_losses = 9, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Castle' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 2, 8, 0, 2, 9, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 2, league_losses = 8, league_ties = 0,
      overall_wins = 2, overall_losses = 9, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kalani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA East', 1, 10, 0, 1, 11, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 1, league_losses = 10, league_ties = 0,
      overall_wins = 1, overall_losses = 11, overall_ties = 0;
  END IF;

  -- OIA WEST
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapolei' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 10, 2, 0, 12, 4, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 10, league_losses = 2, league_ties = 0,
      overall_wins = 12, overall_losses = 4, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mililani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 9, 3, 0, 12, 5, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 9, league_losses = 3, league_ties = 0,
      overall_wins = 12, overall_losses = 5, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Campbell' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 8, 4, 0, 10, 6, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 8, league_losses = 4, league_ties = 0,
      overall_wins = 10, overall_losses = 6, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Pearl City' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 4, 7, 0, 5, 9, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 4, league_losses = 7, league_ties = 0,
      overall_wins = 5, overall_losses = 9, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Nanakuli' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 3, 7, 0, 3, 8, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 3, league_losses = 7, league_ties = 0,
      overall_wins = 3, overall_losses = 8, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waialua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA West', 0, 11, 0, 0, 11, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 0, league_losses = 11, league_ties = 0,
      overall_wins = 0, overall_losses = 11, overall_ties = 0;
  END IF;

  -- OIA D2
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Roosevelt' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 11, 2, 0, 12, 3, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 11, league_losses = 2, league_ties = 0,
      overall_wins = 12, overall_losses = 3, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Leilehua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 10, 2, 0, 11, 3, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 10, league_losses = 2, league_ties = 0,
      overall_wins = 11, overall_losses = 3, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waianae' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 7, 4, 0, 8, 4, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 7, league_losses = 4, league_ties = 0,
      overall_wins = 8, overall_losses = 4, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waipahu' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 6, 5, 0, 8, 6, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 6, league_losses = 5, league_ties = 0,
      overall_wins = 8, overall_losses = 6, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kaiser' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 5, 4, 0, 6, 4, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 5, league_losses = 4, league_ties = 0,
      overall_wins = 6, overall_losses = 4, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kailua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 4, 5, 0, 4, 6, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 4, league_losses = 5, league_ties = 0,
      overall_wins = 4, overall_losses = 6, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Aiea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 3, 5, 0, 3, 6, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 3, league_losses = 5, league_ties = 0,
      overall_wins = 3, overall_losses = 6, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Radford' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'OIA D2', 2, 6, 0, 2, 7, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 2, league_losses = 6, league_ties = 0,
      overall_wins = 2, overall_losses = 7, overall_ties = 0;
  END IF;

  -- ILH D1
  SELECT id INTO v_school_id FROM schools WHERE short_name ILIKE '%Iolani%' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 14, 0, 0, 17, 1, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 14, league_losses = 0, league_ties = 0,
      overall_wins = 17, overall_losses = 1, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 10, 4, 0, 13, 7, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 10, league_losses = 4, league_ties = 0,
      overall_wins = 13, overall_losses = 7, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Punahou' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 6, 6, 0, 7, 7, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 6, league_losses = 6, league_ties = 0,
      overall_wins = 7, overall_losses = 7, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mid-Pacific' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D1', 3, 9, 0, 5, 10, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 3, league_losses = 9, league_ties = 0,
      overall_wins = 5, overall_losses = 10, overall_ties = 0;
  END IF;

  -- ILH D2
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'University Lab' OR short_name = 'University' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 10, 4, 0, 13, 6, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 10, league_losses = 4, league_ties = 0,
      overall_wins = 13, overall_losses = 6, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hawaii Baptist' OR short_name = 'HBA' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 10, 5, 0, 13, 7, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 10, league_losses = 5, league_ties = 0,
      overall_wins = 13, overall_losses = 7, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Damien' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 7, 6, 0, 9, 8, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 7, league_losses = 6, league_ties = 0,
      overall_wins = 9, overall_losses = 8, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maryknoll' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 6, 9, 0, 9, 12, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 6, league_losses = 9, league_ties = 0,
      overall_wins = 9, overall_losses = 12, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Le Jardin' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 5, 9, 0, 6, 12, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 5, league_losses = 9, league_ties = 0,
      overall_wins = 6, overall_losses = 12, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Sacred Hearts' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'ILH D2', 5, 8, 0, 6, 11, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 5, league_losses = 8, league_ties = 0,
      overall_wins = 6, overall_losses = 11, overall_ties = 0;
  END IF;

  -- BIIF D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha Hawaii' OR short_name = 'KS-Hawaii' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 14, 0, 0, 20, 1, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 14, league_losses = 0, league_ties = 0,
      overall_wins = 20, overall_losses = 1, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hilo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 11, 3, 0, 14, 5, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 11, league_losses = 3, league_ties = 0,
      overall_wins = 14, overall_losses = 5, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Konawaena' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 10, 3, 0, 13, 4, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 10, league_losses = 3, league_ties = 0,
      overall_wins = 13, overall_losses = 4, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waiakea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 10, 3, 0, 13, 5, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 10, league_losses = 3, league_ties = 0,
      overall_wins = 13, overall_losses = 5, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kealakehe' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 6, 5, 0, 8, 6, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 6, league_losses = 5, league_ties = 0,
      overall_wins = 8, overall_losses = 6, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Keaau' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'BIIF D1', 5, 6, 0, 7, 8, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 5, league_losses = 6, league_ties = 0,
      overall_wins = 7, overall_losses = 8, overall_ties = 0;
  END IF;

  -- MIL D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha Maui' OR short_name = 'KS-Maui' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 11, 1, 0, 13, 3, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 11, league_losses = 1, league_ties = 0,
      overall_wins = 13, overall_losses = 3, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kekaulike' OR short_name = 'King Kekaulike' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 8, 4, 0, 10, 5, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 8, league_losses = 4, league_ties = 0,
      overall_wins = 10, overall_losses = 5, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Baldwin' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 5, 6, 0, 6, 7, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 5, league_losses = 6, league_ties = 0,
      overall_wins = 6, overall_losses = 7, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maui High' OR short_name = 'Maui' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 4, 7, 0, 5, 9, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 4, league_losses = 7, league_ties = 0,
      overall_wins = 5, overall_losses = 9, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Lahainaluna' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D1', 0, 12, 0, 0, 13, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 0, league_losses = 12, league_ties = 0,
      overall_wins = 0, overall_losses = 13, overall_ties = 0;
  END IF;

  -- MIL D2
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Seabury Hall' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D2', 16, 0, 0, 18, 1, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 16, league_losses = 0, league_ties = 0,
      overall_wins = 18, overall_losses = 1, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Molokai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D2', 10, 5, 0, 13, 7, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 10, league_losses = 5, league_ties = 0,
      overall_wins = 13, overall_losses = 7, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Lanai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'MIL D2', 9, 4, 0, 11, 5, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 9, league_losses = 4, league_ties = 0,
      overall_wins = 11, overall_losses = 5, overall_ties = 0;
  END IF;

  -- KIF
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapaa' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'KIF', 12, 0, 0, 15, 0, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 12, league_losses = 0, league_ties = 0,
      overall_wins = 15, overall_losses = 0, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Island School' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'KIF', 4, 5, 0, 5, 7, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 4, league_losses = 5, league_ties = 0,
      overall_wins = 5, overall_losses = 7, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kauai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'KIF', 3, 6, 0, 4, 8, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 3, league_losses = 6, league_ties = 0,
      overall_wins = 4, overall_losses = 8, overall_ties = 0;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waimea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties)
    VALUES (v_school_id, v_sport_id, 2025, 'KIF', 2, 7, 0, 3, 9, 0)
    ON CONFLICT (school_id, sport_id, season_year) DO UPDATE SET
      league_wins = 2, league_losses = 7, league_ties = 0,
      overall_wins = 3, overall_losses = 9, overall_ties = 0;
  END IF;

  RAISE NOTICE 'Girls Volleyball 2025 standings updated';
END $$;

-- Verify
SELECT 'Girls Volleyball' as sport, league, COUNT(*) as teams
FROM season_standings ss
JOIN sports s ON ss.sport_id = s.id
WHERE s.code = 'girls-volleyball' AND ss.season_year = 2025
GROUP BY league ORDER BY league;
