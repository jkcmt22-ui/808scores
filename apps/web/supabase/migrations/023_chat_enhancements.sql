-- Migration 023: Chat Enhancements
-- Add reply, mention, and like support to chat messages

-- Add reply/mention/like columns to chat_messages
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0;

-- Create index for reply lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to_id ON chat_messages(reply_to_id);

-- Chat likes table
CREATE TABLE IF NOT EXISTS chat_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Indexes for chat_likes
CREATE INDEX IF NOT EXISTS idx_chat_likes_message_id ON chat_likes(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_likes_user_id ON chat_likes(user_id);

-- Trigger to update like_count on chat_messages
CREATE OR REPLACE FUNCTION update_message_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE chat_messages SET like_count = like_count + 1 WHERE id = NEW.message_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE chat_messages SET like_count = like_count - 1 WHERE id = OLD.message_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_like_count_trigger ON chat_likes;
CREATE TRIGGER update_like_count_trigger
AFTER INSERT OR DELETE ON chat_likes
FOR EACH ROW EXECUTE FUNCTION update_message_like_count();

-- RLS policies for chat_likes
ALTER TABLE chat_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read chat_likes" ON chat_likes;
CREATE POLICY "Public read chat_likes" ON chat_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth create chat_likes" ON chat_likes;
CREATE POLICY "Auth create chat_likes" ON chat_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Auth delete own chat_likes" ON chat_likes;
CREATE POLICY "Auth delete own chat_likes" ON chat_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for chat_likes
ALTER PUBLICATION supabase_realtime ADD TABLE chat_likes;

-- Daily points tracking table for chat engagement
CREATE TABLE IF NOT EXISTS chat_point_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('comment', 'like_received', 'mention_received')),
  points_earned INT NOT NULL,
  source_id UUID, -- message_id or like_id
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_point_logs_user_id ON chat_point_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_point_logs_created_at ON chat_point_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_point_logs_user_date ON chat_point_logs(user_id, created_at);

-- RLS for chat_point_logs
ALTER TABLE chat_point_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own chat_point_logs" ON chat_point_logs;
CREATE POLICY "Users can view own chat_point_logs" ON chat_point_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert chat_point_logs" ON chat_point_logs;
CREATE POLICY "System can insert chat_point_logs" ON chat_point_logs
  FOR INSERT WITH CHECK (true);

-- Function to award chat points with daily caps
CREATE OR REPLACE FUNCTION award_chat_points(
  p_user_id UUID,
  p_action_type TEXT,
  p_source_id UUID DEFAULT NULL
) RETURNS INT AS $$
DECLARE
  v_points INT;
  v_daily_cap INT;
  v_today_total INT;
  v_actual_points INT;
BEGIN
  -- Determine points and daily cap based on action type
  CASE p_action_type
    WHEN 'comment' THEN
      v_points := 1;
      v_daily_cap := 10;
    WHEN 'like_received' THEN
      v_points := 2;
      v_daily_cap := 20;
    WHEN 'mention_received' THEN
      v_points := 1;
      v_daily_cap := 5;
    ELSE
      RETURN 0;
  END CASE;

  -- Get today's total for this action type
  SELECT COALESCE(SUM(points_earned), 0) INTO v_today_total
  FROM chat_point_logs
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';

  -- Calculate actual points to award (respecting daily cap)
  v_actual_points := LEAST(v_points, v_daily_cap - v_today_total);

  IF v_actual_points <= 0 THEN
    RETURN 0;
  END IF;

  -- Log the points
  INSERT INTO chat_point_logs (user_id, action_type, points_earned, source_id)
  VALUES (p_user_id, p_action_type, v_actual_points, p_source_id);

  -- Update user's points
  UPDATE users
  SET total_points = total_points + v_actual_points,
      season_points = season_points + v_actual_points
  WHERE id = p_user_id;

  RETURN v_actual_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
