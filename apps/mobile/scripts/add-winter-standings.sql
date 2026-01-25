-- Add Winter Sports Standings (Girls Basketball, Boys Soccer, Girls Soccer)
-- Run this in Supabase Studio SQL Editor

-- ============================================
-- GIRLS BASKETBALL STANDINGS
-- ============================================

DO $$
DECLARE
  v_sport_id UUID;
  v_school_id UUID;
BEGIN
  SELECT id INTO v_sport_id FROM sports WHERE code = 'girls-basketball' LIMIT 1;

  IF v_sport_id IS NULL THEN
    RAISE NOTICE 'girls-basketball sport not found';
    RETURN;
  END IF;

  -- OIA D1 East
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kalani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 11, 0, 15, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Moanalua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 9, 2, 10, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kailua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 7, 5, 14, 12) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kaiser' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 5, 6, 9, 12) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kahuku' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 4, 7, 8, 14) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Castle' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 0, 11, 2, 18) ON CONFLICT DO NOTHING;
  END IF;

  -- OIA D1 West
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Campbell' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 11, 0, 17, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mililani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 7, 4, 13, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Leilehua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 7, 5, 16, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapolei' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 5, 6, 10, 12) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Pearl City' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 3, 8, 5, 14) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waianae' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 0, 11, 1, 15) ON CONFLICT DO NOTHING;
  END IF;

  -- ILH D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 9, 0, 19, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name ILIKE '%Iolani%' AND short_name NOT LIKE '%II%' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 5, 4, 11, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maryknoll' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 4, 5, 12, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Punahou' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 4, 5, 11, 12) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mid-Pacific' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 0, 9, 3, 16) ON CONFLICT DO NOTHING;
  END IF;

  -- ILH D2
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hawaii Baptist' OR short_name = 'HBA' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D2', 12, 0, 22, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Sacred Hearts' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D2', 8, 3, 20, 6) ON CONFLICT DO NOTHING;
  END IF;

  -- BIIF D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waiakea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 11, 1, 17, 1) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Konawaena' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 7, 0, 14, 2) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hilo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 7, 4, 12, 9) ON CONFLICT DO NOTHING;
  END IF;

  -- MIL D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maui High' OR short_name = 'Maui' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'MIL D1', 12, 0, 16, 2) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Lahainaluna' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'MIL D1', 9, 3, 12, 3) ON CONFLICT DO NOTHING;
  END IF;

  -- KIF
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waimea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'KIF', 11, 0, 14, 0) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapaa' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'KIF', 7, 4, 10, 7) ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- ============================================
-- BOYS SOCCER STANDINGS
-- ============================================

DO $$
DECLARE
  v_sport_id UUID;
  v_school_id UUID;
