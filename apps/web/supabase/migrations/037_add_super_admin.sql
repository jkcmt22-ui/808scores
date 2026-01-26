-- Migration 037: Add super admins for application owners
-- This grants full administrative access to the application owners

-- Make jetsutsu@gmail.com a super admin
UPDATE users
SET is_super_admin = true,
    is_admin = true,
    is_trusted_reporter = true,
    trust_score = 100
WHERE email = 'jetsutsu@gmail.com';

-- Make chanel.tsutsuse@gmail.com a super admin
UPDATE users
SET is_super_admin = true,
    is_admin = true,
    is_trusted_reporter = true,
    trust_score = 100
WHERE email = 'chanel.tsutsuse@gmail.com';

-- Log the admin changes for audit trail
INSERT INTO suspicious_activity_log (user_id, activity_type, severity, details, action_taken, reviewed, reviewed_at)
SELECT
  id,
  'admin_promotion',
  'low',
  jsonb_build_object(
    'reason', 'Application owner setup',
    'promoted_to', 'super_admin',
    'migration', '037_add_super_admin.sql'
  ),
  'none',
  true,
  NOW()
FROM users
WHERE email IN ('jetsutsu@gmail.com', 'chanel.tsutsuse@gmail.com');
