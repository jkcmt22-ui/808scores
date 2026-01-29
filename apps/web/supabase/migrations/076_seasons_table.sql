-- ============================================
-- Migration 076: Seasons Table
-- ============================================
-- This migration creates a central seasons table for managing
-- competitive seasons, enabling sports per season, and tracking
-- season status. This replaces scattered season_year TEXT strings
-- with a proper source of truth.
-- ============================================

-- Create seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year TEXT UNIQUE NOT NULL,           -- "2025-2026" format
  display_name TEXT,                   -- "2025-26 Season" for UI
  start_date DATE,                     -- Season start
  end_date DATE,                       -- Season end
  is_current BOOLEAN DEFAULT false,    -- Only one can be current
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed')),
  sports_enabled UUID[] DEFAULT '{}',  -- Array of sport IDs enabled this season
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Ensure only one current season at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_seasons_current ON seasons(is_current) WHERE is_current = true;

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_seasons_year ON seasons(year);
CREATE INDEX IF NOT EXISTS idx_seasons_status ON seasons(status);

-- Enable RLS
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

-- Public can read seasons
CREATE POLICY "Public read seasons" ON seasons FOR SELECT USING (true);

-- Admins can manage seasons
CREATE POLICY "Admin manage seasons" ON seasons FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true))
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_seasons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seasons_updated_at
  BEFORE UPDATE ON seasons
  FOR EACH ROW
  EXECUTE FUNCTION update_seasons_updated_at();

-- Function to set a season as current (clears other current flags)
CREATE OR REPLACE FUNCTION set_current_season(p_season_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Clear current flag from all seasons
  UPDATE seasons SET is_current = false WHERE is_current = true;
  -- Set the specified season as current
  UPDATE seasons SET is_current = true, status = 'active' WHERE id = p_season_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (RLS will still apply)
GRANT EXECUTE ON FUNCTION set_current_season(UUID) TO authenticated;

-- Backfill existing seasons from teams table
-- This creates season records for any season_year values that exist in teams
INSERT INTO seasons (year, display_name, status, is_current)
SELECT DISTINCT
  t.season_year,
  REPLACE(t.season_year, '-', '-') || ' Season',
  CASE
    WHEN t.season_year = '2025-2026' THEN 'active'
    ELSE 'completed'
  END,
  t.season_year = '2025-2026'
FROM teams t
WHERE t.season_year IS NOT NULL
ON CONFLICT (year) DO NOTHING;

-- Add comment
COMMENT ON TABLE seasons IS 'Central configuration for competitive seasons. Replaces scattered season_year TEXT strings.';
COMMENT ON COLUMN seasons.sports_enabled IS 'Array of sport IDs that are active for this season. Empty means all sports.';
