-- Migration 024: Enhanced Raffles & Terms
-- Add terms tracking and enhanced raffle features

-- Add raffle terms tracking to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS accepted_raffle_terms BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS raffle_terms_accepted_at TIMESTAMPTZ;

-- Enhance raffles table with season/month and active flag
ALTER TABLE raffles
ADD COLUMN IF NOT EXISTS season TEXT,
ADD COLUMN IF NOT EXISTS month TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for active raffles lookup
CREATE INDEX IF NOT EXISTS idx_raffles_is_active ON raffles(is_active);
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status);

-- Multiple prizes per raffle table (for monthly = 3 prizes)
CREATE TABLE IF NOT EXISTS raffle_prizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE NOT NULL,
  prize_id UUID REFERENCES prizes(id) ON DELETE SET NULL,
  position INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for raffle_prizes
CREATE INDEX IF NOT EXISTS idx_raffle_prizes_raffle_id ON raffle_prizes(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_prizes_prize_id ON raffle_prizes(prize_id);

-- RLS for raffle_prizes
ALTER TABLE raffle_prizes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read raffle_prizes" ON raffle_prizes;
CREATE POLICY "Public read raffle_prizes" ON raffle_prizes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage raffle_prizes" ON raffle_prizes;
CREATE POLICY "Admin manage raffle_prizes" ON raffle_prizes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- Add RLS policies for raffles table (if not exists)
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read raffles" ON raffles;
CREATE POLICY "Public read raffles" ON raffles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage raffles" ON raffles;
CREATE POLICY "Admin manage raffles" ON raffles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- Add RLS policies for prizes table (if not exists)
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read prizes" ON prizes;
CREATE POLICY "Public read prizes" ON prizes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage prizes" ON prizes;
CREATE POLICY "Admin manage prizes" ON prizes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- Add RLS policies for raffle_entries
ALTER TABLE raffle_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read raffle_entries" ON raffle_entries;
CREATE POLICY "Public read raffle_entries" ON raffle_entries
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own entries" ON raffle_entries;
CREATE POLICY "Users can create own entries" ON raffle_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own entries" ON raffle_entries;
CREATE POLICY "Users can update own entries" ON raffle_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for raffle_winners
ALTER TABLE raffle_winners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read raffle_winners" ON raffle_winners;
CREATE POLICY "Public read raffle_winners" ON raffle_winners
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage raffle_winners" ON raffle_winners;
CREATE POLICY "Admin manage raffle_winners" ON raffle_winners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_super_admin = true)
    )
  );

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE raffle_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE raffle_winners;

-- Function to enter a raffle
CREATE OR REPLACE FUNCTION enter_raffle(
  p_raffle_id UUID,
  p_user_id UUID,
  p_entry_count INT
) RETURNS JSONB AS $$
DECLARE
  v_raffle RECORD;
  v_user RECORD;
  v_points_needed INT;
  v_existing_entries INT;
  v_new_total_entries INT;
BEGIN
  -- Get raffle details
  SELECT * INTO v_raffle FROM raffles WHERE id = p_raffle_id;

  IF v_raffle IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Raffle not found');
  END IF;

  -- Check raffle is open
  IF v_raffle.status != 'open' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Raffle is not open for entries');
  END IF;

  -- Check entries are open
  IF NOW() < v_raffle.entries_open_at OR NOW() > v_raffle.entries_close_at THEN
    RETURN jsonb_build_object('success', false, 'error', 'Entries are closed');
  END IF;

  -- Get user details
  SELECT * INTO v_user FROM users WHERE id = p_user_id;

  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Check user has accepted terms
  IF NOT v_user.accepted_raffle_terms THEN
    RETURN jsonb_build_object('success', false, 'error', 'Must accept raffle terms first');
  END IF;

  -- Check minimum points
  IF v_user.season_points < v_raffle.min_points_to_enter THEN
    RETURN jsonb_build_object('success', false, 'error',
      format('Need at least %s points to enter', v_raffle.min_points_to_enter));
  END IF;

  -- Get existing entries
  SELECT COALESCE(entry_count, 0) INTO v_existing_entries
  FROM raffle_entries
  WHERE raffle_id = p_raffle_id AND user_id = p_user_id;

  -- Check max entries
  v_new_total_entries := COALESCE(v_existing_entries, 0) + p_entry_count;
  IF v_raffle.max_entries_per_user IS NOT NULL AND v_new_total_entries > v_raffle.max_entries_per_user THEN
    RETURN jsonb_build_object('success', false, 'error',
      format('Maximum %s entries allowed', v_raffle.max_entries_per_user));
  END IF;

  -- Calculate points needed
  v_points_needed := p_entry_count * v_raffle.points_per_entry;

  -- Check user has enough points
  IF v_user.season_points < v_points_needed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not enough points');
  END IF;

  -- Deduct points from user
  UPDATE users
  SET season_points = season_points - v_points_needed
  WHERE id = p_user_id;

  -- Insert or update entry
  INSERT INTO raffle_entries (raffle_id, user_id, entry_count, points_used)
  VALUES (p_raffle_id, p_user_id, p_entry_count, v_points_needed)
  ON CONFLICT (raffle_id, user_id) DO UPDATE
  SET entry_count = raffle_entries.entry_count + p_entry_count,
      points_used = raffle_entries.points_used + v_points_needed,
      updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'entries_added', p_entry_count,
    'points_used', v_points_needed,
    'total_entries', v_new_total_entries
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint for raffle_entries if not exists
ALTER TABLE raffle_entries
DROP CONSTRAINT IF EXISTS raffle_entries_raffle_user_unique;
ALTER TABLE raffle_entries
ADD CONSTRAINT raffle_entries_raffle_user_unique UNIQUE (raffle_id, user_id);
