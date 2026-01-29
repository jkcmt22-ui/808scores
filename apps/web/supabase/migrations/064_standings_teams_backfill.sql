-- ============================================
-- Migration 064: Standings Teams Backfill
-- ============================================
-- This migration:
-- 1. Adds region column to teams table for OIA East/West tracking
-- 2. Backfills teams with league/division from schools
-- 3. Sets OIA East/West region assignments
-- ============================================

-- 1. Add region column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS region TEXT;

-- Create index for region-based queries
CREATE INDEX IF NOT EXISTS idx_teams_region ON teams(region) WHERE region IS NOT NULL;

-- 2. Backfill teams with league/division from schools (as starting point)
-- Only update teams that don't have a league set
UPDATE teams t SET
  league = s.league,
  division = s.division
FROM schools s
WHERE t.school_id = s.id
  AND t.league IS NULL;

-- 3. OIA East region assignments
-- East side schools: Kahuku, Castle, Kailua, Kalaheo, Kalani, Kaiser, Moanalua, Roosevelt, Farrington, McKinley
UPDATE teams SET region = 'East'
WHERE league = 'OIA'
  AND region IS NULL
  AND school_id IN (
    SELECT id FROM schools WHERE short_name IN (
      'Kahuku', 'Castle', 'Kailua', 'Kalaheo', 'Kalani',
      'Kaiser', 'Moanalua', 'Roosevelt', 'Farrington', 'McKinley'
    )
  );

-- 4. OIA West region assignments
-- West side schools: Mililani, Campbell, Kapolei, Waianae, Leilehua, Pearl City, Aiea, Radford, Nanakuli, Waipahu
UPDATE teams SET region = 'West'
WHERE league = 'OIA'
  AND region IS NULL
  AND school_id IN (
    SELECT id FROM schools WHERE short_name IN (
      'Mililani', 'Campbell', 'Kapolei', 'Waianae', 'Leilehua',
      'Pearl City', 'Aiea', 'Radford', 'Nanakuli', 'Waipahu'
    )
  );

-- 5. Add comment for documentation
COMMENT ON COLUMN teams.region IS 'Regional division within a league (e.g., OIA East/West). Only applicable for leagues with regional divisions.';
