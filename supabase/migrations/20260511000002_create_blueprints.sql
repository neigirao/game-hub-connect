-- Blueprints: pistas salvas pelos usuários
create table public.blueprints (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'Minha Pista',
  track_data jsonb not null,        -- array de nós: [{x,y,kind}]
  closed_loop boolean not null default false,
  node_count integer not null default 0,
  -- Scores da melhor corrida
  survival_rate integer not null default 0,    -- 0-100
  adrenaline_score integer not null default 0, -- 0-100
  chaos_score integer not null default 0,      -- 0-100
  smoothness_score integer not null default 0, -- 0-100
  creativity_score integer not null default 0, -- 0-100
  best_total_score integer not null default 0,
  -- Social
  is_public boolean not null default false,
  likes integer not null default 0,
  downloads integer not null default 0,
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blueprints enable row level security;

-- Qualquer um pode ver pistas públicas
create policy "blueprints_select_public"
  on public.blueprints for select
  using (is_public = true or auth.uid() = creator_id);

-- Usuário cria suas próprias pistas
create policy "blueprints_insert_own"
  on public.blueprints for insert
  with check (auth.uid() = creator_id);

-- Usuário atualiza suas próprias pistas
create policy "blueprints_update_own"
  on public.blueprints for update
  using (auth.uid() = creator_id);

-- Usuário deleta suas próprias pistas
create policy "blueprints_delete_own"
  on public.blueprints for delete
  using (auth.uid() = creator_id);

create trigger blueprints_updated_at
  before update on public.blueprints
  for each row execute function public.update_updated_at();

-- Índices para queries frequentes
create index blueprints_creator_idx on public.blueprints(creator_id);
create index blueprints_public_score_idx on public.blueprints(best_total_score desc) where is_public = true;
