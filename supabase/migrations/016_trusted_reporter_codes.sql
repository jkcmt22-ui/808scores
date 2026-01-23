-- Migration: Trusted Reporter Codes
-- Allows admins to generate invite codes for trusted reporters

-- Trusted reporter codes table
CREATE TABLE IF NOT EXISTS trusted_reporter_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  redeemed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  max_uses INT DEFAULT 1,
  use_count INT DEFAULT 0,
  note TEXT, -- Admin can add a note like "For Coach Smith"
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trusted_reporter_codes_code ON trusted_reporter_codes(code);
CREATE INDEX IF NOT EXISTS idx_trusted_reporter_codes_active ON trusted_reporter_codes(active) WHERE active = true;

-- Enable RLS
ALTER TABLE trusted_reporter_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can check if a code exists (for redemption)
CREATE POLICY "Anyone can validate codes"
  ON trusted_reporter_codes FOR SELECT
  USING (true);

-- Only admins can create codes
CREATE POLICY "Admins can create codes"
  ON trusted_reporter_codes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_trusted_reporter = true OR users.tier = 'trusted' OR users.tier = 'elite')
    )
  );

-- Only admins can update codes (deactivate, etc.)
CREATE POLICY "Admins can update codes"
  ON trusted_reporter_codes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_trusted_reporter = true OR users.tier = 'trusted' OR users.tier = 'elite')
    )
  );

-- Authenticated users can redeem codes (update use_count and redeemed_by)
-- This is handled via a function to ensure atomic operations
CREATE OR REPLACE FUNCTION redeem_trusted_reporter_code(code_input VARCHAR)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_record trusted_reporter_codes%ROWTYPE;
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check if user is already a trusted reporter
  IF EXISTS (SELECT 1 FROM users WHERE id = v_user_id AND is_trusted_reporter = true) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are already a trusted reporter');
  END IF;

  -- Find and lock the code
  SELECT * INTO v_code_record
  FROM trusted_reporter_codes
  WHERE code = UPPER(code_input)
    AND active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR use_count < max_uses)
  FOR UPDATE;

  IF v_code_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired code');
  END IF;

  -- Update the code
  UPDATE trusted_reporter_codes
  SET use_count = use_count + 1,
      redeemed_by = COALESCE(redeemed_by, v_user_id),
      redeemed_at = COALESCE(redeemed_at, NOW()),
      active = CASE WHEN max_uses IS NOT NULL AND use_count + 1 >= max_uses THEN false ELSE active END
  WHERE id = v_code_record.id;

  -- Update the user to be a trusted reporter
  UPDATE users
  SET is_trusted_reporter = true,
      tier = 'trusted',
      trusted_reporter_approved_at = NOW()
  WHERE id = v_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'You are now a trusted reporter!');
END;
$$;
