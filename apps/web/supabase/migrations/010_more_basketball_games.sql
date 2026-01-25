-- Migration: Add more basketball games from OIA, BIIF, MIL, KIF leagues
-- Date: January 2026

-- First, let's add more schools from different leagues
-- OIA (Oahu Interscholastic Association) schools
INSERT INTO schools (id, name, short_name, mascot, city, island, league, division, primary_color, secondary_color) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddd01', 'Aiea High School', 'Aiea', 'Na Alii', 'Aiea', 'Oahu', 'OIA', 'Division I', '#8B0000', '#FFD700'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd02', 'Castle High School', 'Castle', 'Knights', 'Kaneohe', 'Oahu', 'OIA', 'Division I', '#003366', '#FFD700'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd03', 'Farrington High School', 'Farrington', 'Governors', 'Honolulu', 'Oahu', 'OIA', 'Division I', '#800000', '#FFFFFF'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd04', 'Kalani High School', 'Kalani', 'Falcons', 'Honolulu', 'Oahu', 'OIA', 'Division I', '#008000', '#FFD700'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd05', 'Kailua High School', 'Kailua', 'Surfriders', 'Kailua', 'Oahu', 'OIA', 'Division I', '#0000FF', '#FFFFFF'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd06', 'Kalaheo High School', 'Kalaheo', 'Mustangs', 'Kailua', 'Oahu', 'OIA', 'Division I', '#FF0000', '#000000'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd07', 'McKinley High School', 'McKinley', 'Tigers', 'Honolulu', 'Oahu', 'OIA', 'Division II', '#000000', '#FFD700'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd08', 'Moanalua High School', 'Moanalua', 'Menehune', 'Honolulu', 'Oahu', 'OIA', 'Division I', '#800080', '#FFD700'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd09', 'Pearl City High School', 'Pearl City', 'Chargers', 'Pearl City', 'Oahu', 'OIA', 'Division I', '#003366', '#FFD700'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd10', 'Radford High School', 'Radford', 'Rams', 'Honolulu', 'Oahu', 'OIA', 'Division II', '#B22222', '#000000'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd11', 'Roosevelt High School', 'Roosevelt', 'Rough Riders', 'Honolulu', 'Oahu', 'OIA', 'Division I', '#0000CD', '#FFD700'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd12', 'Waialua High School', 'Waialua', 'Bulldogs', 'Waialua', 'Oahu', 'OIA', 'Division II', '#800000', '#FFFFFF'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd13', 'Waipahu High School', 'Waipahu', 'Marauders', 'Waipahu', 'Oahu', 'OIA', 'Division I', '#800000', '#FFD700')
ON CONFLICT (id) DO NOTHING;

-- BIIF (Big Island Interscholastic Federation) schools
INSERT INTO schools (id, name, short_name, mascot, city, island, league, division, primary_color, secondary_color) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Hilo High School', 'Hilo', 'Vikings', 'Hilo', 'Hawaii', 'BIIF', 'Division I', '#0000FF', '#FFD700'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Waiakea High School', 'Waiakea', 'Warriors', 'Hilo', 'Hawaii', 'BIIF', 'Division I', '#FF0000', '#000000'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03', 'Keaau High School', 'Keaau', 'Cougars', 'Keaau', 'Hawaii', 'BIIF', 'Division II', '#008000', '#FFD700'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee04', 'Pahoa High School', 'Pahoa', 'Daggers', 'Pahoa', 'Hawaii', 'BIIF', 'Division II', '#800000', '#FFFFFF'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee05', 'Kealakehe High School', 'Kealakehe', 'Waveriders', 'Kailua-Kona', 'Hawaii', 'BIIF', 'Division I', '#0000CD', '#FFFFFF'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee06', 'Konawaena High School', 'Konawaena', 'Wildcats', 'Kealakekua', 'Hawaii', 'BIIF', 'Division I', '#FFD700', '#000000'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee07', 'Honokaa High School', 'Honokaa', 'Dragons', 'Honokaa', 'Hawaii', 'BIIF', 'Division II', '#008000', '#FFD700'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee08', 'Kohala High School', 'Kohala', 'Cowboys', 'Kapaau', 'Hawaii', 'BIIF', 'Division II', '#800000', '#000000'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee09', 'Hawaii Preparatory Academy', 'HPA', 'Ka Makani', 'Kamuela', 'Hawaii', 'BIIF', 'Division I', '#003366', '#FFFFFF'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee10', 'Parker School', 'Parker', 'Bruins', 'Kamuela', 'Hawaii', 'BIIF', 'Division II', '#8B4513', '#FFD700')
ON CONFLICT (id) DO NOTHING;

