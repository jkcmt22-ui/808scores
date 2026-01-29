-- ============================================
-- Migration 063: Verify Roster Migration
-- ============================================
-- This migration ensures all player_seasons data
-- is properly migrated to team_rosters.
-- It handles any entries that may have been missed
-- in the initial migration (042).
-- ============================================

-- ============================================
-- 1. CREATE MISSING TEAMS
-- ============================================
-- Ensure teams exist for all school/sport/gender/season combinations
-- that have player_seasons entries

INSERT INTO teams (school_id, sport_id, gender, division, league, season_year, is_active)
SELECT DISTINCT
  p.school_id,
  ps.sport_id,
  sp.gender,
  s.division,
  s.league,
  -- Convert numeric season_year to string format (e.g., 2025 -> "2025-2026")
  CONCAT(ps.season_year, '-', ps.season_year + 1) as season_year,
  true as is_active
FROM player_seasons ps
JOIN players p ON p.id = ps.player_id
JOIN sports sp ON sp.id = ps.sport_id
JOIN schools s ON s.id = p.school_id
WHERE p.school_id IS NOT NULL
  AND p.is_active = true
ON CONFLICT (school_id, sport_id, gender, season_year) DO NOTHING;

-- ============================================
-- 2. BACKFILL TEAM_ROSTERS FROM PLAYER_SEASONS
-- ============================================
-- Insert missing entries from player_seasons into team_rosters
-- This catches any records that weren't migrated initially

INSERT INTO team_rosters (
  team_id,
  player_id,
  jersey_number,
  position,
  grade,
  is_captain,
  is_starter,
  season_year,
  is_active,
  created_at,
  updated_at
)
SELECT
  t.id as team_id,
  ps.player_id,
  ps.jersey_number,
  ps.position,
  ps.grade,
  ps.is_captain,
  false as is_starter,  -- Default, not tracked in player_seasons
  CONCAT(ps.season_year, '-', ps.season_year + 1) as season_year,
  true as is_active,
  ps.created_at,
  NOW() as updated_at
FROM player_seasons ps
JOIN players p ON p.id = ps.player_id
JOIN sports sp ON sp.id = ps.sport_id
JOIN teams t ON t.school_id = p.school_id
  AND t.sport_id = ps.sport_id
  AND t.gender = sp.gender
  AND t.season_year = CONCAT(ps.season_year, '-', ps.season_year + 1)
WHERE p.school_id IS NOT NULL
  AND p.is_active = true
ON CONFLICT (team_id, player_id, season_year) DO UPDATE SET
  -- Update existing entries if they've changed
  jersey_number = COALESCE(EXCLUDED.jersey_number, team_rosters.jersey_number),
  position = COALESCE(EXCLUDED.position, team_rosters.position),
  grade = COALESCE(EXCLUDED.grade, team_rosters.grade),
  is_captain = EXCLUDED.is_captain,
  updated_at = NOW();

-- ============================================
-- 3. VERIFICATION REPORT
-- ============================================
-- Create a temporary view to verify migration completeness
-- This can be run manually to check counts

DO $$
DECLARE
  player_seasons_count INTEGER;
  team_rosters_count INTEGER;
  missing_count INTEGER;
BEGIN
  -- Count player_seasons entries (for active players)
  SELECT COUNT(*) INTO player_seasons_count
  FROM player_seasons ps
  JOIN players p ON p.id = ps.player_id
  WHERE p.is_active = true AND p.school_id IS NOT NULL;

  -- Count team_rosters entries
  SELECT COUNT(*) INTO team_rosters_count
  FROM team_rosters tr
  WHERE tr.is_active = true;

  -- Count potentially missing entries
  SELECT COUNT(*) INTO missing_count
  FROM player_seasons ps
  JOIN players p ON p.id = ps.player_id
  JOIN sports sp ON sp.id = ps.sport_id
  WHERE p.is_active = true
    AND p.school_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM team_rosters tr
      JOIN teams t ON t.id = tr.team_id
      WHERE tr.player_id = ps.player_id
        AND t.sport_id = ps.sport_id
        AND tr.season_year = CONCAT(ps.season_year, '-', ps.season_year + 1)
        AND tr.is_active = true
    );

  RAISE NOTICE 'Migration Verification Report:';
  RAISE NOTICE '  Player Seasons (active): %', player_seasons_count;
  RAISE NOTICE '  Team Rosters (active): %', team_rosters_count;
  RAISE NOTICE '  Potentially Missing: %', missing_count;

  IF missing_count = 0 THEN
    RAISE NOTICE 'Migration complete: All player_seasons migrated to team_rosters';
  ELSE
    RAISE WARNING 'Migration incomplete: % entries may need manual review', missing_count;
  END IF;
END $$;

-- ============================================
-- 4. CREATE HELPER FUNCTION
-- ============================================
-- Function to get roster migration status for a school

CREATE OR REPLACE FUNCTION get_roster_migration_status(p_school_id UUID)
RETURNS TABLE(
  sport_name TEXT,
  gender TEXT,
  season_year TEXT,
  player_seasons_count BIGINT,
  team_rosters_count BIGINT,
  is_complete BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT
    sp.display_name as sport_name,
    sp.gender,
    CONCAT(ps.season_year, '-', ps.season_year + 1) as season_year,
    COUNT(DISTINCT ps.id) as player_seasons_count,
    COUNT(DISTINCT tr.id) as team_rosters_count,
    COUNT(DISTINCT ps.id) = COUNT(DISTINCT tr.id) as is_complete
  FROM player_seasons ps
  JOIN players p ON p.id = ps.player_id
  JOIN sports sp ON sp.id = ps.sport_id
  LEFT JOIN teams t ON t.school_id = p.school_id
    AND t.sport_id = ps.sport_id
    AND t.gender = sp.gender
    AND t.season_year = CONCAT(ps.season_year, '-', ps.season_year + 1)
  LEFT JOIN team_rosters tr ON tr.team_id = t.id
    AND tr.player_id = ps.player_id
    AND tr.season_year = CONCAT(ps.season_year, '-', ps.season_year + 1)
    AND tr.is_active = true
  WHERE p.school_id = p_school_id
    AND p.is_active = true
  GROUP BY sp.display_name, sp.gender, ps.season_year
  ORDER BY ps.season_year DESC, sp.display_name, sp.gender
$$;
