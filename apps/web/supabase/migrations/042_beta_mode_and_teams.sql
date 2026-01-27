-- ============================================
-- Migration 042: Beta Mode & Team Structure
-- ============================================
-- This migration implements:
-- 1. Beta access control with codes
-- 2. Teams table (sport + gender + division per school)
-- 3. Team managers (replaces/extends school managers)
-- 4. Team rosters (organized by sport/gender/season)
-- 5. Data migration from old structure
-- ============================================

-- ============================================
-- 1. BETA ACCESS CONTROL
-- ============================================

-- Beta codes for access control
CREATE TABLE IF NOT EXISTS beta_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- 8-character code (e.g., "BETA2026")
  name TEXT, -- Optional label (e.g., "Wave 1 Coaches")
  description TEXT,
  max_uses INTEGER DEFAULT 1, -- -1 = unlimited
  use_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  notes TEXT
);

CREATE INDEX idx_beta_codes_code ON beta_codes(code) WHERE is_active = true;
CREATE INDEX idx_beta_codes_active ON beta_codes(is_active, expires_at);

-- Track beta access grants
CREATE TABLE IF NOT EXISTS beta_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  beta_code_id UUID REFERENCES beta_codes(id),
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX idx_beta_access_user ON beta_access(user_id);

-- Add beta fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_beta_access BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS beta_granted_at TIMESTAMPTZ;

-- ============================================
-- 2. TEAMS TABLE (Sport + Gender + Division per School)
-- ============================================

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  sport_id UUID REFERENCES sports(id) ON DELETE CASCADE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('boys', 'girls', 'coed')),

  -- Division can be different per sport
  division TEXT, -- "Open", "Division I", "Division II", "ILH", "OIA", etc.
  league TEXT, -- "ILH", "OIA", "BIIF", etc.

  -- Season tracking
  season_year TEXT NOT NULL, -- "2025-2026"
  is_active BOOLEAN DEFAULT true,

  -- Beta flags
  is_beta BOOLEAN DEFAULT false,
  beta_features JSONB DEFAULT '{}', -- {"rosters": true, "schedule": false}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One team per school/sport/gender/season combination
  UNIQUE(school_id, sport_id, gender, season_year)
);

CREATE INDEX idx_teams_school ON teams(school_id) WHERE is_active = true;
CREATE INDEX idx_teams_sport ON teams(sport_id) WHERE is_active = true;
CREATE INDEX idx_teams_season ON teams(season_year) WHERE is_active = true;
CREATE INDEX idx_teams_lookup ON teams(school_id, sport_id, gender, season_year);

-- ============================================
-- 3. TEAM MANAGERS (Replaces/Extends School Managers)
-- ============================================

CREATE TABLE IF NOT EXISTS team_managers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,

  -- Role hierarchy
  role TEXT NOT NULL DEFAULT 'assistant' CHECK (role IN ('owner', 'head_coach', 'assistant_coach', 'manager', 'assistant')),

  -- Permissions
  can_edit_roster BOOLEAN DEFAULT true,
  can_edit_schedule BOOLEAN DEFAULT false,
  can_submit_scores BOOLEAN DEFAULT true,
  can_post_updates BOOLEAN DEFAULT true,
  can_manage_coaches BOOLEAN DEFAULT false,

  -- Audit
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, team_id)
);

CREATE INDEX idx_team_managers_user ON team_managers(user_id) WHERE is_active = true;
CREATE INDEX idx_team_managers_team ON team_managers(team_id) WHERE is_active = true;

-- ============================================
-- 4. RESTRUCTURE ROSTERS
-- ============================================

-- Keep existing players table but add team_id
ALTER TABLE players ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Create index for team-based queries
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id) WHERE is_active = true;

-- Player roster assignments (allows same player on multiple teams if needed)
CREATE TABLE IF NOT EXISTS team_rosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,

  -- Player info for this team
  jersey_number INTEGER,
  position TEXT,
  grade TEXT, -- "9", "10", "11", "12"
  is_captain BOOLEAN DEFAULT false,
  is_starter BOOLEAN DEFAULT false,

  -- Season tracking
  season_year TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, player_id, season_year)
);

CREATE INDEX idx_team_rosters_team ON team_rosters(team_id, season_year) WHERE is_active = true;
CREATE INDEX idx_team_rosters_player ON team_rosters(player_id);

-- ============================================
-- 5. MIGRATE EXISTING DATA
-- ============================================

-- Auto-create teams for existing schools
-- This creates one team per school/sport/gender combination
INSERT INTO teams (school_id, sport_id, gender, division, league, season_year, is_active)
SELECT DISTINCT
  s.id as school_id,
  sp.id as sport_id,
  sp.gender,
  s.division, -- Copy current school-level division
  s.league,
  '2025-2026' as season_year,
  true as is_active
FROM schools s
CROSS JOIN sports sp
WHERE sp.active = true
ON CONFLICT (school_id, sport_id, gender, season_year) DO NOTHING;

