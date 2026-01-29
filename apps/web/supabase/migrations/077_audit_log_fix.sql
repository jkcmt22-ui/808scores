-- ============================================
-- Migration 077: Fix Audit Log RLS and Add Triggers
-- ============================================
-- This migration:
-- 1. Fixes the broken RLS policy on audit_log (was USING (false))
-- 2. Adds triggers to automatically log sensitive admin operations
-- 3. Enables admin visibility into audit trail
-- ============================================

-- Fix the broken RLS policy
-- The original policy used USING (false) which blocked ALL access
DROP POLICY IF EXISTS "Admin read audit" ON audit_log;

-- Allow admins to read audit logs
CREATE POLICY "Admin read audit" ON audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
);

-- Allow system to insert audit logs (via triggers with SECURITY DEFINER)
DROP POLICY IF EXISTS "System insert audit" ON audit_log;
CREATE POLICY "System insert audit" ON audit_log FOR INSERT WITH CHECK (true);

-- ============================================
-- Audit Logging Function
-- ============================================

CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, action_type, entity_type, entity_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Triggers for Sensitive Operations
-- ============================================

-- Audit user role changes (admin, super_admin, trusted_reporter)
DROP TRIGGER IF EXISTS audit_users_role_changes ON users;
CREATE TRIGGER audit_users_role_changes
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (
    OLD.is_admin IS DISTINCT FROM NEW.is_admin
    OR OLD.is_super_admin IS DISTINCT FROM NEW.is_super_admin
    OR OLD.is_trusted_reporter IS DISTINCT FROM NEW.is_trusted_reporter
    OR OLD.has_beta_access IS DISTINCT FROM NEW.has_beta_access
  )
  EXECUTE FUNCTION log_admin_action();

-- Audit game score changes (when game becomes final)
DROP TRIGGER IF EXISTS audit_game_score_changes ON games;
CREATE TRIGGER audit_game_score_changes
  AFTER UPDATE ON games
  FOR EACH ROW
  WHEN (
    OLD.status IS DISTINCT FROM NEW.status
    OR (NEW.status = 'final' AND (OLD.home_score IS DISTINCT FROM NEW.home_score OR OLD.away_score IS DISTINCT FROM NEW.away_score))
  )
  EXECUTE FUNCTION log_admin_action();

-- Audit season changes
DROP TRIGGER IF EXISTS audit_seasons_changes ON seasons;
CREATE TRIGGER audit_seasons_changes
  AFTER INSERT OR UPDATE OR DELETE ON seasons
  FOR EACH ROW
  EXECUTE FUNCTION log_admin_action();

-- ============================================
-- Helper View for Audit Log with User Info
-- ============================================

CREATE OR REPLACE VIEW audit_log_with_user AS
SELECT
  al.*,
  u.display_name AS actor_name,
  u.email AS actor_email
FROM audit_log al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC;

-- Grant access to the view (RLS on base table still applies)
GRANT SELECT ON audit_log_with_user TO authenticated;

-- Add comments
COMMENT ON FUNCTION log_admin_action IS 'Automatically logs admin actions to audit_log table. Used by triggers on sensitive tables.';
COMMENT ON VIEW audit_log_with_user IS 'Audit log with actor user information for admin display.';
