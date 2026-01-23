-- Hawaii Sports Center - Real Soccer Games
-- Actual scores from January 2026 Hawaii high school soccer
-- Sources: ScoringLive (scoringlive.com)

-- ============================================
-- ADDITIONAL SCHOOLS (ILH & OIA)
-- ============================================

-- PAC-5 (ILH)
INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors) VALUES
('22222222-2222-2222-2222-222222220214', 'PAC-5', 'PAC-5', 'Wolfpack', 'Oahu', 'ILH', 'Division II', '{"primary": "#000080", "secondary": "#FFD700"}')
ON CONFLICT (id) DO NOTHING;

-- Kaiser High School (OIA)
INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors) VALUES
('22222222-2222-2222-2222-222222220120', 'Kaiser High School', 'Kaiser', 'Cougars', 'Oahu', 'OIA', 'Division I', '{"primary": "#800000", "secondary": "#FFD700"}')
ON CONFLICT (id) DO NOTHING;

-- Makua Lani Christian Academy (BIIF)
INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors) VALUES
('22222222-2222-2222-2222-222222220411', 'Makua Lani Christian Academy', 'Makua Lani', 'Lions', 'Hawaii', 'BIIF', 'Division II', '{"primary": "#0000FF", "secondary": "#FFFFFF"}')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BOYS SOCCER - ILH GAMES (January 2026)
-- ============================================

-- January 21, 2026 - ILH Boys Soccer
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Kamehameha 2, Mid-Pacific 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc01',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220203',
  '22222222-2222-2222-2222-222222220206',
  '2026-01-21 16:00:00-10',
  'Kamehameha Schools',
  'final',
  2, 0,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Iolani 4, Punahou 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc02',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220204',
  '22222222-2222-2222-2222-222222220202',
  '2026-01-21 16:00:00-10',
  'Iolani School',
  'final',
  4, 0,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Saint Louis 5, Damien 1
(
  'cccccccc-cccc-cccc-cccc-cccccccccc03',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220201',
  '22222222-2222-2222-2222-222222220205',
  '2026-01-21 16:00:00-10',
  'Saint Louis School',
  'final',
  5, 1,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Le Jardin 2, PAC-5 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc04',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220209',
  '22222222-2222-2222-2222-222222220214',
  '2026-01-21 16:00:00-10',
  'Le Jardin Academy',
  'final',
  2, 0,
  true, 'trusted', 'regular_season', 0
);

-- January 19, 2026 - ILH Boys Soccer
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- PAC-5 7, Damien 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc05',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220214',
  '22222222-2222-2222-2222-222222220205',
  '2026-01-19 16:00:00-10',
  'PAC-5 Field',
  'final',
  7, 0,
  true, 'trusted', 'regular_season', 0
);

