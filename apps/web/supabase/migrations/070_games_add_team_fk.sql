-- ============================================
-- Migration 070: Add new team FK columns to games
-- ============================================
-- This migration adds nullable columns that will reference the teams table.
-- The existing home_team_id and away_team_id columns currently reference schools.
-- After backfill (migration 071), we'll swap these columns (migration 072).
-- ============================================

-- Add new columns (nullable initially for gradual migration)
ALTER TABLE games ADD COLUMN IF NOT EXISTS home_team_id_new UUID REFERENCES teams(id);
ALTER TABLE games ADD COLUMN IF NOT EXISTS away_team_id_new UUID REFERENCES teams(id);

-- Create indexes for efficient lookups during transition
CREATE INDEX IF NOT EXISTS idx_games_home_team_new ON games(home_team_id_new);
CREATE INDEX IF NOT EXISTS idx_games_away_team_new ON games(away_team_id_new);

-- Add comments explaining the migration status
COMMENT ON COLUMN games.home_team_id_new IS 'New FK to teams table - will replace home_team_id after migration';
COMMENT ON COLUMN games.home_team_id IS 'DEPRECATED: Currently references schools, will be renamed to home_school_id_deprecated';
COMMENT ON COLUMN games.away_team_id_new IS 'New FK to teams table - will replace away_team_id after migration';
COMMENT ON COLUMN games.away_team_id IS 'DEPRECATED: Currently references schools, will be renamed to away_school_id_deprecated';
