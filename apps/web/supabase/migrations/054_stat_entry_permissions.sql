-- Migration 054: Stat Entry Permissions
-- Adds RLS policies for trusted reporters, school managers, and team managers
-- to manage player_game_stats for their respective schools

-- ============================================
-- NEW POLICIES FOR player_game_stats
-- ============================================

-- Existing policies:
-- 1. "Public can view player stats" - SELECT, USING (true)
-- 2. "Admins can manage player stats" - ALL, admins/super_admins

-- Add: Trusted reporters can manage all stats
CREATE POLICY "Trusted reporters can manage stats"
  ON player_game_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.is_trusted_reporter = true OR u.tier IN ('trusted', 'elite'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.is_trusted_reporter = true OR u.tier IN ('trusted', 'elite'))
    )
  );

-- Add: School managers can manage stats for their school's players
CREATE POLICY "School managers can manage their school stats"
  ON player_game_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM school_managers sm
      WHERE sm.user_id = auth.uid()
      AND sm.school_id = player_game_stats.school_id
      AND sm.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_managers sm
      WHERE sm.user_id = auth.uid()
      AND sm.school_id = player_game_stats.school_id
      AND sm.is_active = true
    )
  );

-- Add: Team managers with can_submit_scores can manage stats for their team's school
CREATE POLICY "Team managers can manage their team stats"
  ON player_game_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_managers tm
      JOIN teams t ON t.id = tm.team_id
      WHERE tm.user_id = auth.uid()
      AND tm.can_submit_scores = true
      AND tm.is_active = true
      AND t.school_id = player_game_stats.school_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_managers tm
      JOIN teams t ON t.id = tm.team_id
      WHERE tm.user_id = auth.uid()
      AND tm.can_submit_scores = true
      AND tm.is_active = true
      AND t.school_id = player_game_stats.school_id
    )
  );

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Trusted reporters can manage stats" ON player_game_stats IS
  'Allows trusted reporters (is_trusted_reporter=true or tier in trusted/elite) to manage all player stats';

COMMENT ON POLICY "School managers can manage their school stats" ON player_game_stats IS
  'Allows active school managers to manage stats for players belonging to their school';

COMMENT ON POLICY "Team managers can manage their team stats" ON player_game_stats IS
  'Allows team managers with can_submit_scores permission to manage stats for players at their team''s school';
