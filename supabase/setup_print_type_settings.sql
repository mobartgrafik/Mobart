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
create policy "authenticated users can manage print type config"
on public.app_settings
for all
to authenticated
using (key = 'print_type_config')
with check (key = 'print_type_config');

insert into public.app_settings (key, value)
values (
  'print_type_config',
  '[]'::jsonb
)
on conflict (key) do nothing;
