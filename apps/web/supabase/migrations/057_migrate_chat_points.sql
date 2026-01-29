-- Migration 057: Migrate Chat Points to Ledger
-- Updates award_chat_points function to also create point_events entries

-- ============================================
-- UPDATE AWARD_CHAT_POINTS FUNCTION
-- ============================================

-- Replace the existing function to also insert into point_events
CREATE OR REPLACE FUNCTION award_chat_points(
  p_user_id UUID,
  p_action_type TEXT,
  p_source_id UUID DEFAULT NULL
) RETURNS INT AS $$
DECLARE
  v_points INT;
  v_daily_cap INT;
  v_today_total INT;
  v_actual_points INT;
  v_event_type TEXT;
BEGIN
  -- Determine points and daily cap based on action type
  CASE p_action_type
    WHEN 'comment' THEN
      v_points := 1;
      v_daily_cap := 10;
      v_event_type := 'chat_comment';
    WHEN 'like_received' THEN
      v_points := 2;
      v_daily_cap := 20;
      v_event_type := 'chat_like_received';
    WHEN 'mention_received' THEN
      v_points := 1;
      v_daily_cap := 5;
      v_event_type := 'chat_mention_received';
    ELSE
      RETURN 0;
  END CASE;

  -- Get today's total for this action type
  SELECT COALESCE(SUM(points_earned), 0) INTO v_today_total
  FROM chat_point_logs
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';

  -- Calculate actual points to award (respecting daily cap)
  v_actual_points := LEAST(v_points, v_daily_cap - v_today_total);

  IF v_actual_points <= 0 THEN
    RETURN 0;
  END IF;

  -- Log the points in chat_point_logs (existing behavior)
  INSERT INTO chat_point_logs (user_id, action_type, points_earned, source_id)
  VALUES (p_user_id, p_action_type, v_actual_points, p_source_id);

  -- Also create entry in point_events ledger for audit trail
  INSERT INTO point_events (user_id, event_type, points, source_type, source_id, metadata)
  VALUES (
    p_user_id,
    v_event_type,
    v_actual_points,
    'chat_message',
    p_source_id,
    jsonb_build_object(
      'action_type', p_action_type,
      'daily_cap', v_daily_cap,
      'today_total_before', v_today_total
    )
  );

  -- Update user's points
  UPDATE users
  SET total_points = total_points + v_actual_points,
      season_points = season_points + v_actual_points
  WHERE id = p_user_id;

  RETURN v_actual_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION award_chat_points IS 'Awards points for chat engagement actions with daily caps. Creates entries in both chat_point_logs and point_events for audit trail.';
