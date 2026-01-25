-- Migration 018: Remove fake/test game data
-- This cleans up the hardcoded test games so we can use real scraped data

-- Delete all existing games (they were test/fake data)
DELETE FROM game_scores;
DELETE FROM submissions WHERE game_id IN (SELECT id FROM games);
DELETE FROM disputes WHERE game_id IN (SELECT id FROM games);
DELETE FROM games;

-- Note: Schools, sports, badges, and users are kept as they are real reference data
-- Only games and related game data are removed

-- Add a column to track external source ID for scraped games
ALTER TABLE games ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Create index for external_id lookups
CREATE INDEX IF NOT EXISTS idx_games_external_id ON games(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_games_source ON games(source);

-- Add game_type if not exists (for regular_season, playoff, tournament, etc)
ALTER TABLE games ADD COLUMN IF NOT EXISTS game_type TEXT DEFAULT 'regular_season';
ALTER TABLE games ADD COLUMN IF NOT EXISTS overtime_count INT DEFAULT 0;

COMMENT ON COLUMN games.external_id IS 'External ID from source (e.g., ScoringLive gameid)';
COMMENT ON COLUMN games.source IS 'Data source: manual, scoringlive, user_submitted';
COMMENT ON COLUMN games.game_type IS 'Type: regular_season, playoff, tournament, scrimmage';
