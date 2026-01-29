-- ============================================
-- Migration 071: Backfill games with team references
-- ============================================
-- This migration:
-- 1. Creates missing teams for any school+sport+gender+season combination in games
-- 2. Populates the new team FK columns in games table
-- 3. Uses scheduled_at to determine season_year (Aug 1 cutoff)
-- ============================================

-- Create teams for all unique combinations in games that don't exist yet
DO $$
DECLARE
  v_game RECORD;
  v_home_team_id UUID;
  v_away_team_id UUID;
  v_count INTEGER := 0;
  v_total INTEGER := 0;
BEGIN
  -- Count games that need migration
  SELECT COUNT(*) INTO v_total FROM games WHERE home_team_id_new IS NULL;
  RAISE NOTICE 'Starting backfill for % games', v_total;

  -- Process each game that hasn't been migrated yet
  FOR v_game IN
    SELECT
      g.id,
      g.home_team_id AS home_school_id,
      g.away_team_id AS away_school_id,
      g.sport_id,
      s.gender,
      CASE
        -- Season year is based on August 1 cutoff
        -- Games from Aug onwards are part of the YYYY-YYYY+1 season
        WHEN EXTRACT(MONTH FROM g.scheduled_at) >= 8 THEN
          EXTRACT(YEAR FROM g.scheduled_at)::TEXT || '-' || (EXTRACT(YEAR FROM g.scheduled_at) + 1)::TEXT
        -- Games Jan-Jul are part of the previous year's season
        ELSE
          (EXTRACT(YEAR FROM g.scheduled_at) - 1)::TEXT || '-' || EXTRACT(YEAR FROM g.scheduled_at)::TEXT
      END AS season_year
    FROM games g
    JOIN sports s ON g.sport_id = s.id
    WHERE g.home_team_id_new IS NULL
  LOOP
    -- Find or create home team
    INSERT INTO teams (id, school_id, sport_id, gender, level, season_year, is_active)
    VALUES (
      uuid_generate_v4(),
      v_game.home_school_id,
      v_game.sport_id,
      v_game.gender,
      'varsity',
      v_game.season_year,
      true
    )
    ON CONFLICT (school_id, sport_id, gender, level, season_year) DO NOTHING;

    -- Get the home team ID
    SELECT id INTO v_home_team_id FROM teams
    WHERE school_id = v_game.home_school_id
      AND sport_id = v_game.sport_id
      AND gender = v_game.gender
      AND level = 'varsity'
      AND season_year = v_game.season_year;

    -- Find or create away team
    INSERT INTO teams (id, school_id, sport_id, gender, level, season_year, is_active)
    VALUES (
      uuid_generate_v4(),
      v_game.away_school_id,
      v_game.sport_id,
      v_game.gender,
      'varsity',
      v_game.season_year,
      true
    )
    ON CONFLICT (school_id, sport_id, gender, level, season_year) DO NOTHING;

    -- Get the away team ID
    SELECT id INTO v_away_team_id FROM teams
    WHERE school_id = v_game.away_school_id
      AND sport_id = v_game.sport_id
      AND gender = v_game.gender
      AND level = 'varsity'
      AND season_year = v_game.season_year;

    -- Update game with team references
    UPDATE games SET
      home_team_id_new = v_home_team_id,
      away_team_id_new = v_away_team_id
    WHERE id = v_game.id;

    v_count := v_count + 1;
    IF v_count % 100 = 0 THEN
      RAISE NOTICE 'Processed % / % games', v_count, v_total;
    END IF;
  END LOOP;

  RAISE NOTICE 'Backfill complete: % games updated', v_count;
END $$;

-- Verify no nulls remain
DO $$
DECLARE
  v_null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_null_count
  FROM games
  WHERE home_team_id_new IS NULL OR away_team_id_new IS NULL;

  IF v_null_count > 0 THEN
    RAISE WARNING 'Migration incomplete: % games still have NULL team references', v_null_count;
  ELSE
    RAISE NOTICE 'All games have been successfully migrated to team references';
  END IF;
END $$;

-- Create a verification view for manual checking
CREATE OR REPLACE VIEW migration_071_verification AS
SELECT
  g.id AS game_id,
  g.scheduled_at,
  hs.name AS home_school_name,
  aws.name AS away_school_name,
  ht.id AS home_team_id,
  at.id AS away_team_id,
  ht.school_id = g.home_team_id AS home_school_matches,
  at.school_id = g.away_team_id AS away_school_matches,
  ht.gender = s.gender AS home_gender_matches,
  at.gender = s.gender AS away_gender_matches
FROM games g
LEFT JOIN teams ht ON g.home_team_id_new = ht.id
LEFT JOIN teams at ON g.away_team_id_new = at.id
LEFT JOIN schools hs ON g.home_team_id = hs.id
LEFT JOIN schools aws ON g.away_team_id = aws.id
LEFT JOIN sports s ON g.sport_id = s.id;
