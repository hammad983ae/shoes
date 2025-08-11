-- Ensure table exists (no changes if it already does)
create table if not exists public.site_metrics (
  key text primary key,
  value integer not null,
  updated_at timestamptz not null default now()
);

insert into public.site_metrics(key, value)
values ('browsing_now', 37)
on conflict (key) do nothing;

alter table public.site_metrics enable row level security;
drop policy if exists site_metrics_read on public.site_metrics;
create policy site_metrics_read on public.site_metrics for select using (true);

-- Gradual-settle nudge function
create or replace function public.nudge_browsing_now()
returns void
language plpgsql
security definer
set search_path to ''
as $$
declare
  cur int;
  step int;
  next int;
begin
  select value into cur from public.site_metrics where key = 'browsing_now' for update;
  if cur is null then
    cur := 37;
    insert into public.site_metrics(key, value) values ('browsing_now', cur)
    on conflict (key) do update set value = excluded.value;
  end if;

  -- random step 1..5
  step := (1 + floor(random()*5))::int;

  if cur > 80 then
    -- above max: step DOWN gradually; stop at 80 when close
    next := greatest(cur - step, 80);
  elsif cur < 5 then
    -- below min: step UP gradually; stop at 5 when close
    next := least(cur + step, 5);
  else
    -- within band: drift ±1..5 but keep within [5,80]
    if random() < 0.5 then
      next := greatest(cur - step, 5);
    else
      next := least(cur + step, 80);
    end if;
  end if;

  update public.site_metrics
  set value = next,
      updated_at = now()
  where key = 'browsing_now';
end;
$$;

-- Schedule every 10 minutes (keeps existing if already present)
create extension if not exists pg_cron;

-- Drop old job if the name was reused elsewhere (ignore error if none)
select cron.unschedule(jobid)
from cron.job
where jobname = 'browsing_now_nudge_every_10m';

select cron.schedule(
  'browsing_now_nudge_every_10m',
  '*/10 * * * *',
  $$ select public.nudge_browsing_now(); $$
);