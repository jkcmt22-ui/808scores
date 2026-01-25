-- Hawaii Sports Center Database Schema
-- Initial migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SCHOOLS
-- ============================================
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  mascot TEXT,
  island TEXT NOT NULL,
  league TEXT,
  division TEXT,
  colors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schools_island ON schools(island);
CREATE INDEX idx_schools_league ON schools(league);

-- ============================================
-- SPORTS
-- ============================================
CREATE TABLE sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  periods_config JSONB NOT NULL,
  season TEXT,
  active BOOLEAN DEFAULT true
);

-- ============================================
-- GAMES
-- ============================================
CREATE TYPE game_status AS ENUM ('scheduled', 'in_progress', 'final', 'postponed', 'canceled');
CREATE TYPE verification_method AS ENUM ('trusted', 'majority', 'timer', 'manual');

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id UUID REFERENCES sports(id) NOT NULL,
  home_team_id UUID REFERENCES schools(id) NOT NULL,
  away_team_id UUID REFERENCES schools(id) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  venue TEXT,
  status game_status DEFAULT 'scheduled',
  current_period TEXT,
  time_remaining TEXT,
  home_score INT DEFAULT 0,
  away_score INT DEFAULT 0,
  is_overtime BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verification_method verification_method,
  golden_game BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_games_scheduled ON games(scheduled_at);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_sport ON games(sport_id);
CREATE INDEX idx_games_home_team ON games(home_team_id);
CREATE INDEX idx_games_away_team ON games(away_team_id);

-- ============================================
-- GAME SCORES (period-by-period)
-- ============================================
CREATE TABLE game_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL,
  home_score INT NOT NULL,
  away_score INT NOT NULL,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,
  UNIQUE(game_id, period)
);

CREATE INDEX idx_game_scores_game ON game_scores(game_id);

-- ============================================
-- USERS
-- ============================================
CREATE TYPE user_tier AS ENUM ('new', 'standard', 'verified', 'elite', 'trusted');

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  reputation_score INT DEFAULT 50,
  tier user_tier DEFAULT 'new',
  is_trusted_reporter BOOLEAN DEFAULT false,
  trusted_reporter_approved_at TIMESTAMPTZ,
  total_points INT DEFAULT 0,
  season_points INT DEFAULT 0,
  accuracy_rate DECIMAL(5,2),
  submission_count INT DEFAULT 0,
  verified_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_points ON users(total_points DESC);

-- ============================================
-- SUBMISSIONS
-- ============================================
CREATE TYPE submission_type AS ENUM ('period_score', 'live_update', 'final_score', 'event', 'status_change');
CREATE TYPE submission_status AS ENUM ('pending', 'published', 'rejected', 'overturned');

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  submission_type submission_type NOT NULL,
  period TEXT,
  home_score INT,
  away_score INT,
  time_remaining TEXT,
  event_type TEXT,
  event_description TEXT,
  photo_url TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  at_game BOOLEAN DEFAULT false,
  status submission_status DEFAULT 'pending',
  verification_method verification_method,
  points_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  ip_address INET
);

CREATE INDEX idx_submissions_game ON submissions(game_id);
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created ON submissions(created_at DESC);

-- ============================================
-- DISPUTES
-- ============================================
CREATE TYPE dispute_status AS ENUM ('open', 'resolved', 'rejected');

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  disputed_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  proposed_home_score INT,
  proposed_away_score INT,
  reason TEXT,
  status dispute_status DEFAULT 'open',
  resolution TEXT,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_disputes_game ON disputes(game_id);
CREATE INDEX idx_disputes_status ON disputes(status);

-- ============================================
-- BADGES
-- ============================================
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT
);

-- ============================================
-- USER BADGES
-- ============================================
CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- ============================================
-- TEAM FOLLOWS
-- ============================================
CREATE TABLE team_follows (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  notify BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, school_id)
);

CREATE INDEX idx_team_follows_school ON team_follows(school_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE read = false;

-- ============================================
-- TRUSTED REPORTER APPLICATIONS
-- ============================================
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE trusted_reporter_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  school_affiliation TEXT,
  id_verification_url TEXT,
  reason TEXT,
  status application_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_applications_status ON trusted_reporter_applications(status);

-- ============================================
-- AUDIT LOG
-- ============================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_reporter_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Public read access for schools, sports, games, game_scores, badges
CREATE POLICY "Public read schools" ON schools FOR SELECT USING (true);
CREATE POLICY "Public read sports" ON sports FOR SELECT USING (true);
CREATE POLICY "Public read games" ON games FOR SELECT USING (true);
CREATE POLICY "Public read game_scores" ON game_scores FOR SELECT USING (true);
CREATE POLICY "Public read badges" ON badges FOR SELECT USING (true);

-- Users can read their own data, public can see limited user info
CREATE POLICY "Users read own data" ON users FOR SELECT
  USING (auth.uid() = id OR true); -- Public leaderboard access

CREATE POLICY "Users update own data" ON users FOR UPDATE
  USING (auth.uid() = id);

-- Submissions: public read, authenticated create
CREATE POLICY "Public read submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Auth create submissions" ON submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Disputes: public read, authenticated create
CREATE POLICY "Public read disputes" ON disputes FOR SELECT USING (true);
CREATE POLICY "Auth create disputes" ON disputes FOR INSERT
  WITH CHECK (auth.uid() = disputed_by);

-- User badges: public read
CREATE POLICY "Public read user_badges" ON user_badges FOR SELECT USING (true);

-- Team follows: users manage their own
CREATE POLICY "Users read own follows" ON team_follows FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users manage own follows" ON team_follows FOR ALL
  USING (auth.uid() = user_id);

-- Notifications: users read their own
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Trusted reporter applications: users can create and read their own
CREATE POLICY "Users read own applications" ON trusted_reporter_applications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users create applications" ON trusted_reporter_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Audit log: admin only (handled via service role)
CREATE POLICY "Admin read audit" ON audit_log FOR SELECT USING (false);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for games updated_at
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone, email, display_name)
  VALUES (
    NEW.id,
    NEW.phone,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for live score updates
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;
