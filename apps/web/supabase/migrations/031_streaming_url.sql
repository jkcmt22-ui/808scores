-- Add streaming_url column to games table for live stream links
ALTER TABLE games ADD COLUMN IF NOT EXISTS streaming_url TEXT;

COMMENT ON COLUMN games.streaming_url IS 'URL to live stream (YouTube, Twitch, NFHS Network, etc.)';
