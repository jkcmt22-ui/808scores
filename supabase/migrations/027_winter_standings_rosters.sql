-- Migration 027: Winter 2025-26 Standings and Rosters
-- Data sourced from ScoringLive.com on January 24, 2026

-- ============================================
-- 1. SEASON STANDINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS season_standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  sport_id UUID REFERENCES sports(id) ON DELETE CASCADE NOT NULL,
  season_year INT NOT NULL,
  league TEXT NOT NULL, -- OIA D1 East, ILH D1, etc.
  league_wins INT DEFAULT 0,
  league_losses INT DEFAULT 0,
  league_ties INT DEFAULT 0,
  overall_wins INT DEFAULT 0,
  overall_losses INT DEFAULT 0,
  overall_ties INT DEFAULT 0,
  points INT DEFAULT 0, -- For soccer (3 pts win, 1 pt tie)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, sport_id, season_year)
);

CREATE INDEX idx_standings_sport_season ON season_standings(sport_id, season_year);
CREATE INDEX idx_standings_league ON season_standings(league);

ALTER TABLE season_standings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read standings" ON season_standings FOR SELECT USING (true);
CREATE POLICY "Admin manage standings" ON season_standings FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
);

-- ============================================
-- 2. INSERT BOYS BASKETBALL STANDINGS
-- ============================================

-- Get the boys-basketball sport ID
DO $$
DECLARE
  v_sport_id UUID;
  v_school_id UUID;
BEGIN
  SELECT id INTO v_sport_id FROM sports WHERE code = 'boys-basketball' LIMIT 1;

  IF v_sport_id IS NULL THEN
    RAISE NOTICE 'boys-basketball sport not found';
    RETURN;
  END IF;

  -- OIA D1 East
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kahuku' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 8, 1, 18, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kailua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 8, 1, 18, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kaiser' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 5, 4, 13, 12) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Moanalua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 3, 6, 12, 12) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kalaheo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 3, 6, 8, 13) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Farrington' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 East', 0, 9, 1, 19) ON CONFLICT DO NOTHING;
  END IF;

  -- OIA D1 West
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Nanakuli' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 9, 0, 14, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mililani' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 7, 2, 15, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Leilehua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 5, 4, 11, 11) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapolei' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 4, 5, 5, 12) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Campbell' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 2, 7, 6, 18) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Radford' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D1 West', 0, 9, 2, 14) ON CONFLICT DO NOTHING;
  END IF;

  -- ILH D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Punahou' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 6, 2, 20, 8) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name ILIKE '%Iolani%' AND short_name NOT LIKE '%II%' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 6, 3, 14, 7) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Saint Louis' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 6, 3, 22, 4) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Maryknoll' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 5, 3, 14, 10) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 2, 6, 14, 12) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mid-Pacific' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'ILH D1', 2, 7, 7, 18) ON CONFLICT DO NOTHING;
  END IF;

  -- BIIF D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha Hawaii' OR short_name = 'KS-Hawaii' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 9, 2, 13, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hilo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 7, 3, 7, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Konawaena' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 6, 4, 10, 11) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waiakea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 0, 9, 0, 9) ON CONFLICT DO NOTHING;
  END IF;

  -- MIL D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Baldwin' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'MIL D1', 11, 0, 14, 5) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kekaulike' OR short_name = 'King Kekaulike' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'MIL D1', 8, 4, 11, 6) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Lahainaluna' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'MIL D1', 4, 5, 8, 11) ON CONFLICT DO NOTHING;
  END IF;

  -- KIF
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapaa' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'KIF', 9, 1, 15, 3) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kauai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'KIF', 6, 3, 7, 9) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waimea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'KIF', 4, 5, 6, 11) ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- ============================================
-- 3. INSERT GIRLS BASKETBALL STANDINGS
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
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Konawaena' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 7, 0, 14, 2) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waiakea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 11, 1, 17, 1) ON CONFLICT DO NOTHING;
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

  -- MIL D2
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Lanai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'MIL D2', 12, 0, 18, 1) ON CONFLICT DO NOTHING;
  END IF;

  -- KIF
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waimea' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, overall_wins, overall_losses)
    VALUES (v_school_id, v_sport_id, 2026, 'KIF', 11, 0, 14, 0) ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- ============================================
