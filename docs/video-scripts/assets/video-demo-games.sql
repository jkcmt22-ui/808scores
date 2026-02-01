-- ============================================
-- HAWAII SPORTS CENTER - VIDEO DEMO GAMES
-- Date Range: January 31 - February 7, 2026
-- ============================================
--
-- These games use ID prefix 'dddddddd-dddd-dddd-dddd-' for easy cleanup.
-- Winter sports season: Basketball and Soccer
--
-- TO REVERSE: Run the cleanup section at the bottom of this file.
-- ============================================

-- ============================================
-- SATURDAY, JANUARY 31, 2026 (TODAY)
-- ============================================

-- LIVE: OIA Boys Basketball - Open Division (Golden Game!)
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count, golden_game, current_period, time_remaining)
VALUES ('dddddddd-dddd-dddd-dddd-000000000101', '11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220101', '22222222-2222-2222-2222-222222220103', '2026-01-31 19:00:00-10', 'Kahuku Gym', 'in_progress', 52, 48, false, 'regular_season', 0, true, 'Q4', '3:45');

-- LIVE: ILH Girls Basketball
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count, current_period, time_remaining)
VALUES ('dddddddd-dddd-dddd-dddd-000000000102', '11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220203', '22222222-2222-2222-2222-222222220202', '2026-01-31 18:00:00-10', 'Kamehameha Kekuhaupio Gym', 'in_progress', 38, 41, false, 'regular_season', 0, 'Q3', '2:15');

-- LIVE: Boys Soccer - ILH
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count, current_period, time_remaining)
VALUES ('dddddddd-dddd-dddd-dddd-000000000103', '11111111-1111-1111-1111-111111111204', '22222222-2222-2222-2222-222222220204', '22222222-2222-2222-2222-222222220201', '2026-01-31 17:00:00-10', 'Iolani Field', 'in_progress', 2, 1, false, 'regular_season', 0, '2nd Half', '18:00');

-- Final: OIA Boys Basketball - D1 (earlier game)
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, verification_method, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000104', '11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220106', '22222222-2222-2222-2222-222222220107', '2026-01-31 14:00:00-10', 'Moanalua Gym', 'final', 68, 62, true, 'trusted', 'regular_season', 0);

-- Final: OIA Girls Basketball - D1 (earlier game)
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, verification_method, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000105', '11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220106', '22222222-2222-2222-2222-222222220107', '2026-01-31 12:30:00-10', 'Moanalua Gym', 'final', 55, 48, true, 'trusted', 'regular_season', 0);

-- Final: Girls Soccer - OIA (earlier game)
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, verification_method, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000106', '11111111-1111-1111-1111-111111111205', '22222222-2222-2222-2222-222222220102', '22222222-2222-2222-2222-222222220104', '2026-01-31 11:00:00-10', 'Mililani Field', 'final', 3, 1, true, 'trusted', 'regular_season', 0);

-- Scheduled: MIL Boys Basketball (later tonight)
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000107', '11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220301', '22222222-2222-2222-2222-222222220302', '2026-01-31 19:30:00-10', 'Lahainaluna Gym', 'scheduled', 0, 0, false, 'regular_season', 0);

-- Scheduled: BIIF Girls Basketball (later tonight)
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000108', '11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220401', '22222222-2222-2222-2222-222222220402', '2026-01-31 18:00:00-10', 'Hilo Civic Auditorium', 'scheduled', 0, 0, false, 'regular_season', 0);

-- ============================================
-- TUESDAY, FEBRUARY 3, 2026
-- ============================================

-- OIA Boys Basketball - D1
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000301', '11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220109', '22222222-2222-2222-2222-222222220108', '2026-02-03 19:00:00-10', 'Pearl City Gym', 'scheduled', 0, 0, false, 'regular_season', 0);

-- OIA Girls Basketball - D1
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000302', '11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220109', '22222222-2222-2222-2222-222222220108', '2026-02-03 17:30:00-10', 'Pearl City Gym', 'scheduled', 0, 0, false, 'regular_season', 0);

-- ILH Boys Basketball
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000303', '11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220202', '22222222-2222-2222-2222-222222220201', '2026-02-03 18:30:00-10', 'Punahou Gym', 'scheduled', 0, 0, false, 'regular_season', 0);

-- ILH Girls Soccer
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000304', '11111111-1111-1111-1111-111111111205', '22222222-2222-2222-2222-222222220203', '22222222-2222-2222-2222-222222220202', '2026-02-03 16:00:00-10', 'Kamehameha Field', 'scheduled', 0, 0, false, 'regular_season', 0);

-- ============================================
-- WEDNESDAY, FEBRUARY 4, 2026
-- ============================================

-- OIA Boys Basketball - D2
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000401', '11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220111', '22222222-2222-2222-2222-222222220112', '2026-02-04 19:00:00-10', 'Kailua Gym', 'scheduled', 0, 0, false, 'regular_season', 0);

-- OIA Girls Basketball - D2
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000402', '11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220111', '22222222-2222-2222-2222-222222220112', '2026-02-04 17:30:00-10', 'Kailua Gym', 'scheduled', 0, 0, false, 'regular_season', 0);

-- Boys Soccer - OIA
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000403', '11111111-1111-1111-1111-111111111204', '22222222-2222-2222-2222-222222220103', '22222222-2222-2222-2222-222222220104', '2026-02-04 19:00:00-10', 'Campbell Stadium', 'scheduled', 0, 0, false, 'regular_season', 0);

-- Girls Soccer - OIA
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000404', '11111111-1111-1111-1111-111111111205', '22222222-2222-2222-2222-222222220103', '22222222-2222-2222-2222-222222220104', '2026-02-04 17:00:00-10', 'Campbell Stadium', 'scheduled', 0, 0, false, 'regular_season', 0);

