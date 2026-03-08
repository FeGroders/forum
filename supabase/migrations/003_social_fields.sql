-- Adiciona campos de redes sociais na tabela profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS github    TEXT,
  ADD COLUMN IF NOT EXISTS twitter   TEXT,
  ADD COLUMN IF NOT EXISTS linkedin  TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS discord   TEXT;
