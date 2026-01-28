-- ============================================
-- Performance Optimization Testing Script
-- Run these queries after deploying migrations
-- ============================================

-- TEST 1: Verify middleware auth function exists and works
-- Expected: Returns your user permissions in <5ms
SELECT * FROM get_user_permissions(auth.uid());

-- TEST 2: Verify admin users materialized view
-- Expected: Returns filtered users in <5ms, uses index scan
EXPLAIN ANALYZE SELECT * FROM admin_users_list LIMIT 100;

-- Count check
SELECT COUNT(*) as admin_user_count FROM admin_users_list;

-- TEST 3: Verify indexes were created
-- Expected: Shows all new indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE indexname LIKE 'idx_%'
  AND tablename IN ('submissions', 'chat_messages', 'users', 'schools', 'games', 'raffles')
ORDER BY tablename, indexname;

-- TEST 4: Test analytics function (ADMIN ONLY)
-- Expected: Returns JSON with all metrics in 300-500ms
-- NOTE: This will fail if you're not an admin
SELECT get_admin_analytics();

-- TEST 5: Verify materialized view auto-refresh trigger
-- Expected: Shows triggers exist
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE 'refresh_admin_users%'
ORDER BY trigger_name;

-- TEST 6: Performance comparison for admin users query
-- Old way (slow):
EXPLAIN ANALYZE
SELECT id, display_name, email, phone, is_super_admin, is_admin, is_trusted_reporter, has_beta_access, tier, created_at
FROM users
WHERE is_admin = true
   OR is_super_admin = true
   OR is_trusted_reporter = true
   OR has_beta_access = true
ORDER BY created_at DESC
LIMIT 100;

-- New way (fast):
EXPLAIN ANALYZE
SELECT * FROM admin_users_list LIMIT 100;

-- Compare execution times above ^

-- TEST 7: Sample analytics data structure
-- This shows what the function returns
SELECT jsonb_pretty(get_admin_analytics()::jsonb);

-- ============================================
-- Expected Results Summary
-- ============================================

/*
TEST 1: Should return row with has_beta_access, is_admin, is_super_admin, is_trusted_reporter
TEST 2: Execution Time should be <5ms with "Index Scan"
TEST 3: Should show ~7 new indexes
TEST 4: Should return large JSON object with users, games, submissions, etc.
TEST 5: Should show 2 triggers (on update and insert)
TEST 6: Old query ~500ms with "Seq Scan", New query <5ms with "Index Scan"
TEST 7: Should show pretty-printed JSON structure

If any test fails, check the deployment guide for rollback instructions.
*/

-- ============================================
-- Security Test (Optional)
-- ============================================

-- Verify non-admin users cannot call analytics
-- (Run this as a non-admin user to verify access denied)
-- Expected: ERROR: Access denied: Admin privileges required
-- SELECT get_admin_analytics();

-- ============================================
-- Manual Refresh (if needed)
-- ============================================

-- If the materialized view needs manual refresh:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY admin_users_list;
