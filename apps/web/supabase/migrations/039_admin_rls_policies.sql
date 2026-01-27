-- Migration 039: Add RLS policies for admin access
-- This allows admins and super admins to read data needed for the admin panel

-- ============================================
-- USERS TABLE - Admin read access
-- ============================================

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins read all users" ON users;

-- Allow admins and super admins to read all user data
CREATE POLICY "Admins read all users" ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND (admin_user.is_admin = true OR admin_user.is_super_admin = true)
    )
  );

-- ============================================
-- GAMES TABLE - Admin write access
-- ============================================

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins manage games" ON games;

-- Allow admins to create, update, delete games
CREATE POLICY "Admins manage games" ON games FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- ============================================
-- SPORTS TABLE - Admin write access
-- ============================================

DROP POLICY IF EXISTS "Admins manage sports" ON sports;

CREATE POLICY "Admins manage sports" ON sports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- ============================================
-- SCHOOLS TABLE - Admin write access
-- ============================================

DROP POLICY IF EXISTS "Admins manage schools" ON schools;

CREATE POLICY "Admins manage schools" ON schools FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- ============================================
-- TRUSTED REPORTER APPLICATIONS - Update for admins
-- ============================================

-- Drop and recreate to use is_admin instead of just is_trusted_reporter
DROP POLICY IF EXISTS "Admins read all applications" ON trusted_reporter_applications;
DROP POLICY IF EXISTS "Admins update applications" ON trusted_reporter_applications;

CREATE POLICY "Admins read all applications" ON trusted_reporter_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true OR users.is_trusted_reporter = true)
    )
  );

CREATE POLICY "Admins update applications" ON trusted_reporter_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- ============================================
-- TRUSTED REPORTER CODES - Admin access
-- ============================================

DROP POLICY IF EXISTS "Admins manage codes" ON trusted_reporter_codes;

CREATE POLICY "Admins manage codes" ON trusted_reporter_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- ============================================
-- SUBMISSIONS TABLE - Admin read access
-- ============================================

DROP POLICY IF EXISTS "Admins read all submissions" ON submissions;

CREATE POLICY "Admins read all submissions" ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- ============================================
-- CHAT MESSAGES TABLE - Admin read access for counts
-- ============================================

DROP POLICY IF EXISTS "Admins read all chat messages" ON chat_messages;

CREATE POLICY "Admins read all chat messages" ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- ============================================
-- RAFFLES TABLE - Admin access
-- ============================================

DROP POLICY IF EXISTS "Admins manage raffles" ON raffles;

CREATE POLICY "Admins manage raffles" ON raffles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- ============================================
-- RAFFLE ENTRIES TABLE - Admin read access
-- ============================================

DROP POLICY IF EXISTS "Admins read raffle entries" ON raffle_entries;

CREATE POLICY "Admins read raffle entries" ON raffle_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- ============================================
-- SUPER ADMIN - Full user management
-- ============================================

-- Allow super admins to update any user (for promoting/demoting admins)
DROP POLICY IF EXISTS "Super admins update all users" ON users;

CREATE POLICY "Super admins update all users" ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.is_super_admin = true
    )
  );

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Admins read all users" ON users IS
  'Allows admins and super admins to view all user data in admin panel';

COMMENT ON POLICY "Admins manage games" ON games IS
  'Allows admins to create, update, and delete games';

COMMENT ON POLICY "Super admins update all users" ON users IS
  'Allows super admins to promote/demote other users';
