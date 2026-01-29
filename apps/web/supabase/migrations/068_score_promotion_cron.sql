-- Migration 068: Score Promotion Cron Function
-- Promotes pending submissions after 60 seconds with no conflicts

-- ============================================================================
-- PART 1: Main promotion function
-- ============================================================================

CREATE OR REPLACE FUNCTION promote_pending_scores()
RETURNS TABLE(
  promoted_count INT,
  conflict_count INT,
  games_processed INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promoted_count INT := 0;
  v_conflict_count INT := 0;
  v_games_processed INT := 0;
  v_game RECORD;
  v_latest_submission RECORD;
  v_matching_count INT;
  v_has_conflict BOOLEAN;
BEGIN
  -- Find all games with pending submissions older than 60 seconds
  FOR v_game IN
    SELECT DISTINCT s.game_id, g.home_score AS current_home, g.away_score AS current_away,
           g.official_submission_id, g.is_verified
    FROM submissions s
    JOIN games g ON g.id = s.game_id
    WHERE s.status = 'pending'
      AND s.created_at < NOW() - INTERVAL '60 seconds'
      AND g.status IN ('scheduled', 'in_progress', 'final')
    ORDER BY s.game_id
  LOOP
    v_games_processed := v_games_processed + 1;

    -- Get all pending submissions for this game
    SELECT INTO v_latest_submission *
    FROM submissions
    WHERE game_id = v_game.game_id
      AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Check if there are any pending submissions with different scores (conflict)
    SELECT COUNT(DISTINCT (home_score, away_score)) INTO v_matching_count
    FROM submissions
    WHERE game_id = v_game.game_id
      AND status = 'pending';

    v_has_conflict := v_matching_count > 1;

    IF v_has_conflict THEN
      -- Multiple different scores submitted - check for majority
      DECLARE
        v_majority_score RECORD;
        v_majority_count INT;
      BEGIN
        -- Find the score with the most submissions
        SELECT home_score, away_score, COUNT(*) as cnt
        INTO v_majority_score
        FROM submissions
        WHERE game_id = v_game.game_id
          AND status = 'pending'
        GROUP BY home_score, away_score
        ORDER BY COUNT(*) DESC, MAX(created_at) DESC
        LIMIT 1;

        v_majority_count := v_majority_score.cnt;

        IF v_majority_count >= 2 THEN
          -- Majority rule: 2+ submissions agree
          -- Get the earliest submission with the majority score
          SELECT INTO v_latest_submission *
          FROM submissions
          WHERE game_id = v_game.game_id
            AND status = 'pending'
            AND home_score = v_majority_score.home_score
            AND away_score = v_majority_score.away_score
          ORDER BY created_at ASC
          LIMIT 1;

          -- Promote this submission
          PERFORM promote_submission(
            v_latest_submission.id,
            'majority',
            NULL,
            jsonb_build_object('majority_count', v_majority_count, 'conflict', true)
          );

          v_promoted_count := v_promoted_count + 1;
        ELSE
          -- No clear majority - flag for manual review
          v_conflict_count := v_conflict_count + 1;
          -- Log the conflict (don't promote anything)
          INSERT INTO score_promotion_log (
            game_id, submission_id, promotion_type,
            home_score, away_score,
            previous_home_score, previous_away_score,
            metadata
          ) VALUES (
            v_game.game_id,
            v_latest_submission.id,
            'conflict_flagged',
            v_latest_submission.home_score,
            v_latest_submission.away_score,
            v_game.current_home,
            v_game.current_away,
            jsonb_build_object(
              'distinct_scores', v_matching_count,
              'requires_manual_review', true
            )
          );
        END IF;
      END;
    ELSE
      -- No conflict - promote the latest submission (timer rule)
      PERFORM promote_submission(
        v_latest_submission.id,
        'timer_no_conflict',
        NULL,
        jsonb_build_object('waited_seconds', 60)
      );

      v_promoted_count := v_promoted_count + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_promoted_count, v_conflict_count, v_games_processed;
END;
$$;

-- ============================================================================
-- PART 2: Helper function to promote a single submission
-- ============================================================================

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

  -- Log promotion
  INSERT INTO score_promotion_log (game_id, submission_id, promotion_type, home_score, away_score,
    promoted_by_user_id, previous_home_score, previous_away_score, previous_submission_id, metadata)
  VALUES (v_submission.game_id, p_submission_id, p_promotion_type, v_submission.home_score, v_submission.away_score,
    p_promoted_by_user_id, v_game.home_score, v_game.away_score, v_game.official_submission_id, p_metadata);

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- PART 3: Function to manually verify an unverified score
-- ============================================================================

CREATE OR REPLACE FUNCTION verify_game_score(
  p_game_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role TEXT;
  v_game RECORD;
BEGIN
  SELECT get_submission_role(p_user_id) INTO v_user_role;

  IF v_user_role NOT IN ('trusted_reporter', 'admin', 'super_admin') THEN
    RAISE EXCEPTION 'Only trusted reporters and admins can verify scores';
  END IF;

  SELECT * INTO v_game FROM games WHERE id = p_game_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Game not found'; END IF;

  IF v_game.is_verified THEN RETURN TRUE; END IF;

  -- Verify the score with proper enum cast
  UPDATE games SET
    is_verified = TRUE,
    verified_at = NOW(),
    verified_by_user_id = p_user_id,
    verification_method = 'manual'::verification_method
  WHERE id = p_game_id;

  -- Log the verification
  INSERT INTO score_promotion_log (game_id, submission_id, promotion_type, home_score, away_score, promoted_by_user_id, metadata)
  VALUES (p_game_id, COALESCE(v_game.official_submission_id, '00000000-0000-0000-0000-000000000000'::UUID),
    'manual_verification', v_game.home_score, v_game.away_score, p_user_id,
    jsonb_build_object('verified_by_role', v_user_role));

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- PART 4: Function for admin to override a score
-- ============================================================================

CREATE OR REPLACE FUNCTION admin_override_score(
  p_game_id UUID,
  p_user_id UUID,
  p_home_score INT,
  p_away_score INT,
  p_reason TEXT DEFAULT 'Admin override'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role TEXT;
  v_game RECORD;
  v_submission_id UUID;
BEGIN
  SELECT get_submission_role(p_user_id) INTO v_user_role;

  IF v_user_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Only admins can override scores';
  END IF;

  SELECT * INTO v_game FROM games WHERE id = p_game_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Game not found'; END IF;

  -- Create an admin submission
  INSERT INTO submissions (game_id, user_id, submission_type, home_score, away_score,
    status, submitted_by_role, promoted_at, promotion_reason)
  VALUES (p_game_id, p_user_id, 'final_score', p_home_score, p_away_score,
    'published', v_user_role, NOW(), 'admin_override')
  RETURNING id INTO v_submission_id;

  -- Update the game with proper enum cast
  UPDATE games SET
    home_score = p_home_score,
    away_score = p_away_score,
    is_verified = TRUE,
    verified_at = NOW(),
    verified_by_user_id = p_user_id,
    official_submission_id = v_submission_id,
    last_score_update_at = NOW(),
    verification_method = 'manual'::verification_method
  WHERE id = p_game_id;

  -- Mark previous official submission as overturned
  IF v_game.official_submission_id IS NOT NULL THEN
    UPDATE submissions SET status = 'overturned' WHERE id = v_game.official_submission_id;
  END IF;

  -- Log the override
  INSERT INTO score_promotion_log (game_id, submission_id, promotion_type, home_score, away_score,
    promoted_by_user_id, previous_home_score, previous_away_score, previous_submission_id, metadata)
  VALUES (p_game_id, v_submission_id, 'admin_override', p_home_score, p_away_score,
    p_user_id, v_game.home_score, v_game.away_score, v_game.official_submission_id,
    jsonb_build_object('reason', p_reason, 'admin_role', v_user_role));

  RETURN v_submission_id;
END;
$$;

-- ============================================================================
-- PART 5: Set up pg_cron to run promotion every 30 seconds
-- Note: pg_cron must be enabled in Supabase dashboard first
-- ============================================================================

-- Check if pg_cron extension exists and schedule the job
DO $$
BEGIN
  -- Try to schedule the cron job (will fail silently if pg_cron not enabled)
  BEGIN
    PERFORM cron.schedule(
      'promote-pending-scores',
      '30 seconds',
      'SELECT promote_pending_scores()'
    );
    RAISE NOTICE 'Cron job scheduled successfully';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron not available - run promote_pending_scores() manually or via Edge Function';
  END;
END;
$$;

-- ============================================================================
-- PART 6: Grant execute permissions
-- ============================================================================

-- Allow authenticated users to call verify_game_score (function checks role internally)
GRANT EXECUTE ON FUNCTION verify_game_score(UUID, UUID) TO authenticated;

-- Allow authenticated users to call admin_override_score (function checks role internally)
GRANT EXECUTE ON FUNCTION admin_override_score(UUID, UUID, INT, INT, TEXT) TO authenticated;

-- ============================================================================
-- PART 7: Comments
-- ============================================================================

COMMENT ON FUNCTION promote_pending_scores IS 'Cron job function: promotes pending submissions after 60 seconds';
COMMENT ON FUNCTION promote_submission IS 'Helper: promotes a single submission and updates game';
COMMENT ON FUNCTION verify_game_score IS 'Allows trusted reporters/admins to verify an unverified score';
COMMENT ON FUNCTION admin_override_score IS 'Allows admins to override any score with audit trail';
