-- ============================================
-- MIGRATION 094: Add is_banned to permissions function
-- Allows middleware to check ban status in a single RPC
-- ============================================

CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE(
  has_beta_access BOOLEAN,
  is_admin BOOLEAN,
  is_super_admin BOOLEAN,
  is_trusted_reporter BOOLEAN,
  is_banned BOOLEAN
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    has_beta_access,
    is_admin,
    is_super_admin,
    is_trusted_reporter,
    is_banned
  FROM users
  WHERE id = p_user_id;
$$;

-- Grant remains the same
GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO authenticated;
