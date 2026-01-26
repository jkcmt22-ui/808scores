-- Migration 038: School Managers, New Badges, and Scholarship Voting
-- Adds school owner/manager system, new achievement badges, and sportsman of the year voting

-- ============================================
-- 1. SCHOOL MANAGERS SYSTEM
-- ============================================

-- Table to link users to schools they can manage
CREATE TABLE IF NOT EXISTS school_managers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('owner', 'manager', 'assistant')),
  -- owner: full control, can add other managers
  -- manager: can edit school info, rosters, schedules
  -- assistant: can only add updates/news
  can_edit_info BOOLEAN DEFAULT true,      -- Logo, colors, description
  can_manage_roster BOOLEAN DEFAULT true,   -- Players, seasons
  can_manage_schedule BOOLEAN DEFAULT false, -- Future: schedule management
  can_post_updates BOOLEAN DEFAULT true,    -- Team news/updates
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, school_id)
);

CREATE INDEX idx_school_managers_user ON school_managers(user_id) WHERE is_active = true;
CREATE INDEX idx_school_managers_school ON school_managers(school_id) WHERE is_active = true;

-- Add logo and description to schools
ALTER TABLE schools ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS website_url TEXT DEFAULT NULL;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS twitter_handle TEXT DEFAULT NULL;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS instagram_handle TEXT DEFAULT NULL;

-- School updates/news table
CREATE TABLE IF NOT EXISTS school_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  posted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT DEFAULT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_school_updates_school ON school_updates(school_id, created_at DESC);
CREATE INDEX idx_school_updates_pinned ON school_updates(school_id, is_pinned) WHERE is_pinned = true;

-- RLS Policies for school_managers
ALTER TABLE school_managers ENABLE ROW LEVEL SECURITY;

-- Anyone can view school managers (for display purposes)
CREATE POLICY "Anyone can view school managers" ON school_managers
  FOR SELECT USING (is_active = true);

-- Super admins can manage all
CREATE POLICY "Super admins manage all school managers" ON school_managers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- School owners can add managers to their schools
CREATE POLICY "School owners can add managers" ON school_managers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_managers sm
      WHERE sm.user_id = auth.uid()
      AND sm.school_id = school_managers.school_id
      AND sm.role = 'owner'
      AND sm.is_active = true
    )
  );

-- RLS Policies for school_updates
ALTER TABLE school_updates ENABLE ROW LEVEL SECURITY;

-- Anyone can view published updates
CREATE POLICY "Anyone can view published updates" ON school_updates
  FOR SELECT USING (is_published = true);

-- School managers can create updates for their schools
CREATE POLICY "School managers can create updates" ON school_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_managers sm
      WHERE sm.user_id = auth.uid()
      AND sm.school_id = school_updates.school_id
      AND sm.can_post_updates = true
      AND sm.is_active = true
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
  );

-- School managers can update their own posts
CREATE POLICY "School managers can update own posts" ON school_updates
  FOR UPDATE USING (
    posted_by = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
  );

-- ============================================
-- 2. NEW ACHIEVEMENT BADGES
-- ============================================

-- Insert new badges
INSERT INTO badges (code, name, description, category) VALUES
  -- Submission milestones
  ('first_submission', 'First Score!', 'Submitted your first score update', 'milestone'),
  ('submissions_10', 'Scorekeeper', 'Submitted 10 verified scores', 'milestone'),
  ('submissions_50', 'Stats Master', 'Submitted 50 verified scores', 'milestone'),
  ('submissions_100', 'Century Club', 'Submitted 100 verified scores', 'milestone'),
  ('submissions_500', 'Hall of Famer', 'Submitted 500 verified scores', 'milestone'),

  -- Engagement badges
  ('chat_first', 'First Words', 'Sent your first chat message', 'engagement'),
  ('chat_100', 'Chatterbox', 'Sent 100 chat messages', 'engagement'),
  ('likes_given_50', 'Supporter', 'Liked 50 messages from other fans', 'engagement'),
  ('likes_received_100', 'Fan Favorite', 'Received 100 likes on your messages', 'engagement'),

  -- Special badges
  ('early_adopter', 'Early Adopter', 'Joined 808scores in the first year', 'special'),
  ('school_spirit', 'School Spirit', 'Followed 3+ teams from the same school', 'special'),
  ('island_hopper', 'Island Hopper', 'Submitted scores for games on 3+ islands', 'special'),
  ('playoff_reporter', 'Playoff Reporter', 'Submitted scores for 5+ playoff games', 'special'),
  ('championship_witness', 'Championship Witness', 'Submitted the final score of a championship game', 'special'),

  -- Raffle/Community badges
  ('raffle_winner', 'Lucky Winner', 'Won a raffle prize', 'community'),
  ('referral_5', 'Recruiter', 'Referred 5 friends who signed up', 'community')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 3. SPORTSMAN OF THE YEAR SCHOLARSHIP
-- ============================================

