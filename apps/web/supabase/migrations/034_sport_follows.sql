-- Migration 034: Add sport_follows table
-- This table is referenced in the codebase but was missing from the schema

-- ============================================
-- SPORT FOLLOWS
-- ============================================
CREATE TABLE IF NOT EXISTS sport_follows (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
  notify BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, sport_id)
);

CREATE INDEX IF NOT EXISTS idx_sport_follows_sport ON sport_follows(sport_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE sport_follows ENABLE ROW LEVEL SECURITY;

-- Users can view their own sport follows
CREATE POLICY "Users can view own sport follows"
  ON sport_follows FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sport follows
CREATE POLICY "Users can insert own sport follows"
  ON sport_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sport follows
CREATE POLICY "Users can update own sport follows"
  ON sport_follows FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own sport follows
CREATE POLICY "Users can delete own sport follows"
  ON sport_follows FOR DELETE
  USING (auth.uid() = user_id);
