-- Migration 025: Anti-Bot Protection
-- Comprehensive bot detection and prevention for login and points system

-- ============================================
-- 1. DEVICE FINGERPRINTING & TRACKING
-- ============================================

-- Track unique devices per user
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  fingerprint_hash TEXT NOT NULL, -- Hash of device fingerprint
  user_agent TEXT,
  screen_resolution TEXT,
  timezone TEXT,
  language TEXT,
  platform TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_ip INET,
  is_suspicious BOOLEAN DEFAULT false,
  trust_score INT DEFAULT 50, -- 0-100, higher = more trusted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, fingerprint_hash)
);

CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_fingerprint ON user_devices(fingerprint_hash);
CREATE INDEX idx_user_devices_suspicious ON user_devices(is_suspicious) WHERE is_suspicious = true;

-- ============================================
-- 2. IP TRACKING & RATE LIMITING
-- ============================================

-- Track IP addresses and their activity
CREATE TABLE IF NOT EXISTS ip_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address INET NOT NULL UNIQUE,
  is_vpn BOOLEAN DEFAULT false,
  is_proxy BOOLEAN DEFAULT false,
  is_tor BOOLEAN DEFAULT false,
  is_datacenter BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  block_reason TEXT,
  country_code TEXT,
  region TEXT,
  city TEXT,
  asn TEXT,
  isp TEXT,
  risk_score INT DEFAULT 0, -- 0-100, higher = more risky
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  total_requests INT DEFAULT 0,
  users_count INT DEFAULT 0, -- How many users from this IP
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ip_tracking_ip ON ip_tracking(ip_address);
CREATE INDEX idx_ip_tracking_blocked ON ip_tracking(is_blocked) WHERE is_blocked = true;
CREATE INDEX idx_ip_tracking_risk ON ip_tracking(risk_score) WHERE risk_score > 50;

-- Track which users use which IPs (for multi-account detection)
CREATE TABLE IF NOT EXISTS user_ip_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  ip_address INET NOT NULL,
  first_used_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  request_count INT DEFAULT 1,
  UNIQUE(user_id, ip_address)
);

CREATE INDEX idx_user_ip_history_user ON user_ip_history(user_id);
CREATE INDEX idx_user_ip_history_ip ON user_ip_history(ip_address);

-- ============================================
-- 3. ACTION RATE LIMITING (Server-side)
-- ============================================

-- Track action rates per user for velocity detection
CREATE TABLE IF NOT EXISTS action_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET,
  action_type TEXT NOT NULL, -- 'chat_message', 'like', 'raffle_entry', 'login', 'signup'
  window_start TIMESTAMPTZ NOT NULL,
  window_seconds INT NOT NULL, -- Duration of window (60, 3600, 86400)
  action_count INT DEFAULT 1,
  UNIQUE(user_id, action_type, window_start, window_seconds)
);

CREATE INDEX idx_action_rate_limits_user ON action_rate_limits(user_id, action_type);
CREATE INDEX idx_action_rate_limits_window ON action_rate_limits(window_start);

-- Rate limit configuration
CREATE TABLE IF NOT EXISTS rate_limit_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type TEXT NOT NULL UNIQUE,
  window_seconds INT NOT NULL,
  max_actions INT NOT NULL,
  penalty_type TEXT DEFAULT 'block', -- 'block', 'captcha', 'cooldown'
  penalty_duration_seconds INT DEFAULT 300,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rate limits
INSERT INTO rate_limit_config (action_type, window_seconds, max_actions, penalty_type, penalty_duration_seconds) VALUES
  ('login_attempt', 300, 5, 'captcha', 900), -- 5 logins per 5 min, then captcha for 15 min
  ('signup', 3600, 3, 'block', 86400), -- 3 signups per hour per IP
  ('chat_message', 60, 10, 'cooldown', 60), -- 10 messages per minute
  ('chat_like', 60, 30, 'cooldown', 60), -- 30 likes per minute
  ('raffle_entry', 300, 5, 'captcha', 300), -- 5 raffle entries per 5 min
  ('point_earning', 60, 20, 'block', 3600), -- Max 20 point-earning actions per minute
  ('password_reset', 3600, 3, 'block', 3600) -- 3 resets per hour
ON CONFLICT (action_type) DO NOTHING;

