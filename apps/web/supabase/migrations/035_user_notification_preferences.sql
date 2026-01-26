-- Migration 035: Add user notification and marketing preferences
-- Allows users to opt out of notifications and opt in to marketing emails

-- Add notification preferences to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS regular_season_notifications BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT false;

-- Add comments
COMMENT ON COLUMN users.notifications_enabled IS 'Global opt-out for all push notifications';
COMMENT ON COLUMN users.regular_season_notifications IS 'Whether to receive notifications for regular season games (not just playoffs)';
COMMENT ON COLUMN users.marketing_opt_in IS 'Whether user has opted in to receive promotional emails and newsletters';

-- Create index for notification queries
CREATE INDEX IF NOT EXISTS idx_users_notifications_enabled ON users(notifications_enabled) WHERE notifications_enabled = true;
