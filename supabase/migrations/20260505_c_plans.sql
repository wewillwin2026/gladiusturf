-- Phase 3.B+ — Plans engine per LIGHTING_LEGENDARY §6.
--
-- Two tables:
--   plans                — tenant-defined recurring plans (Bright Basics,
--                          Bright Care, Bright Guardian per Bright Lights).
--   plan_subscriptions   — customer ↔ plan, with starts_at + next_visit_at.
--
-- Both tenant-scoped, RLS via is_tenant_member, idempotent.

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vertical text not null,
  tier text not null check (tier in ('basics','care','guardian','custom')),
  display_name text not null,
  annual_price_cents integer not null,
  visits_per_year integer,
  cadence text,
  features jsonb not null default '[]',
  badge text,
  most_popular boolean not null default false,
  recommended_for text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, tier)
);

create index if not exists plans_tenant_active_idx
  on public.plans (tenant_id, active);

alter table public.plans enable row level security;
drop policy if exists "tenant rows" on public.plans;
create policy "tenant rows"
  on public.plans for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

create table if not exists public.plan_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  starts_at date not null default current_date,
  next_visit_at date,
  status text not null default 'active' check (status in ('active','paused','canceled','expired')),
  paused_reason text,
  created_at timestamptz not null default now(),
  unique (tenant_id, customer_id, plan_id, starts_at)
);

create index if not exists plan_subscriptions_tenant_status_idx
  on public.plan_subscriptions (tenant_id, status);
create index if not exists plan_subscriptions_customer_idx
  on public.plan_subscriptions (customer_id, status);

alter table public.plan_subscriptions enable row level security;
drop policy if exists "tenant rows" on public.plan_subscriptions;
create policy "tenant rows"
  on public.plan_subscriptions for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));
