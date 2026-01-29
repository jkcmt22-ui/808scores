-- ============================================
-- Migration 072: Swap games columns from school to team references
-- ============================================
-- IMPORTANT: Only run this after verifying migration 071 completed successfully.
-- This migration:
-- 1. Verifies no null team references exist
-- 2. Drops old foreign key constraints
-- 3. Renames columns (old → deprecated, new → active)
-- 4. Adds new foreign key constraints
-- 5. Adds NOT NULL constraints
-- 6. Adds check constraint to prevent same home/away team
-- ============================================

-- Step 1: Verify no nulls exist (fail migration if incomplete)
DO $$
DECLARE
  v_null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_null_count
  FROM games
  WHERE home_team_id_new IS NULL OR away_team_id_new IS NULL;

  IF v_null_count > 0 THEN
    RAISE EXCEPTION 'Backfill incomplete - % games have NULL team references. Run migration 071 first.', v_null_count;
  END IF;
END $$;

-- Step 2: Drop old foreign key constraints
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_home_team_id_fkey;
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_away_team_id_fkey;

-- Step 3: Rename columns
-- Old school-referencing columns become deprecated
ALTER TABLE games RENAME COLUMN home_team_id TO home_school_id_deprecated;
ALTER TABLE games RENAME COLUMN away_team_id TO away_school_id_deprecated;

-- New team-referencing columns become the active columns
ALTER TABLE games RENAME COLUMN home_team_id_new TO home_team_id;
ALTER TABLE games RENAME COLUMN away_team_id_new TO away_team_id;

-- Step 4: Add new foreign key constraints with proper names
ALTER TABLE games ADD CONSTRAINT games_home_team_id_fkey
  FOREIGN KEY (home_team_id) REFERENCES teams(id);
ALTER TABLE games ADD CONSTRAINT games_away_team_id_fkey
  FOREIGN KEY (away_team_id) REFERENCES teams(id);

-- Step 5: Add NOT NULL constraints
ALTER TABLE games ALTER COLUMN home_team_id SET NOT NULL;
ALTER TABLE games ALTER COLUMN away_team_id SET NOT NULL;

-- Step 6: Add check constraint to prevent same team playing itself
ALTER TABLE games ADD CONSTRAINT games_home_away_different
  CHECK (home_team_id != away_team_id);

-- Step 7: Drop old indexes and create new ones
DROP INDEX IF EXISTS idx_games_home_team_new;
DROP INDEX IF EXISTS idx_games_away_team_new;
CREATE INDEX IF NOT EXISTS idx_games_home_team_id ON games(home_team_id);
CREATE INDEX IF NOT EXISTS idx_games_away_team_id ON games(away_team_id);

-- Step 8: Update column comments
COMMENT ON COLUMN games.home_team_id IS 'Foreign key to teams table for the home team';
COMMENT ON COLUMN games.away_team_id IS 'Foreign key to teams table for the away team';
COMMENT ON COLUMN games.home_school_id_deprecated IS 'DEPRECATED: Old school reference, kept for rollback. Will be removed in future migration.';
COMMENT ON COLUMN games.away_school_id_deprecated IS 'DEPRECATED: Old school reference, kept for rollback. Will be removed in future migration.';

-- Step 9: Drop the verification view from migration 071
DROP VIEW IF EXISTS migration_071_verification;

-- Step 10: Create a compatibility view for code that still expects school data directly
CREATE OR REPLACE VIEW games_with_schools AS
SELECT
  g.id,
  g.sport_id,
  g.home_team_id,
  g.away_team_id,
  g.scheduled_at,
  g.venue,
  g.status,
  g.current_period,
  g.time_remaining,
  g.home_score,
  g.away_score,
  g.is_overtime,
  g.is_verified,
  g.verification_method,
  g.golden_game,
  g.game_type,
  g.overtime_count,
  g.tournament_id,
  g.tournament_round,
  g.bracket_position,
  g.winner_advances_to,
  g.loser_drops_to,
  g.photos_url,
  g.instagram_url,
  g.created_at,
  g.updated_at,
  -- Legacy fields for backward compatibility
  ht.school_id AS home_school_id,
  at.school_id AS away_school_id
FROM games g
JOIN teams ht ON g.home_team_id = ht.id
JOIN teams at ON g.away_team_id = at.id;

COMMENT ON VIEW games_with_schools IS 'Compatibility view providing legacy home_school_id and away_school_id fields. Use during transition period.';
