-- Migration 089: Fix score promotion bugs
-- Bug 99: promote_pending_scores() doesn't check score_locked — cron can
--         overwrite locked final scores with old pending submissions.
-- Bug 100: promote_submission() awards duplicate points — no idempotency
--          check before calling award_points(), and no unique constraint
--          on point_events(source_id).

-- ============================================================================
-- PART 1: Fix promote_pending_scores to skip score-locked games
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
  -- Bug 99 fix: skip games where score_locked is true
  FOR v_game IN
    SELECT DISTINCT s.game_id, g.home_score AS current_home, g.away_score AS current_away,
           g.official_submission_id, g.is_verified
    FROM submissions s
    JOIN games g ON g.id = s.game_id
    WHERE s.status = 'pending'
      AND s.created_at < NOW() - INTERVAL '60 seconds'
      AND g.status IN ('scheduled', 'in_progress', 'final')
      AND g.score_locked IS NOT TRUE
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
-- PART 2: Fix promote_submission to check score_locked + idempotent points
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
  v_already_awarded BOOLEAN;
BEGIN
  SELECT * INTO v_submission FROM submissions WHERE id = p_submission_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  -- Bug 100 fix: skip if submission is already published (prevents re-promotion)
  IF v_submission.status = 'published' THEN RETURN FALSE; END IF;

  SELECT * INTO v_game FROM games WHERE id = v_submission.game_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  -- Bug 99 fix: don't overwrite score-locked games
  IF v_game.score_locked IS TRUE THEN
    -- Log that we skipped a locked game
    INSERT INTO score_promotion_log (
      game_id, submission_id, promotion_type,
      home_score, away_score,
      previous_home_score, previous_away_score,
      metadata
    ) VALUES (
      v_submission.game_id, p_submission_id, 'skipped_locked',
      v_submission.home_score, v_submission.away_score,
      v_game.home_score, v_game.away_score,
      jsonb_build_object('reason', 'Game score is locked', 'original_type', p_promotion_type)
    );
    -- Reject the submission since the game is locked
    UPDATE submissions SET status = 'rejected', promotion_reason = 'game_score_locked'
    WHERE id = p_submission_id;
    RETURN FALSE;
  END IF;

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

  -- Bug 100 fix: Award points only if not already awarded for this submission
  IF v_submission.points_earned > 0 THEN
    SELECT EXISTS(
      SELECT 1 FROM point_events
      WHERE source_id = v_submission.id
        AND source_type = 'submission'
        AND event_type = 'submission'
    ) INTO v_already_awarded;

    IF NOT v_already_awarded THEN
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
  END IF;

  -- Log promotion
  INSERT INTO score_promotion_log (game_id, submission_id, promotion_type, home_score, away_score,
    promoted_by_user_id, previous_home_score, previous_away_score, previous_submission_id, metadata)
  VALUES (v_submission.game_id, p_submission_id, p_promotion_type, v_submission.home_score, v_submission.away_score,
    p_promoted_by_user_id, v_game.home_score, v_game.away_score, v_game.official_submission_id, p_metadata);

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION promote_pending_scores IS 'Cron job: promotes pending submissions after 60s, skips score-locked games';
COMMENT ON FUNCTION promote_submission IS 'Promotes a single submission with score-lock check and idempotent point awards';
