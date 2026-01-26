-- Migration 033: January-February 2026 Game Schedule
-- Source: Honolulu Star-Advertiser, ScoringLive, HHSAA
-- Basketball and Soccer games for late January 2026

-- ============================================
-- JANUARY 26, 2026 - BASKETBALL
-- ============================================

-- ILH Boys Varsity I
-- Iolani vs University at Saint Louis 5pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220204', '22222222-2222-2222-2222-222222220210', '2026-01-26 17:00:00-10', 'Saint Louis School', 'scheduled', 'regular_season');

-- Maryknoll at Punahou 5pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220202', '22222222-2222-2222-2222-222222220209', '2026-01-26 17:00:00-10', 'Punahou School', 'scheduled', 'regular_season');

-- Kamehameha at Saint Louis 6:30pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220201', '22222222-2222-2222-2222-222222220203', '2026-01-26 18:30:00-10', 'Saint Louis School', 'scheduled', 'regular_season');

-- ILH Boys Varsity II
-- Hanalani at Hawaii Baptist 6pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220207', '22222222-2222-2222-2222-222222220215', '2026-01-26 18:00:00-10', 'Hawaii Baptist Academy', 'scheduled', 'regular_season');

-- Island Pacific at Hawaiian Mission 6pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220216', '22222222-2222-2222-2222-222222220219', '2026-01-26 18:00:00-10', 'Hawaiian Mission Academy', 'scheduled', 'regular_season');

-- Damien at Le Jardin 6pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220212', '22222222-2222-2222-2222-222222220205', '2026-01-26 18:00:00-10', 'Le Jardin Academy', 'scheduled', 'regular_season');

-- ILH Boys Varsity I-AA: Kamehameha at Punahou 6:30pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220202', '22222222-2222-2222-2222-222222220203', '2026-01-26 18:30:00-10', 'Punahou School', 'scheduled', 'regular_season');

-- ILH Girls Varsity I: Maryknoll at Kamehameha (Tournament) 6pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220203', '22222222-2222-2222-2222-222222220209', '2026-01-26 18:00:00-10', 'Kamehameha Schools', 'scheduled', 'tournament');

-- OIA Girls Division I Tournament Semifinals at McKinley
-- Mililani vs Kalani 5:30pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220102', '22222222-2222-2222-2222-222222220114', '2026-01-26 17:30:00-10', 'McKinley High School', 'scheduled', 'tournament');

-- Moanalua vs Campbell 7:30pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220106', '22222222-2222-2222-2222-222222220103', '2026-01-26 19:30:00-10', 'McKinley High School', 'scheduled', 'tournament');

-- OIA Girls Division I Fifth Place Semifinals
-- Radford at Kailua 6pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220111', '22222222-2222-2222-2222-222222220110', '2026-01-26 18:00:00-10', 'Kailua High School', 'scheduled', 'tournament');

-- Farrington at Leilehua 6pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220107', '22222222-2222-2222-2222-222222220116', '2026-01-26 18:00:00-10', 'Leilehua High School', 'scheduled', 'tournament');

-- ============================================
-- JANUARY 26, 2026 - GIRLS SOCCER STATE CHAMPIONSHIPS
-- ============================================

-- Hele/HHSAA Girls Division I State Championships - First Round
-- Mililani at Waiakea 2pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111205', '22222222-2222-2222-2222-222222220402', '22222222-2222-2222-2222-222222220102', '2026-01-26 14:00:00-10', 'Waiakea High School', 'scheduled', 'championship');

-- Kalani at Kamehameha-Maui 3:30pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111205', '22222222-2222-2222-2222-222222220304', '22222222-2222-2222-2222-222222220114', '2026-01-26 15:30:00-10', 'Kamehameha Schools Maui', 'scheduled', 'championship');

-- Pearl City at Punahou 3:30pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111205', '22222222-2222-2222-2222-222222220202', '22222222-2222-2222-2222-222222220109', '2026-01-26 15:30:00-10', 'Punahou School', 'scheduled', 'championship');

