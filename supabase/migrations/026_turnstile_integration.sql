-- Migration 026: Cloudflare Turnstile Integration
-- Additional tables and functions for CAPTCHA verification

-- ============================================
-- 1. TURNSTILE CONFIGURATION
-- ============================================

-- Store which actions require Turnstile verification
CREATE TABLE IF NOT EXISTS turnstile_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type TEXT NOT NULL UNIQUE,
  always_required BOOLEAN DEFAULT false, -- Always show turnstile
  trust_threshold INT DEFAULT 50, -- Show if trust score below this
  after_failures INT DEFAULT 3, -- Show after N failures
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default requirements
INSERT INTO turnstile_requirements (action_type, always_required, trust_threshold, after_failures, description) VALUES
  ('signup', true, 100, 0, 'Always require on signup'),
  ('login', false, 40, 3, 'Require after 3 failed logins or low trust'),
  ('raffle_entry', false, 50, 0, 'Require for low trust users'),
  ('password_reset', true, 100, 0, 'Always require on password reset'),
  ('report_abuse', false, 30, 5, 'Require for very low trust or after 5 reports')
ON CONFLICT (action_type) DO NOTHING;

-- ============================================
-- 2. TURNSTILE TOKEN TRACKING
-- ============================================

-- Track used Turnstile tokens to prevent replay attacks
CREATE TABLE IF NOT EXISTS turnstile_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_hash TEXT NOT NULL UNIQUE, -- SHA256 hash of the token
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  action_type TEXT NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes'
);

CREATE INDEX idx_turnstile_tokens_hash ON turnstile_tokens(token_hash);
CREATE INDEX idx_turnstile_tokens_expires ON turnstile_tokens(expires_at);

-- ============================================
-- 3. CHALLENGE SESSION TRACKING
-- ============================================

-- Track challenge sessions (when user needs to complete Turnstile)
CREATE TABLE IF NOT EXISTS challenge_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  action_type TEXT NOT NULL,
  challenge_reason TEXT, -- Why challenge was required
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 5,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 minutes',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_challenge_sessions_token ON challenge_sessions(session_token);
CREATE INDEX idx_challenge_sessions_user ON challenge_sessions(user_id);
CREATE INDEX idx_challenge_sessions_expires ON challenge_sessions(expires_at);

-- ============================================
-- 4. FUNCTIONS
-- ============================================

-- Function to check if Turnstile is required for an action
CREATE OR REPLACE FUNCTION check_turnstile_required(
  p_user_id UUID,
  p_action_type TEXT,
  p_ip_address INET
) RETURNS JSONB AS $$
DECLARE
  v_requirement RECORD;
  v_user RECORD;
  v_recent_failures INT;
  v_requires_challenge BOOLEAN := false;
  v_reason TEXT;
BEGIN
  -- Get requirement config
  SELECT * INTO v_requirement FROM turnstile_requirements
  WHERE action_type = p_action_type AND is_active = true;

  IF v_requirement IS NULL THEN
    RETURN jsonb_build_object('required', false, 'reason', 'no_config');
  END IF;

  -- Always required?
  IF v_requirement.always_required THEN
    RETURN jsonb_build_object('required', true, 'reason', 'always_required');
  END IF;

  -- Get user if logged in
  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_user FROM users WHERE id = p_user_id;

    -- Check trust score
    IF v_user.trust_score < v_requirement.trust_threshold THEN
      v_requires_challenge := true;
      v_reason := 'low_trust_score';
    END IF;

    -- Check recent captcha failures
    SELECT COUNT(*) INTO v_recent_failures FROM captcha_verifications
    WHERE user_id = p_user_id
    AND passed = false
    AND created_at > NOW() - INTERVAL '1 hour';

    IF v_recent_failures >= v_requirement.after_failures THEN
      v_requires_challenge := true;
      v_reason := COALESCE(v_reason, 'recent_failures');
    END IF;
  END IF;

  -- Check IP risk
  IF EXISTS (SELECT 1 FROM ip_tracking WHERE ip_address = p_ip_address AND (is_vpn = true OR risk_score > 70)) THEN
    v_requires_challenge := true;
    v_reason := COALESCE(v_reason, 'suspicious_ip');
  END IF;

  RETURN jsonb_build_object(
    'required', v_requires_challenge,
    'reason', COALESCE(v_reason, 'not_required')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a challenge session
CREATE OR REPLACE FUNCTION create_challenge_session(
  p_user_id UUID,
  p_ip_address INET,
  p_action_type TEXT,
  p_reason TEXT
) RETURNS TEXT AS $$
DECLARE
  v_session_token TEXT;
BEGIN
  -- Generate random session token
  v_session_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO challenge_sessions (session_token, user_id, ip_address, action_type, challenge_reason)
  VALUES (v_session_token, p_user_id, p_ip_address, p_action_type, p_reason);

  RETURN v_session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify Turnstile token
-- Note: Actual verification happens in the API, this records the result
CREATE OR REPLACE FUNCTION record_turnstile_verification(
  p_token_hash TEXT,
  p_user_id UUID,
  p_ip_address INET,
  p_action_type TEXT,
  p_passed BOOLEAN,
  p_score DECIMAL(3,2) DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_already_used BOOLEAN;
BEGIN
  -- Check if token was already used (replay attack)
  SELECT EXISTS(SELECT 1 FROM turnstile_tokens WHERE token_hash = p_token_hash) INTO v_already_used;

  IF v_already_used THEN
    -- Log replay attempt
    INSERT INTO suspicious_activity_log (user_id, ip_address, activity_type, severity, details)
    VALUES (p_user_id, p_ip_address, 'turnstile_replay', 'high',
            jsonb_build_object('action_type', p_action_type));
    RETURN false;
  END IF;

  -- Record the token
  INSERT INTO turnstile_tokens (token_hash, user_id, ip_address, action_type)
  VALUES (p_token_hash, p_user_id, p_ip_address, p_action_type);

  -- Record verification result
  INSERT INTO captcha_verifications (user_id, ip_address, captcha_provider, challenge_token, action_type, passed, score)
  VALUES (p_user_id, p_ip_address, 'turnstile', p_token_hash, p_action_type, p_passed, p_score);

  -- Update user captcha stats
  IF p_user_id IS NOT NULL THEN
    IF p_passed THEN
      UPDATE users SET last_captcha_at = NOW() WHERE id = p_user_id;
    ELSE
      UPDATE users SET captcha_failures = captcha_failures + 1 WHERE id = p_user_id;
    END IF;
  END IF;

  RETURN p_passed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. CLEANUP
-- ============================================

-- Extend cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_security_data() RETURNS VOID AS $$
BEGIN
  -- Delete expired Turnstile tokens
  DELETE FROM turnstile_tokens WHERE expires_at < NOW();

  -- Delete expired challenge sessions
  DELETE FROM challenge_sessions WHERE expires_at < NOW();

  -- Delete old rate limit records
  DELETE FROM action_rate_limits WHERE window_start < NOW() - INTERVAL '24 hours';

  -- Delete old captcha verifications (keep 30 days)
  DELETE FROM captcha_verifications WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. SCHEDULED CLEANUP (Create a cron job or Edge Function to call this)
-- ============================================

-- Note: You'll want to set up a scheduled job to run cleanup_old_security_data()
-- This can be done with pg_cron or a Supabase Edge Function

COMMENT ON FUNCTION cleanup_old_security_data() IS
'Call this function periodically (hourly) to clean up expired security data.
Set up a cron job or Supabase Edge Function to run: SELECT cleanup_old_security_data();';
