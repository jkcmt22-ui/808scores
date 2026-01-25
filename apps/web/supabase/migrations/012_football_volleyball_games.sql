-- Hawaii Sports Center - Football & Volleyball Games
-- Recent scores from the 2025-2026 school year
-- Football (fall 2025) and Girls Volleyball (fall 2025)

-- ============================================
-- FOOTBALL GAMES - Fall 2025 Season Finals/Playoffs
-- Note: Football season ends around Thanksgiving/early December
-- ============================================

-- November 2025 Football - Regular Season Finals
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- ILH Football - November 7, 2025
(
  'ffffffff-ffff-ffff-ffff-fffffffffb01',
  '11111111-1111-1111-1111-111111111101', -- Football
  '22222222-2222-2222-2222-222222220201', -- Saint Louis
  '22222222-2222-2222-2222-222222220203', -- Kamehameha
  '2025-11-07 19:00:00-10',
  'Aloha Stadium',
  'final',
  35, 28,
  true, 'trusted', 'regular_season', 0
),
-- ILH Football - November 8, 2025
(
  'ffffffff-ffff-ffff-ffff-fffffffffb02',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222220202', -- Punahou
  '22222222-2222-2222-2222-222222220204', -- Iolani
  '2025-11-08 13:00:00-10',
  'Alexander Field',
  'final',
  42, 14,
  true, 'trusted', 'regular_season', 0
),
-- OIA Football - November 8, 2025
(
  'ffffffff-ffff-ffff-ffff-fffffffffb03',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222220101', -- Kahuku
  '22222222-2222-2222-2222-222222220102', -- Mililani
  '2025-11-08 18:00:00-10',
  'Carleton E. Weimer Field',
  'final',
  28, 21,
  true, 'trusted', 'regular_season', 0
),
(
  'ffffffff-ffff-ffff-ffff-fffffffffb04',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222220103', -- Campbell
  '22222222-2222-2222-2222-222222220104', -- Kapolei
  '2025-11-08 19:00:00-10',
  'James Campbell High School Stadium',
  'final',
  35, 14,
  true, 'trusted', 'regular_season', 0
);

-- Football State Playoffs - November 2025
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Open Division Semifinal - November 15, 2025
(
  'ffffffff-ffff-ffff-ffff-fffffffffb05',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222220201', -- Saint Louis
  '22222222-2222-2222-2222-222222220101', -- Kahuku
  '2025-11-15 18:00:00-10',
  'Aloha Stadium',
  'final',
  31, 28,
  true, 'trusted', 'playoff', 1 -- OT thriller
),
(
  'ffffffff-ffff-ffff-ffff-fffffffffb06',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222220103', -- Campbell
  '22222222-2222-2222-2222-222222220202', -- Punahou
  '2025-11-15 19:30:00-10',
  'Aloha Stadium',
  'final',
  21, 17,
  true, 'trusted', 'playoff', 0
),
-- Open Division Championship - November 22, 2025
(
  'ffffffff-ffff-ffff-ffff-fffffffffb07',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222220201', -- Saint Louis (home)
  '22222222-2222-2222-2222-222222220103', -- Campbell (away)
  '2025-11-22 19:00:00-10',
  'Aloha Stadium',
  'final',
  42, 35,
  true, 'trusted', 'championship', 0
);

-- More OIA Football Regular Season Games
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
(
  'ffffffff-ffff-ffff-ffff-fffffffffb08',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222220105', -- Waianae
  '22222222-2222-2222-2222-222222220106', -- Moanalua
  '2025-11-01 18:00:00-10',
  'Waianae High School',
  'final',
  21, 14,
  true, 'trusted', 'regular_season', 0
),
(
  'ffffffff-ffff-ffff-ffff-fffffffffb09',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222220107', -- Leilehua
  '22222222-2222-2222-2222-222222220108', -- Aiea
  '2025-11-01 19:00:00-10',
  'Hugh Yoshida Stadium',
  'final',
  28, 7,
  true, 'trusted', 'regular_season', 0
),
(
  'ffffffff-ffff-ffff-ffff-fffffffffb10',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222220109', -- Pearl City
  '22222222-2222-2222-2222-222222220110', -- Radford
  '2025-10-31 19:00:00-10',
  'Pearl City High School Stadium',
  'final',
  35, 21,
  true, 'trusted', 'regular_season', 0
);

-- BIIF Football Games
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
(
  'ffffffff-ffff-ffff-ffff-fffffffffb11',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222220401', -- Hilo
  '22222222-2222-2222-2222-222222220402', -- Waiakea
  '2025-10-25 19:00:00-10',
  'Wong Stadium',
  'final',
  24, 21,
  true, 'trusted', 'regular_season', 0
),
(
  'ffffffff-ffff-ffff-ffff-fffffffffb12',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222220404', -- Kealakehe
  '22222222-2222-2222-2222-222222220405', -- Konawaena
  '2025-10-25 18:00:00-10',
  'Kealakehe High School',
  'final',
  14, 28,
  true, 'trusted', 'regular_season', 0
);

-- MIL Football Games
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
(
  'ffffffff-ffff-ffff-ffff-fffffffffb13',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222220301', -- Lahainaluna
  '22222222-2222-2222-2222-222222220302', -- Baldwin
  '2025-10-18 19:00:00-10',
  'Sue D. Cooley Stadium',
  'final',
  42, 7,
  true, 'trusted', 'regular_season', 0
),
(
  'ffffffff-ffff-ffff-ffff-fffffffffb14',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222220304', -- Kamehameha Maui
  '22222222-2222-2222-2222-222222220303', -- Maui High
  '2025-10-18 18:00:00-10',
  'Kamehameha Maui Stadium',
  'final',
  35, 14,
  true, 'trusted', 'regular_season', 0
);

