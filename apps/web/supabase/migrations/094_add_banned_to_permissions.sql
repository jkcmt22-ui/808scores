-- ============================================
-- MIGRATION 094: Add is_user_banned() function
-- Separate function because get_user_permissions() signature
-- can't be altered (RLS policies depend on it)
-- ============================================

CREATE OR REPLACE FUNCTION is_user_banned(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_banned, false)
  FROM users
  WHERE id = p_user_id;
$$;

GRANT EXECUTE ON FUNCTION is_user_banned(UUID) TO authenticated;
