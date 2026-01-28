-- ============================================
-- MIGRATION 048: Admin Users Materialized View
-- Pre-compute the OR filter for fast queries
-- ============================================

-- Drop if exists (for re-running migration)
DROP MATERIALIZED VIEW IF EXISTS admin_users_list CASCADE;

-- Create materialized view with pre-filtered users
CREATE MATERIALIZED VIEW admin_users_list AS
SELECT
  id,
  display_name,
  email,
  phone,
  is_super_admin,
  is_admin,
  is_trusted_reporter,
  has_beta_access,
  tier,
  created_at
FROM users
WHERE is_admin = true
   OR is_super_admin = true
   OR is_trusted_reporter = true
   OR has_beta_access = true
ORDER BY created_at DESC;

-- Add unique index for fast lookups
CREATE UNIQUE INDEX idx_admin_users_list_id ON admin_users_list(id);

-- Add index for ordering
CREATE INDEX idx_admin_users_list_created ON admin_users_list(created_at DESC);

-- Refresh function (call when users table changes)
CREATE OR REPLACE FUNCTION refresh_admin_users_list()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_users_list;
  RETURN NULL;
END;
$$;

-- Trigger to auto-refresh when users change their admin status
CREATE TRIGGER refresh_admin_users_on_update
AFTER UPDATE OF is_admin, is_super_admin, is_trusted_reporter, has_beta_access ON users
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_admin_users_list();

-- Trigger to refresh on new users
CREATE TRIGGER refresh_admin_users_on_insert
AFTER INSERT ON users
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_admin_users_list();

-- Grant access
GRANT SELECT ON admin_users_list TO authenticated;

-- Initial refresh
REFRESH MATERIALIZED VIEW admin_users_list;
