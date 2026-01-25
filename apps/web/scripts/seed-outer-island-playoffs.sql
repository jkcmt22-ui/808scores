-- Add BIIF, MIL, KIF league playoffs
-- Run this in the Supabase SQL Editor

-- BIIF League Playoffs (Big Island)
INSERT INTO tournaments (name, sport_id, format, status, start_date, end_date, venue, island, league, division, season, num_teams)
VALUES
  (
    '2026 BIIF Boys Basketball Playoffs',
    (SELECT id FROM sports WHERE code = 'boys-basketball'),
    'single_elimination',
    'upcoming',
    '2026-02-01',
    '2026-02-08',
    NULL,
    'Hawaii',
    'BIIF',
    'Open',
    '2025-26',
    8
  ),
  (
    '2026 BIIF Girls Basketball Playoffs',
    (SELECT id FROM sports WHERE code = 'girls-basketball'),
    'single_elimination',
    'upcoming',
    '2026-02-01',
    '2026-02-08',
    NULL,
    'Hawaii',
    'BIIF',
    'Open',
    '2025-26',
    8
  ),
  (
    '2026 BIIF Boys Soccer Playoffs',
    (SELECT id FROM sports WHERE code = 'boys-soccer'),
    'single_elimination',
    'upcoming',
    '2026-01-25',
    '2026-02-01',
    NULL,
    'Hawaii',
    'BIIF',
    'Open',
    '2025-26',
    6
  ),
  (
    '2026 BIIF Girls Soccer Playoffs',
    (SELECT id FROM sports WHERE code = 'girls-soccer'),
    'single_elimination',
    'upcoming',
    '2026-01-25',
    '2026-02-01',
    NULL,
    'Hawaii',
    'BIIF',
    'Open',
    '2025-26',
    6
  ),

  -- MIL League Playoffs (Maui)
  (
    '2026 MIL Boys Basketball Playoffs',
    (SELECT id FROM sports WHERE code = 'boys-basketball'),
    'single_elimination',
    'upcoming',
    '2026-02-01',
    '2026-02-08',
    NULL,
    'Maui',
    'MIL',
    'Open',
    '2025-26',
    6
  ),
  (
    '2026 MIL Girls Basketball Playoffs',
    (SELECT id FROM sports WHERE code = 'girls-basketball'),
    'single_elimination',
    'upcoming',
    '2026-02-01',
    '2026-02-08',
    NULL,
    'Maui',
    'MIL',
    'Open',
    '2025-26',
    6
  ),
  (
    '2026 MIL Boys Soccer Playoffs',
    (SELECT id FROM sports WHERE code = 'boys-soccer'),
    'single_elimination',
    'upcoming',
    '2026-01-25',
    '2026-02-01',
    NULL,
    'Maui',
    'MIL',
    'Open',
    '2025-26',
    6
  ),
  (
    '2026 MIL Girls Soccer Playoffs',
    (SELECT id FROM sports WHERE code = 'girls-soccer'),
    'single_elimination',
    'upcoming',
    '2026-01-25',
    '2026-02-01',
    NULL,
    'Maui',
    'MIL',
    'Open',
    '2025-26',
    6
  ),

  -- KIF League Playoffs (Kauai)
  (
    '2026 KIF Boys Basketball Playoffs',
    (SELECT id FROM sports WHERE code = 'boys-basketball'),
    'single_elimination',
    'upcoming',
    '2026-02-01',
    '2026-02-08',
    NULL,
    'Kauai',
    'KIF',
    'Open',
    '2025-26',
    4
  ),
  (
    '2026 KIF Girls Basketball Playoffs',
    (SELECT id FROM sports WHERE code = 'girls-basketball'),
    'single_elimination',
    'upcoming',
    '2026-02-01',
    '2026-02-08',
    NULL,
    'Kauai',
    'KIF',
    'Open',
    '2025-26',
    4
  ),
  (
    '2026 KIF Boys Soccer Playoffs',
    (SELECT id FROM sports WHERE code = 'boys-soccer'),
    'single_elimination',
    'upcoming',
    '2026-01-25',
    '2026-02-01',
    NULL,
    'Kauai',
    'KIF',
    'Open',
    '2025-26',
    4
  ),
  (
    '2026 KIF Girls Soccer Playoffs',
    (SELECT id FROM sports WHERE code = 'girls-soccer'),
    'single_elimination',
    'upcoming',
    '2026-01-25',
    '2026-02-01',
    NULL,
    'Kauai',
    'KIF',
    'Open',
    '2025-26',
    4
  )
ON CONFLICT DO NOTHING;

-- Verify all tournaments
SELECT
  t.name,
  s.display_name as sport,
  t.league,
  t.island,
  t.start_date,
  t.status
FROM tournaments t
JOIN sports s ON t.sport_id = s.id
ORDER BY t.league, t.start_date, t.name;
