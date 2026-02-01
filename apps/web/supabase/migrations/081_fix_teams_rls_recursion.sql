-- ============================================
-- Migration 081: Fix teams RLS infinite recursion
-- ============================================
-- The "Team managers can create teams" policy in migration 062 causes
-- infinite recursion because it joins back to the teams table.
--
-- Fix: Simplify the policy to only allow admins to create teams.
-- Team managers creating teams is an edge case we can handle differently.
-- ============================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Team managers can create teams" ON teams;

-- Create a simple, non-recursive policy for team creation
-- Only admins can create teams (this is the primary use case)
CREATE POLICY "Admins can create teams"
ON teams
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (is_admin = true OR is_super_admin = true)
  )
);

-- Also ensure the "Admins manage teams" policy works for all operations
-- Drop and recreate to ensure it has proper WITH CHECK for INSERT
DROP POLICY IF EXISTS "Admins manage teams" ON teams;

CREATE POLICY "Admins manage teams"
ON teams
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (is_admin = true OR is_super_admin = true)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (is_admin = true OR is_super_admin = true)
  )
);

-- Keep the read policy for everyone
-- (Already exists from migration 042, but ensure it's there)
DROP POLICY IF EXISTS "Anyone can view active teams" ON teams;

CREATE POLICY "Anyone can view active teams"
ON teams
FOR SELECT
USING (is_active = true);