-- 4. INSERT BOYS SOCCER STANDINGS
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

  -- OIA D2
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kahuku' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D2', 8, 0, 0, 9, 0, 0, 24) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Waipahu' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D2', 6, 1, 1, 7, 1, 1, 19) ON CONFLICT DO NOTHING;
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

  -- BIIF D1
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hilo' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D1', 8, 0, 1, 8, 0, 1, 25) ON CONFLICT DO NOTHING;
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

  -- KIF
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kapaa' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'KIF', 9, 0, 2, 9, 0, 2, 29) ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- ============================================
-- 5. INSERT GIRLS SOCCER STANDINGS
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

  -- OIA D2
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kailua' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D2', 9, 0, 0, 10, 0, 0, 27) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Radford' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'OIA D2', 8, 1, 0, 8, 2, 0, 24) ON CONFLICT DO NOTHING;
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

  -- BIIF D2
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kamehameha Hawaii' OR short_name = 'KS-Hawaii' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'BIIF D2', 8, 0, 0, 9, 0, 0, 24) ON CONFLICT DO NOTHING;
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

  -- KIF
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kauai' LIMIT 1;
  IF v_school_id IS NOT NULL THEN
    INSERT INTO season_standings (school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points)
    VALUES (v_school_id, v_sport_id, 2026, 'KIF', 6, 2, 4, 6, 2, 4, 22) ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- ============================================
-- 6. INSERT PLAYER ROSTERS
-- ============================================

-- Saint Louis Boys Basketball
DO $$
DECLARE
  v_school_id UUID;
  v_sport_id UUID;
  v_player_id UUID;
BEGIN
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Saint Louis' LIMIT 1;
  SELECT id INTO v_sport_id FROM sports WHERE code = 'boys-basketball' LIMIT 1;

  IF v_school_id IS NULL OR v_sport_id IS NULL THEN RETURN; END IF;

  -- Insert players
  INSERT INTO players (id, school_id, first_name, last_name, jersey_number, is_active) VALUES
    (uuid_generate_v4(), v_school_id, 'Rey', 'Fernando', 1, true),
    (uuid_generate_v4(), v_school_id, 'A', 'Kahue-Parker', 3, true),
    (uuid_generate_v4(), v_school_id, 'Keone', 'Ah Sam', 4, true),
    (uuid_generate_v4(), v_school_id, 'Laurence', 'Robello', 5, true),
    (uuid_generate_v4(), v_school_id, 'Alii', 'Woodward', 10, true),
    (uuid_generate_v4(), v_school_id, 'Hunter', 'Reich', 11, true),
    (uuid_generate_v4(), v_school_id, 'Makoa', 'Strohl', 15, true),
    (uuid_generate_v4(), v_school_id, 'Keanu', 'Meacham', 20, true),
    (uuid_generate_v4(), v_school_id, 'Zion', 'Lefotu', 23, true),
    (uuid_generate_v4(), v_school_id, 'Andrew', 'Robello', 30, true),
    (uuid_generate_v4(), v_school_id, 'Ryder', 'Brink', 33, true),
    (uuid_generate_v4(), v_school_id, 'Isaiah', 'Wright', 35, true),
    (uuid_generate_v4(), v_school_id, 'Elijah', 'Salanoa', 50, true),
    (uuid_generate_v4(), v_school_id, 'Ricky', 'Liilii', 55, true),
    (uuid_generate_v4(), v_school_id, 'Jordan', 'Nunuha', NULL, true)
  ON CONFLICT DO NOTHING;

  -- Add player seasons
  FOR v_player_id IN SELECT id FROM players WHERE school_id = v_school_id LOOP
    INSERT INTO player_seasons (player_id, sport_id, season_year)
    VALUES (v_player_id, v_sport_id, 2026)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- Iolani Boys Basketball (with positions)
DO $$
DECLARE
  v_school_id UUID;
  v_sport_id UUID;
  v_player_id UUID;
BEGIN
  SELECT id INTO v_school_id FROM schools WHERE short_name ILIKE '%Iolani%' AND short_name NOT LIKE '%II%' LIMIT 1;
  SELECT id INTO v_sport_id FROM sports WHERE code = 'boys-basketball' LIMIT 1;

  IF v_school_id IS NULL OR v_sport_id IS NULL THEN RETURN; END IF;

  -- Casey Lee
  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Casey', 'Lee', 10, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'G', 'Junior') ON CONFLICT DO NOTHING;

  -- Kahua Benton
  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Kahua', 'Benton', 11, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'G', 'Freshman') ON CONFLICT DO NOTHING;

  -- Troy Freitas
  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Troy', 'Freitas', 12, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'G', 'Senior') ON CONFLICT DO NOTHING;

  -- Ayden Goo
  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Ayden', 'Goo', 20, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'G/F', 'Senior') ON CONFLICT DO NOTHING;

  -- Ambrose Smith
  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Ambrose', 'Smith', 21, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'F/C', 'Junior') ON CONFLICT DO NOTHING;

  -- Jackson Hung
  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Jackson', 'Hung', 22, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'G/F', 'Senior') ON CONFLICT DO NOTHING;

  -- Declan Beckette
  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Declan', 'Beckette', 23, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'G/F', 'Junior') ON CONFLICT DO NOTHING;

  -- Carter Holden
  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Carter', 'Holden', 34, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'C', 'Junior') ON CONFLICT DO NOTHING;