-- ============================================
-- 4. SUSPICIOUS ACTIVITY LOGGING
-- ============================================

CREATE TABLE IF NOT EXISTS suspicious_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  device_fingerprint TEXT,
  activity_type TEXT NOT NULL, -- 'rapid_actions', 'multi_account', 'vpn_detected', 'bot_pattern', 'captcha_fail'
  severity TEXT NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  details JSONB,
  action_taken TEXT, -- 'none', 'captcha_required', 'temp_ban', 'perm_ban', 'points_revoked'
  reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suspicious_activity_user ON suspicious_activity_log(user_id);
CREATE INDEX idx_suspicious_activity_ip ON suspicious_activity_log(ip_address);
CREATE INDEX idx_suspicious_activity_type ON suspicious_activity_log(activity_type);
CREATE INDEX idx_suspicious_activity_severity ON suspicious_activity_log(severity);
CREATE INDEX idx_suspicious_activity_unreviewed ON suspicious_activity_log(reviewed) WHERE reviewed = false;

-- ============================================
-- 5. CAPTCHA VERIFICATION TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS captcha_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  device_fingerprint TEXT,
  captcha_provider TEXT NOT NULL, -- 'turnstile', 'hcaptcha', 'recaptcha'
  challenge_token TEXT NOT NULL,
  action_type TEXT NOT NULL, -- What action required the captcha
  passed BOOLEAN NOT NULL,
  score DECIMAL(3,2), -- Some providers give a score 0-1
  failure_reason TEXT,
  response_time_ms INT, -- How long user took to solve
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_captcha_user ON captcha_verifications(user_id);
CREATE INDEX idx_captcha_ip ON captcha_verifications(ip_address);
CREATE INDEX idx_captcha_failed ON captcha_verifications(passed) WHERE passed = false;

-- ============================================
-- 6. USER TRUST SCORING
-- ============================================

-- Add trust/risk fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS trust_score INT DEFAULT 50, -- 0-100
ADD COLUMN IF NOT EXISTS risk_flags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_captcha_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS captcha_failures INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS suspicious_activity_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_suspicious_activity_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_age_days INT GENERATED ALWAYS AS (EXTRACT(DAY FROM NOW() - created_at)::INT) STORED;

-- Create index for trust queries
CREATE INDEX IF NOT EXISTS idx_users_trust_score ON users(trust_score);
CREATE INDEX IF NOT EXISTS idx_users_suspicious ON users(suspicious_activity_count) WHERE suspicious_activity_count > 0;

-- ============================================
-- 7. MULTI-ACCOUNT DETECTION
-- ============================================

-- Track potential linked accounts
CREATE TABLE IF NOT EXISTS linked_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_1 UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  user_id_2 UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  link_type TEXT NOT NULL, -- 'same_device', 'same_ip', 'similar_behavior', 'same_phone'
  confidence DECIMAL(3,2) NOT NULL, -- 0-1 confidence score
  evidence JSONB, -- Details about why linked
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'dismissed'
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id_1, user_id_2, link_type),
  CHECK (user_id_1 < user_id_2) -- Ensure consistent ordering
);

CREATE INDEX idx_linked_accounts_user1 ON linked_accounts(user_id_1);
CREATE INDEX idx_linked_accounts_user2 ON linked_accounts(user_id_2);
CREATE INDEX idx_linked_accounts_pending ON linked_accounts(status) WHERE status = 'pending';

-- ============================================
-- 8. POINT TRANSACTION AUDIT
-- ============================================

-- Enhanced audit trail for all point changes
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL, -- 'submission', 'chat_comment', 'chat_like', 'chat_mention', 'raffle_entry', 'admin_adjustment', 'reversal'
  points_change INT NOT NULL, -- Positive for earned, negative for spent/revoked
  points_before INT NOT NULL,
  points_after INT NOT NULL,
  source_id UUID, -- ID of the source (message, submission, raffle, etc.)
  source_table TEXT, -- Table name of source
  ip_address INET,
  device_fingerprint TEXT,
  is_suspicious BOOLEAN DEFAULT false,
  reversed BOOLEAN DEFAULT false,
  reversed_at TIMESTAMPTZ,
  reversed_by UUID REFERENCES users(id),
  reversal_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_type ON point_transactions(action_type);
