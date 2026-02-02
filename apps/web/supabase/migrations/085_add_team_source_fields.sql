-- ============================================
-- Migration 085: Add Team Source Game Fields
-- ============================================
-- This migration adds fields to track where TBD team slots come from,
-- enabling "Winner of Game X" functionality for tournament brackets.
-- When a source game becomes final, the TBD team is automatically
-- replaced with the winner or loser of that game.
-- ============================================

-- Add source game tracking fields
ALTER TABLE games ADD COLUMN IF NOT EXISTS home_team_source_game_id UUID REFERENCES games(id) ON DELETE SET NULL;
ALTER TABLE games ADD COLUMN IF NOT EXISTS home_team_source_type TEXT CHECK (home_team_source_type IN ('winner', 'loser'));
ALTER TABLE games ADD COLUMN IF NOT EXISTS away_team_source_game_id UUID REFERENCES games(id) ON DELETE SET NULL;
ALTER TABLE games ADD COLUMN IF NOT EXISTS away_team_source_type TEXT CHECK (away_team_source_type IN ('winner', 'loser'));

-- Add comments for documentation
COMMENT ON COLUMN games.home_team_source_game_id IS 'The game whose winner/loser determines the home team (for TBD bracket slots)';
COMMENT ON COLUMN games.home_team_source_type IS 'Whether the home team is the winner or loser of the source game';
COMMENT ON COLUMN games.away_team_source_game_id IS 'The game whose winner/loser determines the away team (for TBD bracket slots)';
COMMENT ON COLUMN games.away_team_source_type IS 'Whether the away team is the winner or loser of the source game';

-- Create function to resolve TBD teams when source game completes
CREATE OR REPLACE FUNCTION resolve_tbd_teams()
RETURNS TRIGGER AS $$
DECLARE
  winner_team_id UUID;
  loser_team_id UUID;
  tbd_school_id UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
BEGIN
  -- Only act when game becomes final
  IF NEW.status = 'final' AND (OLD.status IS NULL OR OLD.status != 'final') THEN
    -- Determine winner/loser by score
    IF NEW.home_score > NEW.away_score THEN
      winner_team_id := NEW.home_team_id;
      loser_team_id := NEW.away_team_id;
    ELSIF NEW.away_score > NEW.home_score THEN
      winner_team_id := NEW.away_team_id;
      loser_team_id := NEW.home_team_id;
    ELSE
      -- Tie game - can't determine winner, skip resolution
      RETURN NEW;
    END IF;

    -- Update games waiting for this game's winner (home team slot)
    UPDATE games
    SET home_team_id = winner_team_id
    WHERE home_team_source_game_id = NEW.id
      AND home_team_source_type = 'winner'
      AND home_team_id IN (SELECT id FROM teams WHERE school_id = tbd_school_id);

    -- Update games waiting for this game's winner (away team slot)
    UPDATE games
    SET away_team_id = winner_team_id
    WHERE away_team_source_game_id = NEW.id
      AND away_team_source_type = 'winner'
      AND away_team_id IN (SELECT id FROM teams WHERE school_id = tbd_school_id);

    -- Update games waiting for this game's loser (home team slot)
    UPDATE games
    SET home_team_id = loser_team_id
    WHERE home_team_source_game_id = NEW.id
      AND home_team_source_type = 'loser'
      AND home_team_id IN (SELECT id FROM teams WHERE school_id = tbd_school_id);

    -- Update games waiting for this game's loser (away team slot)
    UPDATE games
    SET away_team_id = loser_team_id
    WHERE away_team_source_game_id = NEW.id
      AND away_team_source_type = 'loser'
      AND away_team_id IN (SELECT id FROM teams WHERE school_id = tbd_school_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for TBD resolution
DROP TRIGGER IF EXISTS resolve_tbd_teams_trigger ON games;
CREATE TRIGGER resolve_tbd_teams_trigger
  AFTER UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION resolve_tbd_teams();

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_games_home_team_source ON games(home_team_source_game_id) WHERE home_team_source_game_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_games_away_team_source ON games(away_team_source_game_id) WHERE away_team_source_game_id IS NOT NULL;
