-- Levels: fases da campanha (gerenciadas pelo admin)
create table public.levels (
  id integer primary key generated always as identity,
  title text not null,
  description text,
  scenario text not null default 'Classic Fun Park',
  order_index integer not null default 0,
  budget integer not null default 5000,
  max_nodes integer not null default 30,
  -- Critérios de estrelas (score mínimo para cada estrela)
  star1_score integer not null default 30,
  star2_score integer not null default 60,
  star3_score integer not null default 90,
  -- Objetivos em JSON: [{id, label, type, target}]
  objectives jsonb not null default '[]',
  -- Recompensas ao completar
  reward_coins integer not null default 100,
  reward_xp integer not null default 50,
  -- Pista inicial (pré-construída pelo level designer)
  starter_track jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.levels enable row level security;

-- Todos podem ver fases publicadas
create policy "levels_select_published"
  on public.levels for select
  using (is_published = true);

-- Admin pode ver todas as fases
create policy "levels_select_admin"
  on public.levels for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Só admin gerencia fases
create policy "levels_write_admin"
  on public.levels for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create index levels_order_idx on public.levels(order_index) where is_published = true;

create trigger levels_updated_at
  before update on public.levels
  for each row execute function public.update_updated_at();
