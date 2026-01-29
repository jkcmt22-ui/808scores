-- Migration 059: Game Predictions Schema
-- Adds the ability for users to predict game outcomes and win points

-- ============================================
-- ADD PREDICTIONS_ENABLED TO GAMES
-- ============================================

ALTER TABLE games
ADD COLUMN IF NOT EXISTS predictions_enabled BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_games_predictions_enabled ON games(predictions_enabled) WHERE predictions_enabled = true;

COMMENT ON COLUMN games.predictions_enabled IS 'Whether users can make predictions for this game. Admin-controlled toggle.';

-- ============================================
-- GAME PREDICTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS game_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  predicted_home_score INT NOT NULL CHECK (predicted_home_score >= 0),
  predicted_away_score INT NOT NULL CHECK (predicted_away_score >= 0),
  predicted_winner_id UUID REFERENCES schools(id),  -- Derived from scores, but explicit for easier querying
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(game_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_game_predictions_game_id ON game_predictions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_predictions_user_id ON game_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_predictions_game_user ON game_predictions(game_id, user_id);

-- Comments
COMMENT ON TABLE game_predictions IS 'User predictions for game scores. Locked once game starts.';
COMMENT ON COLUMN game_predictions.predicted_winner_id IS 'Derived from predicted scores. NULL for predicted tie.';

-- ============================================
-- PREDICTION RESULTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS prediction_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE UNIQUE,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_predictions INT NOT NULL DEFAULT 0,
  exact_match_count INT NOT NULL DEFAULT 0,
  avg_home_score DECIMAL(8,2),
  avg_away_score DECIMAL(8,2),
  home_win_prediction_pct DECIMAL(5,2),
  results_json JSONB  -- Detailed results: [{user_id, rank, error, points_awarded}]
);

CREATE INDEX IF NOT EXISTS idx_prediction_results_game_id ON prediction_results(game_id);
CREATE INDEX IF NOT EXISTS idx_prediction_results_processed_at ON prediction_results(processed_at DESC);

COMMENT ON TABLE prediction_results IS 'Processed results for games with predictions. Created when game is finalized.';
COMMENT ON COLUMN prediction_results.results_json IS 'Array of {user_id, rank, error, points_awarded} sorted by rank';

-- ============================================
-- RLS POLICIES FOR GAME_PREDICTIONS
-- ============================================

ALTER TABLE game_predictions ENABLE ROW LEVEL SECURITY;

-- Users can view their own predictions
CREATE POLICY "Users can view own predictions"
  ON game_predictions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can view others' predictions ONLY after game is final (to prevent cheating)
CREATE POLICY "Users can view others predictions after game final"
  ON game_predictions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games g
      WHERE g.id = game_predictions.game_id
      AND g.status = 'final'
    )
  );

-- Admins can view all predictions
CREATE POLICY "Admins can view all predictions"
  ON game_predictions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- Users can insert their own predictions ONLY before game starts
CREATE POLICY "Users can create predictions before game starts"
  ON game_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM games g
      WHERE g.id = game_id
      AND g.predictions_enabled = true
      AND g.scheduled_at > NOW()
      AND g.status = 'scheduled'
    )
  );

-- Users can update their own predictions ONLY before game starts
CREATE POLICY "Users can update predictions before game starts"
  ON game_predictions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM games g
      WHERE g.id = game_id
      AND g.predictions_enabled = true
      AND g.scheduled_at > NOW()
      AND g.status = 'scheduled'
    )
  );

-- Users can delete their own predictions before game starts
CREATE POLICY "Users can delete predictions before game starts"
  ON game_predictions
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM games g
      WHERE g.id = game_id
      AND g.scheduled_at > NOW()
      AND g.status = 'scheduled'
    )
  );

-- ============================================
-- RLS POLICIES FOR PREDICTION_RESULTS
-- ============================================

ALTER TABLE prediction_results ENABLE ROW LEVEL SECURITY;

-- Anyone can view prediction results (they're only created after game is final)
CREATE POLICY "Anyone can view prediction results"
  ON prediction_results
  FOR SELECT
  TO authenticated
  USING (true);

-- Only system can insert/update prediction results
CREATE POLICY "Service role can manage prediction results"
  ON prediction_results
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TRIGGER TO UPDATE PREDICTED_WINNER_ID
-- ============================================

CREATE OR REPLACE FUNCTION set_predicted_winner()
RETURNS TRIGGER AS $$
DECLARE
  v_home_team_id UUID;
  v_away_team_id UUID;
BEGIN
  -- Get team IDs from the game
  SELECT home_team_id, away_team_id INTO v_home_team_id, v_away_team_id
  FROM games WHERE id = NEW.game_id;

  -- Set predicted winner based on scores
  IF NEW.predicted_home_score > NEW.predicted_away_score THEN
    NEW.predicted_winner_id := v_home_team_id;
  ELSIF NEW.predicted_away_score > NEW.predicted_home_score THEN
    NEW.predicted_winner_id := v_away_team_id;
  ELSE
    NEW.predicted_winner_id := NULL; -- Tie prediction
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_predicted_winner_trigger
  BEFORE INSERT OR UPDATE ON game_predictions
  FOR EACH ROW EXECUTE FUNCTION set_predicted_winner();

-- ============================================
-- GRANTS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON game_predictions TO authenticated;
GRANT SELECT ON prediction_results TO authenticated;
