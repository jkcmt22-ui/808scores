-- Hawaii Sports Center Seed Data
-- Hawaii High Schools, Sports, and Sample Data

-- ============================================
-- SPORTS
-- ============================================
INSERT INTO sports (id, name, code, periods_config, season, active) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Football', 'football', '{"count": 4, "names": ["Q1", "Q2", "Q3", "Q4"]}', 'fall', true),
  ('11111111-1111-1111-1111-111111111102', 'Basketball', 'basketball', '{"count": 4, "names": ["Q1", "Q2", "Q3", "Q4"]}', 'winter', true),
  ('11111111-1111-1111-1111-111111111103', 'Volleyball', 'volleyball', '{"count": 5, "names": ["Set 1", "Set 2", "Set 3", "Set 4", "Set 5"]}', 'fall', true),
  ('11111111-1111-1111-1111-111111111104', 'Baseball', 'baseball', '{"count": 9, "names": ["1", "2", "3", "4", "5", "6", "7", "8", "9"]}', 'spring', true),
  ('11111111-1111-1111-1111-111111111105', 'Softball', 'softball', '{"count": 7, "names": ["1", "2", "3", "4", "5", "6", "7"]}', 'spring', true),
  ('11111111-1111-1111-1111-111111111106', 'Soccer', 'soccer', '{"count": 2, "names": ["1st Half", "2nd Half"]}', 'winter', true);

-- ============================================
-- OAHU SCHOOLS - OIA
-- ============================================
INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors) VALUES
  -- OIA Open Division
  ('22222222-2222-2222-2222-222222220101', 'Kahuku High School', 'Kahuku', 'Red Raiders', 'Oahu', 'OIA', 'Open', '{"primary": "#CC0000", "secondary": "#000000"}'),
  ('22222222-2222-2222-2222-222222220102', 'Mililani High School', 'Mililani', 'Trojans', 'Oahu', 'OIA', 'Open', '{"primary": "#000080", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220103', 'Campbell High School', 'Campbell', 'Sabers', 'Oahu', 'OIA', 'Open', '{"primary": "#FFD700", "secondary": "#000000"}'),
  ('22222222-2222-2222-2222-222222220104', 'Kapolei High School', 'Kapolei', 'Hurricanes', 'Oahu', 'OIA', 'Open', '{"primary": "#FF0000", "secondary": "#000000"}'),
  ('22222222-2222-2222-2222-222222220105', 'Waianae High School', 'Waianae', 'Seariders', 'Oahu', 'OIA', 'Open', '{"primary": "#008000", "secondary": "#FFD700"}'),

  -- OIA Division I
  ('22222222-2222-2222-2222-222222220106', 'Moanalua High School', 'Moanalua', 'Menehunes', 'Oahu', 'OIA', 'Division I', '{"primary": "#0000FF", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220107', 'Leilehua High School', 'Leilehua', 'Mules', 'Oahu', 'OIA', 'Division I', '{"primary": "#800000", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220108', 'Aiea High School', 'Aiea', 'Na Alii', 'Oahu', 'OIA', 'Division I', '{"primary": "#FF0000", "secondary": "#000000"}'),
  ('22222222-2222-2222-2222-222222220109', 'Pearl City High School', 'Pearl City', 'Chargers', 'Oahu', 'OIA', 'Division I', '{"primary": "#0000FF", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220110', 'Radford High School', 'Radford', 'Rams', 'Oahu', 'OIA', 'Division I', '{"primary": "#FF0000", "secondary": "#000000"}'),

  -- OIA Division II
  ('22222222-2222-2222-2222-222222220111', 'Kailua High School', 'Kailua', 'Surfriders', 'Oahu', 'OIA', 'Division II', '{"primary": "#0000FF", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220112', 'Kalaheo High School', 'Kalaheo', 'Mustangs', 'Oahu', 'OIA', 'Division II', '{"primary": "#008000", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220113', 'Roosevelt High School', 'Roosevelt', 'Rough Riders', 'Oahu', 'OIA', 'Division II', '{"primary": "#FF0000", "secondary": "#000000"}'),
  ('22222222-2222-2222-2222-222222220114', 'Kalani High School', 'Kalani', 'Falcons', 'Oahu', 'OIA', 'Division II', '{"primary": "#000080", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220115', 'Castle High School', 'Castle', 'Knights', 'Oahu', 'OIA', 'Division II', '{"primary": "#800000", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220116', 'Farrington High School', 'Farrington', 'Governors', 'Oahu', 'OIA', 'Division II', '{"primary": "#0000FF", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220117', 'McKinley High School', 'McKinley', 'Tigers', 'Oahu', 'OIA', 'Division II', '{"primary": "#000000", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220118', 'Nanakuli High School', 'Nanakuli', 'Golden Hawks', 'Oahu', 'OIA', 'Division II', '{"primary": "#FFD700", "secondary": "#000000"}'),
  ('22222222-2222-2222-2222-222222220119', 'Waipahu High School', 'Waipahu', 'Marauders', 'Oahu', 'OIA', 'Division II', '{"primary": "#800000", "secondary": "#FFFFFF"}');

