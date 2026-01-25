-- Hawaii Sports Center Enhanced Sports Migration
-- Adds gender separation and game type support

-- ============================================
-- 1. CREATE NEW ENUMS
-- ============================================
CREATE TYPE sport_gender AS ENUM ('boys', 'girls', 'coed');
CREATE TYPE game_type AS ENUM ('regular_season', 'playoff', 'championship', 'tournament', 'exhibition', 'scrimmage');

-- ============================================
-- 2. ADD COLUMNS TO SPORTS TABLE
-- ============================================
ALTER TABLE sports ADD COLUMN gender sport_gender DEFAULT 'coed';
ALTER TABLE sports ADD COLUMN display_name TEXT;
ALTER TABLE sports ADD COLUMN sort_order INT DEFAULT 0;

-- ============================================
-- 3. ADD COLUMNS TO GAMES TABLE
-- ============================================
ALTER TABLE games ADD COLUMN game_type game_type DEFAULT 'regular_season';
ALTER TABLE games ADD COLUMN overtime_count INT DEFAULT 0;

-- ============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_sports_gender ON sports(gender);
CREATE INDEX idx_sports_active_order ON sports(active, sort_order);
CREATE INDEX idx_games_type ON games(game_type);

-- ============================================
-- 5. UPDATE EXISTING SPORTS WITH DEFAULTS
-- ============================================
-- Set display_name to match name for existing sports
UPDATE sports SET display_name = name WHERE display_name IS NULL;
