-- ============================================
-- MIGRATION 045: Beta Code Redemption Function
-- Create secure function for users to redeem beta codes
-- ============================================

-- Function to redeem a beta code for the current user
CREATE OR REPLACE FUNCTION redeem_beta_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_code_record RECORD;
  v_result JSON;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Check if user already has beta access
  IF EXISTS (
    SELECT 1 FROM users
    WHERE id = v_user_id
    AND has_beta_access = true
  ) THEN
    RETURN json_build_object(
      'success', true,
      'message', 'You already have beta access'
    );
  END IF;

  -- Find and validate the beta code
  SELECT * INTO v_code_record
  FROM beta_codes
  WHERE code = UPPER(TRIM(p_code))
  AND is_active = true
  FOR UPDATE; -- Lock the row to prevent race conditions

  -- Check if code exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid beta code'
    );
  END IF;

  -- Check if code is expired
  IF v_code_record.expires_at IS NOT NULL
     AND v_code_record.expires_at < NOW() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Beta code has expired'
    );
  END IF;

  -- Check if code has uses remaining
  IF v_code_record.max_uses != -1
     AND v_code_record.use_count >= v_code_record.max_uses THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Beta code has reached maximum uses'
    );
  END IF;

  -- Grant beta access
  INSERT INTO beta_access (user_id, beta_code_id, granted_at)
  VALUES (v_user_id, v_code_record.id, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  -- Update user record
  UPDATE users
  SET has_beta_access = true,
      beta_granted_at = NOW()
  WHERE id = v_user_id;

  -- Increment code use count
  UPDATE beta_codes
  SET use_count = use_count + 1
  WHERE id = v_code_record.id;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Beta access granted successfully!'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'An error occurred while redeeming the code'
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION redeem_beta_code(TEXT) TO authenticated;

-- Comment: This function runs with SECURITY DEFINER, which means it bypasses
-- RLS policies and runs with the privileges of the function owner (postgres).
-- This allows authenticated users to redeem beta codes without needing admin
-- permissions, while still maintaining security through the function's logic.
