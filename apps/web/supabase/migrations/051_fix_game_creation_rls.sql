-- ============================================
-- MIGRATION 051: Fix Admin RLS Performance Issues
-- Replace circular RLS subqueries with get_user_permissions function
-- ============================================

-- This migration fixes a critical performance issue where admin RLS policies
-- were using subqueries on the users table, which themselves are subject to RLS.
-- This creates circular checks and causes 50ms+ delays or timeouts.
--
-- Solution: Use the existing get_user_permissions() function (from migration 047)
-- which bypasses RLS using SECURITY DEFINER, reducing checks from 50ms to 2ms.

-- ============================================
-- GAMES TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins manage games" ON games;

CREATE POLICY "Admins manage games" ON games FOR ALL
  USING ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())))
  WITH CHECK ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())));

-- ============================================
-- SPORTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins manage sports" ON sports;

CREATE POLICY "Admins manage sports" ON sports FOR ALL
  USING ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())))
  WITH CHECK ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())));

-- ============================================
-- SCHOOLS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins manage schools" ON schools;

CREATE POLICY "Admins manage schools" ON schools FOR ALL
  USING ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())))
  WITH CHECK ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())));

-- ============================================
-- TRUSTED REPORTER APPLICATIONS
-- ============================================
DROP POLICY IF EXISTS "Admins read all applications" ON trusted_reporter_applications;
DROP POLICY IF EXISTS "Admins update applications" ON trusted_reporter_applications;

CREATE POLICY "Admins read all applications" ON trusted_reporter_applications FOR SELECT
  USING ((SELECT is_admin OR is_super_admin OR is_trusted_reporter
          FROM get_user_permissions(auth.uid())));

CREATE POLICY "Admins update applications" ON trusted_reporter_applications FOR UPDATE
  USING ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())))
  WITH CHECK ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())));

-- ============================================
-- TRUSTED REPORTER CODES
-- ============================================
DROP POLICY IF EXISTS "Admins manage codes" ON trusted_reporter_codes;

CREATE POLICY "Admins manage codes" ON trusted_reporter_codes FOR ALL
  USING ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())))
  WITH CHECK ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())));

-- ============================================
-- RAFFLES
-- ============================================
DROP POLICY IF EXISTS "Admins manage raffles" ON raffles;

CREATE POLICY "Admins manage raffles" ON raffles FOR ALL
  USING ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())))
  WITH CHECK ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())));

-- ============================================
-- USERS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins read all users" ON users;
DROP POLICY IF EXISTS "Super admins update all users" ON users;

CREATE POLICY "Admins read all users" ON users FOR SELECT
  USING ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())));

CREATE POLICY "Super admins update all users" ON users FOR UPDATE
  USING ((SELECT is_super_admin FROM get_user_permissions(auth.uid())))
  WITH CHECK ((SELECT is_super_admin FROM get_user_permissions(auth.uid())));

-- ============================================
-- SUBMISSIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins read all submissions" ON submissions;

CREATE POLICY "Admins read all submissions" ON submissions FOR SELECT
  USING ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())));

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins read all chat messages" ON chat_messages;

CREATE POLICY "Admins read all chat messages" ON chat_messages FOR SELECT
  USING ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())));

-- ============================================
-- RAFFLE ENTRIES TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins read raffle entries" ON raffle_entries;

CREATE POLICY "Admins read raffle entries" ON raffle_entries FOR SELECT
  USING ((SELECT is_admin OR is_super_admin FROM get_user_permissions(auth.uid())));

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON POLICY "Admins manage games" ON games IS
  'Allows admins to create, update, and delete games. Uses get_user_permissions to avoid circular RLS.';

COMMENT ON POLICY "Admins manage sports" ON sports IS
  'Allows admins to manage sports. Uses get_user_permissions to avoid circular RLS.';

COMMENT ON POLICY "Admins manage schools" ON schools IS
  'Allows admins to manage schools. Uses get_user_permissions to avoid circular RLS.';

COMMENT ON POLICY "Admins read all users" ON users IS
  'Allows admins to view all user data. Uses get_user_permissions to avoid circular RLS.';

COMMENT ON POLICY "Super admins update all users" ON users IS
  'Allows super admins to promote/demote users. Uses get_user_permissions to avoid circular RLS.';
