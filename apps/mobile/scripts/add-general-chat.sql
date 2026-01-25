-- General Chat Tables for 808scores
-- This creates a Discord-like general chat feature

-- Create general_chat_messages table
CREATE TABLE IF NOT EXISTS general_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  report_count INTEGER DEFAULT 0,
  reply_to_id UUID REFERENCES general_chat_messages(id) ON DELETE SET NULL,
  mentions UUID[] DEFAULT '{}',
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_general_chat_messages_created_at ON general_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_general_chat_messages_user_id ON general_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_general_chat_messages_is_hidden ON general_chat_messages(is_hidden);

-- Create general_chat_likes table
CREATE TABLE IF NOT EXISTS general_chat_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES general_chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_general_chat_likes_message_id ON general_chat_likes(message_id);
CREATE INDEX IF NOT EXISTS idx_general_chat_likes_user_id ON general_chat_likes(user_id);

-- Enable RLS
ALTER TABLE general_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_chat_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for general_chat_messages

-- Anyone can read non-hidden messages
CREATE POLICY "Anyone can read visible general chat messages"
  ON general_chat_messages
  FOR SELECT
  USING (is_hidden = FALSE);

-- Authenticated users can insert messages
CREATE POLICY "Authenticated users can insert general chat messages"
  ON general_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own messages (for editing)
CREATE POLICY "Users can update their own general chat messages"
  ON general_chat_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for general_chat_likes

-- Anyone can read likes
CREATE POLICY "Anyone can read general chat likes"
  ON general_chat_likes
  FOR SELECT
  USING (TRUE);

-- Authenticated users can insert their own likes
CREATE POLICY "Authenticated users can insert general chat likes"
  ON general_chat_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own general chat likes"
  ON general_chat_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update like_count when likes change
CREATE OR REPLACE FUNCTION update_general_chat_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE general_chat_messages
    SET like_count = like_count + 1
    WHERE id = NEW.message_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE general_chat_messages
    SET like_count = GREATEST(0, like_count - 1)
    WHERE id = OLD.message_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for like count updates
DROP TRIGGER IF EXISTS trigger_update_general_chat_like_count ON general_chat_likes;
CREATE TRIGGER trigger_update_general_chat_like_count
  AFTER INSERT OR DELETE ON general_chat_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_general_chat_like_count();

-- Enable realtime for the tables
ALTER PUBLICATION supabase_realtime ADD TABLE general_chat_messages;

-- Grant necessary permissions
GRANT SELECT ON general_chat_messages TO anon;
GRANT SELECT, INSERT ON general_chat_messages TO authenticated;
GRANT SELECT ON general_chat_likes TO anon;
GRANT SELECT, INSERT, DELETE ON general_chat_likes TO authenticated;
