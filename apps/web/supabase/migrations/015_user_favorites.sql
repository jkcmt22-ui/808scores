-- Migration: Sport follows table and onboarding flag
-- Created: User favorites & onboarding feature

-- Sport follows table (similar to team_follows)
CREATE TABLE IF NOT EXISTS sport_follows (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
  notify BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, sport_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sport_follows_user ON sport_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_sport_follows_sport ON sport_follows(sport_id);

-- Add onboarding_completed flag to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Enable Row Level Security
ALTER TABLE sport_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sport_follows
CREATE POLICY "Users can view own sport follows"
  ON sport_follows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sport follows"
  ON sport_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sport follows"
  ON sport_follows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sport follows"
  ON sport_follows FOR DELETE
  USING (auth.uid() = user_id);
