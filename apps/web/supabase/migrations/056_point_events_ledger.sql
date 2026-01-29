-- Migration 056: Point Events Ledger
-- Creates an audit trail for all point changes in the system
-- Every point transaction (submission, chat, prediction, admin, etc.) creates a record

-- ============================================
-- POINT EVENTS TABLE (Audit Ledger)
-- ============================================

CREATE TABLE IF NOT EXISTS point_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,                    -- submission, chat_comment, chat_like_received, prediction_winner, raffle_deduction, admin_adjustment, etc.
  points INT NOT NULL,                         -- can be negative for deductions
  source_type TEXT NOT NULL,                   -- submission, chat_message, game_prediction, raffle, admin
  source_id UUID,                              -- FK to source record (submission_id, chat_message_id, game_id, raffle_id, etc.)
  metadata JSONB DEFAULT '{}',                 -- Additional context (e.g., breakdown, multipliers applied)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_point_events_user_id ON point_events(user_id);
CREATE INDEX IF NOT EXISTS idx_point_events_user_created ON point_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_events_event_type ON point_events(event_type);
CREATE INDEX IF NOT EXISTS idx_point_events_source ON point_events(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_point_events_created_at ON point_events(created_at DESC);

-- Comments
COMMENT ON TABLE point_events IS 'Audit ledger tracking all point changes. Every point addition/deduction creates a record.';
COMMENT ON COLUMN point_events.event_type IS 'Type of event: submission, chat_comment, chat_like_received, chat_mention_received, prediction_winner, prediction_top3, prediction_top10, raffle_deduction, admin_adjustment, bonus, etc.';
COMMENT ON COLUMN point_events.points IS 'Points awarded (positive) or deducted (negative)';
COMMENT ON COLUMN point_events.source_type IS 'Source category: submission, chat_message, game_prediction, raffle, admin';
COMMENT ON COLUMN point_events.source_id IS 'UUID reference to source record';
COMMENT ON COLUMN point_events.metadata IS 'Additional context like point breakdown, multipliers, caps applied';

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE point_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own point events
CREATE POLICY "Users can view own point events"
  ON point_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all point events
CREATE POLICY "Admins can view all point events"
  ON point_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- Only system (via functions) can insert point events
-- No direct insert policy for regular users
CREATE POLICY "Service role can insert point events"
  ON point_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================
-- AWARD POINTS FUNCTION
-- ============================================

-- Generic function to award points and create ledger entry atomically
CREATE OR REPLACE FUNCTION award_points(
  p_user_id UUID,
  p_event_type TEXT,
  p_points INT,
  p_source_type TEXT,
  p_source_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  -- Validate input
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be null';
  END IF;

  IF p_event_type IS NULL OR p_event_type = '' THEN
    RAISE EXCEPTION 'event_type cannot be null or empty';
  END IF;

  IF p_source_type IS NULL OR p_source_type = '' THEN
    RAISE EXCEPTION 'source_type cannot be null or empty';
  END IF;

  -- Create the ledger entry
  INSERT INTO point_events (user_id, event_type, points, source_type, source_id, metadata)
  VALUES (p_user_id, p_event_type, p_points, p_source_type, p_source_id, p_metadata)
  RETURNING id INTO v_event_id;

  -- Update user totals atomically
  -- Note: season_points might need separate handling based on season boundaries
  UPDATE users
  SET
    total_points = total_points + p_points,
    season_points = season_points + p_points
  WHERE id = p_user_id;

  RETURN v_event_id;
END;
$$;

COMMENT ON FUNCTION award_points IS 'Awards points to a user and creates an audit trail entry. Updates both total_points and season_points atomically.';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Allow authenticated users to call award_points via RPC (function handles security)
GRANT EXECUTE ON FUNCTION award_points TO authenticated;

-- Allow reading from point_events (RLS handles row-level access)
GRANT SELECT ON point_events TO authenticated;
