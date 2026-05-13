
-- Drop the old permissive insert policy; inserts must now go through submit_score()
DROP POLICY IF EXISTS leaderboard_insert_own ON public.leaderboard_entries;

-- No INSERT policy => direct inserts blocked for normal clients.
-- The SECURITY DEFINER function below bypasses RLS to insert validated rows.

CREATE OR REPLACE FUNCTION public.submit_score(
  p_blueprint_id uuid,
  p_level_id integer,
  p_survival integer,
  p_adrenaline integer,
  p_chaos integer,
  p_smoothness integer,
  p_creativity integer,
  p_max_g numeric,
  p_max_speed_kmh integer,
  p_laps integer,
  p_season text DEFAULT 'global'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  v_total integer;
  v_recent integer;
  v_banned boolean;
  v_new_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Block banned users
  SELECT is_banned INTO v_banned FROM public.profiles WHERE id = uid;
  IF COALESCE(v_banned, false) THEN
    RAISE EXCEPTION 'user_banned';
  END IF;

  -- Validate score components (0..100)
  IF p_survival   < 0 OR p_survival   > 100
  OR p_adrenaline < 0 OR p_adrenaline > 100
  OR p_chaos      < 0 OR p_chaos      > 100
  OR p_smoothness < 0 OR p_smoothness > 100
  OR p_creativity < 0 OR p_creativity > 100 THEN
    RAISE EXCEPTION 'invalid_score_component';
  END IF;

  -- Validate physics ranges
  IF p_max_g IS NULL OR p_max_g < 0 OR p_max_g > 20 THEN
    RAISE EXCEPTION 'invalid_max_g';
  END IF;
  IF p_max_speed_kmh < 0 OR p_max_speed_kmh > 500 THEN
    RAISE EXCEPTION 'invalid_max_speed';
  END IF;
  IF p_laps < 0 OR p_laps > 100 THEN
    RAISE EXCEPTION 'invalid_laps';
  END IF;

  -- Validate season format
  IF p_season IS NULL
     OR (p_season <> 'global' AND p_season !~ '^daily-\d{4}-\d{2}-\d{2}$') THEN
    RAISE EXCEPTION 'invalid_season';
  END IF;

  -- Validate referenced blueprint exists if provided
  IF p_blueprint_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.blueprints WHERE id = p_blueprint_id) THEN
    RAISE EXCEPTION 'blueprint_not_found';
  END IF;

  -- Validate referenced level exists if provided
  IF p_level_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.levels WHERE id = p_level_id) THEN
    RAISE EXCEPTION 'level_not_found';
  END IF;

  -- Rate limit: max 12 submissions per minute per user
  SELECT COUNT(*) INTO v_recent
    FROM public.leaderboard_entries
    WHERE user_id = uid AND submitted_at > now() - interval '1 minute';
  IF v_recent >= 12 THEN
    RAISE EXCEPTION 'rate_limited';
  END IF;

  -- Recompute total server-side (ignore any client-supplied value)
  v_total := ((p_survival + p_adrenaline + p_chaos + p_smoothness + p_creativity) / 5);
  IF v_total <= 0 THEN
    RAISE EXCEPTION 'score_too_low';
  END IF;

  INSERT INTO public.leaderboard_entries (
    user_id, blueprint_id, level_id,
    total_score, survival_rate, adrenaline_score, chaos_score, smoothness_score, creativity_score,
    max_g_force, max_speed_kmh, laps_completed, season
  ) VALUES (
    uid, p_blueprint_id, p_level_id,
    v_total, p_survival, p_adrenaline, p_chaos, p_smoothness, p_creativity,
    ROUND(p_max_g::numeric, 2), p_max_speed_kmh, p_laps, p_season
  )
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object('id', v_new_id, 'total_score', v_total, 'season', p_season);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_score(uuid, integer, integer, integer, integer, integer, integer, numeric, integer, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_score(uuid, integer, integer, integer, integer, integer, integer, numeric, integer, integer, text) TO authenticated;