-- MIL (Maui Interscholastic League) schools
INSERT INTO schools (id, name, short_name, mascot, city, island, league, division, primary_color, secondary_color) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff01', 'Maui High School', 'Maui High', 'Sabers', 'Kahului', 'Maui', 'MIL', 'Division I', '#800080', '#FFD700'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff02', 'Baldwin High School', 'Baldwin', 'Bears', 'Wailuku', 'Maui', 'MIL', 'Division I', '#8B4513', '#FFD700'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff03', 'Lahainaluna High School', 'Lahainaluna', 'Lunas', 'Lahaina', 'Maui', 'MIL', 'Division I', '#FF0000', '#000000'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff04', 'King Kekaulike High School', 'King Kekaulike', 'Na Alii', 'Pukalani', 'Maui', 'MIL', 'Division I', '#003366', '#FFD700'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff05', 'Kamehameha Maui', 'KS Maui', 'Warriors', 'Pukalani', 'Maui', 'MIL', 'Division I', '#0000FF', '#FFFFFF'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff06', 'Seabury Hall', 'Seabury', 'Spartans', 'Makawao', 'Maui', 'MIL', 'Division II', '#003366', '#FFD700'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff07', 'Molokai High School', 'Molokai', 'Farmers', 'Hoolehua', 'Molokai', 'MIL', 'Division II', '#008000', '#FFFFFF'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff08', 'Lanai High School', 'Lanai', 'Pine Lads', 'Lanai City', 'Lanai', 'MIL', 'Division II', '#008000', '#FFD700'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff09', 'Hana High School', 'Hana', 'Dragons', 'Hana', 'Maui', 'MIL', 'Division II', '#FF0000', '#000000')
ON CONFLICT (id) DO NOTHING;

-- KIF (Kauai Interscholastic Federation) schools
INSERT INTO schools (id, name, short_name, mascot, city, island, league, division, primary_color, secondary_color) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Kapaa High School', 'Kapaa', 'Warriors', 'Kapaa', 'Kauai', 'KIF', 'Division I', '#800000', '#FFD700'),
  ('11111111-1111-1111-1111-111111111102', 'Kauai High School', 'Kauai High', 'Red Raiders', 'Lihue', 'Kauai', 'KIF', 'Division I', '#FF0000', '#000000'),
  ('11111111-1111-1111-1111-111111111103', 'Waimea High School', 'Waimea', 'Menehune', 'Waimea', 'Kauai', 'KIF', 'Division II', '#800080', '#FFD700'),
  ('11111111-1111-1111-1111-111111111104', 'Island School', 'Island School', 'Navigators', 'Lihue', 'Kauai', 'KIF', 'Division II', '#003366', '#FFFFFF')
ON CONFLICT (id) DO NOTHING;

-- Get sport IDs for basketball
-- We'll use a DO block to get the sport IDs dynamically

DO $$
DECLARE
  boys_bball_id UUID;
  girls_bball_id UUID;
