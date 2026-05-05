-- Phase 2 — multi-tenant foundation per ~/Downloads/LIGHTING_LEGENDARY.md §6.
--
-- This is the minimum useful first slice: tenants + memberships + helpers +
-- a universal customers table + audit_log. Lighting-specific tables
-- (lighting_fixtures, lighting_transformers, etc) and the rest of the
-- universal tables (proposals, schedule_items, plans, conversations,
-- storm_responses, operator_memories) ship in later commits — adding all
-- of them at once would swell the diff and we don't have product surface
-- for them yet.
--
-- Idempotent: safe to re-run. Existing tables (vertical_leads, demo_requests,
-- visitors / sessions / tracking_events, founder_secrets) are untouched.

-- =============================================================
-- Tenants — one row per paying customer (or pilot, or founder shop)
-- =============================================================
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  display_name text not null,
  legal_name text,
  vertical text not null check (vertical in (
    'lighting','irrigation','pool','landscape','lawn-care','tree-care','snow','commercial'
  )),
  plan_tier text not null default 'independent' check (plan_tier in (
    'independent','professional','enterprise','growth_pilot'
  )),
  stripe_customer_id text,
  stripe_subscription_id text,
  ai_tier text not null default 'sonnet' check (ai_tier in ('haiku','sonnet','opus')),
  brand_primary_hex text,
  brand_accent_hex text,
  service_area_zips text[],
  primary_language text not null default 'en',
  bilingual boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists tenants_slug_idx on public.tenants (slug);
create index if not exists tenants_vertical_idx on public.tenants (vertical);

-- =============================================================
-- Tenant memberships — auth.users ↔ tenants, with role
-- =============================================================
create table if not exists public.tenant_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','operator','viewer')),
  display_name text,
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create index if not exists tenant_members_user_idx on public.tenant_members (user_id);
create index if not exists tenant_members_tenant_idx on public.tenant_members (tenant_id);

-- =============================================================
-- Helpers — used in every RLS policy below
-- =============================================================
create or replace function public.is_tenant_member(t_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tenant_members tm
    where tm.tenant_id = t_id
      and tm.user_id = auth.uid()
  );
$$;

create or replace function public.my_tenant_ids()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select tenant_id from public.tenant_members where user_id = auth.uid();
$$;

-- =============================================================
-- Customers — universal across every vertical
-- =============================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  display_name text not null,
  primary_email text,
  primary_phone text,
  preferred_language text not null default 'en' check (preferred_language in ('en','es')),
  service_address jsonb,
  customer_tier text,
  is_snowbird boolean not null default false,
  away_until date,
  salt_air_zone boolean not null default false,
  notes text,
  source text,
  acquired_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_tenant_created_idx
  on public.customers (tenant_id, created_at desc);
create index if not exists customers_search_idx
  on public.customers using gin (
    to_tsvector('english',
      coalesce(display_name,'') || ' ' ||
      coalesce(primary_email,'') || ' ' ||
      coalesce(primary_phone,'')
    )
  );

-- =============================================================
-- Audit log — every meaningful action, scoped to tenant
-- =============================================================
create table if not exists public.audit_log (
  id bigserial primary key,
  tenant_id uuid references public.tenants(id) on delete cascade,
  user_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}',
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_tenant_created_idx
  on public.audit_log (tenant_id, created_at desc);

-- =============================================================
-- RLS — every tenant-scoped table is gated on is_tenant_member()
-- =============================================================
alter table public.tenants enable row level security;
alter table public.tenant_members enable row level security;
alter table public.customers enable row level security;
alter table public.audit_log enable row level security;

-- Tenants: members read their own tenant; service_role writes
drop policy if exists "members read tenant" on public.tenants;
create policy "members read tenant"
  on public.tenants for select
  using (public.is_tenant_member(id));

drop policy if exists "service writes tenants" on public.tenants;
create policy "service writes tenants"
  on public.tenants for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Tenant members: a user reads their own membership row + any membership in
-- a tenant they belong to. Service role writes (via the Supabase admin
-- client during signup / invite flows).
drop policy if exists "members read memberships" on public.tenant_members;
create policy "members read memberships"
  on public.tenant_members for select
  using (
    user_id = auth.uid()
    or public.is_tenant_member(tenant_id)
  );

drop policy if exists "service writes memberships" on public.tenant_members;
create policy "service writes memberships"
  on public.tenant_members for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Customers: tenant scoping
drop policy if exists "tenant rows" on public.customers;
create policy "tenant rows"
  on public.customers for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- Audit log: members read their tenant's log, service writes
drop policy if exists "members read audit" on public.audit_log;
create policy "members read audit"
  on public.audit_log for select
  using (public.is_tenant_member(tenant_id));

drop policy if exists "service writes audit" on public.audit_log;
create policy "service writes audit"
  on public.audit_log for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