END $$;

-- Iolani Boys Soccer (complete roster with positions)
DO $$
DECLARE
  v_school_id UUID;
  v_sport_id UUID;
  v_player_id UUID;
BEGIN
  SELECT id INTO v_school_id FROM schools WHERE short_name ILIKE '%Iolani%' AND short_name NOT LIKE '%II%' LIMIT 1;
  SELECT id INTO v_sport_id FROM sports WHERE code = 'boys-soccer' LIMIT 1;

  IF v_school_id IS NULL OR v_sport_id IS NULL THEN RETURN; END IF;

  -- Insert all players with positions
  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Braydon', 'Obrero-Ueno', 1, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'GK', 'Senior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Austin', 'Ancheta', 2, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'F', 'Senior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Nico', 'Moses', 3, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'D', 'Senior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Kama', 'Kane', 4, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'D', 'Senior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Zack', 'Bagoyo', 5, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'F', 'Junior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Mack', 'Alapa', 6, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'MF', 'Junior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Brody', 'Awaya', 7, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'F', 'Senior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Devin', 'Lee', 8, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'MF', 'Senior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Reef', 'Kutaka', 9, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'MF', 'Sophomore') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Lucas', 'Ginoza', 10, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'D', 'Junior') ON CONFLICT DO NOTHING;

END $$;

-- Mililani Boys Soccer
DO $$
DECLARE
  v_school_id UUID;
  v_sport_id UUID;
  v_player_id UUID;
BEGIN
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mililani' LIMIT 1;
  SELECT id INTO v_sport_id FROM sports WHERE code = 'boys-soccer' LIMIT 1;

  IF v_school_id IS NULL OR v_sport_id IS NULL THEN RETURN; END IF;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Brennyn', 'Yoshida', 2, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position)
  VALUES (v_player_id, v_sport_id, 2026, 'F') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Minor', 'Maddox', 3, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position)
  VALUES (v_player_id, v_sport_id, 2026, 'D') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Isaiah', 'Sakihara', 4, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position)
  VALUES (v_player_id, v_sport_id, 2026, 'F') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Josiah', 'Ishizaka', 17, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position)
  VALUES (v_player_id, v_sport_id, 2026, 'MF') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Lincoln', 'Uiagalelei', 35, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position)
  VALUES (v_player_id, v_sport_id, 2026, 'GK') ON CONFLICT DO NOTHING;

END $$;

-- Hawaii Baptist Girls Basketball
DO $$
DECLARE
  v_school_id UUID;
  v_sport_id UUID;
  v_player_id UUID;
BEGIN
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Hawaii Baptist' OR short_name = 'HBA' LIMIT 1;
  SELECT id INTO v_sport_id FROM sports WHERE code = 'girls-basketball' LIMIT 1;

  IF v_school_id IS NULL OR v_sport_id IS NULL THEN RETURN; END IF;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Gianna', 'Gosiaco', 4, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'G', 'Junior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Kirah', 'Wong', 5, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'G', 'Junior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Sienna', 'Lamblack', 20, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'G', 'Senior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Lauren', 'Okuda', 23, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'G', 'Senior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Hallie', 'Chock', 15, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'F', 'Sophomore') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Kate', 'Iida', 55, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'F', 'Senior') ON CONFLICT DO NOTHING;

END $$;

-- Kahuku Boys Basketball
DO $$
DECLARE
  v_school_id UUID;
  v_sport_id UUID;
BEGIN
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Kahuku' LIMIT 1;
  SELECT id INTO v_sport_id FROM sports WHERE code = 'boys-basketball' LIMIT 1;

  IF v_school_id IS NULL OR v_sport_id IS NULL THEN RETURN; END IF;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active) VALUES
    (v_school_id, 'DC', 'Aukusitino', 1, true),
    (v_school_id, 'Mystique', 'Akina-Watson', 2, true),
    (v_school_id, 'Inoke', 'Lloyd', 3, true),
    (v_school_id, 'Justus', 'Daley', 5, true),
    (v_school_id, 'Kashus', 'Daley', 10, true),
    (v_school_id, 'Ronin', 'Naihe', 14, true),
    (v_school_id, 'Kaimi', 'Dowling', 15, true),
    (v_school_id, 'Chauncey', 'Ako', 20, true),
    (v_school_id, 'Noah', 'Feinga', 23, true),
    (v_school_id, 'Landon', 'Graham', 24, true),
    (v_school_id, 'Roadan', 'Meredith', 32, true),
    (v_school_id, 'Sena', 'Fonoimoana', 35, true),
    (v_school_id, 'Adrien', 'Meredith', 50, true)
  ON CONFLICT DO NOTHING;
