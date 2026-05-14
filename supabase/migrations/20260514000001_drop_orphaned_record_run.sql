-- B6: record_run() e game_progress são órfãos — nenhum código do app os chama.
-- Foram criados em iteração anterior (20260511002402) e substituídos por
-- submit_score() e award_run_rewards(). Remover para limpar o schema.

DROP FUNCTION IF EXISTS public.record_run(
  uuid, integer, integer, integer, integer, integer,
  integer, numeric, integer, integer, text
);

DROP TABLE IF EXISTS public.game_progress;
