-- ============================================
-- MIGRATION 049: Additional Performance Indexes
-- ============================================

-- Index for submissions ordering by created_at (used in analytics)
CREATE INDEX IF NOT EXISTS idx_submissions_created_at
  ON submissions(created_at DESC);

-- Index for chat messages ordering (used in analytics and moderation)
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
  ON chat_messages(created_at DESC);

-- Index for user submission counts (used in analytics top contributors)
CREATE INDEX IF NOT EXISTS idx_users_submission_count
  ON users(submission_count DESC)
  WHERE submission_count > 0;

-- Index for user verified counts
CREATE INDEX IF NOT EXISTS idx_users_verified_count
  ON users(verified_count DESC)
  WHERE verified_count > 0;

-- Index for schools ordering by name (used in admin school list)
CREATE INDEX IF NOT EXISTS idx_schools_name
  ON schools(name);

-- Composite index for games date range queries (schedule page)
CREATE INDEX IF NOT EXISTS idx_games_scheduled_at_status
  ON games(scheduled_at DESC, status);

-- Index for raffles status filtering
CREATE INDEX IF NOT EXISTS idx_raffles_status
  ON raffles(status)
  WHERE status = 'open';
