-- ============================================
-- Migration 079: Admin Dashboard Performance Indexes
-- ============================================
-- These indexes optimize common admin queries:
-- - Team lookups by school + sport + season
-- - Standings queries
-- - Team counts per season
-- ============================================

-- Composite index for team lookups (school + sport + season)
CREATE INDEX IF NOT EXISTS idx_teams_school_sport_season
  ON teams(school_id, sport_id, season_year) WHERE is_active = true;

-- Index for counting teams per season (used in /admin/seasons)
CREATE INDEX IF NOT EXISTS idx_teams_season_year_active
  ON teams(season_year) WHERE is_active = true;

-- Standings lookups by school
CREATE INDEX IF NOT EXISTS idx_season_standings_school
  ON season_standings(school_id) WHERE school_id IS NOT NULL;

-- Standings lookups by school + sport
CREATE INDEX IF NOT EXISTS idx_season_standings_school_sport
  ON season_standings(school_id, sport_id) WHERE school_id IS NOT NULL;

-- Standings computation (sport + season + league)
CREATE INDEX IF NOT EXISTS idx_season_standings_sport_season_league
  ON season_standings(sport_id, season_year, league);

-- Comment
COMMENT ON INDEX idx_teams_school_sport_season IS 'Optimizes admin team lookups by school/sport/season';
COMMENT ON INDEX idx_teams_season_year_active IS 'Optimizes team count queries in seasons admin page';
