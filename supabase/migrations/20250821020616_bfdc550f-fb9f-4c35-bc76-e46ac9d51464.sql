-- ============= Helpers =============

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() ->> 'role') = 'admin'
    or exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    ),
    false
  );
$$;

-- ============= Canonical credits model =============

create table if not exists public.user_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  available integer not null default 0,
  lifetime_earned integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.credits_ledger (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null check (delta <> 0),
  reason text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.user_balances enable row level security;
alter table public.credits_ledger enable row level security;

-- Read own rows, admins read all
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='user_balances' and policyname='select_own_or_admin'
  ) then
    create policy select_own_or_admin
      on public.user_balances for select
      using (is_admin() or user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='credits_ledger' and policyname='select_own_or_admin'
  ) then
    create policy select_own_or_admin
      on public.credits_ledger for select
      using (is_admin() or user_id = auth.uid());
  end if;

  -- No direct inserts/updates/deletes on balances or ledger (we'll use RPC below)
end $$;

-- Keep balances in sync when a ledger row is inserted
create or replace function public.apply_credits_ledger()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.user_balances as b (user_id, available, lifetime_earned, updated_at)
  values (new.user_id, greatest(new.delta,0), greatest(new.delta,0), now())
  on conflict (user_id) do update
    set available = b.available + new.delta,
        lifetime_earned = b.lifetime_earned + greatest(new.delta,0),
        updated_at = now();

  if (select available from public.user_balances where user_id = new.user_id) < 0 then
    raise exception 'insufficient_credits';
  end if;

  return new;
end $$;

drop trigger if exists trg_apply_credits_ledger on public.credits_ledger;
create trigger trg_apply_credits_ledger
after insert on public.credits_ledger
for each row execute function public.apply_credits_ledger();

-- ============= RPC: write credits via functions =============

create or replace function public.spend_credits(amount integer, reason text, meta jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;
  if amount is null or amount <= 0 then
    raise exception 'amount_must_be_positive';
  end if;

  insert into public.credits_ledger (user_id, delta, reason, meta)
  values (uid, -amount, reason, coalesce(meta,'{}'::jsonb));
end $$;

revoke all on function public.spend_credits(integer, text, jsonb) from public;
grant execute on function public.spend_credits(integer, text, jsonb) to anon, authenticated;

create or replace function public.grant_credits_admin(target_user uuid, amount integer, reason text, meta jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  if target_user is null then
    raise exception 'target_user_required';
  end if;
  if amount is null or amount <= 0 then
    raise exception 'amount_must_be_positive';
  end if;

  insert into public.credits_ledger (user_id, delta, reason, meta)
  values (target_user, amount, reason, coalesce(meta,'{}'::jsonb));
end $$;

revoke all on function public.grant_credits_admin(uuid, integer, text, jsonb) from public;
grant execute on function public.grant_credits_admin(uuid, integer, text, jsonb) to authenticated;

-- ============= Backfill from existing data (soft migrate) =============

-- Seed balances from existing profiles.credits
insert into public.user_balances (user_id, available, lifetime_earned)
select p.user_id, coalesce(p.credits,0), greatest(coalesce(p.credits,0),0)
from public.profiles p
on conflict (user_id) do nothing;

-- If user_credits table exists, prefer its value
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='user_credits') then
    insert into public.user_balances (user_id, available, lifetime_earned)
    select uc.user_id, coalesce(uc.current_balance,0), greatest(coalesce(uc.total_earned,0),0)
    from public.user_credits uc
    on conflict (user_id) do update
      set available = excluded.available,
          lifetime_earned = greatest(public.user_balances.lifetime_earned, excluded.lifetime_earned);
  end if;
end $$;

-- ============= Compatibility view so UI can keep reading `credits` =============

create or replace view public.v_profile_full as
select
  p.user_id,
  p.display_name,
  p.avatar_url,
  p.bio,
  p.role,
  p.is_creator,
  p.commission_rate,
  p.referrals_count,
  p.total_spent,
  p.last_login_at,
  p.created_at,
  p.updated_at,
  p.creator_tier,
  p.coupon_code,
  coalesce(b.available, 0) as credits
from public.profiles p
left join public.user_balances b on b.user_id = p.user_id;

-- NOTE: RLS on the view is governed by underlying tables' policies.
-- Ensure profiles has a select policy for owner/admin:

alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='select_own_or_admin'
  ) then
    create policy select_own_or_admin
      on public.profiles for select
      using (is_admin() or user_id = auth.uid());
  end if;
end $$;

-- (Optional) mark old columns/tables as deprecated for humans
comment on table public.user_credits is 'DEPRECATED: use user_balances + credits_ledger';
comment on column public.profiles.credits is 'DEPRECATED: use v_profile_full.credits (from user_balances)';