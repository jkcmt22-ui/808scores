-- Seed upcoming Hawaii high school tournaments
-- Run this in the Supabase SQL Editor

-- First, get sport IDs (we'll use these in the inserts)
-- You can run this first to verify sports exist:
-- SELECT id, code, name FROM sports WHERE code IN ('boys-basketball', 'girls-basketball', 'boys-soccer', 'girls-soccer');

-- Insert tournaments
INSERT INTO tournaments (name, sport_id, format, status, start_date, end_date, venue, island, league, division, season, num_teams)
VALUES
  -- HHSAA State Championships (Basketball)
  (
    '2026 HHSAA Boys Basketball Division I State Championship',
    (SELECT id FROM sports WHERE code = 'boys-basketball'),
    'single_elimination',
    'upcoming',
    '2026-02-19',
    '2026-02-22',
    'Neal Blaisdell Arena',
    'Oahu',
    'HHSAA',
    'Division I',
    '2025-26',
    8
  ),
  (
    '2026 HHSAA Boys Basketball Division II State Championship',
    (SELECT id FROM sports WHERE code = 'boys-basketball'),
    'single_elimination',
    'upcoming',
    '2026-02-19',
    '2026-02-22',
    'Neal Blaisdell Arena',
    'Oahu',
    'HHSAA',
    'Division II',
    '2025-26',
    8
  ),
  (
    '2026 HHSAA Girls Basketball Division I State Championship',
    (SELECT id FROM sports WHERE code = 'girls-basketball'),
    'single_elimination',
    'upcoming',
    '2026-02-19',
    '2026-02-22',
    'Neal Blaisdell Arena',
    'Oahu',
    'HHSAA',
    'Division I',
    '2025-26',
    8
  ),
  (
    '2026 HHSAA Girls Basketball Division II State Championship',
    (SELECT id FROM sports WHERE code = 'girls-basketball'),
    'single_elimination',
    'upcoming',
    '2026-02-19',
    '2026-02-22',
    'Neal Blaisdell Arena',
    'Oahu',
    'HHSAA',
    'Division II',
    '2025-26',
    8
  ),

  -- HHSAA State Championships (Soccer)
  (
    '2026 HHSAA Boys Soccer State Championship',
    (SELECT id FROM sports WHERE code = 'boys-soccer'),
    'single_elimination',
    'upcoming',
    '2026-02-07',
    '2026-02-15',
    'Waipio Peninsula Soccer Stadium',
    'Oahu',
    'HHSAA',
    'Open',
    '2025-26',
    8
  ),
  (
    '2026 HHSAA Girls Soccer State Championship',
    (SELECT id FROM sports WHERE code = 'girls-soccer'),
    'single_elimination',
    'upcoming',
    '2026-02-07',
    '2026-02-15',
    'Waipio Peninsula Soccer Stadium',
    'Oahu',
    'HHSAA',
    'Open',
    '2025-26',
    8
  ),

  -- OIA League Playoffs (Basketball)
  (
    '2026 OIA Boys Basketball Division I Playoffs',
    (SELECT id FROM sports WHERE code = 'boys-basketball'),
    'single_elimination',
    'upcoming',
    '2026-02-01',
    '2026-02-08',
    NULL,
    'Oahu',
    'OIA',
    'Division I',
    '2025-26',
    8
  ),
  (
    '2026 OIA Girls Basketball Division I Playoffs',
    (SELECT id FROM sports WHERE code = 'girls-basketball'),
    'single_elimination',
    'upcoming',
    '2026-02-01',
    '2026-02-08',
    NULL,
    'Oahu',
    'OIA',
    'Division I',
    '2025-26',
    8
  ),

  -- ILH League Playoffs (Basketball)
  (
    '2026 ILH Boys Basketball Playoffs',
    (SELECT id FROM sports WHERE code = 'boys-basketball'),
    'single_elimination',
    'upcoming',
    '2026-02-03',
    '2026-02-10',
    NULL,
    'Oahu',
    'ILH',
    'Open',
    '2025-26',
    6
  ),
  (
    '2026 ILH Girls Basketball Playoffs',
    (SELECT id FROM sports WHERE code = 'girls-basketball'),
    'single_elimination',
    'upcoming',
    '2026-02-03',
    '2026-02-10',
    NULL,
    'Oahu',
    'ILH',
    'Open',
    '2025-26',
    6
  )
ON CONFLICT DO NOTHING;

-- Verify what was created
SELECT
  t.name,
  s.display_name as sport,
  t.league,
  t.division,
  t.start_date,
  t.status
FROM tournaments t
JOIN sports s ON t.sport_id = s.id
ORDER BY t.start_date, t.name;