-- ============================================
-- THURSDAY, FEBRUARY 5, 2026
-- ============================================

-- ILH Boys Basketball
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000501', '11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220204', '22222222-2222-2222-2222-222222220203', '2026-02-05 18:30:00-10', 'Iolani Gym', 'scheduled', 0, 0, false, 'regular_season', 0);

-- ILH Girls Basketball
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000502', '11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220204', '22222222-2222-2222-2222-222222220203', '2026-02-05 17:00:00-10', 'Iolani Gym', 'scheduled', 0, 0, false, 'regular_season', 0);

-- KIF Boys Basketball
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000503', '11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220501', '22222222-2222-2222-2222-222222220502', '2026-02-05 19:00:00-10', 'Kapaa Gym', 'scheduled', 0, 0, false, 'regular_season', 0);

-- KIF Girls Basketball
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000504', '11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220501', '22222222-2222-2222-2222-222222220502', '2026-02-05 17:30:00-10', 'Kapaa Gym', 'scheduled', 0, 0, false, 'regular_season', 0);

-- ============================================
-- FRIDAY, FEBRUARY 6, 2026
-- ============================================

-- OIA Boys Basketball - Open (Big rivalry game!)
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count, golden_game)
VALUES ('dddddddd-dddd-dddd-dddd-000000000601', '11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220102', '22222222-2222-2222-2222-222222220101', '2026-02-06 19:00:00-10', 'Mililani Gym', 'scheduled', 0, 0, false, 'regular_season', 0, true);

-- OIA Girls Basketball - Open
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000602', '11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220102', '22222222-2222-2222-2222-222222220101', '2026-02-06 17:30:00-10', 'Mililani Gym', 'scheduled', 0, 0, false, 'regular_season', 0);

-- BIIF Boys Basketball
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000603', '11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220405', '22222222-2222-2222-2222-222222220406', '2026-02-06 19:00:00-10', 'Konawaena Gym', 'scheduled', 0, 0, false, 'regular_season', 0);

-- MIL Boys Soccer
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000604', '11111111-1111-1111-1111-111111111204', '22222222-2222-2222-2222-222222220304', '22222222-2222-2222-2222-222222220301', '2026-02-06 16:00:00-10', 'Kamehameha Maui Field', 'scheduled', 0, 0, false, 'regular_season', 0);

-- ============================================
-- SATURDAY, FEBRUARY 7, 2026
-- ============================================

-- OIA Boys Basketball - D1
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000701', '11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220110', '22222222-2222-2222-2222-222222220106', '2026-02-07 19:00:00-10', 'Radford Gym', 'scheduled', 0, 0, false, 'regular_season', 0);

-- OIA Girls Basketball - D1
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000702', '11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220110', '22222222-2222-2222-2222-222222220106', '2026-02-07 17:30:00-10', 'Radford Gym', 'scheduled', 0, 0, false, 'regular_season', 0);

-- ILH Boys Basketball - Championship Preview
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count, golden_game)
VALUES ('dddddddd-dddd-dddd-dddd-000000000703', '11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220201', '22222222-2222-2222-2222-222222220204', '2026-02-07 18:30:00-10', 'Saint Louis Gymnasium', 'scheduled', 0, 0, false, 'regular_season', 0, true);

-- ILH Girls Basketball
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000704', '11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220201', '22222222-2222-2222-2222-222222220204', '2026-02-07 17:00:00-10', 'Saint Louis Gymnasium', 'scheduled', 0, 0, false, 'regular_season', 0);

-- Boys Soccer - ILH
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000705', '11111111-1111-1111-1111-111111111204', '22222222-2222-2222-2222-222222220202', '22222222-2222-2222-2222-222222220203', '2026-02-07 16:00:00-10', 'Punahou Field', 'scheduled', 0, 0, false, 'regular_season', 0);

-- Girls Soccer - ILH
INSERT INTO games (id, sport_id, home_team_id, away_team_id, scheduled_at, venue, status, home_score, away_score, is_verified, game_type, overtime_count)
VALUES ('dddddddd-dddd-dddd-dddd-000000000706', '11111111-1111-1111-1111-111111111205', '22222222-2222-2222-2222-222222220202', '22222222-2222-2222-2222-222222220203', '2026-02-07 14:00:00-10', 'Punahou Field', 'scheduled', 0, 0, false, 'regular_season', 0);


-- ============================================
-- SUMMARY
-- ============================================
-- Total games inserted: 28
--
-- By date:
--   Sat Jan 31: 8 games (3 live, 3 final, 2 scheduled)
--   Tue Feb 3:  4 games (scheduled)
--   Wed Feb 4:  4 games (scheduled)
--   Thu Feb 5:  4 games (scheduled)
--   Fri Feb 6:  4 games (scheduled)
--   Sat Feb 7:  6 games (scheduled)
--
-- No games on Sun Feb 1 or Mon Feb 2 (realistic)
--
-- By sport:
--   Boys Basketball: 12 games
--   Girls Basketball: 10 games
--   Boys Soccer: 4 games
--   Girls Soccer: 4 games
--
-- Golden Games: 3 (for 3x points demo)
-- Live Games: 3 (for real-time demo)
-- ============================================


-- ============================================
-- CLEANUP: Run this to remove all demo games
-- ============================================
--
-- DELETE FROM games WHERE id LIKE 'dddddddd-dddd-dddd-dddd-%';
--
-- Verification after cleanup:
-- SELECT COUNT(*) FROM games WHERE id LIKE 'dddddddd-dddd-dddd-dddd-%';
-- (Should return 0)
-- ============================================
