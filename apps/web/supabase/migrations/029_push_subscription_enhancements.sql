-- Migration 029: Push Subscription Enhancements
-- Adds platform and device_type columns to support Expo (mobile) push notifications
-- Also makes p256dh and auth nullable for Expo subscriptions

-- Add platform column to distinguish between web and mobile
ALTER TABLE push_subscriptions
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';

-- Add device_type column for mobile devices (ios, android)
ALTER TABLE push_subscriptions
ADD COLUMN IF NOT EXISTS device_type TEXT;

-- Make p256dh nullable (not used for Expo push)
ALTER TABLE push_subscriptions
ALTER COLUMN p256dh DROP NOT NULL;

-- Make auth nullable (not used for Expo push)
ALTER TABLE push_subscriptions
ALTER COLUMN auth DROP NOT NULL;

-- Add index for platform filtering
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_platform
ON push_subscriptions(platform);

-- Comment on new columns
COMMENT ON COLUMN push_subscriptions.platform IS 'Push platform: web (Web Push) or expo (Expo push for mobile)';
COMMENT ON COLUMN push_subscriptions.device_type IS 'Device type for mobile: ios or android';
