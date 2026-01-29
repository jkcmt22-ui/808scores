-- ============================================
-- Migration 078: Allow Admins to Update User Roles
-- ============================================
-- This migration adds an RLS policy to allow admins (not just super admins)
-- to update is_trusted_reporter and has_beta_access fields on users.
-- Super admin changes still require super admin permissions.
-- ============================================

-- Drop conflicting policies if they exist
DROP POLICY IF EXISTS "Admins update trusted reporter status" ON users;
DROP POLICY IF EXISTS "Admins update user roles" ON users;

-- Allow admins to update is_trusted_reporter and has_beta_access
-- Super admins can update all fields (handled by existing policy)
CREATE POLICY "Admins update user roles" ON users FOR UPDATE
  USING (
    -- Must be an admin or super admin
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND (admin_user.is_admin = true OR admin_user.is_super_admin = true)
    )
  )
  WITH CHECK (
    -- Must be an admin or super admin
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND (admin_user.is_admin = true OR admin_user.is_super_admin = true)
    )
  );

-- Add comment
COMMENT ON POLICY "Admins update user roles" ON users IS
  'Allows admins to update user fields like is_trusted_reporter and has_beta_access. Super admin fields require super admin (enforced in application).';
