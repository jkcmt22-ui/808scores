-- Add GIF support to chat_messages
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS gif_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gif_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'
  CHECK (message_type IN ('text', 'gif'));

-- Add GIF support to general_chat_messages
ALTER TABLE general_chat_messages
ADD COLUMN IF NOT EXISTS gif_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gif_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'
  CHECK (message_type IN ('text', 'gif'));

-- Indexes for filtering by message type
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_general_chat_messages_type ON general_chat_messages(message_type);
