-- Migration: Add general terms acceptance fields to users table
-- This tracks whether users have accepted the Terms of Service and Privacy Policy

-- Add terms acceptance columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '2026-01';

-- For existing users, set accepted_terms to true since they already agreed
-- (the old flow said "By continuing, you agree to our Terms")
UPDATE users SET accepted_terms = TRUE, terms_accepted_at = created_at WHERE accepted_terms IS NULL OR accepted_terms = FALSE;

-- Create index for querying users who haven't accepted
CREATE INDEX IF NOT EXISTS idx_users_accepted_terms ON users(accepted_terms) WHERE accepted_terms = FALSE;

-- Add comment for documentation
COMMENT ON COLUMN users.accepted_terms IS 'Whether user has explicitly accepted Terms of Service and Privacy Policy';
COMMENT ON COLUMN users.terms_accepted_at IS 'Timestamp when terms were accepted';
COMMENT ON COLUMN users.terms_version IS 'Version of terms accepted (format: YYYY-MM)';
