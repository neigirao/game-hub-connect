-- Leaderboard: entradas de ranking global por temporada
create table public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  blueprint_id uuid references public.blueprints(id) on delete set null,
  -- Score composto
  total_score integer not null,
  survival_rate integer not null default 0,
  adrenaline_score integer not null default 0,
  chaos_score integer not null default 0,
  smoothness_score integer not null default 0,
  creativity_score integer not null default 0,
  -- Métricas do run
  max_g_force numeric(4,2) not null default 0,
  max_speed_kmh integer not null default 0,
  laps_completed integer not null default 0,
  -- Temporada: 'global' ou 'YYYY-MM' (mensal)
  season text not null default 'global',
  submitted_at timestamptz not null default now()
);

alter table public.leaderboard_entries enable row level security;

-- Ranking é público
create policy "leaderboard_select_public"
  on public.leaderboard_entries for select using (true);

-- Usuário envia seu próprio score
create policy "leaderboard_insert_own"
  on public.leaderboard_entries for insert
  with check (auth.uid() = user_id);

-- Índices para ranking rápido
create index leaderboard_season_score_idx
  on public.leaderboard_entries(season, total_score desc);
create index leaderboard_user_idx
  on public.leaderboard_entries(user_id);

-- View: top 100 por temporada com join no perfil
create view public.leaderboard_with_profiles as
select
  le.id,
  le.user_id,
  p.username,
  le.total_score,
  le.survival_rate,
  le.adrenaline_score,
  le.chaos_score,
  le.max_g_force,
  le.max_speed_kmh,
  le.laps_completed,
  le.season,
  le.submitted_at,
  rank() over (partition by le.season order by le.total_score desc) as rank
from public.leaderboard_entries le
join public.profiles p on p.id = le.user_id;