-- Kahuku at Kaiser 6pm
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111205', '22222222-2222-2222-2222-222222220120', '22222222-2222-2222-2222-222222220101', '2026-01-26 18:00:00-10', 'Kaiser High School', 'scheduled', 'championship');

-- ============================================
-- JANUARY 29-31, 2026 - GIRLS SOCCER STATE CHAMPIONSHIPS
-- (Semifinals and Finals at Waipio Peninsula Soccer Complex)
-- ============================================

-- Division I Semifinals - January 29
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111205', '22222222-2222-2222-2222-222222220202', '22222222-2222-2222-2222-222222220402', '2026-01-29 17:00:00-10', 'Waipio Peninsula Soccer Complex', 'scheduled', 'championship'),
('11111111-1111-1111-1111-111111111205', '22222222-2222-2222-2222-222222220120', '22222222-2222-2222-2222-222222220304', '2026-01-29 19:00:00-10', 'Waipio Peninsula Soccer Complex', 'scheduled', 'championship');

-- Division I Finals - January 31
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111205', '22222222-2222-2222-2222-222222220202', '22222222-2222-2222-2222-222222220120', '2026-01-31 17:00:00-10', 'Waipio Peninsula Soccer Complex', 'scheduled', 'championship');

-- ============================================
-- FEBRUARY 2026 - BASKETBALL STATE TOURNAMENTS
-- (Based on HHSAA typical schedule)
-- ============================================

-- Girls Basketball Division I State Tournament - February 5-7
-- First Round - February 5
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220203', '22222222-2222-2222-2222-222222220102', '2026-02-05 17:00:00-10', 'Moanalua High School', 'scheduled', 'championship'),
('11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220202', '22222222-2222-2222-2222-222222220401', '2026-02-05 19:00:00-10', 'Moanalua High School', 'scheduled', 'championship');

-- Semifinals - February 6
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220203', '22222222-2222-2222-2222-222222220202', '2026-02-06 17:00:00-10', 'Neal Blaisdell Center', 'scheduled', 'championship'),
('11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220204', '22222222-2222-2222-2222-222222220102', '2026-02-06 19:00:00-10', 'Neal Blaisdell Center', 'scheduled', 'championship');

-- Finals - February 7
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111203', '22222222-2222-2222-2222-222222220203', '22222222-2222-2222-2222-222222220204', '2026-02-07 17:00:00-10', 'Neal Blaisdell Center', 'scheduled', 'championship');

-- Boys Basketball Division I State Tournament - February 19-21
-- First Round - February 19
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220201', '22222222-2222-2222-2222-222222220102', '2026-02-19 17:00:00-10', 'McKinley High School', 'scheduled', 'championship'),
('11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220203', '22222222-2222-2222-2222-222222220401', '2026-02-19 19:00:00-10', 'McKinley High School', 'scheduled', 'championship'),
('11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220202', '22222222-2222-2222-2222-222222220101', '2026-02-19 17:00:00-10', 'Moanalua High School', 'scheduled', 'championship'),
('11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220204', '22222222-2222-2222-2222-222222220106', '2026-02-19 19:00:00-10', 'Moanalua High School', 'scheduled', 'championship');

-- Semifinals - February 20
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220201', '22222222-2222-2222-2222-222222220203', '2026-02-20 17:00:00-10', 'Stan Sheriff Center', 'scheduled', 'championship'),
('11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220202', '22222222-2222-2222-2222-222222220204', '2026-02-20 19:00:00-10', 'Stan Sheriff Center', 'scheduled', 'championship');

-- Finals - February 21
INSERT INTO games (sport_id, home_team_id, away_team_id, scheduled_at, venue, status, game_type) VALUES
('11111111-1111-1111-1111-111111111202', '22222222-2222-2222-2222-222222220201', '22222222-2222-2222-2222-222222220202', '2026-02-21 19:00:00-10', 'Stan Sheriff Center', 'scheduled', 'championship');