BEGIN
  SELECT id INTO v_sport_id FROM sports WHERE code = 'boys-soccer' LIMIT 1;

  IF v_sport_id IS NULL THEN
    RAISE NOTICE 'boys-soccer sport not found';
    RETURN;
  END IF;

  -- OIA D1 East
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kalani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 7, 1, 2, 9, 1, 2, 23) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Castle' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 7, 2, 1, 9, 3, 1, 22) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kaiser' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 6, 2, 2, 8, 3, 2, 20) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Moanalua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 4, 4, 2, 5, 5, 2, 14) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kailua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 2, 6, 2, 3, 7, 2, 8) ON CONFLICT DO NOTHING;
  END IF;

  -- OIA D1 West
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mililani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 9, 1, 0, 11, 1, 0, 27) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Campbell' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 8, 1, 1, 10, 2, 1, 25) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapolei' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 5, 4, 1, 6, 5, 1, 16) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Pearl City' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 3, 6, 1, 4, 7, 1, 10) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Leilehua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 1, 8, 1, 2, 9, 1, 4) ON CONFLICT DO NOTHING;
  END IF;

  -- ILH D1
  SELECT id INTO v_school_id FROM schools WHERE short_name ILIKE '%Iolani%' AND short_name NOT LIKE '%II%' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 9, 0, 0, 9, 0, 0, 27) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Punahou' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 7, 2, 0, 7, 2, 0, 21) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 6, 3, 0, 6, 3, 0, 18) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mid-Pacific' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 4, 5, 0, 4, 5, 0, 12) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Saint Louis' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 1, 8, 0, 1, 8, 0, 3) ON CONFLICT DO NOTHING;
  END IF;

  -- BIIF D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hilo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 8, 0, 1, 8, 0, 1, 25) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waiakea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 5, 3, 1, 5, 3, 1, 16) ON CONFLICT DO NOTHING;
  END IF;

  -- MIL D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kekaulike' OR short_name = 'King Kekaulike' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'MIL D1', 10, 0, 0, 10, 0, 0, 30) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Baldwin' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'MIL D1', 7, 3, 0, 7, 3, 0, 21) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maui High' OR short_name = 'Maui' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'MIL D1', 4, 6, 0, 4, 6, 0, 12) ON CONFLICT DO NOTHING;
  END IF;

  -- KIF
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapaa' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'KIF', 9, 0, 2, 9, 0, 2, 29) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kauai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'KIF', 6, 3, 2, 6, 3, 2, 20) ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- ============================================
-- GIRLS SOCCER STANDINGS
-- ============================================

DO $$
DECLARE
  v_sport_id UUID;
  v_school_id UUID;
BEGIN
  SELECT id INTO v_sport_id FROM sports WHERE code = 'girls-soccer' LIMIT 1;

  IF v_sport_id IS NULL THEN
    RAISE NOTICE 'girls-soccer sport not found';
    RETURN;
  END IF;

  -- OIA D1 East
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kaiser' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 8, 0, 2, 10, 1, 2, 26) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Moanalua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 8, 1, 1, 8, 3, 1, 25) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kalani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 5, 3, 2, 6, 4, 2, 17) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Castle' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 3, 5, 2, 4, 6, 2, 11) ON CONFLICT DO NOTHING;
  END IF;

  -- OIA D1 West
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Campbell' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 8, 0, 2, 11, 0, 2, 26) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mililani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 8, 0, 2, 10, 1, 2, 26) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapolei' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 5, 4, 1, 6, 5, 1, 16) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Pearl City' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 3, 6, 1, 4, 7, 1, 10) ON CONFLICT DO NOTHING;
  END IF;

  -- ILH D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 7, 1, 0, 7, 1, 0, 21) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Punahou' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 5, 2, 1, 5, 2, 1, 16) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name ILIKE '%Iolani%' AND short_name NOT LIKE '%II%' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 5, 3, 0, 5, 3, 0, 15) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mid-Pacific' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 3, 5, 0, 3, 5, 0, 9) ON CONFLICT DO NOTHING;
  END IF;

  -- BIIF D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waiakea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 7, 2, 1, 7, 2, 1, 22) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hilo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 7, 3, 0, 7, 3, 0, 21) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Konawaena' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 5, 4, 1, 5, 4, 1, 16) ON CONFLICT DO NOTHING;
  END IF;

  -- MIL D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha Maui' OR short_name = 'KS-Maui' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'MIL D1', 9, 1, 2, 9, 1, 2, 29) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Baldwin' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'MIL D1', 9, 1, 2, 9, 1, 2, 29) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maui High' OR short_name = 'Maui' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'MIL D1', 5, 5, 2, 5, 5, 2, 17) ON CONFLICT DO NOTHING;
  END IF;

  -- KIF
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kauai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'KIF', 6, 2, 4, 6, 2, 4, 22) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapaa' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'KIF', 5, 3, 4, 5, 3, 4, 19) ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- Verify the standings were added
SELECT s.display_name as sport, COUNT(*) as standings_count
FROM season_standings ss
JOIN sports s ON ss.sport_id = s.id
GROUP BY s.display_name
ORDER BY s.display_name;