-- ============================================
-- OAHU SCHOOLS - ILH
-- ============================================
INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors) VALUES
  ('22222222-2222-2222-2222-222222220201', 'Saint Louis School', 'Saint Louis', 'Crusaders', 'Oahu', 'ILH', 'Open', '{"primary": "#0000FF", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220202', 'Punahou School', 'Punahou', 'Buffanblu', 'Oahu', 'ILH', 'Open', '{"primary": "#003366", "secondary": "#FFCC00"}'),
  ('22222222-2222-2222-2222-222222220203', 'Kamehameha Schools', 'Kamehameha', 'Warriors', 'Oahu', 'ILH', 'Open', '{"primary": "#00008B", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220204', '''Iolani School', '''Iolani', 'Raiders', 'Oahu', 'ILH', 'Open', '{"primary": "#FF0000", "secondary": "#000000"}'),
  ('22222222-2222-2222-2222-222222220205', 'Damien Memorial School', 'Damien', 'Monarchs', 'Oahu', 'ILH', 'Division I', '{"primary": "#800000", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220206', 'Mid-Pacific Institute', 'Mid-Pacific', 'Owls', 'Oahu', 'ILH', 'Division I', '{"primary": "#000080", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220207', 'Hawaii Baptist Academy', 'HBA', 'Eagles', 'Oahu', 'ILH', 'Division II', '{"primary": "#000080", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220208', 'Sacred Hearts Academy', 'Sacred Hearts', 'Lancers', 'Oahu', 'ILH', 'Division II', '{"primary": "#800000", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220209', 'Maryknoll School', 'Maryknoll', 'Spartans', 'Oahu', 'ILH', 'Division II', '{"primary": "#008000", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220210', 'University Laboratory School', 'University Lab', 'Jr. Rainbows', 'Oahu', 'ILH', 'Division III', '{"primary": "#008000", "secondary": "#FFFFFF"}');

-- ============================================
-- MAUI SCHOOLS - MIL
-- ============================================
INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors) VALUES
  ('22222222-2222-2222-2222-222222220301', 'Lahainaluna High School', 'Lahainaluna', 'Lunas', 'Maui', 'MIL', 'Division I', '{"primary": "#800000", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220302', 'Baldwin High School', 'Baldwin', 'Bears', 'Maui', 'MIL', 'Division I', '{"primary": "#0000FF", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220303', 'Maui High School', 'Maui High', 'Sabers', 'Maui', 'MIL', 'Division I', '{"primary": "#FF0000", "secondary": "#000000"}'),
  ('22222222-2222-2222-2222-222222220304', 'Kamehameha Schools Maui', 'Kamehameha Maui', 'Warriors', 'Maui', 'MIL', 'Division I', '{"primary": "#00008B", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220305', 'King Kekaulike High School', 'King Kekaulike', 'Na Alii', 'Maui', 'MIL', 'Division II', '{"primary": "#800000", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220306', 'Seabury Hall', 'Seabury', 'Spartans', 'Maui', 'MIL', 'Division II', '{"primary": "#000080", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220307', 'Molokai High School', 'Molokai', 'Farmers', 'Molokai', 'MIL', 'Division II', '{"primary": "#008000", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220308', 'Lanai High School', 'Lanai', 'Pine Lads', 'Lanai', 'MIL', 'Division II', '{"primary": "#008000", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220309', 'Hana High School', 'Hana', 'Dragons', 'Maui', 'MIL', 'Division II', '{"primary": "#FF0000", "secondary": "#FFD700"}');

-- ============================================
-- BIG ISLAND SCHOOLS - BIIF
-- ============================================
INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors) VALUES
  ('22222222-2222-2222-2222-222222220401', 'Hilo High School', 'Hilo', 'Vikings', 'Hawaii', 'BIIF', 'Division I', '{"primary": "#0000FF", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220402', 'Waiakea High School', 'Waiakea', 'Warriors', 'Hawaii', 'BIIF', 'Division I', '{"primary": "#FF0000", "secondary": "#000000"}'),
  ('22222222-2222-2222-2222-222222220403', 'Keaau High School', 'Keaau', 'Cougars', 'Hawaii', 'BIIF', 'Division I', '{"primary": "#008000", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220404', 'Kealakehe High School', 'Kealakehe', 'Waveriders', 'Hawaii', 'BIIF', 'Division I', '{"primary": "#0000FF", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220405', 'Konawaena High School', 'Konawaena', 'Wildcats', 'Hawaii', 'BIIF', 'Division I', '{"primary": "#800000", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220406', 'Kamehameha Schools Hawaii', 'Kamehameha Hawaii', 'Warriors', 'Hawaii', 'BIIF', 'Division I', '{"primary": "#00008B", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220407', 'Honokaa High School', 'Honokaa', 'Dragons', 'Hawaii', 'BIIF', 'Division II', '{"primary": "#FF0000", "secondary": "#000000"}'),
  ('22222222-2222-2222-2222-222222220408', 'Pahoa High School', 'Pahoa', 'Daggers', 'Hawaii', 'BIIF', 'Division II', '{"primary": "#008000", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220409', 'Hawaii Preparatory Academy', 'HPA', 'Ka Makani', 'Hawaii', 'BIIF', 'Division II', '{"primary": "#000080", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220410', 'Parker School', 'Parker', 'Panthers', 'Hawaii', 'BIIF', 'Division II', '{"primary": "#000000", "secondary": "#FFD700"}');

