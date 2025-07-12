-- Users table for both parents and children
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE, -- Only for parents
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'child')),
  parent_id UUID REFERENCES users(id), -- For child accounts
  avatar TEXT,
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  time_taken INTEGER, -- in milliseconds
  mistakes INTEGER DEFAULT 0,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Play sessions table for time tracking
CREATE TABLE IF NOT EXISTS play_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in minutes
  games_played INTEGER DEFAULT 0
);

-- Settings table for parental controls
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  daily_time_limit INTEGER DEFAULT 30, -- in minutes
  play_schedule TEXT DEFAULT 'anytime', -- 'anytime', 'after-school', 'weekend'
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data and their children's data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id OR parent_id = auth.uid());

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id OR parent_id = auth.uid());

-- Scores policies
CREATE POLICY "Users can view own scores" ON scores
  FOR SELECT USING (
    user_id = auth.uid() OR 
    user_id IN (SELECT id FROM users WHERE parent_id = auth.uid())
  );

CREATE POLICY "Users can insert own scores" ON scores
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Badges policies
CREATE POLICY "Users can view own badges" ON badges
  FOR SELECT USING (
    user_id = auth.uid() OR 
    user_id IN (SELECT id FROM users WHERE parent_id = auth.uid())
  );

CREATE POLICY "Users can insert own badges" ON badges
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Play sessions policies
CREATE POLICY "Users can view own sessions" ON play_sessions
  FOR SELECT USING (
    user_id = auth.uid() OR 
    user_id IN (SELECT id FROM users WHERE parent_id = auth.uid())
  );

CREATE POLICY "Users can insert own sessions" ON play_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Settings policies
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (
    user_id = auth.uid() OR 
    user_id IN (SELECT id FROM users WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents can update child settings" ON user_settings
  FOR ALL USING (
    user_id = auth.uid() OR 
    user_id IN (SELECT id FROM users WHERE parent_id = auth.uid())
  );
