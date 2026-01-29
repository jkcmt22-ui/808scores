-- Migration 067: Score Verification System v2
-- Implements proper pending/verified workflow for score submissions

-- ============================================================================
-- PART 1: Add verification tracking columns to games table
-- ============================================================================

-- Timestamp when score was verified by trusted reporter/admin
ALTER TABLE games ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- User who verified the score (trusted reporter, admin, or super admin)
ALTER TABLE games ADD COLUMN IF NOT EXISTS verified_by_user_id UUID REFERENCES users(id);

-- Link to the submission that became the official score
ALTER TABLE games ADD COLUMN IF NOT EXISTS official_submission_id UUID REFERENCES submissions(id);

-- Track when score was last updated (for timer logic)
ALTER TABLE games ADD COLUMN IF NOT EXISTS last_score_update_at TIMESTAMPTZ;

-- Lock score from general user updates (after verification)
ALTER TABLE games ADD COLUMN IF NOT EXISTS score_locked BOOLEAN DEFAULT FALSE;

-- Index for finding games needing verification processing
CREATE INDEX IF NOT EXISTS idx_games_pending_verification
  ON games(id)
  WHERE is_verified = FALSE AND status IN ('in_progress', 'final');

-- Index for finding games with recent score updates
CREATE INDEX IF NOT EXISTS idx_games_last_score_update
  ON games(last_score_update_at DESC)
  WHERE last_score_update_at IS NOT NULL;

-- ============================================================================
-- PART 2: Add audit columns to submissions table
-- ============================================================================

-- Denormalized role at time of submission (for audit trail)
-- Values: 'general', 'trusted_reporter', 'admin', 'super_admin'
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submitted_by_role TEXT;

-- When this submission was promoted to official (if applicable)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS promoted_at TIMESTAMPTZ;

-- Why this submission was promoted
-- Values: 'trusted_instant', 'admin_instant', 'super_admin_instant',
--         'timer_no_conflict', 'majority', 'admin_override'
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS promotion_reason TEXT;

-- Index for finding pending submissions ready for promotion
CREATE INDEX IF NOT EXISTS idx_submissions_pending_promotion
  ON submissions(game_id, created_at DESC)
  WHERE status = 'pending';

-- Index for finding latest submission per game
CREATE INDEX IF NOT EXISTS idx_submissions_game_latest
  ON submissions(game_id, created_at DESC);

-- Index for finding submissions by user (for rate limiting)
CREATE INDEX IF NOT EXISTS idx_submissions_user_recent
  ON submissions(user_id, created_at DESC);

-- ============================================================================
-- PART 3: Create score promotion audit log
-- ============================================================================

CREATE TABLE IF NOT EXISTS score_promotion_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,

  -- Type of promotion
  -- 'trusted_instant', 'admin_instant', 'super_admin_instant',
  -- 'timer_no_conflict', 'majority', 'manual_verification', 'admin_override'
  promotion_type TEXT NOT NULL,

  -- Scores at time of promotion
  home_score INT NOT NULL,
  away_score INT NOT NULL,

  -- Who triggered this (NULL for automatic timer promotion)
  promoted_by_user_id UUID REFERENCES users(id),

  -- Previous state (for rollback/audit)
  previous_home_score INT,
  previous_away_score INT,
  previous_submission_id UUID REFERENCES submissions(id),

  -- Metadata (conflicting submissions, majority count, etc.)
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding promotion history by game
CREATE INDEX idx_promotion_log_game ON score_promotion_log(game_id, created_at DESC);

-- Index for finding promotions by user (for auditing trusted reporters)
CREATE INDEX idx_promotion_log_user ON score_promotion_log(promoted_by_user_id, created_at DESC)
  WHERE promoted_by_user_id IS NOT NULL;

-- ============================================================================
-- PART 4: Helper function to get user role for submissions
-- ============================================================================

CREATE OR REPLACE FUNCTION get_submission_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT
    CASE
      WHEN is_super_admin THEN 'super_admin'
      WHEN is_admin THEN 'admin'
      WHEN is_trusted_reporter THEN 'trusted_reporter'
      ELSE 'general'
    END
  FROM users
  WHERE id = p_user_id;
$$;

-- ============================================================================
-- PART 5: Function to check if user can submit scores (rate limiting)
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
  v_user_role TEXT;
  v_game_locked BOOLEAN;
  v_last_submission TIMESTAMPTZ;
BEGIN
  -- Get user role
  SELECT get_submission_role(p_user_id) INTO v_user_role;

  -- Admins and super admins always allowed
  IF v_user_role IN ('admin', 'super_admin') THEN
    RETURN QUERY SELECT TRUE, 'admin_override'::TEXT, 0;
    RETURN;
  END IF;

  -- Check if game is locked
  SELECT score_locked INTO v_game_locked
  FROM games WHERE id = p_game_id;

  IF v_game_locked AND v_user_role = 'general' THEN
    RETURN QUERY SELECT FALSE, 'game_score_locked'::TEXT, 0;
    RETURN;
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

  -- Rate limit: max 5 submissions per 5 minutes for trusted reporters
  IF v_user_role = 'trusted_reporter' AND v_recent_count >= 5 THEN
    RETURN QUERY SELECT FALSE, 'rate_limited'::TEXT, v_recent_count;
    RETURN;
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
-- PART 6: Update existing games to set last_score_update_at
-- ============================================================================

UPDATE games
SET last_score_update_at = updated_at
WHERE last_score_update_at IS NULL
  AND (home_score > 0 OR away_score > 0);

-- ============================================================================
-- PART 7: Backfill submitted_by_role for existing submissions
-- ============================================================================

UPDATE submissions s
SET submitted_by_role = get_submission_role(s.user_id)
WHERE submitted_by_role IS NULL;

-- ============================================================================
-- PART 8: Enable realtime for promotion log
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE score_promotion_log;

-- ============================================================================
-- PART 9: RLS Policies for score_promotion_log
-- ============================================================================

ALTER TABLE score_promotion_log ENABLE ROW LEVEL SECURITY;

-- Anyone can read promotion logs (public transparency)
CREATE POLICY "Public read promotion logs"
  ON score_promotion_log FOR SELECT
  USING (true);

-- Only system (via security definer functions) can insert
-- No direct insert policy for users

-- ============================================================================
-- PART 10: Comments for documentation
-- ============================================================================

COMMENT ON COLUMN games.verified_at IS 'Timestamp when score was verified by trusted reporter or admin';
COMMENT ON COLUMN games.verified_by_user_id IS 'User who verified the score (trusted/admin/super)';
COMMENT ON COLUMN games.official_submission_id IS 'The submission that became the official score';
COMMENT ON COLUMN games.last_score_update_at IS 'When score was last changed (for 60-second timer logic)';
COMMENT ON COLUMN games.score_locked IS 'When true, only trusted reporters and admins can update score';

COMMENT ON COLUMN submissions.submitted_by_role IS 'Role at submission time: general, trusted_reporter, admin, super_admin';
COMMENT ON COLUMN submissions.promoted_at IS 'When this submission became the official score';
COMMENT ON COLUMN submissions.promotion_reason IS 'Why promoted: trusted_instant, timer_no_conflict, majority, etc.';

COMMENT ON TABLE score_promotion_log IS 'Audit trail of all score promotions and verifications';
COMMENT ON FUNCTION get_submission_role IS 'Returns user role for submission audit trail';
COMMENT ON FUNCTION can_submit_score IS 'Rate limiting check for score submissions';
