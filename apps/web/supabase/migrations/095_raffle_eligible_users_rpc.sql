-- ============================================
-- MIGRATION 095: Server-side raffle entry aggregation
-- Eliminates 1000-row default limit on point_events queries
-- ============================================

CREATE OR REPLACE FUNCTION get_raffle_eligible_users(p_start TIMESTAMPTZ, p_end TIMESTAMPTZ)
RETURNS TABLE(
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  total_points BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pe.user_id,
    u.display_name,
    u.avatar_url,
    SUM(pe.points)::BIGINT AS total_points
  FROM point_events pe
  JOIN users u ON u.id = pe.user_id
  WHERE pe.created_at >= p_start
    AND pe.created_at < p_end
  GROUP BY pe.user_id, u.display_name, u.avatar_url
  HAVING SUM(pe.points) > 0
  ORDER BY total_points DESC;
$$;

GRANT EXECUTE ON FUNCTION get_raffle_eligible_users(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