BEGIN
  -- Get boys basketball ID
  SELECT id INTO boys_bball_id FROM sports WHERE code = 'boys-basketball' AND active = true LIMIT 1;

  -- Get girls basketball ID
  SELECT id INTO girls_bball_id FROM sports WHERE code = 'girls-basketball' AND active = true LIMIT 1;

  -- Insert OIA Basketball Games (January 20-25, 2026)
  INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type, home_score, away_score, current_period)
  VALUES
    -- January 20, 2026 - Boys Basketball OIA
    ('gggggggg-gggg-gggg-gggg-gggggggggg01', boys_bball_id, 'dddddddd-dddd-dddd-dddd-dddddddddd01', 'dddddddd-dddd-dddd-dddd-dddddddddd02', '2026-01-20 19:00:00+00', 'Aiea Gymnasium', 'final', 'regular', 65, 58, NULL),
    ('gggggggg-gggg-gggg-gggg-gggggggggg02', boys_bball_id, 'dddddddd-dddd-dddd-dddd-dddddddddd04', 'dddddddd-dddd-dddd-dddd-dddddddddd05', '2026-01-20 19:00:00+00', 'Kalani Gymnasium', 'final', 'regular', 72, 68, NULL),
    ('gggggggg-gggg-gggg-gggg-gggggggggg03', boys_bball_id, 'dddddddd-dddd-dddd-dddd-dddddddddd08', 'dddddddd-dddd-dddd-dddd-dddddddddd09', '2026-01-20 19:00:00+00', 'Moanalua Gymnasium', 'final', 'regular', 55, 62, NULL),

    -- January 21, 2026 - Girls Basketball OIA
    ('gggggggg-gggg-gggg-gggg-gggggggggg04', girls_bball_id, 'dddddddd-dddd-dddd-dddd-dddddddddd03', 'dddddddd-dddd-dddd-dddd-dddddddddd06', '2026-01-21 18:00:00+00', 'Farrington Gymnasium', 'final', 'regular', 48, 52, NULL),
    ('gggggggg-gggg-gggg-gggg-gggggggggg05', girls_bball_id, 'dddddddd-dddd-dddd-dddd-dddddddddd11', 'dddddddd-dddd-dddd-dddd-dddddddddd13', '2026-01-21 18:00:00+00', 'Roosevelt Gymnasium', 'final', 'regular', 56, 44, NULL),

    -- January 22, 2026 - Boys Basketball OIA (TODAY)
    ('gggggggg-gggg-gggg-gggg-gggggggggg06', boys_bball_id, 'dddddddd-dddd-dddd-dddd-dddddddddd02', 'dddddddd-dddd-dddd-dddd-dddddddddd03', '2026-01-22 19:00:00+00', 'Castle Gymnasium', 'scheduled', 'regular', NULL, NULL, NULL),
    ('gggggggg-gggg-gggg-gggg-gggggggggg07', boys_bball_id, 'dddddddd-dddd-dddd-dddd-dddddddddd05', 'dddddddd-dddd-dddd-dddd-dddddddddd08', '2026-01-22 19:00:00+00', 'Kailua Gymnasium', 'scheduled', 'regular', NULL, NULL, NULL),
    ('gggggggg-gggg-gggg-gggg-gggggggggg08', boys_bball_id, 'dddddddd-dddd-dddd-dddd-dddddddddd09', 'dddddddd-dddd-dddd-dddd-dddddddddd04', '2026-01-22 19:30:00+00', 'Pearl City Gymnasium', 'scheduled', 'regular', NULL, NULL, NULL),

    -- January 22, 2026 - Girls Basketball OIA (TODAY)
    ('gggggggg-gggg-gggg-gggg-gggggggggg09', girls_bball_id, 'dddddddd-dddd-dddd-dddd-dddddddddd01', 'dddddddd-dddd-dddd-dddd-dddddddddd04', '2026-01-22 17:30:00+00', 'Aiea Gymnasium', 'scheduled', 'regular', NULL, NULL, NULL),
    ('gggggggg-gggg-gggg-gggg-gggggggggg10', girls_bball_id, 'dddddddd-dddd-dddd-dddd-dddddddddd06', 'dddddddd-dddd-dddd-dddd-dddddddddd11', '2026-01-22 17:30:00+00', 'Kalaheo Gymnasium', 'scheduled', 'regular', NULL, NULL, NULL),

    -- January 23, 2026 - Boys Basketball OIA
    ('gggggggg-gggg-gggg-gggg-gggggggggg11', boys_bball_id, 'dddddddd-dddd-dddd-dddd-dddddddddd06', 'dddddddd-dddd-dddd-dddd-dddddddddd01', '2026-01-23 19:00:00+00', 'Kalaheo Gymnasium', 'scheduled', 'regular', NULL, NULL, NULL),
    ('gggggggg-gggg-gggg-gggg-gggggggggg12', boys_bball_id, 'dddddddd-dddd-dddd-dddd-dddddddddd13', 'dddddddd-dddd-dddd-dddd-dddddddddd11', '2026-01-23 19:00:00+00', 'Waipahu Gymnasium', 'scheduled', 'regular', NULL, NULL, NULL)
  ON CONFLICT (id) DO NOTHING;

  -- Insert BIIF Basketball Games
  INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type, home_score, away_score, current_period)
  VALUES
    -- January 20, 2026 - Boys Basketball BIIF
    ('gggggggg-gggg-gggg-gggg-gggggggggg13', boys_bball_id, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', '2026-01-20 19:00:00+00', 'Hilo Civic Auditorium', 'final', 'regular', 71, 65, NULL),
    ('gggggggg-gggg-gggg-gggg-gggggggggg14', boys_bball_id, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee05', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee06', '2026-01-20 19:00:00+00', 'Kealakehe Gymnasium', 'final', 'regular', 58, 64, NULL),

    -- January 21, 2026 - Girls Basketball BIIF
    ('gggggggg-gggg-gggg-gggg-gggggggggg15', girls_bball_id, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', '2026-01-21 18:00:00+00', 'Waiakea Gymnasium', 'final', 'regular', 52, 48, NULL),

    -- January 22, 2026 - Boys Basketball BIIF (TODAY)
    ('gggggggg-gggg-gggg-gggg-gggggggggg16', boys_bball_id, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee06', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee05', '2026-01-22 19:00:00+00', 'Konawaena Gymnasium', 'scheduled', 'regular', NULL, NULL, NULL),
    ('gggggggg-gggg-gggg-gggg-gggggggggg17', boys_bball_id, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee09', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', '2026-01-22 19:00:00+00', 'HPA Gymnasium', 'scheduled', 'regular', NULL, NULL, NULL),

    -- January 23, 2026 - Girls Basketball BIIF
    ('gggggggg-gggg-gggg-gggg-gggggggggg18', girls_bball_id, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee06', '2026-01-23 18:00:00+00', 'Hilo Civic Auditorium', 'scheduled', 'regular', NULL, NULL, NULL)
  ON CONFLICT (id) DO NOTHING;

  -- Insert MIL Basketball Games
  INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type, home_score, away_score, current_period)
  VALUES
    -- January 20, 2026 - Boys Basketball MIL
    ('gggggggg-gggg-gggg-gggg-gggggggggg19', boys_bball_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff01', 'ffffffff-ffff-ffff-ffff-ffffffffffff02', '2026-01-20 19:00:00+00', 'Maui High Gymnasium', 'final', 'regular', 62, 58, NULL),
    ('gggggggg-gggg-gggg-gggg-gggggggggg20', boys_bball_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff03', 'ffffffff-ffff-ffff-ffff-ffffffffffff04', '2026-01-20 19:00:00+00', 'Lahainaluna Gymnasium', 'final', 'regular', 75, 68, NULL),

    -- January 21, 2026 - Girls Basketball MIL
    ('gggggggg-gggg-gggg-gggg-gggggggggg21', girls_bball_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff02', 'ffffffff-ffff-ffff-ffff-ffffffffffff05', '2026-01-21 18:00:00+00', 'Baldwin Gymnasium', 'final', 'regular', 45, 52, NULL),

    -- January 22, 2026 - Boys Basketball MIL (TODAY)
    ('gggggggg-gggg-gggg-gggg-gggggggggg22', boys_bball_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff04', 'ffffffff-ffff-ffff-ffff-ffffffffffff01', '2026-01-22 19:00:00+00', 'King Kekaulike Gymnasium', 'scheduled', 'regular', NULL, NULL, NULL),
    ('gggggggg-gggg-gggg-gggg-gggggggggg23', boys_bball_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff05', 'ffffffff-ffff-ffff-ffff-ffffffffffff03', '2026-01-22 19:00:00+00', 'KS Maui Gymnasium', 'scheduled', 'regular', NULL, NULL, NULL),

    -- January 23, 2026 - Girls Basketball MIL
    ('gggggggg-gggg-gggg-gggg-gggggggggg24', girls_bball_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff03', 'ffffffff-ffff-ffff-ffff-ffffffffffff04', '2026-01-23 18:00:00+00', 'Lahainaluna Gymnasium', 'scheduled', 'regular', NULL, NULL, NULL)
  ON CONFLICT (id) DO NOTHING;

  -- Insert KIF Basketball Games
  INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type, home_score, away_score, current_period)
  VALUES
    -- January 21, 2026 - Boys Basketball KIF
    ('gggggggg-gggg-gggg-gggg-gggggggggg25', boys_bball_id, '11111111-1111-1111-1111-111111111101', '11111111-1111-1111-1111-111111111102', '2026-01-21 19:00:00+00', 'Kapaa Gymnasium', 'final', 'regular', 68, 62, NULL),

    -- January 22, 2026 - Girls Basketball KIF (TODAY)
    ('gggggggg-gggg-gggg-gggg-gggggggggg26', girls_bball_id, '11111111-1111-1111-1111-111111111102', '11111111-1111-1111-1111-111111111101', '2026-01-22 18:00:00+00', 'Kauai High Gymnasium', 'scheduled', 'regular', NULL, NULL, NULL),

    -- January 23, 2026 - Boys Basketball KIF
    ('gggggggg-gggg-gggg-gggg-gggggggggg27', boys_bball_id, '11111111-1111-1111-1111-111111111102', '11111111-1111-1111-1111-111111111103', '2026-01-23 19:00:00+00', 'Kauai High Gymnasium', 'scheduled', 'regular', NULL, NULL, NULL)
  ON CONFLICT (id) DO NOTHING;

END $$;

-- Verify count
SELECT 'New schools added' as info, COUNT(*) as count
FROM schools
WHERE id::text LIKE 'dddddddd%' OR id::text LIKE 'eeeeeeee%' OR id::text LIKE 'ffffffff%' OR id::text LIKE '11111111%';

SELECT 'New games added' as info, COUNT(*) as count
FROM games
WHERE id::text LIKE 'gggggggg%';
