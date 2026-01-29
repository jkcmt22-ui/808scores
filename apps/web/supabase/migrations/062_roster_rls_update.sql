-- ============================================
-- Migration 062: Roster RLS Policy Update
-- ============================================
-- This migration enhances RLS policies for team_rosters
-- to support the updated roster management system:
-- 1. Admins can manage all players and team_rosters
-- 2. Team managers can edit their team's rosters
-- 3. Public read access to team_rosters
-- ============================================

-- ============================================
-- 1. DROP EXISTING POLICIES (if they exist)
-- ============================================
-- Note: Migration 042 already created some policies,
-- so we need to drop them first to avoid conflicts

DROP POLICY IF EXISTS "Anyone can view active rosters" ON team_rosters;
DROP POLICY IF EXISTS "Team managers can edit rosters" ON team_rosters;
DROP POLICY IF EXISTS "Admins manage team_rosters" ON team_rosters;
DROP POLICY IF EXISTS "Team managers edit rosters" ON team_rosters;
DROP POLICY IF EXISTS "Public read team_rosters" ON team_rosters;

-- ============================================
-- 2. PUBLIC READ ACCESS
-- ============================================
-- Anyone can view active roster entries

CREATE POLICY "Public read team_rosters"
ON team_rosters
FOR SELECT
USING (is_active = true);

-- ============================================
-- 3. ADMIN FULL ACCESS
-- ============================================
-- Admins and super admins can manage all team_rosters

CREATE POLICY "Admins manage team_rosters"
ON team_rosters
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (is_admin = true OR is_super_admin = true)
  )
);

-- ============================================
-- 4. TEAM MANAGER ROSTER EDITING
-- ============================================
-- Team managers with can_edit_roster = true can edit their team's roster

CREATE POLICY "Team managers edit rosters"
ON team_rosters
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM team_managers tm
    WHERE tm.user_id = auth.uid()
    AND tm.team_id = team_rosters.team_id
    AND tm.can_edit_roster = true
    AND tm.is_active = true
  )
);

-- ============================================
-- 5. PLAYERS TABLE POLICIES
-- ============================================
-- Ensure players table has proper policies as well

DROP POLICY IF EXISTS "Anyone can view active players" ON players;
DROP POLICY IF EXISTS "Admins manage players" ON players;
DROP POLICY IF EXISTS "Team managers edit players" ON players;

-- Public read access to active players
CREATE POLICY "Anyone can view active players"
ON players
FOR SELECT
USING (is_active = true);

-- Admins can manage all players
CREATE POLICY "Admins manage players"
ON players
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (is_admin = true OR is_super_admin = true)
  )
);

-- Team managers can edit players at their school
-- (through their team's school connection)
CREATE POLICY "Team managers edit players"
ON players
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM team_managers tm
    JOIN teams t ON t.id = tm.team_id
    WHERE tm.user_id = auth.uid()
    AND t.school_id = players.school_id
    AND tm.can_edit_roster = true
    AND tm.is_active = true
  )
);

-- ============================================
-- 6. TEAMS TABLE POLICIES (if needed)
-- ============================================
-- Allow team managers to create teams for their school

DROP POLICY IF EXISTS "Team managers can create teams" ON teams;

CREATE POLICY "Team managers can create teams"
ON teams
FOR INSERT
WITH CHECK (
  -- Admins can create any team
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (is_admin = true OR is_super_admin = true)
  )
  OR
  -- Team managers can create teams for schools they manage
  EXISTS (
    SELECT 1 FROM team_managers tm
    JOIN teams t ON t.id = tm.team_id
    WHERE tm.user_id = auth.uid()
    AND t.school_id = teams.school_id
    AND tm.is_active = true
  )
);
