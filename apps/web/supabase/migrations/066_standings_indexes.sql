-- ============================================
-- Migration 066: Standings Performance Indexes
-- ============================================
-- This migration creates indexes to optimize the standings computation function:
-- 1. Index on teams for standings lookup
-- 2. Index on games for final regular season games
-- ============================================

-- 1. Index for teams table standings lookup
-- Covers the main WHERE clause and grouping columns
CREATE INDEX IF NOT EXISTS idx_teams_standings_lookup
  ON teams(sport_id, gender, season_year, league, division)
  WHERE is_active = true;

-- 2. Index for games table standings query
-- Covers final regular season games lookup
CREATE INDEX IF NOT EXISTS idx_games_standings
  ON games(sport_id, status, game_type)
  WHERE status = 'final' AND game_type = 'regular_season';

-- 3. Composite index on games for home/away team lookups in standings
CREATE INDEX IF NOT EXISTS idx_games_standings_teams
  ON games(sport_id, home_team_id, away_team_id)
  WHERE status = 'final' AND game_type = 'regular_season';

-- Add comments for documentation
COMMENT ON INDEX idx_teams_standings_lookup IS 'Optimizes standings function team lookup by sport/gender/season';
COMMENT ON INDEX idx_games_standings IS 'Optimizes standings function game filtering for final regular season games';
COMMENT ON INDEX idx_games_standings_teams IS 'Optimizes standings function team record calculations';