-- Scholarship awards table
CREATE TABLE IF NOT EXISTS scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  school_year TEXT NOT NULL, -- e.g., '2025-2026'
  sport_id UUID REFERENCES sports(id) ON DELETE SET NULL, -- NULL = all sports
  voting_starts_at TIMESTAMPTZ NOT NULL,
  voting_ends_at TIMESTAMPTZ NOT NULL,
  winner_announced_at TIMESTAMPTZ,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'voting', 'closed', 'announced')),
  winner_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scholarship nominees
CREATE TABLE IF NOT EXISTS scholarship_nominees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  sport_id UUID REFERENCES sports(id) ON DELETE CASCADE NOT NULL,
  nomination_reason TEXT,
  nominated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_approved BOOLEAN DEFAULT false, -- Admin must approve nominees
  stats_summary JSONB DEFAULT '{}', -- Cache of player stats
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scholarship_id, player_id)
);

CREATE INDEX idx_scholarship_nominees_scholarship ON scholarship_nominees(scholarship_id) WHERE is_approved = true;

-- Scholarship votes
CREATE TABLE IF NOT EXISTS scholarship_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE NOT NULL,
  nominee_id UUID REFERENCES scholarship_nominees(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scholarship_id, user_id) -- One vote per user per scholarship
);

CREATE INDEX idx_scholarship_votes_nominee ON scholarship_votes(nominee_id);
CREATE INDEX idx_scholarship_votes_user ON scholarship_votes(user_id);

-- RLS Policies for scholarships
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarship_nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarship_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can view scholarships
CREATE POLICY "Anyone can view scholarships" ON scholarships FOR SELECT USING (true);

-- Only admins can manage scholarships
CREATE POLICY "Admins manage scholarships" ON scholarships FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
);

-- Anyone can view approved nominees
CREATE POLICY "Anyone can view approved nominees" ON scholarship_nominees
  FOR SELECT USING (is_approved = true);

-- Admins can manage nominees
CREATE POLICY "Admins manage nominees" ON scholarship_nominees FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
);

-- Logged in users can nominate (needs approval)
CREATE POLICY "Users can nominate" ON scholarship_nominees
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Anyone can view votes (for counts)
CREATE POLICY "Anyone can view votes" ON scholarship_votes FOR SELECT USING (true);

-- Logged in users can vote once
CREATE POLICY "Users can vote" ON scholarship_votes
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM scholarships s
      WHERE s.id = scholarship_id
      AND s.status = 'voting'
      AND NOW() BETWEEN s.voting_starts_at AND s.voting_ends_at
    )
  );

-- Users can delete their own vote (change vote)
CREATE POLICY "Users can change vote" ON scholarship_votes
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to check if user can manage a school
CREATE OR REPLACE FUNCTION can_manage_school(p_user_id UUID, p_school_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Super admins can manage all schools
  IF EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND is_super_admin = true) THEN
    RETURN true;
  END IF;

  -- Check school_managers table
  RETURN EXISTS (
    SELECT 1 FROM school_managers
    WHERE user_id = p_user_id
    AND school_id = p_school_id
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's managed schools
CREATE OR REPLACE FUNCTION get_managed_schools(p_user_id UUID)
RETURNS TABLE(school_id UUID, role TEXT, school_name TEXT) AS $$
BEGIN
  -- Super admins see all schools
  IF EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND is_super_admin = true) THEN
    RETURN QUERY
    SELECT s.id, 'super_admin'::TEXT, s.name
    FROM schools s
    ORDER BY s.name;
  ELSE
    RETURN QUERY
    SELECT sm.school_id, sm.role, s.name
    FROM school_managers sm
    JOIN schools s ON s.id = sm.school_id
    WHERE sm.user_id = p_user_id
    AND sm.is_active = true
    ORDER BY s.name;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get scholarship vote counts
CREATE OR REPLACE FUNCTION get_scholarship_vote_counts(p_scholarship_id UUID)
RETURNS TABLE(nominee_id UUID, player_name TEXT, school_name TEXT, vote_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sn.id,
    (p.first_name || ' ' || p.last_name)::TEXT,
    s.name,
    COUNT(sv.id)::BIGINT
  FROM scholarship_nominees sn
  JOIN players p ON p.id = sn.player_id
  JOIN schools s ON s.id = sn.school_id
  LEFT JOIN scholarship_votes sv ON sv.nominee_id = sn.id
  WHERE sn.scholarship_id = p_scholarship_id
  AND sn.is_approved = true
  GROUP BY sn.id, p.first_name, p.last_name, s.name
  ORDER BY COUNT(sv.id) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. SEED FIRST SPORTSMAN OF THE YEAR
-- ============================================

-- Create the 2025-2026 Sportsman of the Year scholarship
INSERT INTO scholarships (name, description, amount, school_year, voting_starts_at, voting_ends_at, status)
VALUES (
  '808scores Sportsman of the Year',
  'A $10,000 scholarship awarded to the Hawaii high school athlete who best exemplifies sportsmanship, leadership, and athletic excellence. Vote for your favorite athlete!',
  10000.00,
  '2025-2026',
  '2026-04-01 00:00:00-10', -- Voting starts April 1, 2026
  '2026-05-15 23:59:59-10', -- Voting ends May 15, 2026
  'upcoming'
);
