-- Phase 5.4 — Irrigation OS schema bootstrap.
--
-- Per the field research at lib/vertical/irrigation/research.ts and
-- ~/Downloads/light fix.pdf §6 ("Specific Feature Recommendations"). The
-- 4-week MVP build sketch (research §7) sequences:
--   Week 1: Backflow Compliance Autopilot — needs irrigation_backflow_assemblies
--   Week 2: Cross-Brand Smart Controller Fleet — needs irrigation_controllers
--   Week 3: Mass-Route Mode + Bilingual Field App — uses schedule_items (universal)
--   Week 4: Watering Restriction Auto-Programmer — uses irrigation_zones
--
-- This migration ships the tenant-scoped DDL only. No data, no UI yet.
-- Tenants get provisioned with vertical='irrigation' once Wedge 1 ships.

-- =============================================================
-- Backflow assemblies — Wedge 1 (highest moat in FL)
-- =============================================================
create table if not exists public.irrigation_backflow_assemblies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  external_id text,
  manufacturer text,
  model text,
  serial text,
  assembly_type text check (assembly_type in ('RP','DC','PVB','AVB','SVB','RPDA','DCDA')),
  size_inches text,
  install_date date,
  last_test_date date,
  fixed_test_due_date date,
  utility text,
  utility_portal text check (utility_portal in (
    'bsi_online','aqua_backflow','jea','sarasota_county','pinellas','hillsborough',
    'orange_ouc','miami_dade_wasd','gru','tampa_bay_water','fort_lauderdale',
    'davie','boca_raton','hollywood','dania_beach','palm_springs','manual'
  )),
  ccn text,
  in_service_status text not null default 'in_service' check (in_service_status in (
    'in_service','removed','non_compliant','pending_replacement'
  )),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, external_id)
);

create index if not exists irrigation_backflow_tenant_due_idx
  on public.irrigation_backflow_assemblies (tenant_id, fixed_test_due_date);
create index if not exists irrigation_backflow_customer_idx
  on public.irrigation_backflow_assemblies (customer_id);

alter table public.irrigation_backflow_assemblies enable row level security;
drop policy if exists "tenant rows" on public.irrigation_backflow_assemblies;
create policy "tenant rows"
  on public.irrigation_backflow_assemblies for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- =============================================================
-- Controllers — Wedge 3 (cross-brand smart controller fleet)
-- =============================================================
create table if not exists public.irrigation_controllers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  external_id text,
  brand text not null check (brand in (
    'Hunter','Hunter Hydrawise','Rachio','Rain Bird','Rain Bird LNK','Rain Bird IQ4',
    'Weathermatic','Centralus','Toro','manual','other'
  )),
  model text,
  mac text,
  serial text,
  brand_account_id text,
  share_status text not null default 'pending' check (share_status in (
    'pending','requested','granted','revoked','manual'
  )),
  api_connected boolean not null default false,
  last_seen_at timestamptz,
  install_date date,
  zones_count integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, external_id)
);

create index if not exists irrigation_controllers_tenant_brand_idx
  on public.irrigation_controllers (tenant_id, brand);
create index if not exists irrigation_controllers_share_idx
  on public.irrigation_controllers (tenant_id, share_status);
create index if not exists irrigation_controllers_customer_idx
  on public.irrigation_controllers (customer_id);

alter table public.irrigation_controllers enable row level security;
drop policy if exists "tenant rows" on public.irrigation_controllers;
create policy "tenant rows"
  on public.irrigation_controllers for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- =============================================================
-- Zones — Wedge 6 (FL watering restriction auto-programmer)
-- =============================================================
create table if not exists public.irrigation_zones (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  controller_id uuid references public.irrigation_controllers(id) on delete set null,
  external_id text,
  zone_number integer not null,
  label text,
  zone_type text check (zone_type in ('spray','rotor','drip','bubbler','mp_rotator','soaker','manual')),
  head_count integer,
  gpm numeric(5,2),
  precip_in_per_hr numeric(5,3),
  square_footage integer,
  last_psi numeric(5,1),
  schedule_minutes integer,
  schedule_days text[],
  reclaimed_water boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, external_id)
);

create index if not exists irrigation_zones_tenant_customer_idx
  on public.irrigation_zones (tenant_id, customer_id, zone_number);
create index if not exists irrigation_zones_controller_idx
  on public.irrigation_zones (controller_id, zone_number);

alter table public.irrigation_zones enable row level security;
drop policy if exists "tenant rows" on public.irrigation_zones;
create policy "tenant rows"
  on public.irrigation_zones for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- =============================================================
-- Valves / heads — Wedge 9 (buried-valve memory + GPS notes)
-- =============================================================
create table if not exists public.irrigation_valves (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  zone_id uuid references public.irrigation_zones(id) on delete set null,
  external_id text,
  asset_type text not null check (asset_type in ('valve','head','manifold','riser','solenoid','master_valve','flow_sensor')),
  manufacturer text,
  model text,
  size_inches text,
  install_date date,
  lat numeric(9,6),
  lng numeric(9,6),
  depth_inches numeric(4,1),
  sleeve_notes text,
  photo_urls text[],
  qr_sticker_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, external_id)
);

create index if not exists irrigation_valves_tenant_customer_idx
  on public.irrigation_valves (tenant_id, customer_id);
create index if not exists irrigation_valves_zone_idx
  on public.irrigation_valves (zone_id);

alter table public.irrigation_valves enable row level security;
drop policy if exists "tenant rows" on public.irrigation_valves;
create policy "tenant rows"
  on public.irrigation_valves for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- =============================================================
-- Customer FL flags — Wedge 4 (snowbird) + Wedge 6 (watering district)
-- Adds optional columns to public.customers; Bright Lights rows pre-set
-- defaults (NOT snowbird, NOT salt-air zone) which are already the
-- default values from the multitenant migration.
-- =============================================================
alter table public.customers
  add column if not exists snowbird_in_state_start_month integer
    check (snowbird_in_state_start_month between 1 and 12),
  add column if not exists snowbird_in_state_end_month integer
    check (snowbird_in_state_end_month between 1 and 12),
  add column if not exists water_district text check (water_district in (
    'swfwmd','sfwmd','sjrwmd','nwfwmd','srwmd','none'
  )),
  add column if not exists water_source text check (water_source in (
    'potable','reclaimed','well','mixed'
  )),
  add column if not exists hoa_name text,
  add column if not exists is_commercial boolean not null default false;

create index if not exists customers_snowbird_idx
  on public.customers (tenant_id) where is_snowbird = true;
