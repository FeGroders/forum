-- Add badges array to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS badges text[] NOT NULL DEFAULT '{}';
