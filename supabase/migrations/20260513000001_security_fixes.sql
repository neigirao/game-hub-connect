-- A2: Prevent authenticated users from self-promoting blueprints as featured.
-- The existing blueprints_update_own policy allows any column update; we need a
-- WITH CHECK that blocks changes to is_featured unless the requester is an admin.
DROP POLICY IF EXISTS "blueprints_update_own" ON public.blueprints;

CREATE POLICY "blueprints_update_own"
  ON public.blueprints FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (
    auth.uid() = creator_id
    AND (
      -- is_featured must stay false, OR the user is an admin
      is_featured = false
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = true
      )
    )
  );

-- A9: Missing indexes on hot join / filter columns
CREATE INDEX IF NOT EXISTS idx_daily_picks_blueprint_id
  ON public.daily_picks (blueprint_id);

CREATE INDEX IF NOT EXISTS idx_leaderboard_user_season
  ON public.leaderboard_entries (user_id, season);

-- E12: Prevent negative physics values in leaderboard_entries
ALTER TABLE public.leaderboard_entries
  ADD CONSTRAINT chk_leaderboard_non_negative
  CHECK (
    total_score   >= 0
    AND max_g_force   >= 0
    AND max_speed_kmh >= 0
  );
