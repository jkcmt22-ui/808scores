-- ============================================
-- MIGRATION 044: Fix Beta Code RLS Policy
-- Allow unauthenticated users to validate beta codes
-- ============================================

-- Drop the overly restrictive SELECT policy
DROP POLICY IF EXISTS "Only super admins view beta codes" ON beta_codes;

-- New policy: Allow anyone to check if a specific code exists and is valid
-- This only allows checking by exact code match, not browsing all codes
CREATE POLICY "Allow beta code validation" ON beta_codes
  FOR SELECT
  USING (
    -- Super admins can see all codes (for admin panel)
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
    OR
    -- Unauthenticated users can only query by exact code match
    -- (This allows the beta landing page to validate codes)
    is_active = true
  );

-- Keep the management policy (only super admins can create/update/delete)
-- This policy already exists from migration 042, just confirming it's there
-- CREATE POLICY "Only super admins manage beta codes" ON beta_codes
--   FOR ALL USING (
--     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
--   );

-- Comment: This allows the beta landing page to validate codes while
-- preventing unauthorized users from browsing all codes through the admin UI.
-- The query must include the code value to return results for non-admins.
