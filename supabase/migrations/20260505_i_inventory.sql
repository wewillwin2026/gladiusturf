-- Phase 8 — inventory tables.
--
-- Two-level model: inventory_items is the SKU catalog (Cast LED Path Light,
-- Unique Demi pool light, etc.); inventory_units is one row per physical
-- box / item on the truck or shelf. Each unit carries its own QR code so
-- camera scanning at receiving creates one row per unit.
--
-- Aging is computed from received_at — the longer a unit sits in_stock
-- without being deployed to a customer, the more capital is tied up.
-- Thresholds (configurable per tenant in v2): fresh < 30d, aging 30-90d,
-- stale 90-180d, dead > 180d.
--
-- RLS: tenant-scoped via is_tenant_member.

-- =============================================================
-- Inventory items (SKU catalog)
-- =============================================================
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sku text not null,
  category text not null check (category in (
    'fixture','transformer','wire','controller','sensor','bulb','accessory','other'
  )),
  group_label text,
  name text not null,
  description text,
  brand text,
  unit text not null default 'ea',
  unit_cost_cents integer,
  unit_price_cents integer,
  par_level integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, sku)
);

create index if not exists inventory_items_tenant_active_idx
  on public.inventory_items (tenant_id, active);
create index if not exists inventory_items_category_idx
  on public.inventory_items (tenant_id, category);

alter table public.inventory_items enable row level security;
drop policy if exists "tenant rows" on public.inventory_items;
create policy "tenant rows"
  on public.inventory_items for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- =============================================================
-- Inventory units (individual boxes / instances)
-- =============================================================
create table if not exists public.inventory_units (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  item_id uuid references public.inventory_items(id) on delete set null,
  qr_code text not null,
  status text not null default 'in_stock' check (status in (
    'in_stock','reserved','deployed','damaged','returned','lost'
  )),
  location text,
  cost_cents integer,
  received_at timestamptz not null default now(),
  deployed_at timestamptz,
  deployed_to_customer_id uuid references public.customers(id) on delete set null,
  scanned_by_user_id uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, qr_code)
);

create index if not exists inventory_units_tenant_status_idx
  on public.inventory_units (tenant_id, status, received_at);
create index if not exists inventory_units_item_status_idx
  on public.inventory_units (item_id, status);
create index if not exists inventory_units_aging_idx
  on public.inventory_units (tenant_id, received_at)
  where status = 'in_stock';

alter table public.inventory_units enable row level security;
drop policy if exists "tenant rows" on public.inventory_units;
create policy "tenant rows"
  on public.inventory_units for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));