END $$;

-- Punahou Boys Basketball
DO $$
DECLARE
  v_school_id UUID;
  v_sport_id UUID;
BEGIN
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Punahou' LIMIT 1;
  SELECT id INTO v_sport_id FROM sports WHERE code = 'boys-basketball' LIMIT 1;

  IF v_school_id IS NULL OR v_sport_id IS NULL THEN RETURN; END IF;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active) VALUES
    (v_school_id, 'Koen', 'Makinano', 2, true),
    (v_school_id, 'Ethan', 'Chung', 3, true),
    (v_school_id, 'Tanoa', 'Scanlan', 5, true),
    (v_school_id, 'Tyler', 'Yoshiki', 10, true),
    (v_school_id, 'Dane', 'Kellner', 11, true),
    (v_school_id, 'Keola', 'Todd-Perry', 14, true),
    (v_school_id, 'Hunter', 'Bond', 20, true),
    (v_school_id, 'Johnny', 'King', 21, true),
    (v_school_id, 'Preston James', 'Lau', 22, true),
    (v_school_id, 'Kanalu', 'Akana', 23, true),
    (v_school_id, 'Matteo', 'Bennett', 24, true),
    (v_school_id, 'Nahua', 'Lloyd', 32, true),
    (v_school_id, 'Kamuela', 'Wilhelm', 50, true)
  ON CONFLICT DO NOTHING;
END $$;

-- Mililani Boys Basketball
DO $$
DECLARE
  v_school_id UUID;
  v_sport_id UUID;
BEGIN
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Mililani' LIMIT 1;
  SELECT id INTO v_sport_id FROM sports WHERE code = 'boys-basketball' LIMIT 1;

  IF v_school_id IS NULL OR v_sport_id IS NULL THEN RETURN; END IF;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active) VALUES
    (v_school_id, 'Tui', 'Tukimaka', 0, true),
    (v_school_id, 'Trevor', 'Klemp', 1, true),
    (v_school_id, 'Lionel', 'Low', 2, true),
    (v_school_id, 'Bronson', 'Lei', 3, true),
    (v_school_id, 'Devan', 'Gardner', 4, true),
    (v_school_id, 'Railee', 'Manaba', 5, true),
    (v_school_id, 'Jeremiah', 'Johnson', 10, true),
    (v_school_id, 'Paul', 'Gardner', 11, true),
    (v_school_id, 'Elijah', 'Pontin', 12, true),
    (v_school_id, 'Richard', 'Windsor', 14, true),
    (v_school_id, 'Jonah', 'Castillo', 15, true),
    (v_school_id, 'Luke', 'Van Antwerp', 20, true),
    (v_school_id, 'Jacob', 'Loyola', 22, true),
    (v_school_id, 'Taye', 'Marxen', 23, true),
    (v_school_id, 'Tyson', 'Dagon', 24, true)
  ON CONFLICT DO NOTHING;
END $$;

-- Punahou Boys Soccer
DO $$
DECLARE
  v_school_id UUID;
  v_sport_id UUID;
  v_player_id UUID;
BEGIN
  SELECT id INTO v_school_id FROM schools WHERE short_name = 'Punahou' LIMIT 1;
  SELECT id INTO v_sport_id FROM sports WHERE code = 'boys-soccer' LIMIT 1;

  IF v_school_id IS NULL OR v_sport_id IS NULL THEN RETURN; END IF;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Zane', 'Mapes', 0, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'GK', 'Junior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Blaze', 'Bailey', 2, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'D', 'Senior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Neyo', 'Simon', 3, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'D', 'Senior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Matias', 'Valentin', 7, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'F', 'Senior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Thompson', 'Cheever', 10, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'F', 'Junior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Hideo', 'Barlag', 12, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'MF', 'Senior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Morgan', 'Kominek', 20, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'D', 'Junior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Kimat', 'Holcomb', 21, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'D', 'Senior') ON CONFLICT DO NOTHING;

  INSERT INTO players (school_id, first_name, last_name, jersey_number, is_active)
  VALUES (v_school_id, 'Lucas', 'Trinacty', 23, true) RETURNING id INTO v_player_id;
  INSERT INTO player_seasons (player_id, sport_id, season_year, position, grade)
  VALUES (v_player_id, v_sport_id, 2026, 'D', 'Senior') ON CONFLICT DO NOTHING;

END $$;

-- Migration complete: Winter 2025-26 standings and rosters inserted
