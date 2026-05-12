-- Blueprint likes: rastreia quem curtiu qual pista
create table public.blueprint_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  blueprint_id uuid not null references public.blueprints(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, blueprint_id)
);

alter table public.blueprint_likes enable row level security;

create policy "blueprint_likes_select"
  on public.blueprint_likes for select using (true);

create policy "blueprint_likes_insert"
  on public.blueprint_likes for insert
  with check (auth.uid() = user_id);

create policy "blueprint_likes_delete"
  on public.blueprint_likes for delete
  using (auth.uid() = user_id);

create index blueprint_likes_blueprint_idx on public.blueprint_likes(blueprint_id);

-- Toggle like: atômico, incrementa/decrementa contador em blueprints
create or replace function public.toggle_blueprint_like(p_blueprint_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  uid uuid := auth.uid();
  already_liked boolean;
  new_likes integer;
begin
  if uid is null then raise exception 'not_authenticated'; end if;

  select exists(
    select 1 from public.blueprint_likes
    where user_id = uid and blueprint_id = p_blueprint_id
  ) into already_liked;

  if already_liked then
    delete from public.blueprint_likes
    where user_id = uid and blueprint_id = p_blueprint_id;

    update public.blueprints
    set likes = greatest(0, likes - 1)
    where id = p_blueprint_id
    returning likes into new_likes;

    return jsonb_build_object('liked', false, 'likes', coalesce(new_likes, 0));
  else
    insert into public.blueprint_likes (user_id, blueprint_id)
    values (uid, p_blueprint_id);

    update public.blueprints
    set likes = likes + 1
    where id = p_blueprint_id
    returning likes into new_likes;

    return jsonb_build_object('liked', true, 'likes', coalesce(new_likes, 0));
  end if;
end;
$$;

-- Purchase shop item: verifica coins e atualiza inventory
create or replace function public.purchase_shop_item(p_item_id text, p_item_cost integer)
returns jsonb language plpgsql security definer as $$
declare
  prof public.profiles%rowtype;
  inv jsonb;
begin
  select * into prof from public.profiles where id = auth.uid();
  if prof.id is null then raise exception 'not_authenticated'; end if;
  if prof.coins < p_item_cost then raise exception 'insufficient_coins'; end if;

  inv := coalesce(prof.inventory, '[]'::jsonb);
  if inv @> jsonb_build_array(p_item_id) then raise exception 'already_owned'; end if;

  update public.profiles
  set coins = coins - p_item_cost,
      inventory = inv || jsonb_build_array(p_item_id)
  where id = auth.uid();

  return jsonb_build_object(
    'success', true,
    'new_coins', prof.coins - p_item_cost,
    'item_id', p_item_id
  );
end;
$$;
