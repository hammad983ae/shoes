-- Create site_metrics table for global browsing counter
create table if not exists public.site_metrics (
  key text primary key,
  value integer not null,
  updated_at timestamptz not null default now()
);

-- Insert initial browsing_now value
insert into public.site_metrics(key, value)
values ('browsing_now', 37)
on conflict (key) do nothing;

-- Enable RLS and allow public read access
alter table public.site_metrics enable row level security;

-- READ allowed for everyone (anon + authenticated)
drop policy if exists site_metrics_read on public.site_metrics;
create policy site_metrics_read
on public.site_metrics
for select
using (true);

-- Function to nudge the browsing_now value up or down by 1..5, then clamp to 5..80
create or replace function public.nudge_browsing_now()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  cur int;
  sign int;
  step int;
  next int;
begin
  select value into cur from public.site_metrics where key = 'browsing_now' for update;

  if cur is null then
    cur := 37;
    insert into public.site_metrics(key, value) values ('browsing_now', cur)
    on conflict (key) do update set value = excluded.value;
  end if;

  -- pick + or - with equal probability
  sign := case when random() < 0.5 then -1 else 1 end;
  -- random step from 1..5
  step := (1 + floor(random()*5))::int;

  next := cur + sign * step;

  -- clamp to [5, 80]
  if next < 5 then next := 5; end if;
  if next > 80 then next := 80; end if;

  update public.site_metrics
  set value = next,
      updated_at = now()
  where key = 'browsing_now';
end;
$$;

-- Enable pg_cron extension if not already enabled
create extension if not exists pg_cron;

-- Schedule the function to run every 10 minutes
select cron.schedule(
  'browsing_now_nudge_every_10m',
  '*/10 * * * *',
  $$ select public.nudge_browsing_now(); $$
);