-- Migrate school_managers to team_managers
-- For now, give them access to all teams at their school
INSERT INTO team_managers (user_id, team_id, role, can_edit_roster, can_edit_schedule, can_submit_scores, can_post_updates, can_manage_coaches, granted_by, granted_at, is_active)
SELECT
  sm.user_id,
  t.id as team_id,
  CASE sm.role
    WHEN 'owner' THEN 'owner'
    WHEN 'manager' THEN 'head_coach'
    ELSE 'assistant'
  END as role,
  sm.can_manage_roster as can_edit_roster,
  sm.can_manage_schedule as can_edit_schedule,
  true as can_submit_scores,
  sm.can_post_updates,
  CASE WHEN sm.role = 'owner' THEN true ELSE false END as can_manage_coaches,
  sm.granted_by,
  sm.granted_at,
  sm.is_active
FROM school_managers sm
JOIN teams t ON t.school_id = sm.school_id
WHERE sm.is_active = true
ON CONFLICT (user_id, team_id) DO NOTHING;

-- Link existing players to teams
-- This is a best-guess migration - admin will need to verify
UPDATE players p
SET team_id = (
  SELECT t.id
  FROM teams t
  WHERE t.school_id = p.school_id
  AND t.sport_id = (
    -- Get most recent sport from player_seasons
    SELECT ps.sport_id
    FROM player_seasons ps
    WHERE ps.player_id = p.id
    ORDER BY ps.season_year DESC
    LIMIT 1
  )
  AND t.season_year = '2025-2026'
  LIMIT 1
)
WHERE p.team_id IS NULL AND p.school_id IS NOT NULL;

-- Create team_rosters entries from player_seasons
INSERT INTO team_rosters (team_id, player_id, jersey_number, position, grade, is_captain, season_year, is_active)
SELECT DISTINCT
  t.id as team_id,
  ps.player_id,
  ps.jersey_number,
  ps.position,
  ps.grade,
  ps.is_captain,
  CAST(ps.season_year AS TEXT) as season_year,
  true as is_active
FROM player_seasons ps
JOIN players p ON p.id = ps.player_id
JOIN teams t ON t.school_id = p.school_id
  AND t.sport_id = ps.sport_id
  AND t.season_year = CAST(ps.season_year AS TEXT)
WHERE p.school_id IS NOT NULL
ON CONFLICT (team_id, player_id, season_year) DO NOTHING;

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- Beta codes - only super admins can manage
ALTER TABLE beta_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins view beta codes" ON beta_codes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Only super admins manage beta codes" ON beta_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Beta access - users can see their own, admins see all
ALTER TABLE beta_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own beta access" ON beta_access
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
  );

CREATE POLICY "Admins manage beta access" ON beta_access
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
  );

-- Teams - public read, admin write
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active teams" ON teams
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage teams" ON teams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
  );

-- Team managers - public read, managers and admins write
ALTER TABLE team_managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team managers" ON team_managers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Team owners can add managers" ON team_managers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_managers tm
      WHERE tm.user_id = auth.uid()
      AND tm.team_id = team_managers.team_id
      AND tm.role = 'owner'
      AND tm.can_manage_coaches = true
      AND tm.is_active = true
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
  );

CREATE POLICY "Team owners can update managers" ON team_managers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_managers tm
      WHERE tm.user_id = auth.uid()
      AND tm.team_id = team_managers.team_id
      AND tm.role = 'owner'
      AND tm.can_manage_coaches = true
      AND tm.is_active = true
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
  );

-- Team rosters - public read, team managers can edit their rosters
ALTER TABLE team_rosters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rosters" ON team_rosters
  FOR SELECT USING (is_active = true);

CREATE POLICY "Team managers can edit rosters" ON team_rosters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_managers tm
      WHERE tm.user_id = auth.uid()
      AND tm.team_id = team_rosters.team_id
      AND tm.can_edit_roster = true
      AND tm.is_active = true
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
  );

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Check if user has beta access
CREATE OR REPLACE FUNCTION has_beta_access(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = p_user_id
    AND (
      has_beta_access = true
      OR is_admin = true
      OR is_super_admin = true
    )
  )
$$;

-- Get teams for a school
CREATE OR REPLACE FUNCTION get_school_teams(p_school_id UUID, p_season_year TEXT DEFAULT '2025-2026')
RETURNS TABLE(
  team_id UUID,
  sport_name TEXT,
  gender TEXT,
  division TEXT,
  player_count BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT
    t.id as team_id,
    s.display_name as sport_name,
    t.gender,
    t.division,
    COUNT(tr.id) as player_count
  FROM teams t
  JOIN sports s ON s.id = t.sport_id
  LEFT JOIN team_rosters tr ON tr.team_id = t.id AND tr.is_active = true AND tr.season_year = p_season_year
  WHERE t.school_id = p_school_id
  AND t.season_year = p_season_year
  AND t.is_active = true
  GROUP BY t.id, s.display_name, t.gender, t.division
  ORDER BY s.display_name, t.gender
$$;

-- Get user's managed teams
CREATE OR REPLACE FUNCTION get_user_managed_teams(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  team_id UUID,
  school_name TEXT,
  sport_name TEXT,
  gender TEXT,
  division TEXT,
  role TEXT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT
    t.id as team_id,
    sc.name as school_name,
    sp.display_name as sport_name,
    t.gender,
    t.division,
    tm.role
  FROM team_managers tm
  JOIN teams t ON t.id = tm.team_id
  JOIN schools sc ON sc.id = t.school_id
  JOIN sports sp ON sp.id = t.sport_id
  WHERE tm.user_id = p_user_id
  AND tm.is_active = true
  AND t.is_active = true
  ORDER BY sc.name, sp.display_name
$$;
