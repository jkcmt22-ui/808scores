-- Migration 091: Raffle & Prizes System Enhancements
-- 1. Add top_contributor_prize_id to raffles
-- 2. Reset all point balances (clean slate for 1:1 points system)
-- 3. Clear existing raffle entries (they used old point values)

-- Add top contributor prize field to raffles
ALTER TABLE raffles ADD COLUMN IF NOT EXISTS
  top_contributor_prize_id UUID REFERENCES prizes(id) ON DELETE SET NULL;

-- Comment for documentation
COMMENT ON COLUMN raffles.top_contributor_prize_id IS
  'Prize awarded to the #1 contributor for the raffle period (guaranteed, not drawn)';

-- Reset all point balances - clean slate under new 1:1 system
-- Keep point_events history for audit but new earnings start fresh
UPDATE users SET total_points = 0, season_points = 0;

-- Clear existing raffle entries (they were from old point system)
DELETE FROM raffle_entries;
