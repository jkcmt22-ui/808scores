-- Add media URL columns to games table
-- These allow admins to add links to photos, Instagram posts, and live streams

ALTER TABLE games
ADD COLUMN IF NOT EXISTS photos_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS streaming_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN games.photos_url IS 'URL to game photo album or gallery';
COMMENT ON COLUMN games.instagram_url IS 'URL to Instagram post about the game';
COMMENT ON COLUMN games.streaming_url IS 'URL to live stream (YouTube, Twitch, NFHS Network, etc.)';
