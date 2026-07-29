-- Add banner column to profiles table for profile customization
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner TEXT;
