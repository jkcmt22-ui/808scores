-- Hawaii Sports Center Test Games
-- Sample games for development and testing

-- ============================================
-- TEST GAMES - Today's Date
-- ============================================

-- Use variables for today's date calculations
-- Note: Run this in Supabase SQL Editor

-- LIVE Football Game - Kahuku vs Mililani (Playoff)
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  current_period, time_remaining, home_score, away_score, is_overtime,
  is_verified, verification_method, golden_game, game_type, overtime_count
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111101', -- Football
  '22222222-2222-2222-2222-222222220101', -- Kahuku
  '22222222-2222-2222-2222-222222220102', -- Mililani
  NOW(),
  'Kahuku High School Stadium',
  'in_progress',
  'Q3', '8:42',
  21, 14,
  false, true, 'trusted', true,
  'playoff', 0
);

-- LIVE Girls Volleyball - Kapolei vs Lahainaluna
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  current_period, time_remaining, home_score, away_score, is_overtime,
  is_verified, verification_method, golden_game, game_type, overtime_count
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
  '11111111-1111-1111-1111-111111111201', -- Girls Volleyball
  '22222222-2222-2222-2222-222222220104', -- Kapolei
  '22222222-2222-2222-2222-222222220301', -- Lahainaluna
  NOW(),
  'Kapolei High School Gym',
  'in_progress',
  'Set 3', NULL,
  2, 0,
  false, true, 'timer', false,
  'regular_season', 0
);

-- FINAL Boys Basketball - Saint Louis vs Punahou (with OT)
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  current_period, time_remaining, home_score, away_score, is_overtime,
  is_verified, verification_method, golden_game, game_type, overtime_count
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220201', -- Saint Louis
  '22222222-2222-2222-2222-222222220202', -- Punahou
  NOW() - INTERVAL '3 hours',
  'Saint Louis Gymnasium',
  'final',
  NULL, NULL,
  68, 72,
  true, true, 'majority', false,
  'regular_season', 1
);

-- FINAL Girls Basketball - Kamehameha vs Iolani
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  current_period, time_remaining, home_score, away_score, is_overtime,
  is_verified, verification_method, golden_game, game_type, overtime_count
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad',
  '11111111-1111-1111-1111-111111111203', -- Girls Basketball
  '22222222-2222-2222-2222-222222220203', -- Kamehameha
  '22222222-2222-2222-2222-222222220204', -- Iolani
  NOW() - INTERVAL '2 hours',
  'Kamehameha Kekuhaupio Gym',
  'final',
  NULL, NULL,
  55, 48,
  false, true, 'trusted', false,
  'tournament', 0
);

-- SCHEDULED Football - Kamehameha vs Campbell (Championship)
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  current_period, time_remaining, home_score, away_score, is_overtime,
  is_verified, verification_method, golden_game, game_type, overtime_count
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae',
  '11111111-1111-1111-1111-111111111101', -- Football
  '22222222-2222-2222-2222-222222220203', -- Kamehameha
  '22222222-2222-2222-2222-222222220103', -- Campbell
  NOW() + INTERVAL '3 hours',
  'Aloha Stadium',
  'scheduled',
  NULL, NULL,
  0, 0,
  false, false, NULL, true,
  'championship', 0
);

-- SCHEDULED Boys Soccer - Hilo vs Waiakea
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  current_period, time_remaining, home_score, away_score, is_overtime,
  is_verified, verification_method, golden_game, game_type, overtime_count
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaf',
  '11111111-1111-1111-1111-111111111204', -- Boys Soccer
  '22222222-2222-2222-2222-222222220401', -- Hilo
  '22222222-2222-2222-2222-222222220402', -- Waiakea
  NOW() + INTERVAL '5 hours',
  'Hilo High School Field',
  'scheduled',
  NULL, NULL,
  0, 0,
  false, false, NULL, false,
  'regular_season', 0
);

-- SCHEDULED Girls Soccer - Baldwin vs Maui High
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  current_period, time_remaining, home_score, away_score, is_overtime,
  is_verified, verification_method, golden_game, game_type, overtime_count
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab0',
  '11111111-1111-1111-1111-111111111205', -- Girls Soccer
  '22222222-2222-2222-2222-222222220302', -- Baldwin
  '22222222-2222-2222-2222-222222220303', -- Maui High
  NOW() + INTERVAL '4 hours',
  'War Memorial Stadium',
  'scheduled',
  NULL, NULL,
  0, 0,
  false, false, NULL, false,
  'playoff', 0
);

-- EXHIBITION Boys Basketball - Moanalua vs Leilehua
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  current_period, time_remaining, home_score, away_score, is_overtime,
  is_verified, verification_method, golden_game, game_type, overtime_count
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab1',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220106', -- Moanalua
  '22222222-2222-2222-2222-222222220107', -- Leilehua
  NOW() + INTERVAL '2 hours',
  'Moanalua High School Gym',
  'scheduled',
  NULL, NULL,
  0, 0,
  false, false, NULL, false,
  'exhibition', 0
);

-- SCRIMMAGE Girls Volleyball - Pearl City vs Aiea (Final)
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  current_period, time_remaining, home_score, away_score, is_overtime,
  is_verified, verification_method, golden_game, game_type, overtime_count
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab2',
  '11111111-1111-1111-1111-111111111201', -- Girls Volleyball
  '22222222-2222-2222-2222-222222220109', -- Pearl City
  '22222222-2222-2222-2222-222222220108', -- Aiea
  NOW() - INTERVAL '1 hour',
  'Pearl City High School Gym',
  'final',
  NULL, NULL,
  3, 1,
  false, false, NULL, false,
  'scrimmage', 0
);

-- LIVE Boys Basketball - Kapaa vs Kauai High
INSERT INTO games (
  id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status,
  current_period, time_remaining, home_score, away_score, is_overtime,
  is_verified, verification_method, golden_game, game_type, overtime_count
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab3',
  '11111111-1111-1111-1111-111111111202', -- Boys Basketball
  '22222222-2222-2222-2222-222222220501', -- Kapaa
  '22222222-2222-2222-2222-222222220502', -- Kauai High
  NOW(),
  'Kapaa High School Gym',
  'in_progress',
  'Q4', '3:15',
  58, 62,
  false, true, 'trusted', false,
  'regular_season', 0
);
