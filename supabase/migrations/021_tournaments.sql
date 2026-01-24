-- Migration 021: Tournaments and Playoffs Schema
-- Adds support for tournaments, playoffs, and bracket visualization

-- Tournament format enum
CREATE TYPE tournament_format AS ENUM (
  'single_elimination',
  'double_elimination',
  'round_robin',
  'pool_play',
  'custom'
);

-- Tournament status enum
CREATE TYPE tournament_status AS ENUM (
  'upcoming',
  'in_progress',
  'completed',
  'canceled'
);

-- Tournament round enum (for bracket positioning)
CREATE TYPE tournament_round AS ENUM (
  'play_in',
  'round_of_32',
  'round_of_16',
  'quarterfinal',
  'semifinal',
  'third_place',
  'final',
  'pool_a',
  'pool_b',
  'pool_c',
  'pool_d'
);

-- Tournaments table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,

  -- Tournament details
  format tournament_format NOT NULL DEFAULT 'single_elimination',
  status tournament_status NOT NULL DEFAULT 'upcoming',
  description TEXT,

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,

  -- Location
  venue VARCHAR(255),
  island VARCHAR(50),

  -- Structure
  num_teams INTEGER,
  current_round tournament_round,

  -- Championship/Season context
  season VARCHAR(20), -- e.g., "2025-26"
  league VARCHAR(50), -- e.g., "OIA", "ILH", "HHSAA" (state)
  division VARCHAR(50), -- e.g., "Division I", "Division II"

  -- Metadata
  external_id VARCHAR(100), -- For linking to ScoringLive or other sources
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournament teams (participants with seeding)
CREATE TABLE tournament_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

  -- Seeding and placement
  seed INTEGER, -- 1 = top seed, NULL = unseeded
  pool VARCHAR(10), -- For pool play: "A", "B", etc.

  -- Results
  eliminated BOOLEAN DEFAULT false,
  eliminated_round tournament_round,
  final_placement INTEGER, -- 1 = champion, 2 = runner-up, etc.

  -- Stats (optional, can be computed)
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  points_for INTEGER DEFAULT 0,
  points_against INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each school can only be in a tournament once
  UNIQUE(tournament_id, school_id)
);

-- Add tournament fields to games table
ALTER TABLE games
  ADD COLUMN tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  ADD COLUMN tournament_round tournament_round,
  ADD COLUMN bracket_position INTEGER, -- For ordering: 1-8 for quarterfinals, 1-4 for semis, etc.
  ADD COLUMN winner_advances_to UUID REFERENCES games(id) ON DELETE SET NULL, -- Links to next game in bracket
  ADD COLUMN loser_drops_to UUID REFERENCES games(id) ON DELETE SET NULL; -- For double elimination

-- Indexes
CREATE INDEX idx_tournaments_sport ON tournaments(sport_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_dates ON tournaments(start_date, end_date);
CREATE INDEX idx_tournaments_league ON tournaments(league);
CREATE INDEX idx_tournaments_season ON tournaments(season);

CREATE INDEX idx_tournament_teams_tournament ON tournament_teams(tournament_id);
CREATE INDEX idx_tournament_teams_school ON tournament_teams(school_id);
CREATE INDEX idx_tournament_teams_seed ON tournament_teams(tournament_id, seed);

CREATE INDEX idx_games_tournament ON games(tournament_id);
CREATE INDEX idx_games_tournament_round ON games(tournament_id, tournament_round);

-- RLS Policies
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;

-- Tournaments: Anyone can view, only admins can modify
CREATE POLICY "Anyone can view tournaments"
  ON tournaments FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert tournaments"
  ON tournaments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (is_trusted_reporter = true OR tier IN ('elite', 'trusted'))
    )
  );

CREATE POLICY "Admins can update tournaments"
  ON tournaments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (is_trusted_reporter = true OR tier IN ('elite', 'trusted'))
    )
  );

CREATE POLICY "Admins can delete tournaments"
  ON tournaments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (is_trusted_reporter = true OR tier IN ('elite', 'trusted'))
    )
  );

-- Tournament teams: Anyone can view, only admins can modify
CREATE POLICY "Anyone can view tournament teams"
  ON tournament_teams FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert tournament teams"
  ON tournament_teams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (is_trusted_reporter = true OR tier IN ('elite', 'trusted'))
    )
  );

CREATE POLICY "Admins can update tournament teams"
  ON tournament_teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (is_trusted_reporter = true OR tier IN ('elite', 'trusted'))
    )
  );

