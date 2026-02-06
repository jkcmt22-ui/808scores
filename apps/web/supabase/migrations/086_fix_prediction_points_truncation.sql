-- Migration 086: Fix prediction points integer truncation
-- PostgreSQL integer division truncates remainders. When tied users split
-- points (e.g. 25 / 3 = 8, losing 1 point), we now ROUND instead.

CREATE OR REPLACE FUNCTION process_prediction_results(p_game_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_game RECORD;
  v_prediction RECORD;
  v_results JSONB := '[]'::JSONB;
  v_current_rank INT := 0;
  v_last_error INT := -1;
  v_tied_users UUID[] := '{}';
  v_tied_points INT := 0;
  v_points_to_award INT;
  v_user_id UUID;
  v_total_predictions INT;
  v_exact_match_count INT := 0;
BEGIN
  -- Get game details
  SELECT id, home_score, away_score, status, predictions_enabled
  INTO v_game
  FROM games
  WHERE id = p_game_id;

  -- Validate game state
  IF v_game IS NULL THEN
    RAISE EXCEPTION 'Game not found: %', p_game_id;
  END IF;

  IF v_game.status != 'final' THEN
    RAISE EXCEPTION 'Game is not final: status = %', v_game.status;
  END IF;

  IF NOT v_game.predictions_enabled THEN
    RAISE NOTICE 'Predictions not enabled for this game';
    RETURN FALSE;
  END IF;

  -- Check if already processed
  IF EXISTS (SELECT 1 FROM prediction_results WHERE game_id = p_game_id) THEN
    RAISE NOTICE 'Predictions already processed for this game';
    RETURN FALSE;
  END IF;

  -- Count total predictions
  SELECT COUNT(*) INTO v_total_predictions
  FROM game_predictions
  WHERE game_id = p_game_id;

  IF v_total_predictions = 0 THEN
    RAISE NOTICE 'No predictions for this game';
    RETURN FALSE;
  END IF;

  -- Process each prediction ordered by error (ascending), then created_at (ascending for tiebreaker)
  FOR v_prediction IN
    SELECT
      gp.id,
      gp.user_id,
      gp.predicted_home_score,
      gp.predicted_away_score,
      gp.created_at,
      ABS(gp.predicted_home_score - v_game.home_score) +
        ABS(gp.predicted_away_score - v_game.away_score) AS error,
      (gp.predicted_home_score = v_game.home_score AND
       gp.predicted_away_score = v_game.away_score) AS is_exact_match
    FROM game_predictions gp
    WHERE gp.game_id = p_game_id
    ORDER BY error ASC, gp.created_at ASC
  LOOP
    -- Track exact matches
    IF v_prediction.is_exact_match THEN
      v_exact_match_count := v_exact_match_count + 1;
    END IF;

    -- Handle ties: if same error as previous, they share the same rank
    IF v_prediction.error = v_last_error THEN
      -- Add to tied group
      v_tied_users := array_append(v_tied_users, v_prediction.user_id);
    ELSE
      -- Award points to previous tied group if any
      IF array_length(v_tied_users, 1) > 0 THEN
        -- Calculate average points for tied users (ROUND to avoid truncation)
        v_points_to_award := ROUND(v_tied_points::numeric / array_length(v_tied_users, 1))::int;
        FOREACH v_user_id IN ARRAY v_tied_users
        LOOP
          IF v_points_to_award > 0 THEN
            PERFORM award_points(
              v_user_id,
              CASE
                WHEN v_current_rank = 1 AND v_last_error = 0 THEN 'prediction_exact_match'
                WHEN v_current_rank <= 3 THEN 'prediction_top3'
                ELSE 'prediction_top10'
              END,
              v_points_to_award,
              'game_prediction',
              p_game_id,
              jsonb_build_object('rank', v_current_rank, 'error', v_last_error, 'tied_count', array_length(v_tied_users, 1))
            );
          END IF;
        END LOOP;
      END IF;

      -- Start new rank group
      v_current_rank := v_current_rank + COALESCE(array_length(v_tied_users, 1), 1);
      v_tied_users := ARRAY[v_prediction.user_id];
      v_last_error := v_prediction.error;

      -- Calculate points for this rank
      IF v_current_rank = 1 AND v_prediction.is_exact_match THEN
        v_tied_points := 50; -- Exact match
      ELSIF v_current_rank = 1 THEN
        v_tied_points := 25; -- 1st place (no exact match)
      ELSIF v_current_rank <= 3 THEN
        v_tied_points := 25; -- Top 3
      ELSIF v_current_rank <= 10 THEN
        v_tied_points := 10; -- Top 10
      ELSE
        v_tied_points := 0;
      END IF;
    END IF;

    -- Add to results
    v_results := v_results || jsonb_build_object(
      'user_id', v_prediction.user_id,
      'rank', v_current_rank,
      'error', v_prediction.error,
      'points_awarded', CASE
        WHEN v_current_rank = 1 AND v_prediction.is_exact_match THEN 50
        WHEN v_current_rank <= 3 THEN 25
        WHEN v_current_rank <= 10 THEN 10
        ELSE 0
      END,
      'predicted_home_score', v_prediction.predicted_home_score,
      'predicted_away_score', v_prediction.predicted_away_score,
      'is_exact_match', v_prediction.is_exact_match
    );
  END LOOP;

  -- Award points to final tied group
  IF array_length(v_tied_users, 1) > 0 AND v_tied_points > 0 THEN
    -- ROUND to avoid truncation
    v_points_to_award := ROUND(v_tied_points::numeric / array_length(v_tied_users, 1))::int;
    FOREACH v_user_id IN ARRAY v_tied_users
    LOOP
      IF v_points_to_award > 0 THEN
        PERFORM award_points(
          v_user_id,
          CASE
            WHEN v_current_rank = 1 AND v_last_error = 0 THEN 'prediction_exact_match'
            WHEN v_current_rank <= 3 THEN 'prediction_top3'
            ELSE 'prediction_top10'
          END,
          v_points_to_award,
          'game_prediction',
          p_game_id,
          jsonb_build_object('rank', v_current_rank, 'error', v_last_error, 'tied_count', array_length(v_tied_users, 1))
        );
      END IF;
    END LOOP;
  END IF;

  -- Store results
  INSERT INTO prediction_results (
    game_id,
    total_predictions,
    exact_match_count,
    avg_home_score,
    avg_away_score,
    home_win_prediction_pct,
    results_json
  )
  SELECT
    p_game_id,
    COUNT(*),
    v_exact_match_count,
    ROUND(AVG(predicted_home_score)::NUMERIC, 2),
    ROUND(AVG(predicted_away_score)::NUMERIC, 2),
    ROUND(
      (COUNT(*) FILTER (WHERE predicted_home_score > predicted_away_score) * 100.0 / COUNT(*))::NUMERIC,
      2
    ),
    v_results
  FROM game_predictions
  WHERE game_id = p_game_id;

  RETURN TRUE;
END;
$$;
