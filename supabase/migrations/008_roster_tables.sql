-- Roster system tables
-- Basic player tracking: name and jersey number per team/sport/season

-- ============================================
-- PLAYERS (basic player info)
-- ============================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  jersey_number INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_players_school ON players(school_id);
CREATE INDEX idx_players_name ON players(last_name, first_name);
CREATE INDEX idx_players_active ON players(is_active) WHERE is_active = true;

-- ============================================
-- PLAYER SEASONS (links player to sport/year)
-- ============================================
CREATE TABLE player_seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  sport_id UUID REFERENCES sports(id) ON DELETE CASCADE NOT NULL,
  season_year INT NOT NULL,
  jersey_number INT, -- Can override player's default jersey number
  position TEXT,
  grade TEXT, -- Freshman, Sophomore, Junior, Senior
  is_captain BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, sport_id, season_year)
);

CREATE INDEX idx_player_seasons_player ON player_seasons(player_id);
CREATE INDEX idx_player_seasons_sport ON player_seasons(sport_id);
CREATE INDEX idx_player_seasons_year ON player_seasons(season_year);
CREATE INDEX idx_player_seasons_sport_year ON player_seasons(sport_id, season_year);

-- ============================================
-- GAME ROSTERS (tracks which players participated in a game)
-- ============================================
CREATE TABLE game_rosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  is_starter BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, player_id)
);

CREATE INDEX idx_game_rosters_game ON game_rosters(game_id);
CREATE INDEX idx_game_rosters_player ON game_rosters(player_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rosters ENABLE ROW LEVEL SECURITY;

-- Public read access for all roster data
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read player_seasons" ON player_seasons FOR SELECT USING (true);
CREATE POLICY "Public read game_rosters" ON game_rosters FOR SELECT USING (true);

-- Admin-only write access (using service role key)
-- These policies prevent direct writes from client
-- All writes should go through admin API with service role

-- ============================================
-- TRIGGERS
-- ============================================

-- Update players.updated_at on changes
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for roster changes (useful for admin panel)
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE player_seasons;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE players IS 'Basic player information linked to a school';
COMMENT ON TABLE player_seasons IS 'Links players to specific sports and seasons with optional jersey/position overrides';
COMMENT ON TABLE game_rosters IS 'Tracks which players participated in specific games';

COMMENT ON COLUMN players.jersey_number IS 'Default jersey number, can be overridden per season in player_seasons';
COMMENT ON COLUMN player_seasons.jersey_number IS 'Jersey number for this specific season, overrides player default if set';
COMMENT ON COLUMN player_seasons.grade IS 'Academic grade level: Freshman, Sophomore, Junior, Senior';
