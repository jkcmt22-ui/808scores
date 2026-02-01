-- ============================================
-- Migration 082: Set Default Team Divisions
-- ============================================
-- Sets proper division values for all teams:
-- - Existing teams without division → 'Division I'
-- - Adds CHECK constraint for valid division values
-- ============================================

-- Set default division for all teams without one
UPDATE teams SET division = 'Division I' WHERE division IS NULL;

-- Add check constraint for valid divisions (drop if exists first)
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_division_check;
ALTER TABLE teams ADD CONSTRAINT teams_division_check
  CHECK (division IN ('Open', 'Division I', 'Division II'));

-- Add comment explaining the division column
COMMENT ON COLUMN teams.division IS 'Team competitive division: Open (top tier), Division I, or Division II';
