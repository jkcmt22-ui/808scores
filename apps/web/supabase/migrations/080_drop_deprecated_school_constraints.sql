-- ============================================
-- Migration 080: Drop NOT NULL constraints on deprecated school columns
-- ============================================
-- After migration 072, the old school reference columns were renamed to
-- home_school_id_deprecated and away_school_id_deprecated but kept their
-- NOT NULL constraints. This prevents inserting new games since we now
-- only provide team IDs.
-- ============================================

-- Drop NOT NULL constraints on deprecated columns
ALTER TABLE games ALTER COLUMN home_school_id_deprecated DROP NOT NULL;
ALTER TABLE games ALTER COLUMN away_school_id_deprecated DROP NOT NULL;

-- Update comments to clarify these are fully deprecated
COMMENT ON COLUMN games.home_school_id_deprecated IS
  'DEPRECATED: Legacy school reference. No longer used for new games. Will be removed in future migration.';
COMMENT ON COLUMN games.away_school_id_deprecated IS
  'DEPRECATED: Legacy school reference. No longer used for new games. Will be removed in future migration.';
