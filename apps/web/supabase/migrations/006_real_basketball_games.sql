-- Hawaii Sports Center - Real Basketball Games
-- Actual scores from January 2026 Hawaii high school basketball
-- Sources: Honolulu Star-Advertiser, ScoringLive

-- ============================================
-- ENSURE SCHOOLS EXIST (ILH Schools)
-- ============================================

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220201', 'Saint Louis School', 'Saint Louis', 'Crusaders', 'Oahu', 'ILH', 'I')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220202', 'Punahou School', 'Punahou', 'Buffanblu', 'Oahu', 'ILH', 'I')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220203', 'Kamehameha Schools', 'Kamehameha', 'Warriors', 'Oahu', 'ILH', 'I')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220204', 'Iolani School', 'Iolani', 'Raiders', 'Oahu', 'ILH', 'I')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220205', 'Maryknoll School', 'Maryknoll', 'Spartans', 'Oahu', 'ILH', 'I')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220206', 'Mid-Pacific Institute', 'Mid-Pacific', 'Owls', 'Oahu', 'ILH', 'I')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220207', 'University Laboratory School', 'University', 'Jr. Rainbows', 'Oahu', 'ILH', 'I')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220208', 'Damien Memorial School', 'Damien', 'Monarchs', 'Oahu', 'ILH', 'II')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220209', 'Le Jardin Academy', 'Le Jardin', 'Bulldogs', 'Oahu', 'ILH', 'II')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220210', 'Hanalani Schools', 'Hanalani', 'Royals', 'Oahu', 'ILH', 'II')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220211', 'Hawaiian Mission Academy', 'Hawaiian Mission', 'Eagles', 'Oahu', 'ILH', 'II')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220212', 'Hawaii Baptist Academy', 'Hawaii Baptist', 'Eagles', 'Oahu', 'ILH', 'II')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220213', 'Sacred Hearts Academy', 'Sacred Hearts', 'Lancers', 'Oahu', 'ILH', 'II')
ON CONFLICT (id) DO NOTHING;

-- Big Island Schools
INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220401', 'Hilo High School', 'Hilo', 'Vikings', 'Hawaii', 'BIIF', 'I')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220403', 'Waiakea High School', 'Waiakea', 'Warriors', 'Hawaii', 'BIIF', 'I')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220404', 'Keaau High School', 'Keaau', 'Cougars', 'Hawaii', 'BIIF', 'I')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, short_name, mascot, island, league, division) VALUES
('22222222-2222-2222-2222-222222220405', 'Kamehameha-Hawaii', 'Kamehameha-HI', 'Warriors', 'Hawaii', 'BIIF', 'I')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- REAL BASKETBALL GAMES - January 2026
-- ============================================

-- January 16, 2026 - ILH Boys Varsity I
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220207', -- University (home)
  '22222222-2222-2222-2222-222222220203', -- Kamehameha (away)
  '2026-01-16 17:00:00-10',
  'Punahou School',
  'final',
  40, 53,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220202', -- Punahou (home)
  '22222222-2222-2222-2222-222222220206', -- Mid-Pacific (away)
  '2026-01-16 18:30:00-10',
  'Punahou School',
  'final',
  68, 63,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220205', -- Maryknoll (home)
  '22222222-2222-2222-2222-222222220201', -- Saint Louis (away)
  '2026-01-16 18:30:00-10',
  'Maryknoll School',
  'final',
  42, 50,
  true, 'trusted', 'regular_season', 0
);

-- January 16, 2026 - ILH Girls Varsity I
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04',
  '11111111-1111-1111-1111-111111111203', -- Girls Basketball
  '22222222-2222-2222-2222-222222220205', -- Maryknoll (home)
  '22222222-2222-2222-2222-222222220204', -- Iolani (away)
  '2026-01-16 17:00:00-10',
  'Maryknoll School',
  'final',
  60, 57,
  true, 'trusted', 'regular_season', 1  -- Overtime!
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05',
  '11111111-1111-1111-1111-111111111203', -- Girls Basketball
  '22222222-2222-2222-2222-222222220203', -- Kamehameha (home)
  '22222222-2222-2222-2222-222222220202', -- Punahou (away)
  '2026-01-16 18:00:00-10',
  'Kamehameha Schools',
  'final',
  50, 31,
  true, 'trusted', 'regular_season', 0
);

-- January 15, 2026 - ILH Boys Varsity II
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb06',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220208', -- Damien (home)
  '22222222-2222-2222-2222-222222220209', -- Le Jardin (away)
  '2026-01-15 18:00:00-10',
  'Damien Memorial School',
  'final',
  65, 32,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb07',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220210', -- Hanalani (home)
  '22222222-2222-2222-2222-222222220211', -- Hawaiian Mission (away)
  '2026-01-15 18:00:00-10',
  'Hanalani Schools',
  'final',
  57, 38,
  true, 'trusted', 'regular_season', 0
);

-- January 15, 2026 - ILH Boys Varsity I-AA
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb08',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220205', -- Maryknoll (home)
  '22222222-2222-2222-2222-222222220203', -- Kamehameha (away)
  '2026-01-15 17:00:00-10',
  'Maryknoll School',
  'final',
  25, 71,
  true, 'trusted', 'regular_season', 0
);

-- January 15, 2026 - ILH Girls Varsity II
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb09',
  '11111111-1111-1111-1111-111111111203', -- Girls Basketball
  '22222222-2222-2222-2222-222222220212', -- Hawaii Baptist (home)
  '22222222-2222-2222-2222-222222220213', -- Sacred Hearts (away)
  '2026-01-15 17:00:00-10',
  'Hawaii Baptist Academy',
  'final',
  36, 35,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb10',
  '11111111-1111-1111-1111-111111111203', -- Girls Basketball
  '22222222-2222-2222-2222-222222220210', -- Hanalani (home)
  '22222222-2222-2222-2222-222222220211', -- Hawaiian Mission (away)
  '2026-01-15 17:00:00-10',
  'Hanalani Schools',
  'final',
  37, 33,
  true, 'trusted', 'regular_season', 0
);

