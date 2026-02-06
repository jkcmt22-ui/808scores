-- Migration 087: Award points when submissions are promoted
-- Previously, points were awarded immediately on submission even for pending ones.
-- Now the API only awards points for published (trusted) submissions.
-- This migration adds point awarding to promote_submission so non-trusted
-- users get their points when their submission is actually promoted.

CREATE OR REPLACE FUNCTION promote_submission(
  p_submission_id UUID,
  p_promotion_type TEXT,
  p_promoted_by_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_submission RECORD;
  v_game RECORD;
  v_new_status game_status;
  v_verification verification_method;
BEGIN
  SELECT * INTO v_submission FROM submissions WHERE id = p_submission_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  SELECT * INTO v_game FROM games WHERE id = v_submission.game_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  -- Set game status with proper enum cast
  v_new_status := CASE
    WHEN v_submission.submission_type = 'final_score' THEN 'final'::game_status
    ELSE 'in_progress'::game_status
  END;

  -- Set verification method with proper enum cast
  v_verification := CASE
    WHEN p_promotion_type = 'timer_no_conflict' THEN 'timer'::verification_method
    WHEN p_promotion_type = 'majority' THEN 'majority'::verification_method
    WHEN p_promotion_type LIKE '%_instant' THEN 'trusted'::verification_method
    ELSE 'manual'::verification_method
  END;

  -- Update submission
  UPDATE submissions SET status = 'published', promoted_at = NOW(), promotion_reason = p_promotion_type
  WHERE id = p_submission_id;

  -- Update game (NOT verified for auto-promotion)
  UPDATE games SET
    home_score = v_submission.home_score,
    away_score = v_submission.away_score,
    status = v_new_status,
    current_period = CASE WHEN v_submission.submission_type = 'final_score' THEN NULL ELSE v_submission.period END,
    time_remaining = CASE WHEN v_submission.submission_type = 'final_score' THEN NULL ELSE v_submission.time_remaining END,
    is_verified = FALSE,
    official_submission_id = p_submission_id,
    last_score_update_at = NOW(),
    verification_method = v_verification
  WHERE id = v_submission.game_id;

  -- Mark other pending as rejected
  UPDATE submissions SET status = 'rejected'
  WHERE game_id = v_submission.game_id AND status = 'pending' AND id != p_submission_id;

  -- Award points to the promoted submission's author (deferred from submission creation)
  IF v_submission.points_earned > 0 THEN
    PERFORM award_points(
      v_submission.user_id,
      'submission',
      v_submission.points_earned,
      'submission',
      v_submission.id,
      jsonb_build_object(
        'deferred', true,
        'promotion_type', p_promotion_type,
        'submission_type', v_submission.submission_type
      )
    );
  END IF;

  -- Log promotion
  INSERT INTO score_promotion_log (game_id, submission_id, promotion_type, home_score, away_score,
    promoted_by_user_id, previous_home_score, previous_away_score, previous_submission_id, metadata)
  VALUES (v_submission.game_id, p_submission_id, p_promotion_type, v_submission.home_score, v_submission.away_score,
    p_promoted_by_user_id, v_game.home_score, v_game.away_score, v_game.official_submission_id, p_metadata);

  RETURN TRUE;
END;
$$;
