-- ============================================
-- Migration 084: Create TBD Teams for Playoff Scheduling
-- ============================================
-- This migration creates a special "TBD" school and teams for each sport,
-- allowing admins to schedule playoff games before knowing which teams will play.
-- Games with TBD teams can be edited later to replace with actual teams.
-- ============================================

-- Create TBD school with a fixed UUID for easy reference
INSERT INTO schools (id, name, short_name, mascot, island, league, division)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'To Be Determined',
  'TBD',
  'TBD',
  'Oahu',
  NULL,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Create TBD teams for each active sport/gender combination
-- This will create teams like "TBD Boys Basketball", "TBD Girls Volleyball", etc.
INSERT INTO teams (school_id, sport_id, gender, level, division, league, season_year, is_active)
SELECT
  'aaaaaaaa-0000-0000-0000-000000000001',
  s.id,
  s.gender,
  'varsity',
  'Open',
  NULL,
  '2025-2026',
  true
FROM sports s
WHERE s.active = true
ON CONFLICT DO NOTHING;

-- Add a comment to document the TBD school
COMMENT ON TABLE schools IS 'School records. The TBD school (id: aaaaaaaa-0000-0000-0000-000000000001) is used for playoff game scheduling.';
