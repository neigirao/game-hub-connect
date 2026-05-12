-- =============================================================
-- Crash Coaster: consolidated schema migration
-- Aplica no projeto ao vivo (sekuurohkxqktpllebdd) tudo que estava
-- fragmentado em 12 migrations historicas.
-- 100% idempotente.
-- =============================================================

-- ---------- helpers ----------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;

-- ---------- profiles: estende com colunas CC ----------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email      TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username   TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp         INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level      INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inventory  JSONB   NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin   BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned  BOOLEAN NOT NULL DEFAULT false;

-- backfill email/username a partir de auth.users e display_name
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

UPDATE public.profiles
SET username = COALESCE(NULLIF(display_name,''), split_part(COALESCE(email,'player'), '@', 1), 'player_' || substr(id::text, 1, 8))
WHERE username IS NULL;

-- garantir unicidade de username (case-insensitive seguro o suficiente como text unique)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='profiles_username_key') THEN
    -- Resolve duplicatas antes de criar unique
    WITH dups AS (
      SELECT id, username,
             row_number() OVER (PARTITION BY lower(username) ORDER BY created_at) AS rn
      FROM public.profiles
    )
    UPDATE public.profiles p
    SET username = p.username || '_' || substr(p.id::text, 1, 6)
    FROM dups
    WHERE p.id = dups.id AND dups.rn > 1;

    CREATE UNIQUE INDEX profiles_username_key ON public.profiles (username);
  END IF;
END $$;

