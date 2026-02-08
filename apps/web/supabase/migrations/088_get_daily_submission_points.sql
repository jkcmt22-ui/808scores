-- Migration 088: Create get_daily_submission_points function
-- Bug 96: This RPC was called by submit-score route but never defined,
-- causing the daily 100-point cap to be completely bypassed.

CREATE OR REPLACE FUNCTION get_daily_submission_points(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_total INT;
  v_today_start TIMESTAMPTZ;
BEGIN
  -- Calculate start of today in Hawaii time (UTC-10, no DST)
  -- midnight HST = 10:00 UTC
  v_today_start := date_trunc('day', NOW() AT TIME ZONE 'Pacific/Honolulu') AT TIME ZONE 'Pacific/Honolulu';

  SELECT COALESCE(SUM(points_earned), 0)::INT INTO v_total
  FROM submissions
  WHERE user_id = p_user_id
    AND status IN ('published', 'pending')
    AND created_at >= v_today_start;

  RETURN v_total;
END;
$$;

COMMENT ON FUNCTION get_daily_submission_points IS 'Returns total submission points earned by user today (Hawaii timezone boundaries)';
