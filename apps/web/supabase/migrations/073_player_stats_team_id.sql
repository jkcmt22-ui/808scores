-- ============================================
-- Migration 073: Add team_id to player_game_stats
-- ============================================
-- This migration:
-- 1. Adds team_id column to player_game_stats
-- 2. Backfills team_id from the game's team references
-- 3. Creates indexes for team-based queries
-- Note: school_id is kept for now for backward compatibility
-- ============================================

-- Step 1: Add team_id column (nullable initially)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);

-- Step 2: Create index for team-based queries
CREATE INDEX IF NOT EXISTS idx_player_game_stats_team ON player_game_stats(team_id);

-- Step 3: Backfill team_id from game's team references
-- Match player's school to either home or away team in the game
UPDATE player_game_stats pgs
SET team_id = CASE
  -- If player's school matches home team's school, use home_team_id
  WHEN pgs.school_id = g_home.school_id THEN g.home_team_id
  -- If player's school matches away team's school, use away_team_id
  WHEN pgs.school_id = g_away.school_id THEN g.away_team_id
  ELSE NULL
END
FROM games g
JOIN teams g_home ON g.home_team_id = g_home.id
JOIN teams g_away ON g.away_team_id = g_away.id
WHERE pgs.game_id = g.id
  AND pgs.team_id IS NULL;

-- Step 4: Verify backfill and log results
DO $$
DECLARE
  v_total INTEGER;
  v_with_team INTEGER;
  v_orphaned INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total FROM player_game_stats;
  SELECT COUNT(*) INTO v_with_team FROM player_game_stats WHERE team_id IS NOT NULL;
  SELECT COUNT(*) INTO v_orphaned FROM player_game_stats WHERE team_id IS NULL;

  RAISE NOTICE 'Player game stats migration: % total, % with team_id, % orphaned', v_total, v_with_team, v_orphaned;

  IF v_orphaned > 0 THEN
    RAISE WARNING '% player_game_stats records have NULL team_id - these may have mismatched school_id', v_orphaned;
  END IF;
END $$;

-- Step 5: Verify team_id matches game participants
-- This checks that each stat's team_id is actually participating in the game
DO $$
DECLARE
  v_invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_invalid_count
  FROM player_game_stats pgs
  JOIN games g ON pgs.game_id = g.id
  WHERE pgs.team_id IS NOT NULL
    AND pgs.team_id NOT IN (g.home_team_id, g.away_team_id);

  IF v_invalid_count > 0 THEN
    RAISE WARNING '% player_game_stats have team_id that does not match game participants', v_invalid_count;
  ELSE
    RAISE NOTICE 'All player_game_stats team_id values correctly match game participants';
  END IF;
END $$;

-- Step 6: Add comment explaining the columns
COMMENT ON COLUMN player_game_stats.team_id IS 'Foreign key to teams table - the team this player was playing for in this game';
COMMENT ON COLUMN player_game_stats.school_id IS 'DEPRECATED: Foreign key to schools table - kept for backward compatibility. Use team_id instead.';

-- Note: NOT NULL constraint and dropping school_id will be done in a future migration
-- after all code has been updated to use team_id