-- ============================================
-- GIRLS VOLLEYBALL - Fall 2025 Season (Recently Completed)
-- ============================================

-- ILH Girls Volleyball - Late October 2025
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Regular Season
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv01',
  '11111111-1111-1111-1111-111111111201', -- Girls Volleyball
  '22222222-2222-2222-2222-222222220202', -- Punahou
  '22222222-2222-2222-2222-222222220203', -- Kamehameha
  '2025-10-21 18:00:00-10',
  'Punahou School',
  'final',
  3, 2, -- 5-set match (3 sets to win)
  true, 'trusted', 'regular_season', 0
),
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv02',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220204', -- Iolani
  '22222222-2222-2222-2222-222222220201', -- Saint Louis (girls team would be Sacred Hearts etc)
  '2025-10-21 17:00:00-10',
  'Iolani School',
  'final',
  3, 1,
  true, 'trusted', 'regular_season', 0
),
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv03',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220206', -- Mid-Pacific
  '22222222-2222-2222-2222-222222220205', -- Maryknoll
  '2025-10-22 17:00:00-10',
  'Mid-Pacific Institute',
  'final',
  3, 0, -- Sweep
  true, 'trusted', 'regular_season', 0
);

-- OIA Girls Volleyball - October 2025
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv04',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220102', -- Mililani
  '22222222-2222-2222-2222-222222220101', -- Kahuku
  '2025-10-22 18:00:00-10',
  'Mililani High School',
  'final',
  3, 1,
  true, 'trusted', 'regular_season', 0
),
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv05',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220103', -- Campbell
  '22222222-2222-2222-2222-222222220104', -- Kapolei
  '2025-10-22 18:00:00-10',
  'James Campbell High School',
  'final',
  3, 2,
  true, 'trusted', 'regular_season', 0
),
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv06',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220106', -- Moanalua
  '22222222-2222-2222-2222-222222220109', -- Pearl City
  '2025-10-23 17:30:00-10',
  'Moanalua High School',
  'final',
  3, 0,
  true, 'trusted', 'regular_season', 0
),
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv07',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220111', -- Kailua
  '22222222-2222-2222-2222-222222220114', -- Kalani
  '2025-10-23 18:00:00-10',
  'Kailua High School',
  'final',
  2, 3, -- 5-set loss
  true, 'trusted', 'regular_season', 0
);

-- Girls Volleyball State Tournament - November 2025
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
-- Division I Semifinal
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv08',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220202', -- Punahou
  '22222222-2222-2222-2222-222222220102', -- Mililani
  '2025-11-01 17:00:00-10',
  'Blaisdell Arena',
  'final',
  3, 1,
  true, 'trusted', 'playoff', 0
),
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv09',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220203', -- Kamehameha
  '22222222-2222-2222-2222-222222220204', -- Iolani
  '2025-11-01 19:00:00-10',
  'Blaisdell Arena',
  'final',
  3, 2,
  true, 'trusted', 'playoff', 0
),
-- Division I Championship
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv10',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220202', -- Punahou
  '22222222-2222-2222-2222-222222220203', -- Kamehameha
  '2025-11-02 18:00:00-10',
  'Blaisdell Arena',
  'final',
  3, 1,
  true, 'trusted', 'championship', 0
);

-- BIIF Girls Volleyball
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv11',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220401', -- Hilo
  '22222222-2222-2222-2222-222222220402', -- Waiakea
  '2025-10-15 18:00:00-10',
  'Hilo High School',
  'final',
  3, 2,
  true, 'trusted', 'regular_season', 0
),
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv12',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220405', -- Konawaena
  '22222222-2222-2222-2222-222222220404', -- Kealakehe
  '2025-10-15 17:30:00-10',
  'Konawaena High School',
  'final',
  3, 0,
  true, 'trusted', 'regular_season', 0
);

-- MIL Girls Volleyball
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv13',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220301', -- Lahainaluna
  '22222222-2222-2222-2222-222222220302', -- Baldwin
  '2025-10-14 18:00:00-10',
  'Lahainaluna High School',
  'final',
  3, 1,
  true, 'trusted', 'regular_season', 0
),
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv14',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220304', -- Kamehameha Maui
  '22222222-2222-2222-2222-222222220303', -- Maui High
  '2025-10-14 17:00:00-10',
  'Kamehameha Maui',
  'final',
  3, 0,
  true, 'trusted', 'regular_season', 0
);

-- KIF Girls Volleyball
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  home_score, away_score, is_verified, verification_method, game_type, overtime_count
) VALUES
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv15',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220501', -- Kapaa
  '22222222-2222-2222-2222-222222220502', -- Kauai High
  '2025-10-16 18:00:00-10',
  'Kapaa High School',
  'final',
  3, 2,
  true, 'trusted', 'regular_season', 0
),
(
  'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv16',
  '11111111-1111-1111-1111-111111111201',
  '22222222-2222-2222-2222-222222220503', -- Waimea
  '22222222-2222-2222-2222-222222220504', -- Island School
  '2025-10-16 17:00:00-10',
  'Waimea High School',
  'final',
  3, 0,
  true, 'trusted', 'regular_season', 0
);

-- ============================================
-- COMMENT
-- ============================================
COMMENT ON TABLE games IS 'Games table now includes football (fall), girls volleyball (fall), basketball (winter), and soccer (winter) seasons';