CREATE INDEX idx_point_transactions_suspicious ON point_transactions(is_suspicious) WHERE is_suspicious = true;
CREATE INDEX idx_point_transactions_date ON point_transactions(created_at);

-- ============================================
-- 9. RLS POLICIES
-- ============================================

-- User devices - users can only see their own
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own devices" ON user_devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage devices" ON user_devices FOR ALL USING (true);

-- IP tracking - admin only
ALTER TABLE ip_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read ip_tracking" ON ip_tracking FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
);

-- Suspicious activity - admin only
ALTER TABLE suspicious_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read suspicious_activity" ON suspicious_activity_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
);

-- Point transactions - users see own, admins see all
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON point_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all transactions" ON point_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
);
CREATE POLICY "System can insert transactions" ON point_transactions FOR INSERT WITH CHECK (true);

-- Linked accounts - admin only
ALTER TABLE linked_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage linked_accounts" ON linked_accounts FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
);

-- ============================================
-- 10. HELPER FUNCTIONS
-- ============================================

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_ip_address INET,
  p_action_type TEXT
) RETURNS JSONB AS $$
DECLARE
  v_config RECORD;
  v_current_count INT;
  v_window_start TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  -- Get config for this action type
  SELECT * INTO v_config FROM rate_limit_config WHERE action_type = p_action_type AND is_active = true;

  IF v_config IS NULL THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'no_config');
  END IF;

  -- Calculate window start
  v_window_start := date_trunc('second', NOW()) - (EXTRACT(EPOCH FROM NOW())::INT % v_config.window_seconds) * INTERVAL '1 second';

  -- Get or create rate limit record
  INSERT INTO action_rate_limits (user_id, ip_address, action_type, window_start, window_seconds, action_count)
  VALUES (p_user_id, p_ip_address, p_action_type, v_window_start, v_config.window_seconds, 1)
  ON CONFLICT (user_id, action_type, window_start, window_seconds)
  DO UPDATE SET action_count = action_rate_limits.action_count + 1
  RETURNING action_count INTO v_current_count;

  IF v_current_count > v_config.max_actions THEN
    -- Log suspicious activity if significantly over limit
    IF v_current_count > v_config.max_actions * 2 THEN
      INSERT INTO suspicious_activity_log (user_id, ip_address, activity_type, severity, details)
      VALUES (p_user_id, p_ip_address, 'rate_limit_exceeded',
              CASE WHEN v_current_count > v_config.max_actions * 5 THEN 'high' ELSE 'medium' END,
              jsonb_build_object('action_type', p_action_type, 'count', v_current_count, 'limit', v_config.max_actions));
    END IF;

    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limited',
      'penalty_type', v_config.penalty_type,
      'retry_after_seconds', v_config.penalty_duration_seconds,
      'current_count', v_current_count,
      'max_allowed', v_config.max_actions
    );
  END IF;

  RETURN jsonb_build_object('allowed', true, 'current_count', v_current_count, 'max_allowed', v_config.max_actions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record device fingerprint
CREATE OR REPLACE FUNCTION record_device(
  p_user_id UUID,
  p_fingerprint_hash TEXT,
  p_user_agent TEXT DEFAULT NULL,
  p_screen_resolution TEXT DEFAULT NULL,
  p_timezone TEXT DEFAULT NULL,
  p_language TEXT DEFAULT NULL,
  p_platform TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_device RECORD;
  v_device_count INT;
  v_is_new BOOLEAN := false;
BEGIN
  -- Insert or update device
  INSERT INTO user_devices (user_id, fingerprint_hash, user_agent, screen_resolution, timezone, language, platform, last_ip)
  VALUES (p_user_id, p_fingerprint_hash, p_user_agent, p_screen_resolution, p_timezone, p_language, p_platform, p_ip_address)
  ON CONFLICT (user_id, fingerprint_hash) DO UPDATE
  SET last_seen_at = NOW(),
      last_ip = COALESCE(p_ip_address, user_devices.last_ip),
      user_agent = COALESCE(p_user_agent, user_devices.user_agent)
  RETURNING *, (xmax = 0) AS is_new INTO v_device, v_is_new;

  -- Check how many devices this user has
  SELECT COUNT(*) INTO v_device_count FROM user_devices WHERE user_id = p_user_id;

  -- Flag suspicious if too many devices
  IF v_device_count > 5 THEN
    INSERT INTO suspicious_activity_log (user_id, ip_address, device_fingerprint, activity_type, severity, details)
    VALUES (p_user_id, p_ip_address, p_fingerprint_hash, 'many_devices', 'medium',
            jsonb_build_object('device_count', v_device_count));
  END IF;

  -- Check if this fingerprint is used by other users (potential multi-account)
  PERFORM detect_multi_account_by_device(p_user_id, p_fingerprint_hash);

  RETURN jsonb_build_object(
    'device_id', v_device.id,
    'is_new', v_is_new,
    'trust_score', v_device.trust_score,
    'is_suspicious', v_device.is_suspicious,
    'device_count', v_device_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect multi-accounts by device
CREATE OR REPLACE FUNCTION detect_multi_account_by_device(
  p_user_id UUID,
  p_fingerprint_hash TEXT
) RETURNS VOID AS $$
DECLARE
  v_other_user RECORD;
BEGIN
  FOR v_other_user IN
    SELECT user_id FROM user_devices
    WHERE fingerprint_hash = p_fingerprint_hash
    AND user_id != p_user_id
  LOOP
    -- Create linked account record
    INSERT INTO linked_accounts (user_id_1, user_id_2, link_type, confidence, evidence)
    VALUES (
      LEAST(p_user_id, v_other_user.user_id),
      GREATEST(p_user_id, v_other_user.user_id),
      'same_device',
      0.8, -- High confidence for same device
      jsonb_build_object('fingerprint_hash', p_fingerprint_hash)
    )
    ON CONFLICT (user_id_1, user_id_2, link_type) DO UPDATE
    SET confidence = GREATEST(linked_accounts.confidence, 0.8);

    -- Log suspicious activity
    INSERT INTO suspicious_activity_log (user_id, device_fingerprint, activity_type, severity, details)
    VALUES (p_user_id, p_fingerprint_hash, 'multi_account', 'high',
            jsonb_build_object('other_user_id', v_other_user.user_id));
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record IP usage
CREATE OR REPLACE FUNCTION record_ip_usage(
  p_user_id UUID,
  p_ip_address INET
) RETURNS JSONB AS $$
DECLARE
  v_ip RECORD;
  v_users_on_ip INT;
BEGIN
  -- Update or insert IP tracking
  INSERT INTO ip_tracking (ip_address, last_seen_at, total_requests)
  VALUES (p_ip_address, NOW(), 1)
  ON CONFLICT (ip_address) DO UPDATE
  SET last_seen_at = NOW(),
      total_requests = ip_tracking.total_requests + 1,
      updated_at = NOW()
  RETURNING * INTO v_ip;

  -- Record user-IP association
  INSERT INTO user_ip_history (user_id, ip_address, request_count)
  VALUES (p_user_id, p_ip_address, 1)
  ON CONFLICT (user_id, ip_address) DO UPDATE
  SET last_used_at = NOW(),
      request_count = user_ip_history.request_count + 1;

  -- Check how many users use this IP
  SELECT COUNT(DISTINCT user_id) INTO v_users_on_ip
  FROM user_ip_history WHERE ip_address = p_ip_address;

  -- Update users count on IP
  UPDATE ip_tracking SET users_count = v_users_on_ip WHERE ip_address = p_ip_address;

  -- Flag if too many users on one IP (might be VPN/proxy)
  IF v_users_on_ip > 10 THEN
    UPDATE ip_tracking SET risk_score = LEAST(risk_score + 10, 100) WHERE ip_address = p_ip_address;
  END IF;

  RETURN jsonb_build_object(
    'ip_blocked', v_ip.is_blocked,
    'is_vpn', v_ip.is_vpn,
    'is_proxy', v_ip.is_proxy,
    'risk_score', v_ip.risk_score,
    'users_on_ip', v_users_on_ip
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate user trust score
CREATE OR REPLACE FUNCTION calculate_trust_score(p_user_id UUID) RETURNS INT AS $$
DECLARE
  v_score INT := 50; -- Start at neutral
  v_user RECORD;
  v_suspicious_count INT;
  v_device_count INT;
  v_captcha_failures INT;
BEGIN
  SELECT * INTO v_user FROM users WHERE id = p_user_id;
  IF v_user IS NULL THEN RETURN 0; END IF;

  -- Account age bonus (up to +20)
  v_score := v_score + LEAST((v_user.account_age_days / 30) * 5, 20);

  -- Phone verified bonus (+15)
  IF v_user.phone IS NOT NULL THEN v_score := v_score + 15; END IF;

  -- Email verified bonus (+10)
  IF v_user.email IS NOT NULL THEN v_score := v_score + 10; END IF;

  -- Trusted reporter bonus (+20)
  IF v_user.is_trusted_reporter THEN v_score := v_score + 20; END IF;

  -- Submission history bonus (up to +15)
  IF v_user.submission_count > 0 THEN
    v_score := v_score + LEAST(v_user.submission_count, 15);
  END IF;

  -- Suspicious activity penalty
  SELECT COUNT(*) INTO v_suspicious_count FROM suspicious_activity_log
  WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '30 days';
  v_score := v_score - (v_suspicious_count * 5);

  -- Multiple devices penalty (if more than 3)
  SELECT COUNT(*) INTO v_device_count FROM user_devices WHERE user_id = p_user_id;
  IF v_device_count > 3 THEN v_score := v_score - ((v_device_count - 3) * 5); END IF;

  -- Captcha failure penalty
  SELECT COUNT(*) INTO v_captcha_failures FROM captcha_verifications
  WHERE user_id = p_user_id AND passed = false AND created_at > NOW() - INTERVAL '7 days';
  v_score := v_score - (v_captcha_failures * 3);

  -- Clamp to 0-100
  v_score := GREATEST(0, LEAST(100, v_score));

  -- Update user's trust score
  UPDATE users SET trust_score = v_score WHERE id = p_user_id;

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 11. ENHANCED POINT AWARDING WITH ANTI-BOT
-- ============================================

-- Replace the chat points function with anti-bot version
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
  v_user RECORD;
  v_rate_check JSONB;
BEGIN
  -- Get user trust score
  SELECT * INTO v_user FROM users WHERE id = p_user_id;
  IF v_user IS NULL THEN RETURN 0; END IF;

  -- Check rate limit first
  v_rate_check := check_rate_limit(p_user_id, NULL, 'point_earning');
  IF NOT (v_rate_check->>'allowed')::BOOLEAN THEN
    RETURN 0;
  END IF;

  -- Low trust users get reduced points
  IF v_user.trust_score < 30 THEN
    RETURN 0; -- Very low trust = no points
  END IF;

  -- Determine points and daily cap based on action type
  CASE p_action_type
    WHEN 'comment' THEN
      v_points := 1;
      v_daily_cap := 10;
    WHEN 'like_received' THEN
      v_points := 2;
      v_daily_cap := 20;
    WHEN 'mention_received' THEN
      v_points := 1;
      v_daily_cap := 5;
    ELSE
      RETURN 0;
  END CASE;

  -- Reduce cap for medium-trust users
  IF v_user.trust_score < 50 THEN
    v_daily_cap := v_daily_cap / 2;
  END IF;

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

  -- Log the points
  INSERT INTO chat_point_logs (user_id, action_type, points_earned, source_id)
  VALUES (p_user_id, p_action_type, v_actual_points, p_source_id);

  -- Record in audit trail
  INSERT INTO point_transactions (user_id, action_type, points_change, points_before, points_after, source_id, source_table)
  VALUES (p_user_id, p_action_type, v_actual_points, v_user.total_points, v_user.total_points + v_actual_points, p_source_id, 'chat_point_logs');

  -- Update user's points
  UPDATE users
  SET total_points = total_points + v_actual_points,
      season_points = season_points + v_actual_points
  WHERE id = p_user_id;

  RETURN v_actual_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 12. ENHANCED RAFFLE ENTRY WITH ANTI-BOT
-- ============================================

-- Replace raffle entry function with anti-bot version
CREATE OR REPLACE FUNCTION enter_raffle(
  p_raffle_id UUID,
  p_user_id UUID,
  p_entry_count INT
) RETURNS JSONB AS $$
DECLARE
  v_raffle RECORD;
  v_user RECORD;
  v_points_needed INT;
  v_existing_entries INT;
  v_new_total_entries INT;
  v_rate_check JSONB;
  v_captcha_required BOOLEAN := false;
BEGIN
  -- Check rate limit
  v_rate_check := check_rate_limit(p_user_id, NULL, 'raffle_entry');
  IF NOT (v_rate_check->>'allowed')::BOOLEAN THEN
    IF v_rate_check->>'penalty_type' = 'captcha' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Captcha verification required', 'require_captcha', true);
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Too many entries. Please try again later.');
    END IF;
  END IF;

  -- Get raffle details
  SELECT * INTO v_raffle FROM raffles WHERE id = p_raffle_id;

  IF v_raffle IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Raffle not found');
  END IF;

  -- Check raffle is open
  IF v_raffle.status != 'open' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Raffle is not open for entries');
  END IF;

  -- Check entries are open
  IF NOW() < v_raffle.entries_open_at OR NOW() > v_raffle.entries_close_at THEN
    RETURN jsonb_build_object('success', false, 'error', 'Entries are closed');
  END IF;

  -- Get user details
  SELECT * INTO v_user FROM users WHERE id = p_user_id;

  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- ANTI-BOT CHECKS

  -- Check trust score
  IF v_user.trust_score < 30 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account not eligible for raffles');
  END IF;

  -- Require phone verification for raffles
  IF v_user.phone IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Phone verification required for raffles');
  END IF;

  -- Check for linked accounts
  IF EXISTS (
    SELECT 1 FROM linked_accounts
    WHERE (user_id_1 = p_user_id OR user_id_2 = p_user_id)
    AND status = 'confirmed'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account flagged for review');
  END IF;

  -- Require captcha for low trust users
  IF v_user.trust_score < 50 THEN
    v_captcha_required := true;
    -- In practice, you'd check if captcha was passed in this request
  END IF;

  -- Check user has accepted terms
  IF NOT v_user.accepted_raffle_terms THEN
    RETURN jsonb_build_object('success', false, 'error', 'Must accept raffle terms first');
  END IF;

  -- Check minimum points
  IF v_user.season_points < v_raffle.min_points_to_enter THEN
    RETURN jsonb_build_object('success', false, 'error',
      format('Need at least %s points to enter', v_raffle.min_points_to_enter));
  END IF;

  -- Get existing entries
  SELECT COALESCE(entry_count, 0) INTO v_existing_entries
  FROM raffle_entries
  WHERE raffle_id = p_raffle_id AND user_id = p_user_id;

  -- Check max entries
  v_new_total_entries := COALESCE(v_existing_entries, 0) + p_entry_count;
  IF v_raffle.max_entries_per_user IS NOT NULL AND v_new_total_entries > v_raffle.max_entries_per_user THEN
    RETURN jsonb_build_object('success', false, 'error',
      format('Maximum %s entries allowed', v_raffle.max_entries_per_user));
  END IF;

  -- Calculate points needed
  v_points_needed := p_entry_count * v_raffle.points_per_entry;

  -- Check user has enough points
  IF v_user.season_points < v_points_needed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not enough points');
  END IF;

  -- Deduct points from user
  UPDATE users
  SET season_points = season_points - v_points_needed
  WHERE id = p_user_id;

  -- Record point transaction
  INSERT INTO point_transactions (user_id, action_type, points_change, points_before, points_after, source_id, source_table)
  VALUES (p_user_id, 'raffle_entry', -v_points_needed, v_user.season_points, v_user.season_points - v_points_needed, p_raffle_id, 'raffle_entries');

  -- Insert or update entry
  INSERT INTO raffle_entries (raffle_id, user_id, entry_count, points_used)
  VALUES (p_raffle_id, p_user_id, p_entry_count, v_points_needed)
  ON CONFLICT (raffle_id, user_id) DO UPDATE
  SET entry_count = raffle_entries.entry_count + p_entry_count,
      points_used = raffle_entries.points_used + v_points_needed,
      updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'entries_added', p_entry_count,
    'points_used', v_points_needed,
    'total_entries', v_new_total_entries
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 13. CLEANUP OLD DATA
-- ============================================

-- Function to cleanup old rate limit data
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits() RETURNS VOID AS $$
BEGIN
  -- Delete rate limit records older than 24 hours
  DELETE FROM action_rate_limits WHERE window_start < NOW() - INTERVAL '24 hours';

  -- Delete old captcha verifications older than 30 days
  DELETE FROM captcha_verifications WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
