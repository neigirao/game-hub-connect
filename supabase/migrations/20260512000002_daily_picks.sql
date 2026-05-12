-- Daily challenges: pista do dia escolhida pelo admin
create table public.daily_picks (
  date date primary key default current_date,
  blueprint_id uuid not null references public.blueprints(id) on delete cascade,
  title text not null default 'Desafio do Dia',
  description text not null default 'Construa a pista mais caótica possível!',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.daily_picks enable row level security;

-- Qualquer um pode ver o desafio do dia
create policy "daily_picks_select"
  on public.daily_picks for select using (true);

-- Apenas admins podem criar/editar desafios
create policy "daily_picks_insert_admin"
  on public.daily_picks for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "daily_picks_update_admin"
  on public.daily_picks for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "daily_picks_delete_admin"
  on public.daily_picks for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
