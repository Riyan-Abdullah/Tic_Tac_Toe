-- TicTac Arena Phase 3 Database Schema

-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_code VARCHAR(6) UNIQUE NOT NULL,
    player_x UUID REFERENCES auth.users(id),
    player_o UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished', 'abandoned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    winner_id UUID REFERENCES auth.users(id),
    result VARCHAR(20) CHECK (result IN ('win_x', 'win_o', 'draw', 'forfeit_x', 'forfeit_o')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Policies for rooms
CREATE POLICY "Users can view rooms they are part of or waiting rooms"
ON public.rooms
FOR SELECT
USING (
    status = 'waiting' OR 
    player_x = auth.uid() OR 
    player_o = auth.uid()
);

CREATE POLICY "Authenticated users can create rooms"
ON public.rooms
FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated' AND 
    player_x = auth.uid()
);

CREATE POLICY "Users can update rooms they are part of"
ON public.rooms
FOR UPDATE
USING (
    player_x = auth.uid() OR 
    player_o = auth.uid() OR
    (status = 'waiting' AND player_o IS NULL) -- allowing someone to join
);

CREATE POLICY "Users can delete empty or their own rooms"
ON public.rooms
FOR DELETE
USING (
    player_x = auth.uid() OR 
    player_o = auth.uid()
);

-- Policies for matches
CREATE POLICY "Users can view their matches"
ON public.matches
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.rooms 
        WHERE rooms.id = matches.room_id 
        AND (rooms.player_x = auth.uid() OR rooms.player_o = auth.uid())
    )
);

-- Optional: Since backend will likely use a service role key to manage these, 
-- service role bypasses RLS automatically.
