-- Migration 055: Season Format Standardization
-- Standardizes all season references to TEXT format '2025-2026' (academic year)
-- This affects player_seasons and season_standings tables

-- ============================================
-- HELPER FUNCTION: Get Current Season
-- ============================================

-- Returns current academic year season based on date
-- August-December: current year to next year (e.g., "2025-2026")
-- January-July: previous year to current year (e.g., "2024-2025")
CREATE OR REPLACE FUNCTION get_current_season()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT CASE
    WHEN EXTRACT(MONTH FROM NOW()) >= 8 THEN
      EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT
    ELSE
      (EXTRACT(YEAR FROM NOW()) - 1)::TEXT || '-' || EXTRACT(YEAR FROM NOW())::TEXT
  END;
$$;

COMMENT ON FUNCTION get_current_season() IS
  'Returns current academic year season as TEXT (e.g., "2025-2026"). Aug-Dec uses current year start, Jan-Jul uses previous year start.';

-- ============================================
-- MIGRATE player_seasons.season_year
-- ============================================

-- Step 1: Add new column
ALTER TABLE player_seasons
ADD COLUMN IF NOT EXISTS season_year_text TEXT;

-- Step 2: Migrate data (2025 -> '2025-2026')
UPDATE player_seasons
SET season_year_text = season_year::TEXT || '-' || (season_year + 1)::TEXT
WHERE season_year_text IS NULL;

-- Step 3: Create new index before dropping old one
CREATE INDEX IF NOT EXISTS idx_player_seasons_year_text
  ON player_seasons(season_year_text);

-- Step 4: Drop old unique constraint and index
ALTER TABLE player_seasons
DROP CONSTRAINT IF EXISTS player_seasons_player_id_sport_id_season_year_key;

DROP INDEX IF EXISTS idx_player_seasons_year;
DROP INDEX IF EXISTS idx_player_seasons_sport_year;

-- Step 5: Drop old column
ALTER TABLE player_seasons DROP COLUMN IF EXISTS season_year;

-- Step 6: Rename new column to season_year
ALTER TABLE player_seasons RENAME COLUMN season_year_text TO season_year;

-- Step 7: Add NOT NULL constraint
ALTER TABLE player_seasons ALTER COLUMN season_year SET NOT NULL;

-- Step 8: Recreate unique constraint with TEXT column
ALTER TABLE player_seasons
ADD CONSTRAINT player_seasons_player_sport_season_unique
  UNIQUE(player_id, sport_id, season_year);

-- Step 9: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_player_seasons_sport_year
  ON player_seasons(sport_id, season_year);

-- ============================================
-- MIGRATE season_standings.season_year
-- ============================================

-- Step 1: Add new column
ALTER TABLE season_standings
ADD COLUMN IF NOT EXISTS season_year_text TEXT;

-- Step 2: Migrate data (2025 -> '2025-2026')
UPDATE season_standings
SET season_year_text = season_year::TEXT || '-' || (season_year + 1)::TEXT
WHERE season_year_text IS NULL;

-- Step 3: Create new index before dropping old one
CREATE INDEX IF NOT EXISTS idx_standings_sport_season_text
  ON season_standings(sport_id, season_year_text);

-- Step 4: Drop old unique constraint
ALTER TABLE season_standings
DROP CONSTRAINT IF EXISTS season_standings_school_id_sport_id_season_year_key;

DROP INDEX IF EXISTS idx_standings_sport_season;

-- Step 5: Drop old column
ALTER TABLE season_standings DROP COLUMN IF EXISTS season_year;

-- Step 6: Rename new column to season_year
ALTER TABLE season_standings RENAME COLUMN season_year_text TO season_year;

-- Step 7: Add NOT NULL constraint
ALTER TABLE season_standings ALTER COLUMN season_year SET NOT NULL;

-- Step 8: Recreate unique constraint with TEXT column
ALTER TABLE season_standings
ADD CONSTRAINT season_standings_school_sport_season_unique
  UNIQUE(school_id, sport_id, season_year);

-- Step 9: Rename index to final name
DROP INDEX IF EXISTS idx_standings_sport_season_text;
CREATE INDEX idx_standings_sport_season
  ON season_standings(sport_id, season_year);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN player_seasons.season_year IS
  'Academic year season in TEXT format (e.g., "2025-2026")';

COMMENT ON COLUMN season_standings.season_year IS
  'Academic year season in TEXT format (e.g., "2025-2026")';