-- January 15, 2026 - ILH Girls Varsity I-AA
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11',
  '11111111-1111-1111-1111-111111111203', -- Girls Basketball
  '22222222-2222-2222-2222-222222220202', -- Punahou (home)
  '22222222-2222-2222-2222-222222220204', -- Iolani (away)
  '2026-01-15 18:00:00-10',
  'Punahou School',
  'final',
  46, 39,
  true, 'trusted', 'regular_season', 0
);

-- January 9, 2026 - ILH Boys Varsity I
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220205', -- Maryknoll (home)
  '22222222-2222-2222-2222-222222220204', -- Iolani (away)
  '2026-01-09 18:00:00-10',
  'Maryknoll School',
  'final',
  46, 51,
  true, 'trusted', 'regular_season', 0
);

-- January 9, 2026 - ILH Girls Varsity I
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13',
  '11111111-1111-1111-1111-111111111203', -- Girls Basketball
  '22222222-2222-2222-2222-222222220202', -- Punahou (home)
  '22222222-2222-2222-2222-222222220204', -- Iolani (away)
  '2026-01-09 18:30:00-10',
  'Punahou School',
  'final',
  32, 46,
  true, 'trusted', 'regular_season', 0
);

-- January 9, 2026 - ILH Boys Varsity II
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220211', -- Hawaiian Mission (home)
  '22222222-2222-2222-2222-222222220208', -- Damien (away)
  '2026-01-09 18:00:00-10',
  'Hawaiian Mission Academy',
  'final',
  25, 81,
  true, 'trusted', 'regular_season', 0
);

-- January 8, 2026 - ILH Boys Varsity II
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb15',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220203', -- Kamehameha (home)
  '22222222-2222-2222-2222-222222220204', -- Iolani (away)
  '2026-01-08 18:00:00-10',
  'Kamehameha Schools',
  'final',
  68, 27,
  true, 'trusted', 'regular_season', 0
);

-- January 8, 2026 - ILH Girls Varsity II
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb16',
  '11111111-1111-1111-1111-111111111203', -- Girls Basketball
  '22222222-2222-2222-2222-222222220212', -- Hawaii Baptist (home)
  '22222222-2222-2222-2222-222222220211', -- Hawaiian Mission (away)
  '2026-01-08 17:00:00-10',
  'Hawaii Baptist Academy',
  'final',
  48, 21,
  true, 'trusted', 'regular_season', 0
);

-- January 7, 2026 - ILH Boys Varsity I
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb17',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220205', -- Maryknoll (home)
  '22222222-2222-2222-2222-222222220202', -- Punahou (away)
  '2026-01-07 18:00:00-10',
  'Maryknoll School',
  'final',
  40, 43,
  true, 'trusted', 'regular_season', 0
);

-- January 7, 2026 - ILH Boys Varsity II
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb18',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220212', -- Hawaii Baptist (home)
  '22222222-2222-2222-2222-222222220209', -- Le Jardin (away)
  '2026-01-07 18:30:00-10',
  'Hawaii Baptist Academy',
  'final',
  56, 58,
  true, 'trusted', 'regular_season', 0
);

-- January 7, 2026 - ILH Girls Varsity II
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb19',
  '11111111-1111-1111-1111-111111111203', -- Girls Basketball
  '22222222-2222-2222-2222-222222220206', -- Mid-Pacific (home)
  '22222222-2222-2222-2222-222222220213', -- Sacred Hearts (away)
  '2026-01-07 17:00:00-10',
  'Mid-Pacific Institute',
  'final',
  47, 59,
  true, 'trusted', 'regular_season', 0
);

-- BIIF Games - January 9, 2026
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb20',
  '11111111-1111-1111-1111-111111111203', -- Girls Basketball
  '22222222-2222-2222-2222-222222220403', -- Waiakea (home)
  '22222222-2222-2222-2222-222222220404', -- Keaau (away)
  '2026-01-09 18:00:00-10',
  'Waiakea High School',
  'final',
  51, 20,
  true, 'trusted', 'regular_season', 0
);

-- BIIF Games - January 7, 2026
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb21',
  '11111111-1111-1111-1111-111111111203', -- Girls Basketball
  '22222222-2222-2222-2222-222222220405', -- Kamehameha-Hawaii (home)
  '22222222-2222-2222-2222-222222220401', -- Hilo (away)
  '2026-01-07 18:00:00-10',
  'Kamehameha Schools Hawaii',
  'final',
  49, 44,
  true, 'trusted', 'regular_season', 0
);

-- ============================================
-- UPCOMING GAMES (for variety)
-- ============================================

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, game_type, overtime_count
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb22',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220201', -- Saint Louis (home)
  '22222222-2222-2222-2222-222222220202', -- Punahou (away)
  NOW() + INTERVAL '2 days',
  'Saint Louis Gymnasium',
  'scheduled',
  0, 0,
  false, 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, game_type, overtime_count, golden_game
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb23',
  '11111111-1111-1111-1111-111111111203', -- Girls Basketball
  '22222222-2222-2222-2222-222222220203', -- Kamehameha (home)
  '22222222-2222-2222-2222-222222220204', -- Iolani (away)
  NOW() + INTERVAL '3 days',
  'Kamehameha Kekuhaupio Gym',
  'scheduled',
  0, 0,
  false, 'playoff', 0, true
);
