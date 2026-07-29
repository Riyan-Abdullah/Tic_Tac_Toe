-- TicTac Arena Phase 4 Database Schema Update

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    avatar VARCHAR(255),
    bio TEXT,
    rating INTEGER DEFAULT 1000,
    rank VARCHAR(50) DEFAULT 'Beginner',
    best_streak INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: We assume a trigger or sign-up hook automatically creates a profile. 
-- For existing users, you may need to insert them manually:
-- INSERT INTO public.profiles (id, username) 
-- SELECT id, email FROM auth.users ON CONFLICT DO NOTHING;

-- 2. Create match_history (Replaces old 'matches' table)
CREATE TABLE IF NOT EXISTS public.match_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_x UUID REFERENCES auth.users(id),
    player_o UUID REFERENCES auth.users(id),
    winner_id UUID REFERENCES auth.users(id),
    result VARCHAR(20) CHECK (result IN ('win_x', 'win_o', 'draw', 'forfeit_x', 'forfeit_o')),
    game_mode VARCHAR(20) DEFAULT 'online', -- 'ai', 'local', 'online'
    difficulty VARCHAR(20), -- For AI matches
    duration_seconds INTEGER,
    moves INTEGER,
    room_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create achievements system
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50),
    points INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for match_history
CREATE POLICY "Matches are viewable by everyone." 
ON public.match_history FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert matches." 
ON public.match_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for achievements (read-only for clients)
CREATE POLICY "Achievements are viewable by everyone." 
ON public.achievements FOR SELECT USING (true);

CREATE POLICY "User achievements are viewable by everyone." 
ON public.user_achievements FOR SELECT USING (true);

-- Function to handle new user signup (auto-create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar)
  VALUES (new.id, new.email, NULL);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Pre-populate some basic achievements
INSERT INTO public.achievements (title, description, icon, points) VALUES
('First Victory', 'Win your first game', 'Trophy', 10),
('Veteran', 'Play 100 Games', 'Shield', 50),
('Unstoppable', 'Achieve a 10-game win streak', 'Flame', 100),
('Legend', 'Reach Legend Rank', 'Crown', 500)
ON CONFLICT DO NOTHING;
