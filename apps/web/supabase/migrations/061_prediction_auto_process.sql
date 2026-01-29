-- Migration 061: Auto-Process Prediction Results
-- Creates a trigger that automatically processes prediction results when a game is finalized

-- ============================================
-- TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION trigger_process_predictions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only process when:
  -- 1. Status changes TO 'final'
  -- 2. The game has predictions_enabled = true
  -- 3. Results haven't been processed yet
  IF NEW.status = 'final'
    AND OLD.status != 'final'
    AND NEW.predictions_enabled = true
    AND NOT EXISTS (SELECT 1 FROM prediction_results WHERE game_id = NEW.id)
  THEN
    -- Process the predictions asynchronously via pg_notify
    -- This allows the transaction to complete quickly
    PERFORM pg_notify('process_predictions', json_build_object(
      'game_id', NEW.id,
      'home_score', NEW.home_score,
      'away_score', NEW.away_score
    )::text);

    -- Also process synchronously as a fallback
    -- In production, you might want to use a background job instead
    BEGIN
      PERFORM process_prediction_results(NEW.id);
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but don't fail the transaction
      RAISE WARNING 'Failed to process predictions for game %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_process_predictions IS 'Automatically processes prediction results when a game status changes to final';

-- ============================================
-- CREATE TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS auto_process_predictions_trigger ON games;

CREATE TRIGGER auto_process_predictions_trigger
  AFTER UPDATE ON games
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trigger_process_predictions();

COMMENT ON TRIGGER auto_process_predictions_trigger ON games IS 'Fires when game status changes, processes predictions if game becomes final';

-- ============================================
-- MANUAL PROCESS FUNCTION (Admin Use)
-- ============================================

-- Function for admins to manually reprocess predictions if needed
CREATE OR REPLACE FUNCTION admin_reprocess_predictions(p_game_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_game RECORD;
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (is_admin = true OR is_super_admin = true)
  ) THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;

  -- Get game
  SELECT * INTO v_game FROM games WHERE id = p_game_id;

  IF v_game IS NULL THEN
    RAISE EXCEPTION 'Game not found';
  END IF;

  IF v_game.status != 'final' THEN
    RAISE EXCEPTION 'Game is not final';
  END IF;

  IF NOT v_game.predictions_enabled THEN
    RAISE EXCEPTION 'Predictions not enabled for this game';
  END IF;

  -- Delete existing results to allow reprocessing
  DELETE FROM prediction_results WHERE game_id = p_game_id;

  -- Delete existing point events for this game's predictions
  DELETE FROM point_events
  WHERE source_type = 'game_prediction'
  AND source_id = p_game_id;

  -- Revert user points that were awarded (this is a simplification - in production you'd want more careful handling)
  -- For now, the process_prediction_results function will award fresh points

  -- Reprocess
  RETURN process_prediction_results(p_game_id);
END;
$$;

COMMENT ON FUNCTION admin_reprocess_predictions IS 'Allows admins to reprocess prediction results for a game. Deletes existing results and re-awards points.';

-- Grant execute to authenticated (function does its own auth check)
GRANT EXECUTE ON FUNCTION admin_reprocess_predictions TO authenticated;