-- ============================================
-- BOYS SOCCER - OIA GAMES (January 2026)
-- ============================================

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Castle 2, Kaiser 1 (F/2OT)
(
  'cccccccc-cccc-cccc-cccc-cccccccccc06',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220115',
  '22222222-2222-2222-2222-222222220120',
  '2026-01-21 17:30:00-10',
  'Castle High School',
  'final',
  2, 1,
  true, 'trusted', 'regular_season', 2
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Moanalua 1, Kailua 0 (F/PK)
(
  'cccccccc-cccc-cccc-cccc-cccccccccc07',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220106',
  '22222222-2222-2222-2222-222222220111',
  '2026-01-21 17:30:00-10',
  'Moanalua High School',
  'final',
  1, 0,
  true, 'trusted', 'regular_season', 2
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Waianae 1, McKinley 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc08',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220105',
  '22222222-2222-2222-2222-222222220117',
  '2026-01-21 17:30:00-10',
  'Waianae High School',
  'final',
  1, 0,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Kalaheo 3, Farrington 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc09',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220112',
  '22222222-2222-2222-2222-222222220116',
  '2026-01-21 17:30:00-10',
  'Kalaheo High School',
  'final',
  3, 0,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Kapolei 2, Castle 1
(
  'cccccccc-cccc-cccc-cccc-cccccccccc10',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220104',
  '22222222-2222-2222-2222-222222220115',
  '2026-01-20 17:30:00-10',
  'Kapolei High School',
  'final',
  2, 1,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Campbell 3, Moanalua 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc11',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220103',
  '22222222-2222-2222-2222-222222220106',
  '2026-01-20 17:30:00-10',
  'Campbell High School',
  'final',
  3, 0,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Mililani 4, Kaiser 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc12',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220102',
  '22222222-2222-2222-2222-222222220120',
  '2026-01-20 17:30:00-10',
  'Mililani High School',
  'final',
  4, 0,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Kalani 2, Kailua 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc13',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220114',
  '22222222-2222-2222-2222-222222220111',
  '2026-01-20 17:30:00-10',
  'Kalani High School',
  'final',
  2, 0,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Kaiser 4, Aiea 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc14',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220120',
  '22222222-2222-2222-2222-222222220108',
  '2026-01-19 17:30:00-10',
  'Kaiser High School',
  'final',
  4, 0,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Kailua 3, Pearl City 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc15',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220111',
  '22222222-2222-2222-2222-222222220109',
  '2026-01-19 17:30:00-10',
  'Kailua High School',
  'final',
  3, 0,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Kapolei 3, Roosevelt 2 (OT)
(
  'cccccccc-cccc-cccc-cccc-cccccccccc16',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220104',
  '22222222-2222-2222-2222-222222220113',
  '2026-01-19 17:30:00-10',
  'Kapolei High School',
  'final',
  3, 2,
  true, 'trusted', 'regular_season', 1
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Moanalua 3, Radford 1
(
  'cccccccc-cccc-cccc-cccc-cccccccccc17',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220106',
  '22222222-2222-2222-2222-222222220110',
  '2026-01-19 17:30:00-10',
  'Moanalua High School',
  'final',
  3, 1,
  true, 'trusted', 'regular_season', 0
);

-- ============================================
-- BOYS SOCCER - BIIF & KIF GAMES
-- ============================================

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Kealakehe 4, Makua Lani 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc18',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220404',
  '22222222-2222-2222-2222-222222220411',
  '2026-01-20 15:00:00-10',
  'Kealakehe High School',
  'final',
  4, 0,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Kapaa 4, Island School 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc19',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220501',
  '22222222-2222-2222-2222-222222220504',
  '2026-01-21 15:00:00-10',
  'Kapaa High School',
  'final',
  4, 0,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Waimea 9, Kauai 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc20',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220503',
  '22222222-2222-2222-2222-222222220502',
  '2026-01-21 15:00:00-10',
  'Waimea High School',
  'final',
  9, 0,
  true, 'trusted', 'regular_season', 0
);

-- ============================================
-- GIRLS SOCCER - BIIF & KIF GAMES
-- ============================================

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Waiakea 4, Kealakehe 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc21',
  '11111111-1111-1111-1111-111111111205',
  '22222222-2222-2222-2222-222222220402',
  '22222222-2222-2222-2222-222222220404',
  '2026-01-19 15:00:00-10',
  'Waiakea High School',
  'final',
  4, 0,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Hilo 2, Konawaena 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc22',
  '11111111-1111-1111-1111-111111111205',
  '22222222-2222-2222-2222-222222220401',
  '22222222-2222-2222-2222-222222220405',
  '2026-01-19 15:00:00-10',
  'Hilo High School',
  'final',
  2, 0,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Hawaii Prep 6, Honokaa 1
(
  'cccccccc-cccc-cccc-cccc-cccccccccc23',
  '11111111-1111-1111-1111-111111111205',
  '22222222-2222-2222-2222-222222220409',
  '22222222-2222-2222-2222-222222220407',
  '2026-01-20 15:00:00-10',
  'Hawaii Preparatory Academy',
  'final',
  6, 1,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Hilo 1, Waiakea 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc24',
  '11111111-1111-1111-1111-111111111205',
  '22222222-2222-2222-2222-222222220401',
  '22222222-2222-2222-2222-222222220402',
  '2026-01-21 15:00:00-10',
  'Hilo High School',
  'final',
  1, 0,
  true, 'trusted', 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Kauai 1, Island School 0
(
  'cccccccc-cccc-cccc-cccc-cccccccccc25',
  '11111111-1111-1111-1111-111111111205',
  '22222222-2222-2222-2222-222222220502',
  '22222222-2222-2222-2222-222222220504',
  '2026-01-20 15:00:00-10',
  'Kauai High School',
  'final',
  1, 0,
  true, 'trusted', 'regular_season', 0
);

-- ============================================
-- UPCOMING SOCCER GAMES (Scheduled)
-- ============================================

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, game_type, overtime_count
) VALUES
(
  'cccccccc-cccc-cccc-cccc-cccccccccc26',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220104',
  '22222222-2222-2222-2222-222222220102',
  '2026-01-22 17:30:00-10',
  'Kapolei High School',
  'scheduled',
  0, 0,
  false, 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, game_type, overtime_count
) VALUES
(
  'cccccccc-cccc-cccc-cccc-cccccccccc27',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220103',
  '22222222-2222-2222-2222-222222220114',
  '2026-01-22 19:00:00-10',
  'Campbell High School',
  'scheduled',
  0, 0,
  false, 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, game_type, overtime_count
) VALUES
(
  'cccccccc-cccc-cccc-cccc-cccccccccc28',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220101',
  '22222222-2222-2222-2222-222222220105',
  '2026-01-22 19:00:00-10',
  'Kahuku High School',
  'scheduled',
  0, 0,
  false, 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, game_type, overtime_count
) VALUES
(
  'cccccccc-cccc-cccc-cccc-cccccccccc29',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220214',
  '22222222-2222-2222-2222-222222220201',
  '2026-01-23 16:15:00-10',
  'PAC-5 Field',
  'scheduled',
  0, 0,
  false, 'regular_season', 0
);

INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, game_type, overtime_count
) VALUES
(
  'cccccccc-cccc-cccc-cccc-cccccccccc30',
  '11111111-1111-1111-1111-111111111204',
  '22222222-2222-2222-2222-222222220115',
  '22222222-2222-2222-2222-222222220106',
  '2026-01-23 17:30:00-10',
  'Castle High School',
  'scheduled',
  0, 0,
  false, 'regular_season', 0
);
