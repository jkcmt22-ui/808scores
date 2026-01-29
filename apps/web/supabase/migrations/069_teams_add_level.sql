-- ============================================
-- Migration 069: Add level column to teams
-- ============================================
-- This migration adds a `level` column to distinguish varsity, JV, and freshman teams.
-- All existing teams are assumed to be varsity level.
-- The unique constraint is updated to include level.
-- ============================================

-- Add level column with default 'varsity'
ALTER TABLE teams ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'varsity'
  CHECK (level IN ('varsity', 'jv', 'freshman'));

-- Drop old unique constraint if it exists
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_school_id_sport_id_gender_season_year_key;

-- Add new unique constraint including level
-- This allows same school/sport/gender/season to have multiple teams at different levels
ALTER TABLE teams ADD CONSTRAINT teams_unique_key
  UNIQUE(school_id, sport_id, gender, level, season_year);

-- Create index for level-based queries
CREATE INDEX IF NOT EXISTS idx_teams_level ON teams(level) WHERE is_active = true;

-- Add comment explaining the level column
COMMENT ON COLUMN teams.level IS 'Team competition level: varsity (default), jv (junior varsity), or freshman';
