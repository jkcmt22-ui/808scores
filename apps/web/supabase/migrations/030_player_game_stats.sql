-- Migration 030: Player Game Stats
-- Adds tables for tracking individual player statistics per game (box scores)

-- Player game stats table for individual performance tracking
CREATE TABLE IF NOT EXISTS player_game_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

  -- Common stats (applicable to most sports)
  minutes_played INTEGER,

  -- Points/Scoring
  points INTEGER DEFAULT 0,

  -- Basketball stats
  field_goals_made INTEGER,
  field_goals_attempted INTEGER,
  three_pointers_made INTEGER,
  three_pointers_attempted INTEGER,
  free_throws_made INTEGER,
  free_throws_attempted INTEGER,
  rebounds_offensive INTEGER,
  rebounds_defensive INTEGER,
  assists INTEGER,
  steals INTEGER,
  blocks INTEGER,
  turnovers INTEGER,
  fouls INTEGER,

  -- Football stats
  passing_yards INTEGER,
  passing_tds INTEGER,
  passing_ints INTEGER,
  completions INTEGER,
  pass_attempts INTEGER,
  rushing_yards INTEGER,
  rushing_tds INTEGER,
  rushing_attempts INTEGER,
  receiving_yards INTEGER,
  receiving_tds INTEGER,
  receptions INTEGER,
  tackles INTEGER,
  sacks DECIMAL(4,1),
  interceptions INTEGER,

  -- Soccer stats
  goals INTEGER,
  assists_soccer INTEGER,
  shots INTEGER,
  shots_on_target INTEGER,
  saves INTEGER,
  yellow_cards INTEGER,
  red_cards INTEGER,

  -- Volleyball stats
  kills INTEGER,
  errors_attack INTEGER,
  attack_attempts INTEGER,
  aces INTEGER,
  serve_errors INTEGER,
  digs INTEGER,
  blocks_solo INTEGER,
  blocks_assist INTEGER,

  -- Baseball/Softball stats
  at_bats INTEGER,
  hits INTEGER,
  runs INTEGER,
  rbis INTEGER,
  doubles INTEGER,
  triples INTEGER,
  home_runs INTEGER,
  walks INTEGER,
  strikeouts_batting INTEGER,
  stolen_bases INTEGER,
  innings_pitched DECIMAL(4,1),
  hits_allowed INTEGER,
  runs_allowed INTEGER,
  earned_runs INTEGER,
  strikeouts_pitching INTEGER,
  walks_pitching INTEGER,

  -- Metadata
  is_starter BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one stat line per player per game
  UNIQUE(game_id, player_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_player_game_stats_game ON player_game_stats(game_id);
CREATE INDEX IF NOT EXISTS idx_player_game_stats_player ON player_game_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_game_stats_school ON player_game_stats(school_id);

-- Enable RLS
ALTER TABLE player_game_stats ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view player stats"
  ON player_game_stats FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Admins can manage player stats"
  ON player_game_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_player_game_stats_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_game_stats_timestamp
  BEFORE UPDATE ON player_game_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_player_game_stats_timestamp();

-- Comment on table
COMMENT ON TABLE player_game_stats IS 'Individual player statistics per game (box scores) for all sports';