CREATE POLICY "Admins can delete tournament teams"
  ON tournament_teams FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (is_trusted_reporter = true OR tier IN ('elite', 'trusted'))
    )
  );

-- Function to update tournament status based on games
CREATE OR REPLACE FUNCTION update_tournament_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If a final game is completed, mark tournament as completed
  IF NEW.status = 'final' AND NEW.tournament_round = 'final' THEN
    UPDATE tournaments
    SET status = 'completed', updated_at = NOW()
    WHERE id = NEW.tournament_id;
  END IF;

  -- If any tournament game goes in_progress, mark tournament as in_progress
  IF NEW.status = 'in_progress' THEN
    UPDATE tournaments
    SET status = 'in_progress',
        current_round = NEW.tournament_round,
        updated_at = NOW()
    WHERE id = NEW.tournament_id AND status = 'upcoming';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tournament_status
  AFTER UPDATE OF status ON games
  FOR EACH ROW
  WHEN (NEW.tournament_id IS NOT NULL)
  EXECUTE FUNCTION update_tournament_status();

-- Function to update tournament team stats when a game ends
CREATE OR REPLACE FUNCTION update_tournament_team_stats()
RETURNS TRIGGER AS $$
DECLARE
  winner_id UUID;
  loser_id UUID;
BEGIN
  -- Only process when game becomes final
  IF NEW.status = 'final' AND NEW.tournament_id IS NOT NULL THEN
    -- Determine winner and loser
    IF NEW.home_score > NEW.away_score THEN
      winner_id := NEW.home_team_id;
      loser_id := NEW.away_team_id;
    ELSE
      winner_id := NEW.away_team_id;
      loser_id := NEW.home_team_id;
    END IF;

    -- Update winner stats
    UPDATE tournament_teams
    SET wins = wins + 1,
        points_for = points_for + GREATEST(NEW.home_score, NEW.away_score),
        points_against = points_against + LEAST(NEW.home_score, NEW.away_score)
    WHERE tournament_id = NEW.tournament_id AND school_id = winner_id;

    -- Update loser stats
    UPDATE tournament_teams
    SET losses = losses + 1,
        points_for = points_for + LEAST(NEW.home_score, NEW.away_score),
        points_against = points_against + GREATEST(NEW.home_score, NEW.away_score),
        eliminated = CASE
          WHEN (SELECT format FROM tournaments WHERE id = NEW.tournament_id) = 'single_elimination'
          THEN true
          ELSE eliminated
        END,
        eliminated_round = CASE
          WHEN (SELECT format FROM tournaments WHERE id = NEW.tournament_id) = 'single_elimination'
          THEN NEW.tournament_round
          ELSE eliminated_round
        END
    WHERE tournament_id = NEW.tournament_id AND school_id = loser_id;

    -- If this is the final, set placements
    IF NEW.tournament_round = 'final' THEN
      UPDATE tournament_teams SET final_placement = 1
      WHERE tournament_id = NEW.tournament_id AND school_id = winner_id;

      UPDATE tournament_teams SET final_placement = 2
      WHERE tournament_id = NEW.tournament_id AND school_id = loser_id;
    END IF;

    -- If this is third place game, set placements
    IF NEW.tournament_round = 'third_place' THEN
      UPDATE tournament_teams SET final_placement = 3
      WHERE tournament_id = NEW.tournament_id AND school_id = winner_id;

      UPDATE tournament_teams SET final_placement = 4
      WHERE tournament_id = NEW.tournament_id AND school_id = loser_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tournament_team_stats
  AFTER UPDATE OF status ON games
  FOR EACH ROW
  WHEN (NEW.tournament_id IS NOT NULL)
  EXECUTE FUNCTION update_tournament_team_stats();

-- Comment on tables
COMMENT ON TABLE tournaments IS 'Stores tournament/playoff information including state championships, league playoffs, and invitational tournaments';
COMMENT ON TABLE tournament_teams IS 'Teams participating in a tournament with seeding and results';
COMMENT ON COLUMN games.tournament_id IS 'Links game to a tournament (NULL for regular season games)';
COMMENT ON COLUMN games.tournament_round IS 'Round of the tournament (quarterfinal, semifinal, final, etc.)';
COMMENT ON COLUMN games.bracket_position IS 'Position in bracket for visualization (1-8 for quarters, 1-4 for semis, etc.)';
