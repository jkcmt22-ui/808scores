-- ============================================
-- MIGRATION 047: Middleware Auth Function
-- Bypass RLS for user's own permission check
-- ============================================

CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE(
  has_beta_access BOOLEAN,
  is_admin BOOLEAN,
  is_super_admin BOOLEAN,
  is_trusted_reporter BOOLEAN
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
    is_trusted_reporter
  FROM users
  WHERE id = p_user_id;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO authenticated;

-- Comment explaining purpose
COMMENT ON FUNCTION get_user_permissions IS
  'Bypasses RLS for self-queries in middleware. SECURITY DEFINER allows users to query their own permissions without RLS overhead.';
