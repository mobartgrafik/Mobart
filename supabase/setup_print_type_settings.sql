create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_settings_set_updated_at on public.app_settings;

create trigger app_settings_set_updated_at
before update on public.app_settings
for each row
execute function public.set_updated_at();

alter table public.app_settings enable row level security;

drop policy if exists "authenticated users can read app settings" on public.app_settings;
create policy "authenticated users can read app settings"
on public.app_settings
for select
to authenticated
using (true);

drop policy if exists "authenticated users can manage print type config" on public.app_settings;
drop policy if exists "authenticated users can manage service settings" on public.app_settings;
create policy "authenticated users can manage service settings"
on public.app_settings
for all
to authenticated
using (key in ('print_type_config', 'employee_list', 'designer_list'))
with check (key in ('print_type_config', 'employee_list', 'designer_list'));

insert into public.app_settings (key, value)
values (
  'print_type_config',
  '[]'::jsonb
)
on conflict (key) do nothing;

insert into public.app_settings (key, value)
values
  ('employee_list', '["Kinga","Kinga Noszczyk","Klaudia","Gabryś","Łukasz","Darek","Robert","Artur"]'::jsonb),
  ('designer_list', '["Gabriel","Klaudia"]'::jsonb)
on conflict (key) do nothing;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  email text,
  display_name text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

alter table public.user_profiles enable row level security;

create or replace function public.is_app_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where id = auth.uid() and is_admin = true
  );
$$;

grant execute on function public.is_app_admin() to authenticated;

create or replace function public.prevent_self_admin_removal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.id = auth.uid() and old.is_admin = true and new.is_admin = false then
    raise exception 'Nie możesz odebrać sobie uprawnień administratora.';
  end if;

  return new;
end;
$$;

drop trigger if exists user_profiles_prevent_self_admin_removal on public.user_profiles;

create trigger user_profiles_prevent_self_admin_removal
before update on public.user_profiles
for each row
execute function public.prevent_self_admin_removal();

drop policy if exists "authenticated users can read profiles" on public.user_profiles;
create policy "authenticated users can read profiles"
on public.user_profiles
for select
to authenticated
using (true);

drop policy if exists "users can insert their own profile" on public.user_profiles;
create policy "users can insert their own profile"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = id and is_admin = false);

drop policy if exists "users can update their own basic profile" on public.user_profiles;
create policy "users can update their own basic profile"
on public.user_profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and is_admin = coalesce((select up.is_admin from public.user_profiles up where up.id = auth.uid()), false)
);

drop policy if exists "admins can manage all profiles" on public.user_profiles;
create policy "admins can manage all profiles"
on public.user_profiles
for update
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

insert into public.user_profiles (id, username, email, display_name, avatar_url, is_admin)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
  u.email,
  coalesce(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'displayName'),
  coalesce(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'avatarUrl'),
  case
    when coalesce(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)) in ('kingastachura', 'gabrielsedkowski') then true
    else false
  end
from auth.users u
on conflict (id) do update
set
  username = excluded.username,
  email = excluded.email,
  display_name = excluded.display_name,
  avatar_url = excluded.avatar_url;