-- ---------- handle_new_user: popular email + username junto ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INT := 0;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'player'
  );
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || '_' || suffix;
  END LOOP;

  INSERT INTO public.profiles (id, email, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(public.profiles.username, EXCLUDED.username);

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- garante o trigger
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- promove o admin principal
UPDATE public.profiles SET is_admin = true WHERE email = 'neigirao@gmail.com';

-- ---------- blueprints ----------
CREATE TABLE IF NOT EXISTS public.blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Minha Pista',
  track_data jsonb NOT NULL,
  closed_loop boolean NOT NULL DEFAULT false,
  node_count integer NOT NULL DEFAULT 0,
  survival_rate integer NOT NULL DEFAULT 0,
  adrenaline_score integer NOT NULL DEFAULT 0,
  chaos_score integer NOT NULL DEFAULT 0,
  smoothness_score integer NOT NULL DEFAULT 0,
  creativity_score integer NOT NULL DEFAULT 0,
  best_total_score integer NOT NULL DEFAULT 0,
  is_public boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  likes integer NOT NULL DEFAULT 0,
  downloads integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blueprints_select_public" ON public.blueprints;
CREATE POLICY "blueprints_select_public" ON public.blueprints FOR SELECT
  USING (is_public = true OR auth.uid() = creator_id);

DROP POLICY IF EXISTS "blueprints_insert_own" ON public.blueprints;
CREATE POLICY "blueprints_insert_own" ON public.blueprints FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "blueprints_update_own" ON public.blueprints;
CREATE POLICY "blueprints_update_own" ON public.blueprints FOR UPDATE
  USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "blueprints_delete_own" ON public.blueprints;
CREATE POLICY "blueprints_delete_own" ON public.blueprints FOR DELETE
  USING (auth.uid() = creator_id);

DROP TRIGGER IF EXISTS blueprints_updated_at ON public.blueprints;
CREATE TRIGGER blueprints_updated_at BEFORE UPDATE ON public.blueprints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS blueprints_creator_idx ON public.blueprints(creator_id);
CREATE INDEX IF NOT EXISTS blueprints_public_score_idx
  ON public.blueprints(best_total_score DESC) WHERE is_public = true;

-- ---------- levels ----------
CREATE TABLE IF NOT EXISTS public.levels (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  description text,
  scenario text NOT NULL DEFAULT 'parque',
  order_index integer NOT NULL DEFAULT 0,
  budget integer NOT NULL DEFAULT 5000,
  max_nodes integer NOT NULL DEFAULT 30,
  star1_score integer NOT NULL DEFAULT 30,
  star2_score integer NOT NULL DEFAULT 60,
  star3_score integer NOT NULL DEFAULT 90,
  objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
  reward_coins integer NOT NULL DEFAULT 100,
  reward_xp integer NOT NULL DEFAULT 50,
  starter_track jsonb,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "levels_select_published" ON public.levels;
CREATE POLICY "levels_select_published" ON public.levels FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "levels_select_admin" ON public.levels;
CREATE POLICY "levels_select_admin" ON public.levels FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "levels_write_admin" ON public.levels;
CREATE POLICY "levels_write_admin" ON public.levels FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

DROP TRIGGER IF EXISTS levels_updated_at ON public.levels;
CREATE TRIGGER levels_updated_at BEFORE UPDATE ON public.levels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS levels_order_idx ON public.levels(order_index) WHERE is_published = true;

-- ---------- leaderboard_entries ----------
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blueprint_id uuid REFERENCES public.blueprints(id) ON DELETE SET NULL,
  level_id integer REFERENCES public.levels(id) ON DELETE SET NULL,
  total_score integer NOT NULL,
  survival_rate integer NOT NULL DEFAULT 0,
  adrenaline_score integer NOT NULL DEFAULT 0,
  chaos_score integer NOT NULL DEFAULT 0,
  smoothness_score integer NOT NULL DEFAULT 0,
  creativity_score integer NOT NULL DEFAULT 0,
  max_g_force numeric(4,2) NOT NULL DEFAULT 0,
  max_speed_kmh integer NOT NULL DEFAULT 0,
  laps_completed integer NOT NULL DEFAULT 0,
  season text NOT NULL DEFAULT 'global',
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leaderboard_select_public" ON public.leaderboard_entries;
CREATE POLICY "leaderboard_select_public" ON public.leaderboard_entries FOR SELECT USING (true);

DROP POLICY IF EXISTS "leaderboard_insert_own" ON public.leaderboard_entries;
CREATE POLICY "leaderboard_insert_own" ON public.leaderboard_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS leaderboard_season_score_idx
  ON public.leaderboard_entries(season, total_score DESC);
CREATE INDEX IF NOT EXISTS leaderboard_user_idx
  ON public.leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_level_id
  ON public.leaderboard_entries(level_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user_level
  ON public.leaderboard_entries(user_id, level_id);

-- ---------- leaderboard view ----------
DROP VIEW IF EXISTS public.leaderboard_with_profiles;
CREATE VIEW public.leaderboard_with_profiles AS
SELECT
  le.id,
  le.user_id,
  p.username,
  p.avatar_url,
  le.blueprint_id,
  le.level_id,
  le.total_score,
  le.survival_rate,
  le.adrenaline_score,
  le.chaos_score,
  le.smoothness_score,
  le.creativity_score,
  le.max_g_force,
  le.max_speed_kmh,
  le.laps_completed,
  le.season,
  le.submitted_at,
  rank() OVER (PARTITION BY le.season ORDER BY le.total_score DESC) AS rank
FROM public.leaderboard_entries le
JOIN public.profiles p ON p.id = le.user_id;

-- ---------- blueprint_likes ----------
CREATE TABLE IF NOT EXISTS public.blueprint_likes (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blueprint_id uuid NOT NULL REFERENCES public.blueprints(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, blueprint_id)
);

ALTER TABLE public.blueprint_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blueprint_likes_select" ON public.blueprint_likes;
CREATE POLICY "blueprint_likes_select" ON public.blueprint_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "blueprint_likes_insert" ON public.blueprint_likes;
CREATE POLICY "blueprint_likes_insert" ON public.blueprint_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "blueprint_likes_delete" ON public.blueprint_likes;
CREATE POLICY "blueprint_likes_delete" ON public.blueprint_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS blueprint_likes_blueprint_idx ON public.blueprint_likes(blueprint_id);

-- ---------- daily_picks ----------
CREATE TABLE IF NOT EXISTS public.daily_picks (
  date date PRIMARY KEY DEFAULT current_date,
  blueprint_id uuid NOT NULL REFERENCES public.blueprints(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Desafio do Dia',
  description text NOT NULL DEFAULT 'Construa a pista mais caotica possivel!',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_picks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_picks_select" ON public.daily_picks;
CREATE POLICY "daily_picks_select" ON public.daily_picks FOR SELECT USING (true);

DROP POLICY IF EXISTS "daily_picks_insert_admin" ON public.daily_picks;
CREATE POLICY "daily_picks_insert_admin" ON public.daily_picks FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "daily_picks_update_admin" ON public.daily_picks;
CREATE POLICY "daily_picks_update_admin" ON public.daily_picks FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "daily_picks_delete_admin" ON public.daily_picks;
CREATE POLICY "daily_picks_delete_admin" ON public.daily_picks FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- ---------- RPCs ----------
-- award_run_rewards: chamada por play.html ao final de cada corrida
CREATE OR REPLACE FUNCTION public.award_run_rewards(
  p_user_id uuid, p_stars integer, p_crashed boolean
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  xp_gain integer;
  coin_gain integer;
  prof public.profiles%ROWTYPE;
  new_lvl integer;
BEGIN
  IF uid IS NULL OR uid <> p_user_id THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF p_crashed THEN
    xp_gain := 10;
    coin_gain := 5;
  ELSE
    xp_gain := 50 + (GREATEST(p_stars, 0) * 30);
    coin_gain := GREATEST(p_stars, 0) * 100;
  END IF;

  UPDATE public.profiles
  SET xp = xp + xp_gain,
      coins = coins + coin_gain,
      level = GREATEST(1, ((xp + xp_gain) / 500) + 1),
      updated_at = now()
  WHERE id = uid
  RETURNING * INTO prof;

  RETURN jsonb_build_object(
    'xp_gained', xp_gain,
    'coins_gained', coin_gain,
    'new_xp', prof.xp,
    'new_coins', prof.coins,
    'new_level', prof.level
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.award_run_rewards(uuid, integer, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_run_rewards(uuid, integer, boolean) TO authenticated;

-- toggle_blueprint_like
CREATE OR REPLACE FUNCTION public.toggle_blueprint_like(p_blueprint_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  already_liked boolean;
  new_likes integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  SELECT EXISTS(SELECT 1 FROM public.blueprint_likes WHERE user_id = uid AND blueprint_id = p_blueprint_id)
    INTO already_liked;

  IF already_liked THEN
    DELETE FROM public.blueprint_likes WHERE user_id = uid AND blueprint_id = p_blueprint_id;
    UPDATE public.blueprints SET likes = GREATEST(0, likes - 1)
      WHERE id = p_blueprint_id RETURNING likes INTO new_likes;
    RETURN jsonb_build_object('liked', false, 'likes', COALESCE(new_likes, 0));
  ELSE
    INSERT INTO public.blueprint_likes (user_id, blueprint_id) VALUES (uid, p_blueprint_id);
    UPDATE public.blueprints SET likes = likes + 1
      WHERE id = p_blueprint_id RETURNING likes INTO new_likes;
    RETURN jsonb_build_object('liked', true, 'likes', COALESCE(new_likes, 0));
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.toggle_blueprint_like(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.toggle_blueprint_like(uuid) TO authenticated;

-- purchase_shop_item
CREATE OR REPLACE FUNCTION public.purchase_shop_item(p_item_id text, p_item_cost integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  prof public.profiles%ROWTYPE;
  inv jsonb;
BEGIN
  SELECT * INTO prof FROM public.profiles WHERE id = auth.uid();
  IF prof.id IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF prof.coins < p_item_cost THEN RAISE EXCEPTION 'insufficient_coins'; END IF;

  inv := COALESCE(prof.inventory, '[]'::jsonb);
  IF inv @> jsonb_build_array(p_item_id) THEN RAISE EXCEPTION 'already_owned'; END IF;

  UPDATE public.profiles
  SET coins = coins - p_item_cost,
      inventory = inv || jsonb_build_array(p_item_id)
  WHERE id = auth.uid();

  RETURN jsonb_build_object(
    'success', true,
    'new_coins', prof.coins - p_item_cost,
    'item_id', p_item_id
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.purchase_shop_item(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purchase_shop_item(text, integer) TO authenticated;

-- ---------- Seed: 3 fases iniciais (so insere se nao houver nenhuma) ----------
INSERT INTO public.levels
  (title, description, scenario, order_index, star1_score, star2_score, star3_score, objectives, reward_coins, reward_xp, starter_track, is_published)
SELECT * FROM (VALUES
  (
    'Primeira Descida',
    'Sua primeira pista! Sobreviva ate o fim e sinta o vento no rosto.',
    'parque', 1, 30, 60, 90,
    '[{"id":"o1","label":"Sobreviva ate o fim","type":"survive"},{"id":"o2","label":"Atinja 60 km/h","type":"speed","target":60}]'::jsonb,
    50, 100,
    '{"nodes":[{"x":120,"y":420,"kind":"normal"},{"x":260,"y":300,"kind":"normal"},{"x":420,"y":260,"kind":"normal"},{"x":580,"y":380,"kind":"normal"},{"x":740,"y":320,"kind":"normal"},{"x":900,"y":420,"kind":"normal"},{"x":1060,"y":480,"kind":"normal"}],"loop":false}'::jsonb,
    true
  ),
  (
    'Loopings e Boosters',
    'Hora de ganhar velocidade. Use boosters e nao quebre na curva.',
    'montanha', 2, 50, 100, 150,
    '[{"id":"o1","label":"Atinja 100 km/h","type":"speed","target":100},{"id":"o2","label":"G-force 4G ou mais","type":"gforce","target":4}]'::jsonb,
    100, 200,
    '{"nodes":[{"x":120,"y":420,"kind":"normal"},{"x":260,"y":300,"kind":"booster"},{"x":420,"y":220,"kind":"normal"},{"x":580,"y":340,"kind":"normal"},{"x":740,"y":260,"kind":"booster"},{"x":900,"y":380,"kind":"normal"},{"x":1060,"y":300,"kind":"normal"},{"x":1180,"y":440,"kind":"normal"}],"loop":false}'::jsonb,
    true
  ),
  (
    'Caos Total',
    'Pista cheia de boosters e freios. Sobreviva se puder.',
    'vulcao', 3, 80, 160, 240,
    '[{"id":"o1","label":"Atinja 120 km/h","type":"speed","target":120},{"id":"o2","label":"3 quase-mortes","type":"nearmiss","target":3}]'::jsonb,
    200, 400,
    '{"nodes":[{"x":100,"y":420,"kind":"normal"},{"x":240,"y":280,"kind":"booster"},{"x":380,"y":200,"kind":"normal"},{"x":520,"y":340,"kind":"booster"},{"x":680,"y":220,"kind":"normal"},{"x":820,"y":380,"kind":"brake"},{"x":960,"y":260,"kind":"booster"},{"x":1100,"y":420,"kind":"normal"},{"x":1240,"y":480,"kind":"normal"}],"loop":false}'::jsonb,
    true
  )
) AS v(title, description, scenario, order_index, star1_score, star2_score, star3_score, objectives, reward_coins, reward_xp, starter_track, is_published)
WHERE NOT EXISTS (SELECT 1 FROM public.levels);
