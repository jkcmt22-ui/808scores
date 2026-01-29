-- ============================================
-- Migration 075: Fix standings function for teams migration
-- ============================================
-- After migration 072, games.home_team_id and away_team_id reference
-- teams.id instead of schools.id. This migration updates the
-- get_computed_standings function to use the correct joins.
-- ============================================

-- Drop existing function
DROP FUNCTION IF EXISTS get_computed_standings(UUID, TEXT, TEXT, TEXT);

-- Create the updated standings computation function
CREATE OR REPLACE FUNCTION get_computed_standings(
  p_sport_id UUID,
  p_gender TEXT,
  p_season_year TEXT,
  p_league TEXT DEFAULT NULL
)
RETURNS TABLE(
  school_id UUID,
  school_name TEXT,
  school_short_name TEXT,
  league TEXT,
  division TEXT,
  region TEXT,
  overall_wins INT,
  overall_losses INT,
  overall_ties INT,
  league_wins INT,
  league_losses INT,
  league_ties INT,
  points_for INT,
  points_against INT
) AS $$
WITH team_lookup AS (
  -- Get all active teams for this sport/gender/season
  -- After migration 072, we use teams.id as the primary identifier
  SELECT
    t.id AS team_id,
    t.school_id,
    t.league,
    t.division,
    t.region
  FROM teams t
  WHERE t.sport_id = p_sport_id
    AND t.gender = p_gender
    AND t.season_year = p_season_year
    AND t.is_active = true
    AND (p_league IS NULL OR t.league = p_league)
),
game_results AS (
  -- Get all final regular season games with team info
  -- Now joining on teams.id (home_team_id/away_team_id reference teams)
  SELECT
    g.home_team_id,
    g.away_team_id,
    g.home_score,
    g.away_score,
    ht.team_id AS home_team,
    ht.school_id AS home_school_id,
    ht.league AS home_league,
    ht.division AS home_division,
    at.team_id AS away_team,
    at.school_id AS away_school_id,
    at.league AS away_league,
    at.division AS away_division,
    -- A game is a "league game" only if both teams are in the same league AND division
    (ht.league = at.league AND COALESCE(ht.division, '') = COALESCE(at.division, '')) AS is_league_game
  FROM games g
  -- Join on team_id (games.home_team_id now references teams.id)
  JOIN team_lookup ht ON ht.team_id = g.home_team_id
  JOIN team_lookup at ON at.team_id = g.away_team_id
  WHERE g.sport_id = p_sport_id
    AND g.status = 'final'
    AND g.game_type = 'regular_season'
),
team_stats AS (
  -- Aggregate stats for each team
  SELECT
    tl.team_id,
    tl.school_id,
    tl.league,
    tl.division,
    tl.region,
    -- Overall wins
    COALESCE(SUM(
      CASE
        WHEN gr.home_team_id = tl.team_id AND gr.home_score > gr.away_score THEN 1
        WHEN gr.away_team_id = tl.team_id AND gr.away_score > gr.home_score THEN 1
        ELSE 0
      END
    ), 0)::INT AS overall_wins,
    -- Overall losses
    COALESCE(SUM(
      CASE
        WHEN gr.home_team_id = tl.team_id AND gr.home_score < gr.away_score THEN 1
        WHEN gr.away_team_id = tl.team_id AND gr.away_score < gr.home_score THEN 1
        ELSE 0
      END
    ), 0)::INT AS overall_losses,
    -- Overall ties
    COALESCE(SUM(
      CASE
        WHEN (gr.home_team_id = tl.team_id OR gr.away_team_id = tl.team_id)
          AND gr.home_score = gr.away_score THEN 1
        ELSE 0
      END
    ), 0)::INT AS overall_ties,
    -- League wins (only games where both teams in same league+division)
    COALESCE(SUM(
      CASE
        WHEN gr.is_league_game AND gr.home_team_id = tl.team_id AND gr.home_score > gr.away_score THEN 1
        WHEN gr.is_league_game AND gr.away_team_id = tl.team_id AND gr.away_score > gr.home_score THEN 1
        ELSE 0
      END
    ), 0)::INT AS league_wins,
    -- League losses
    COALESCE(SUM(
      CASE
        WHEN gr.is_league_game AND gr.home_team_id = tl.team_id AND gr.home_score < gr.away_score THEN 1
        WHEN gr.is_league_game AND gr.away_team_id = tl.team_id AND gr.away_score < gr.home_score THEN 1
        ELSE 0
      END
    ), 0)::INT AS league_losses,
    -- League ties
    COALESCE(SUM(
      CASE
        WHEN gr.is_league_game
          AND (gr.home_team_id = tl.team_id OR gr.away_team_id = tl.team_id)
          AND gr.home_score = gr.away_score THEN 1
        ELSE 0
      END
    ), 0)::INT AS league_ties,
    -- Points for
    COALESCE(SUM(
      CASE
        WHEN gr.home_team_id = tl.team_id THEN gr.home_score
        WHEN gr.away_team_id = tl.team_id THEN gr.away_score
        ELSE 0
      END
    ), 0)::INT AS points_for,
    -- Points against
    COALESCE(SUM(
      CASE
        WHEN gr.home_team_id = tl.team_id THEN gr.away_score
        WHEN gr.away_team_id = tl.team_id THEN gr.home_score
        ELSE 0
      END
    ), 0)::INT AS points_against
  FROM team_lookup tl
  LEFT JOIN game_results gr ON gr.home_team_id = tl.team_id OR gr.away_team_id = tl.team_id
  GROUP BY tl.team_id, tl.school_id, tl.league, tl.division, tl.region
)
-- Final output with school info
SELECT
  ts.school_id,
  s.name AS school_name,
  s.short_name AS school_short_name,
  ts.league,
  ts.division,
  ts.region,
  ts.overall_wins,
  ts.overall_losses,
  ts.overall_ties,
  ts.league_wins,
  ts.league_losses,
  ts.league_ties,
  ts.points_for,
  ts.points_against
FROM team_stats ts
JOIN schools s ON s.id = ts.school_id
ORDER BY
  ts.league,
  ts.division,
  ts.region,
  -- Sort by league win percentage (ties count as 0.5 wins)
  CASE
    WHEN (ts.league_wins + ts.league_losses + ts.league_ties) > 0
    THEN (ts.league_wins::FLOAT + ts.league_ties::FLOAT * 0.5) / (ts.league_wins + ts.league_losses + ts.league_ties)
    ELSE 0
  END DESC,
  -- Then by league wins
  ts.league_wins DESC,
  -- Then by overall win percentage
  CASE
    WHEN (ts.overall_wins + ts.overall_losses + ts.overall_ties) > 0
    THEN (ts.overall_wins::FLOAT + ts.overall_ties::FLOAT * 0.5) / (ts.overall_wins + ts.overall_losses + ts.overall_ties)
    ELSE 0
  END DESC,
  -- Then by point differential
  (ts.points_for - ts.points_against) DESC;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_computed_standings(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_computed_standings(UUID, TEXT, TEXT, TEXT) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION get_computed_standings IS 'Computes standings for a sport/gender/season. Updated for migration 072 where games reference teams.id instead of schools.id.';
