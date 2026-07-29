-- TicTac Arena Phase 5 Database Schema Update

-- 1. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    theme VARCHAR(50) DEFAULT 'dark',
    sound_volume INTEGER DEFAULT 80,
    music_volume INTEGER DEFAULT 50,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    privacy VARCHAR(20) DEFAULT 'public',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role VARCHAR(50) DEFAULT 'admin',
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Friend Requests
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(sender_id, receiver_id)
);

-- 4. Friends
CREATE TABLE IF NOT EXISTS public.friends (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id_1 UUID REFERENCES auth.users(id) NOT NULL,
    user_id_2 UUID REFERENCES auth.users(id) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, blocked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS friends_unique_users_idx ON public.friends (LEAST(user_id_1, user_id_2), GREATEST(user_id_1, user_id_2));

-- 5. Messages (Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id), -- For private chat
    room_id VARCHAR(50), -- For game/lobby chat
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'direct', -- direct, game, lobby
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type VARCHAR(50) NOT NULL, -- friend_request, tournament, rank_up
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tournaments
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, live, completed
    type VARCHAR(50) DEFAULT 'single_elimination',
    max_players INTEGER DEFAULT 16,
    creator_id UUID REFERENCES auth.users(id),
    winner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tournament Players
CREATE TABLE IF NOT EXISTS public.tournament_players (
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (tournament_id, user_id)
);

-- 9. Tournament Matches
CREATE TABLE IF NOT EXISTS public.tournament_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    player1_id UUID REFERENCES auth.users(id),
    player2_id UUID REFERENCES auth.users(id),
    winner_id UUID REFERENCES auth.users(id),
    round_number INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, active, completed
    match_room_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id) NOT NULL,
    reported_id UUID REFERENCES auth.users(id) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Spectators
CREATE TABLE IF NOT EXISTS public.spectators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_code VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- SETTING UP RLS (Row Level Security)

-- Friends & Requests (Users can see their own)
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their friendships" ON public.friends
    FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their requests" ON public.friend_requests
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Messages (Sender and Receiver can see, or anyone in the room)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their messages or room messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR room_id IS NOT NULL);

-- Notifications (Users see only their own)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- Tournaments (Public read)
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tournaments are public" ON public.tournaments FOR SELECT USING (true);
ALTER TABLE public.tournament_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tournament players are public" ON public.tournament_players FOR SELECT USING (true);
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tournament matches are public" ON public.tournament_matches FOR SELECT USING (true);

-- Settings (User only)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON public.settings FOR ALL USING (auth.uid() = user_id);

-- Admins (Only admins see)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins visible to admins" ON public.admins
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- Reports (Only admins read)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read reports" ON public.reports
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Add Settings Auto-Create Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_settings() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_settings();
