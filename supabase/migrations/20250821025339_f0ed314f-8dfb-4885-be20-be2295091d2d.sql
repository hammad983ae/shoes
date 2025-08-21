-- 1) extensions
create extension if not exists pgcrypto;

-- 2) role enum
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'user_role' and n.nspname = 'public'
  ) then
    create type public.user_role as enum ('user','admin');
  end if;
end$$;

-- 3) profiles table
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role        public.user_role not null default 'user',
  credits_cents integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 4) helper for updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- 5) is_admin() helper (used by your RLS)
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- 6) auto-insert profile on signup (SECURITY DEFINER so it bypasses RLS safely)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 7) RLS
alter table public.profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles_select_own_or_admin') then
    create policy profiles_select_own_or_admin on public.profiles
      for select using (user_id = auth.uid() or public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles_update_own_or_admin') then
    create policy profiles_update_own_or_admin on public.profiles
      for update using (user_id = auth.uid() or public.is_admin())
      with check (user_id = auth.uid() or public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles_insert_service_only') then
    -- only the trigger (SECURITY DEFINER) or service role should insert
    create policy profiles_insert_service_only on public.profiles
      for insert with check (auth.role() = 'service_role');
  end if;
end$$;