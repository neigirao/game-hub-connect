-- C17: Index em blueprints(is_featured) para queries ORDER BY is_featured DESC
-- usado em /tracks e /admin/blueprints ao filtrar pistas públicas destacadas.
CREATE INDEX IF NOT EXISTS blueprints_featured_idx
  ON public.blueprints (is_featured DESC)
  WHERE is_public = true;
