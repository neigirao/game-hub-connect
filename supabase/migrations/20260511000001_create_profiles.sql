-- Profiles: espelho de auth.users com dados do jogo
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text unique not null,
  coins integer not null default 0,
  xp integer not null default 0,
  level integer not null default 1,
  inventory jsonb not null default '[]',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Qualquer um pode ver perfis (para ranking e compartilhamento)
create policy "profiles_select_public"
  on public.profiles for select using (true);

-- Usuário só atualiza o próprio perfil
create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id);

-- Trigger: cria perfil automaticamente ao registrar usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: atualiza updated_at automaticamente
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();