-- ============================================
-- KAUAI SCHOOLS - KIF
-- ============================================
INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors) VALUES
  ('22222222-2222-2222-2222-222222220501', 'Kapaa High School', 'Kapaa', 'Warriors', 'Kauai', 'KIF', 'Division I', '{"primary": "#800000", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220502', 'Kauai High School', 'Kauai', 'Red Raiders', 'Kauai', 'KIF', 'Division I', '{"primary": "#FF0000", "secondary": "#000000"}'),
  ('22222222-2222-2222-2222-222222220503', 'Waimea High School', 'Waimea', 'Menehunes', 'Kauai', 'KIF', 'Division II', '{"primary": "#0000FF", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220504', 'Island School', 'Island School', 'Islanders', 'Kauai', 'KIF', 'Division II', '{"primary": "#008000", "secondary": "#FFFFFF"}');

-- ============================================
-- BADGES
-- ============================================
INSERT INTO badges (id, code, name, description, icon_url, category) VALUES
  ('33333333-3333-3333-3333-333333330101', 'first_score', 'First Score', 'Submitted your first verified score', null, 'milestone'),
  ('33333333-3333-3333-3333-333333330102', 'ten_club', '10 Club', 'Submitted 10 verified scores', null, 'milestone'),
  ('33333333-3333-3333-3333-333333330103', 'fifty_club', '50 Club', 'Submitted 50 verified scores', null, 'milestone'),
  ('33333333-3333-3333-3333-333333330104', 'century_club', 'Century Club', 'Submitted 100 verified scores', null, 'milestone'),
  ('33333333-3333-3333-3333-333333330105', 'five_hundred_club', '500 Club', 'Submitted 500 verified scores', null, 'milestone'),

  ('33333333-3333-3333-3333-333333330201', 'sharpshooter', 'Sharpshooter', 'Maintained 95%+ accuracy over 20+ submissions', null, 'accuracy'),
  ('33333333-3333-3333-3333-333333330202', 'reliable', 'Reliable', 'Maintained 90%+ accuracy over 20+ submissions', null, 'accuracy'),
  ('33333333-3333-3333-3333-333333330203', 'streak_5', 'Hot Streak', '5 verified submissions in a row', null, 'accuracy'),
  ('33333333-3333-3333-3333-333333330204', 'streak_10', 'On Fire', '10 verified submissions in a row', null, 'accuracy'),

  ('33333333-3333-3333-3333-333333330301', 'gridiron_guru', 'Gridiron Guru', 'Reported 25+ football games', null, 'sport'),
  ('33333333-3333-3333-3333-333333330302', 'hoops_insider', 'Hoops Insider', 'Reported 25+ basketball games', null, 'sport'),
  ('33333333-3333-3333-3333-333333330303', 'diamond_reporter', 'Diamond Reporter', 'Reported 25+ baseball/softball games', null, 'sport'),
  ('33333333-3333-3333-3333-333333330304', 'net_master', 'Net Master', 'Reported 25+ volleyball games', null, 'sport'),
  ('33333333-3333-3333-3333-333333330305', 'pitch_perfect', 'Pitch Perfect', 'Reported 25+ soccer games', null, 'sport'),

  ('33333333-3333-3333-3333-333333330401', 'trusted_reporter', 'Trusted Reporter', 'Approved as a trusted score reporter', null, 'special'),
  ('33333333-3333-3333-3333-333333330402', 'early_bird', 'Early Bird', 'First to report a final score', null, 'special'),
  ('33333333-3333-3333-3333-333333330403', 'night_owl', 'Night Owl', 'Reported a game after 10pm', null, 'special'),
  ('33333333-3333-3333-3333-333333330404', 'weather_warrior', 'Weather Warrior', 'Reported during inclement weather', null, 'special'),
  ('33333333-3333-3333-3333-333333330405', 'golden_touch', 'Golden Touch', 'Reported 5 Golden Games', null, 'special'),
  ('33333333-3333-3333-3333-333333330406', 'lucky_reporter', 'Lucky Reporter', 'Won a random Lucky Reporter bonus', null, 'special'),

  ('33333333-3333-3333-3333-333333330501', 'season_mvp', 'Season MVP', 'Top contributor of the season', null, 'award'),
  ('33333333-3333-3333-3333-333333330502', 'all_star', 'All-Star', 'Top 10 contributor of the season', null, 'award'),
  ('33333333-3333-3333-3333-333333330503', 'rising_star', 'Rising Star', 'Most improved contributor', null, 'award'),
  ('33333333-3333-3333-3333-333333330504', 'island_champion', 'Island Champion', 'Top contributor for an island', null, 'award');
