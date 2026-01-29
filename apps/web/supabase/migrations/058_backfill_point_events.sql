-- Migration 058: Backfill Historical Point Events
-- Migrates existing submissions and chat_point_logs to the point_events ledger
-- This provides a historical audit trail for existing data

-- ============================================
-- BACKFILL FROM SUBMISSIONS
-- ============================================

-- Insert point events from submissions that awarded points
INSERT INTO point_events (user_id, event_type, points, source_type, source_id, metadata, created_at)
SELECT
  s.user_id,
  'submission' AS event_type,
  s.points_earned AS points,
  'submission' AS source_type,
  s.id AS source_id,
  jsonb_build_object(
    'submission_type', s.submission_type,
    'game_id', s.game_id,
    'status', s.status,
    'backfilled', true
  ) AS metadata,
  s.created_at
FROM submissions s
WHERE s.points_earned > 0
  AND NOT EXISTS (
    -- Avoid duplicates if migration is run multiple times
    SELECT 1 FROM point_events pe
    WHERE pe.source_type = 'submission'
      AND pe.source_id = s.id
  )
ORDER BY s.created_at;

-- ============================================
-- BACKFILL FROM CHAT_POINT_LOGS
-- ============================================

-- Insert point events from chat engagement points
INSERT INTO point_events (user_id, event_type, points, source_type, source_id, metadata, created_at)
SELECT
  cpl.user_id,
  CASE cpl.action_type
    WHEN 'comment' THEN 'chat_comment'
    WHEN 'like_received' THEN 'chat_like_received'
    WHEN 'mention_received' THEN 'chat_mention_received'
    ELSE 'chat_comment'
  END AS event_type,
  cpl.points_earned AS points,
  'chat_message' AS source_type,
  cpl.source_id,
  jsonb_build_object(
    'action_type', cpl.action_type,
    'backfilled', true
  ) AS metadata,
  cpl.created_at
FROM chat_point_logs cpl
WHERE cpl.points_earned > 0
  AND NOT EXISTS (
    -- Avoid duplicates if migration is run multiple times
    SELECT 1 FROM point_events pe
    WHERE pe.source_type = 'chat_message'
      AND pe.source_id = cpl.source_id
      AND pe.user_id = cpl.user_id
      AND pe.event_type = CASE cpl.action_type
        WHEN 'comment' THEN 'chat_comment'
        WHEN 'like_received' THEN 'chat_like_received'
        WHEN 'mention_received' THEN 'chat_mention_received'
        ELSE 'chat_comment'
      END
  )
ORDER BY cpl.created_at;

-- ============================================
-- BACKFILL FROM RAFFLE ENTRIES (Point Deductions)
-- ============================================

-- Insert point events from raffle entries (negative points used)
INSERT INTO point_events (user_id, event_type, points, source_type, source_id, metadata, created_at)
SELECT
  re.user_id,
  'raffle_deduction' AS event_type,
  -re.points_used AS points,  -- Negative because points were spent
  'raffle' AS source_type,
  re.raffle_id AS source_id,
  jsonb_build_object(
    'entry_count', re.entry_count,
    'backfilled', true
  ) AS metadata,
  re.created_at
FROM raffle_entries re
WHERE re.points_used > 0
  AND NOT EXISTS (
    -- Avoid duplicates if migration is run multiple times
    SELECT 1 FROM point_events pe
    WHERE pe.source_type = 'raffle'
      AND pe.source_id = re.raffle_id
      AND pe.user_id = re.user_id
      AND pe.event_type = 'raffle_deduction'
  )
ORDER BY re.created_at;

-- ============================================
-- VERIFICATION REPORT
-- ============================================

-- Create a view to help verify the migration
CREATE OR REPLACE VIEW point_events_backfill_summary AS
SELECT
  event_type,
  source_type,
  COUNT(*) as total_events,
  SUM(points) as total_points,
  MIN(created_at) as earliest,
  MAX(created_at) as latest
FROM point_events
WHERE metadata->>'backfilled' = 'true'
GROUP BY event_type, source_type
ORDER BY event_type, source_type;

COMMENT ON VIEW point_events_backfill_summary IS 'Summary of backfilled point events for verification';
