-- ============================================
-- MIGRATION 046: Users Admin Query Index
-- Optimize the admin panel user management query
-- ============================================

-- Create a partial index for users with any admin/beta/trusted status
-- This query: WHERE is_admin = true OR is_super_admin = true OR is_trusted_reporter = true OR has_beta_access = true
CREATE INDEX IF NOT EXISTS idx_users_privileged
  ON users(created_at DESC)
  WHERE is_admin = true
     OR is_super_admin = true
     OR is_trusted_reporter = true
     OR has_beta_access = true;

-- Comment: This partial index only includes users with special privileges,
-- making the admin panel "Manage Users" query much faster. It indexes by
-- created_at DESC to support the ORDER BY clause in the query.
