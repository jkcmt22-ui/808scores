-- Fix users table RLS policy (CRITICAL SECURITY FIX)
-- The previous policy allowed public read of ALL user data due to "OR true"

-- Drop the vulnerable policy
DROP POLICY IF EXISTS "Users read own data" ON users;

-- Create proper policy: users can only read their own data
-- For leaderboards, we'll create a separate view or function with limited fields
CREATE POLICY "Users read own data" ON users FOR SELECT
  USING (auth.uid() = id);

-- Create a public leaderboard view with only safe fields
-- This allows public leaderboard access without exposing sensitive data
CREATE OR REPLACE VIEW public_leaderboard AS
SELECT
  id,
  display_name,
  avatar_url,
  total_points,
  season_points,
  tier,
  accuracy_rate,
  submission_count,
  verified_count
FROM users
ORDER BY total_points DESC;

-- Grant public access to the view
GRANT SELECT ON public_leaderboard TO anon, authenticated;

-- Comment explaining the security fix
COMMENT ON POLICY "Users read own data" ON users IS
  'Users can only read their own data. Use public_leaderboard view for leaderboard access.';
