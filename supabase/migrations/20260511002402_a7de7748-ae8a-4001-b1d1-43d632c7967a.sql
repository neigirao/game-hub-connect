
CREATE OR REPLACE FUNCTION public.record_run(
  p_total INTEGER,
  p_max_speed NUMERIC,
  p_max_g NUMERIC,
  p_scenario TEXT,
  p_scores JSONB,
  p_track JSONB
)
RETURNS public.game_progress
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_row public.game_progress;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.game_progress AS gp (
    user_id, best_score, runs, max_speed, max_g, scenario, last_scores, last_track
  )
  VALUES (
    v_user, GREATEST(p_total, 0), 1, COALESCE(p_max_speed, 0), COALESCE(p_max_g, 0),
    p_scenario, p_scores, p_track
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    runs        = gp.runs + 1,
    best_score  = GREATEST(gp.best_score, EXCLUDED.best_score),
    max_speed   = GREATEST(gp.max_speed, EXCLUDED.max_speed),
    max_g       = GREATEST(gp.max_g, EXCLUDED.max_g),
    scenario    = EXCLUDED.scenario,
    last_scores = EXCLUDED.last_scores,
    last_track  = EXCLUDED.last_track,
    updated_at  = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_run(INTEGER, NUMERIC, NUMERIC, TEXT, JSONB, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_run(INTEGER, NUMERIC, NUMERIC, TEXT, JSONB, JSONB) TO authenticated;
