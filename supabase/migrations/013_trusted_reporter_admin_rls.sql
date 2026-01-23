-- Enable admin access to trusted reporter applications
-- Admins (trusted reporters) can read all applications and update them

-- ============================================
-- DROP EXISTING RESTRICTIVE POLICIES
-- ============================================

-- Keep the user's own read policy but add admin read
DROP POLICY IF EXISTS "Admins read all applications" ON trusted_reporter_applications;
DROP POLICY IF EXISTS "Admins update applications" ON trusted_reporter_applications;

-- ============================================
-- ADD ADMIN READ POLICY
-- ============================================

-- Trusted reporters can read ALL applications (for admin panel)
CREATE POLICY "Admins read all applications" ON trusted_reporter_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_trusted_reporter = true OR users.tier = 'trusted' OR users.tier = 'elite')
    )
  );

-- ============================================
-- ADD ADMIN UPDATE POLICY
-- ============================================

-- Trusted reporters can update applications (approve/reject)
CREATE POLICY "Admins update applications" ON trusted_reporter_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_trusted_reporter = true OR users.tier = 'trusted' OR users.tier = 'elite')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_trusted_reporter = true OR users.tier = 'trusted' OR users.tier = 'elite')
    )
  );

-- ============================================
-- UPDATE USERS TABLE POLICY FOR ADMIN UPDATES
-- ============================================

-- Allow admins to update user's trusted reporter status
DROP POLICY IF EXISTS "Admins update trusted reporter status" ON users;

CREATE POLICY "Admins update trusted reporter status" ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND (admin_user.is_trusted_reporter = true OR admin_user.tier = 'trusted' OR admin_user.tier = 'elite')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND (admin_user.is_trusted_reporter = true OR admin_user.tier = 'trusted' OR admin_user.tier = 'elite')
    )
  );

-- ============================================
-- COMMENT
-- ============================================
COMMENT ON POLICY "Admins read all applications" ON trusted_reporter_applications IS
  'Allows trusted reporters and elite users to view all applications in admin panel';

COMMENT ON POLICY "Admins update applications" ON trusted_reporter_applications IS
  'Allows trusted reporters and elite users to approve/reject applications';

COMMENT ON POLICY "Admins update trusted reporter status" ON users IS
  'Allows trusted reporters to update other users trusted reporter status when approving applications';
