-- ============================================
-- Migration 074: Add team_id to season_standings
-- ============================================
-- This migration:
-- 1. Adds team_id column to season_standings
-- 2. Backfills team_id by matching school_id + sport_id + season_year
-- 3. Creates indexes for team-based queries
-- Note: school_id is kept for now for backward compatibility
-- ============================================

-- Step 1: Add team_id column (nullable initially)
ALTER TABLE season_standings ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);

-- Step 2: Create index for team-based queries
CREATE INDEX IF NOT EXISTS idx_season_standings_team ON season_standings(team_id);

-- Step 3: Backfill team_id from teams table
-- Match by school_id, sport_id, and season_year (converting INT to TEXT format)
UPDATE season_standings ss
SET team_id = t.id
FROM teams t
JOIN sports s ON t.sport_id = s.id
WHERE ss.school_id = t.school_id
  AND ss.sport_id = t.sport_id
  AND t.gender = s.gender
  AND t.level = 'varsity'
  -- Convert season_year INT (e.g., 2026) to TEXT format (e.g., "2025-2026")
  AND t.season_year = (ss.season_year - 1)::TEXT || '-' || ss.season_year::TEXT
  AND ss.team_id IS NULL;

-- Step 4: Verify backfill and log results
DO $$
DECLARE
  v_total INTEGER;
  v_with_team INTEGER;
  v_orphaned INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total FROM season_standings;
  SELECT COUNT(*) INTO v_with_team FROM season_standings WHERE team_id IS NOT NULL;
  SELECT COUNT(*) INTO v_orphaned FROM season_standings WHERE team_id IS NULL;

  RAISE NOTICE 'Season standings migration: % total, % with team_id, % orphaned', v_total, v_with_team, v_orphaned;

  IF v_orphaned > 0 THEN
    RAISE WARNING '% season_standings records have NULL team_id - these may need manual review', v_orphaned;
  END IF;
END $$;

-- Step 5: Create teams for orphaned standings if needed
-- This handles cases where the teams table doesn't have a matching entry
DO $$
DECLARE
  v_standing RECORD;
  v_gender TEXT;
  v_season_year_text TEXT;
BEGIN
  FOR v_standing IN
    SELECT DISTINCT
      ss.school_id,
      ss.sport_id,
      ss.season_year,
      s.gender
    FROM season_standings ss
    JOIN sports s ON ss.sport_id = s.id
    WHERE ss.team_id IS NULL
  LOOP
    -- Convert season_year INT to TEXT format
    v_season_year_text := (v_standing.season_year - 1)::TEXT || '-' || v_standing.season_year::TEXT;

    -- Create team if it doesn't exist
    INSERT INTO teams (id, school_id, sport_id, gender, level, season_year, is_active)
    VALUES (
      uuid_generate_v4(),
      v_standing.school_id,
      v_standing.sport_id,
      v_standing.gender,
      'varsity',
      v_season_year_text,
      true
    )
    ON CONFLICT (school_id, sport_id, gender, level, season_year) DO NOTHING;
  END LOOP;

  -- Now update the standings with the newly created teams
  UPDATE season_standings ss
  SET team_id = t.id
  FROM teams t
  JOIN sports s ON t.sport_id = s.id
  WHERE ss.school_id = t.school_id
    AND ss.sport_id = t.sport_id
    AND t.gender = s.gender
    AND t.level = 'varsity'
    AND t.season_year = (ss.season_year - 1)::TEXT || '-' || ss.season_year::TEXT
    AND ss.team_id IS NULL;
END $$;

-- Step 6: Final verification
DO $$
DECLARE
  v_orphaned INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_orphaned FROM season_standings WHERE team_id IS NULL;

  IF v_orphaned > 0 THEN
    RAISE WARNING 'After creating teams, % season_standings still have NULL team_id', v_orphaned;
  ELSE
    RAISE NOTICE 'All season_standings have been successfully linked to teams';
  END IF;
END $$;

-- Step 7: Add comments explaining the columns
COMMENT ON COLUMN season_standings.team_id IS 'Foreign key to teams table - the team this standing record is for';
COMMENT ON COLUMN season_standings.school_id IS 'DEPRECATED: Foreign key to schools table - kept for backward compatibility. Use team_id instead.';

-- Note: NOT NULL constraint and dropping school_id will be done in a future migration
-- after all code has been updated to use team_id
