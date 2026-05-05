-- Phase 3.C — lighting-specific tables per LIGHTING_LEGENDARY §6.
--
-- Three tables: lighting_fixtures, lighting_transformers, lighting_warranty_claims.
-- All tenant-scoped via tenant_id FK; RLS gated on is_tenant_member() helper
-- defined in 20260504_multitenant.sql.
--
-- Each row gets an optional `external_id text` so seeded demo data and
-- future imports can use a natural key (BL-MJ-001, etc.) for idempotent
-- upsert via the per-tenant unique constraint.
--
-- Idempotent: safe to re-run (if not exists + drop policy + create policy).

-- =============================================================
-- Fixtures — every installable luminaire on a customer's property
-- =============================================================
create table if not exists public.lighting_fixtures (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  external_id text,
  fixture_type text not null,
  brand text not null check (brand in ('Cast','Unique','FX','VOLT','Coastal','Kichler','Other')),
  model text,
  wattage_text text,
  install_date date,
  warranty_status text check (warranty_status in ('active','expiring','expired','lifetime')),
  warranty_end date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, external_id)
);

create index if not exists lighting_fixtures_tenant_customer_idx
  on public.lighting_fixtures (tenant_id, customer_id);
create index if not exists lighting_fixtures_warranty_idx
  on public.lighting_fixtures (tenant_id, warranty_status, warranty_end);

alter table public.lighting_fixtures enable row level security;
drop policy if exists "tenant rows" on public.lighting_fixtures;
create policy "tenant rows"
  on public.lighting_fixtures for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- =============================================================
-- Transformers — low-voltage power supplies feeding fixtures
-- =============================================================
create table if not exists public.lighting_transformers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  external_id text,
  brand text,
  model text,
  watts_capacity int,
  watts_loaded int,
  zones int,
  install_date date,
  location_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, external_id)
);

create index if not exists lighting_transformers_tenant_customer_idx
  on public.lighting_transformers (tenant_id, customer_id);

alter table public.lighting_transformers enable row level security;
drop policy if exists "tenant rows" on public.lighting_transformers;
create policy "tenant rows"
  on public.lighting_transformers for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- =============================================================
-- Warranty claims — manufacturer RMA tracking
-- =============================================================
create table if not exists public.lighting_warranty_claims (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  fixture_id uuid references public.lighting_fixtures(id) on delete set null,
  external_id text,
  claim_date date not null default current_date,
  status text not null default 'open' check (status in ('open','approved','denied','closed')),
  manufacturer text,
  rma_number text,
  resolution text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, external_id)
);

create index if not exists lighting_warranty_claims_tenant_customer_idx
  on public.lighting_warranty_claims (tenant_id, customer_id);
create index if not exists lighting_warranty_claims_status_idx
  on public.lighting_warranty_claims (tenant_id, status, claim_date desc);

alter table public.lighting_warranty_claims enable row level security;
drop policy if exists "tenant rows" on public.lighting_warranty_claims;
create policy "tenant rows"
  on public.lighting_warranty_claims for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));
