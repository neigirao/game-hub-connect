ALTER TABLE public.leaderboard_entries
  ADD COLUMN IF NOT EXISTS level_id INTEGER REFERENCES public.levels(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_level_id ON public.leaderboard_entries(level_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user_level ON public.leaderboard_entries(user_id, level_id);
