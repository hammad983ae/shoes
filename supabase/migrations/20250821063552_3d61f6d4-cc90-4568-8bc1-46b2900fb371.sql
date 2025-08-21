begin;

-- ---------- PROFILES ----------
alter table public.profiles
  add column if not exists credits           integer not null default 0,
  add column if not exists referrals_count   integer not null default 0,
  add column if not exists referral_code     text,
  add column if not exists referred_by       uuid references auth.users(id) on delete set null;

-- ---------- PRODUCTS ----------
alter table public.products
  add column if not exists title             text,
  add column if not exists brand             text,
  add column if not exists category          text,
  add column if not exists price             numeric,            -- UI uses numeric dollars
  add column if not exists slashed_price     numeric,
  add column if not exists limited           boolean not null default false,
  add column if not exists infinite_stock    boolean not null default false,
  add column if not exists size_type         text,
  add column if not exists materials         text,
  add column if not exists care_instructions text,
  add column if not exists shipping_time     text,
  add column if not exists availability      text,
  add column if not exists color             text,
  add column if not exists filters           jsonb not null default '{}'::jsonb;

-- Keep price & price_cents roughly in sync (UI writes price; older code may read price_cents)
create or replace function public.sync_product_price()
returns trigger language plpgsql as $$
begin
  if TG_OP in ('INSERT','UPDATE') then
    if new.price is not null then
      new.price_cents := round(new.price * 100)::int;
    elsif new.price is null and new.price_cents is not null then
      new.price := (new.price_cents::numeric / 100.0);
    end if;
    if new.title is not null and (new.name is null or new.name = '') then
      new.name := new.title;
    elsif (new.title is null or new.title = '') and new.name is not null then
      new.title := new.name;
    end if;
  end if;
  return new;
end$$;

drop trigger if exists trg_products_sync on public.products;
create trigger trg_products_sync
before insert or update on public.products
for each row execute procedure public.sync_product_price();

-- ---------- PRODUCT_MEDIA ----------
alter table public.product_media
  add column if not exists role           text not null default 'gallery',
  add column if not exists display_order  integer not null default 0;

-- Keep role<->kind and display_order<->sort_order in sync so UI can use either
create or replace function public.sync_product_media_aliases()
returns trigger language plpgsql as $$
begin
  if TG_OP in ('INSERT','UPDATE') then
    -- Incoming UI fields → canonical
    if new.role is not null then
      new.kind := new.role;
    end if;
    if new.display_order is not null then
      new.sort_order := new.display_order;
    end if;
    -- Canonical → aliases (if UI only requested originals)
    if new.role is null then
      new.role := new.kind;
    end if;
    if new.display_order is null then
      new.display_order := new.sort_order;
    end if;
  end if;
  return new;
end$$;

drop trigger if exists trg_product_media_sync on public.product_media;
create trigger trg_product_media_sync
before insert or update on public.product_media
for each row execute procedure public.sync_product_media_aliases();

-- ---------- ORDERS ----------
alter table public.orders
  add column if not exists subtotal           numeric,
  add column if not exists coupon_code        text,
  add column if not exists coupon_discount    numeric,
  add column if not exists credits_used       integer,
  add column if not exists discount_amount    numeric,
  add column if not exists payment_method     text,
  add column if not exists shipping_address   jsonb,
  add column if not exists product_details    jsonb,
  add column if not exists order_images       text[],
  add column if not exists estimated_delivery date;

commit;