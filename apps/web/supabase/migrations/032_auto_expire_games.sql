-- Auto-expire in_progress games to final status
-- Games should be marked final if they're past 5AM HST the day after scheduled_at

-- Create function to expire stale in_progress games
CREATE OR REPLACE FUNCTION expire_stale_games()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update games that are:
  -- 1. Currently 'in_progress'
  -- 2. Scheduled before 5AM HST today (which is 3PM UTC, since HST = UTC-10)
  --
  -- Logic: If current time is past 5AM HST, any game scheduled before yesterday's date
  -- at 5AM HST should be expired. More simply: scheduled_at + 1 day + 5 hours < now()
  -- In UTC terms: scheduled_at < now() - interval '19 hours' (since 5AM HST = 3PM UTC previous day)

  WITH expired AS (
    UPDATE games
    SET
      status = 'final',
      updated_at = NOW()
    WHERE
      status = 'in_progress'
      AND scheduled_at < (
        -- Calculate 5AM HST of today in UTC (which is 3PM UTC, or 15:00)
        -- If current time is before 3PM UTC, use yesterday's 3PM UTC
        -- If current time is after 3PM UTC, use today's 3PM UTC
        CASE
          WHEN EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC') >= 15
          THEN DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '15 hours'
          ELSE DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') - INTERVAL '9 hours'
        END
      )
    RETURNING id
  )
  SELECT COUNT(*) INTO updated_count FROM expired;

  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create a view or helper to check if a game should be expired
-- This can be used in queries to filter out stale games
CREATE OR REPLACE FUNCTION is_game_expired(game_scheduled_at TIMESTAMPTZ, game_status TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- A game is considered expired if:
  -- 1. It's in_progress
  -- 2. Current time is past 5AM HST the day after the game
  IF game_status != 'in_progress' THEN
    RETURN FALSE;
  END IF;

  RETURN game_scheduled_at < (
    CASE
      WHEN EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC') >= 15
      THEN DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '15 hours'
      ELSE DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') - INTERVAL '9 hours'
    END
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION expire_stale_games() IS 'Marks in_progress games as final if past 5AM HST the day after scheduled_at. Call periodically via cron.';
COMMENT ON FUNCTION is_game_expired(TIMESTAMPTZ, TEXT) IS 'Checks if a game should be considered expired based on 5AM HST rule.';
