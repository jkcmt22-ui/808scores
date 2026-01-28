-- ============================================
-- MIGRATION 050: Analytics Aggregation Function
-- Consolidate 50+ queries into 1 function call
-- ============================================

CREATE OR REPLACE FUNCTION get_admin_analytics()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  daily_stats JSON;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (is_admin = true OR is_super_admin = true)
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Main analytics in one query
  SELECT json_build_object(
    -- User metrics
    'users', json_build_object(
      'total', (SELECT COUNT(*) FROM users),
      'last_7_days', (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days'),
      'last_30_days', (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days'),
      'trusted', (SELECT COUNT(*) FROM users WHERE is_trusted_reporter = true),
      'admins', (SELECT COUNT(*) FROM users WHERE is_admin = true OR is_super_admin = true),
      'beta_access', (SELECT COUNT(*) FROM users WHERE has_beta_access = true)
    ),

    -- Game metrics
    'games', json_build_object(
      'total', (SELECT COUNT(*) FROM games),
      'this_week', (SELECT COUNT(*) FROM games WHERE scheduled_at >= NOW() - INTERVAL '7 days'),
      'today', (SELECT COUNT(*) FROM games WHERE scheduled_at >= CURRENT_DATE AND scheduled_at < CURRENT_DATE + INTERVAL '1 day'),
      'live', (SELECT COUNT(*) FROM games WHERE status = 'in_progress'),
      'completed', (SELECT COUNT(*) FROM games WHERE status = 'final'),
      'by_status', json_build_object(
        'scheduled', (SELECT COUNT(*) FROM games WHERE status = 'scheduled'),
        'in_progress', (SELECT COUNT(*) FROM games WHERE status = 'in_progress'),
        'final', (SELECT COUNT(*) FROM games WHERE status = 'final'),
        'postponed', (SELECT COUNT(*) FROM games WHERE status = 'postponed'),
        'canceled', (SELECT COUNT(*) FROM games WHERE status = 'canceled')
      )
    ),

    -- Submission metrics
    'submissions', json_build_object(
      'total', (SELECT COUNT(*) FROM submissions),
      'this_week', (SELECT COUNT(*) FROM submissions WHERE created_at >= NOW() - INTERVAL '7 days'),
      'pending', (SELECT COUNT(*) FROM submissions WHERE status = 'pending'),
      'verified', (SELECT COUNT(*) FROM submissions WHERE status = 'published'),
      'by_type', json_build_object(
        'score', (SELECT COUNT(*) FROM submissions WHERE submission_type = 'score'),
        'update', (SELECT COUNT(*) FROM submissions WHERE submission_type = 'update'),
        'media', (SELECT COUNT(*) FROM submissions WHERE submission_type = 'media')
      )
    ),

    -- Chat metrics
    'chat', json_build_object(
      'total', (SELECT COUNT(*) FROM chat_messages),
      'this_week', (SELECT COUNT(*) FROM chat_messages WHERE created_at >= NOW() - INTERVAL '7 days'),
      'today', (SELECT COUNT(*) FROM chat_messages WHERE created_at >= CURRENT_DATE)
    ),

    -- Raffle metrics
    'raffles', json_build_object(
      'active', (SELECT COUNT(*) FROM raffles WHERE status = 'open'),
      'total_entries', (SELECT COUNT(*) FROM raffle_entries),
      'this_week_entries', (SELECT COUNT(*) FROM raffle_entries WHERE created_at >= NOW() - INTERVAL '7 days')
    ),

    -- Top contributors (aggregated)
    'top_contributors', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT id, display_name, submission_count, verified_count, reputation_score
        FROM users
        WHERE submission_count > 0
        ORDER BY submission_count DESC
        LIMIT 10
      ) t
    ),

    -- Recent submissions (aggregated)
    'recent_submissions', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          s.id,
          s.created_at,
          s.submission_type,
          s.status,
          json_build_object('display_name', u.display_name, 'id', u.id) as user,
          CASE
            WHEN s.game_id IS NOT NULL THEN
              json_build_object(
                'id', g.id,
                'home_team', json_build_object('short_name', ht.short_name, 'id', ht.id),
                'away_team', json_build_object('short_name', at.short_name, 'id', at.id)
              )
            ELSE NULL
          END as game
        FROM submissions s
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN games g ON s.game_id = g.id
        LEFT JOIN schools ht ON g.home_team_id = ht.id
        LEFT JOIN schools at ON g.away_team_id = at.id
        ORDER BY s.created_at DESC
        LIMIT 20
      ) t
    )
  ) INTO result;

  -- Daily stats for last 7 days (simplified)
  WITH daily_counts AS (
    SELECT
      date_trunc('day', created_at)::date as date,
      COUNT(*) FILTER (WHERE source_table = 'users') as new_users,
      COUNT(*) FILTER (WHERE source_table = 'games') as new_games,
      COUNT(*) FILTER (WHERE source_table = 'submissions') as new_submissions,
      COUNT(*) FILTER (WHERE source_table = 'chat_messages') as new_messages
    FROM (
      SELECT created_at, 'users' as source_table FROM users WHERE created_at >= NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT created_at, 'games' as source_table FROM games WHERE created_at >= NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT created_at, 'submissions' as source_table FROM submissions WHERE created_at >= NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT created_at, 'chat_messages' as source_table FROM chat_messages WHERE created_at >= NOW() - INTERVAL '7 days'
    ) combined
    GROUP BY date
    ORDER BY date DESC
  )
  SELECT json_agg(row_to_json(daily_counts)) INTO daily_stats FROM daily_counts;

  -- Combine results
  result := result || json_build_object('daily_stats', daily_stats);

  RETURN result;
END;
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION get_admin_analytics() TO authenticated;

-- Comment
COMMENT ON FUNCTION get_admin_analytics IS
  'Aggregates analytics data for admin dashboard. Only accessible by admins/super admins.';
