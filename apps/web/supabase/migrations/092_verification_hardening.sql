-- Migration 092: Score Verification Hardening
-- Fixes critical majority-rule deduplication bug and adds safety guards.
--
-- Changes:
--   1. promote_pending_scores(): COUNT(DISTINCT user_id) for majority rule
--   2. can_submit_score(): Block submissions for non-active game states
--   3. can_submit_score(): Global per-user rate limit (10/5min)
--   4. can_submit_score(): Trusted reporter rate limit cap (10/5min per game)

-- ============================================================================
-- PART 1: Fix promote_pending_scores — deduplicate users in majority rule
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
  -- Bug 99 fix (mig 089): skip games where score_locked is true
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
        -- Fix (mig 092): COUNT(DISTINCT user_id) instead of COUNT(*)
        -- Prevents a single user submitting 2x from triggering "majority"
        SELECT home_score, away_score, COUNT(DISTINCT user_id) as cnt
        INTO v_majority_score
        FROM submissions
        WHERE game_id = v_game.game_id
          AND status = 'pending'
        GROUP BY home_score, away_score
        ORDER BY COUNT(DISTINCT user_id) DESC, MAX(created_at) DESC
        LIMIT 1;

        v_majority_count := v_majority_score.cnt;

        IF v_majority_count >= 2 THEN
          -- Majority rule: 2+ distinct users agree
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
            jsonb_build_object('majority_count', v_majority_count, 'conflict', true, 'distinct_users', true)
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
-- PART 2: Harden can_submit_score — game status check, global rate limit,
--         trusted reporter cap
-- ============================================================================

CREATE OR REPLACE FUNCTION can_submit_score(
  p_user_id UUID,
  p_game_id UUID
)
RETURNS TABLE(
  allowed BOOLEAN,
  reason TEXT,
  recent_count INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recent_count INT;
  v_global_count INT;
  v_user_role TEXT;
  v_game_locked BOOLEAN;
  v_game_status TEXT;
  v_last_submission TIMESTAMPTZ;
BEGIN
  -- Get user role
  SELECT get_submission_role(p_user_id) INTO v_user_role;

  -- Admins and super admins always allowed
  IF v_user_role IN ('admin', 'super_admin') THEN
    RETURN QUERY SELECT TRUE, 'admin_override'::TEXT, 0;
    RETURN;
  END IF;

  -- NEW (mig 092): Check game status — only allow for active games
  SELECT status INTO v_game_status
  FROM games WHERE id = p_game_id;

  IF v_game_status IS NULL THEN
    RETURN QUERY SELECT FALSE, 'game_not_found'::TEXT, 0;
    RETURN;
  END IF;

  IF v_game_status NOT IN ('scheduled', 'in_progress') THEN
    RETURN QUERY SELECT FALSE, 'game_not_active'::TEXT, 0;
    RETURN;
  END IF;

  -- Check if game is locked
  SELECT score_locked INTO v_game_locked
  FROM games WHERE id = p_game_id;

  IF v_game_locked AND v_user_role = 'general' THEN
    RETURN QUERY SELECT FALSE, 'game_score_locked'::TEXT, 0;
    RETURN;
  END IF;

  -- NEW (mig 092): Global per-user rate limit — max 10 submissions across all games per 5 min
  IF v_user_role = 'general' THEN
    SELECT COUNT(*)::INT INTO v_global_count
    FROM submissions
    WHERE user_id = p_user_id
      AND created_at > NOW() - INTERVAL '5 minutes';

    IF v_global_count >= 10 THEN
      RETURN QUERY SELECT FALSE, 'global_rate_limited'::TEXT, v_global_count;
      RETURN;
    END IF;
  END IF;

  -- Count recent submissions from this user for this game (last 5 minutes)
  SELECT COUNT(*)::INT INTO v_recent_count
  FROM submissions
  WHERE user_id = p_user_id
    AND game_id = p_game_id
    AND created_at > NOW() - INTERVAL '5 minutes';

  -- Rate limit: max 3 submissions per 5 minutes for general users
  IF v_user_role = 'general' AND v_recent_count >= 3 THEN
    RETURN QUERY SELECT FALSE, 'rate_limited'::TEXT, v_recent_count;
    RETURN;
  END IF;

  -- Rate limit for trusted reporters: per-game cap (was 5, keeping 5 per game)
  IF v_user_role = 'trusted_reporter' AND v_recent_count >= 5 THEN
    RETURN QUERY SELECT FALSE, 'rate_limited'::TEXT, v_recent_count;
    RETURN;
  END IF;

  -- NEW (mig 092): Trusted reporter global cap — max 10 submissions across all games per 5 min
  IF v_user_role = 'trusted_reporter' THEN
    SELECT COUNT(*)::INT INTO v_global_count
    FROM submissions
    WHERE user_id = p_user_id
      AND created_at > NOW() - INTERVAL '5 minutes';

    IF v_global_count >= 10 THEN
      RETURN QUERY SELECT FALSE, 'global_rate_limited'::TEXT, v_global_count;
      RETURN;
    END IF;
  END IF;

  -- Check cooldown: must wait 30 seconds between submissions
  SELECT MAX(created_at) INTO v_last_submission
  FROM submissions
  WHERE user_id = p_user_id
    AND game_id = p_game_id;

  IF v_last_submission IS NOT NULL AND v_last_submission > NOW() - INTERVAL '30 seconds' THEN
    IF v_user_role = 'general' THEN
      RETURN QUERY SELECT FALSE, 'cooldown'::TEXT, v_recent_count;
      RETURN;
    END IF;
  END IF;

  RETURN QUERY SELECT TRUE, 'allowed'::TEXT, v_recent_count;
END;
$$;

-- ============================================================================
-- PART 3: Comments
-- ============================================================================

COMMENT ON FUNCTION promote_pending_scores IS 'Cron job: promotes pending submissions after 60s. Uses COUNT(DISTINCT user_id) for majority rule.';
COMMENT ON FUNCTION can_submit_score IS 'Rate limiting + game status validation for score submissions.';
