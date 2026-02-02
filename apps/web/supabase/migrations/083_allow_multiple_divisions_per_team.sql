-- ============================================
-- Migration 083: Allow multiple divisions per team
-- ============================================
-- This migration updates the unique constraint to include division,
-- allowing schools to have both Division I and Division II teams
-- in the same sport/gender/level (e.g., Iolani Boys Basketball D1 + D2).
-- ============================================

-- Drop old unique constraint
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_unique_key;

-- Add new unique constraint including division
-- This allows same school/sport/gender/level/season to have teams in different divisions
ALTER TABLE teams ADD CONSTRAINT teams_unique_key
  UNIQUE(school_id, sport_id, gender, level, division, season_year);

-- Add comment explaining the change
COMMENT ON CONSTRAINT teams_unique_key ON teams IS
  'Allows multiple teams per school/sport/gender/level, differentiated by division (D1, D2, etc.)';
