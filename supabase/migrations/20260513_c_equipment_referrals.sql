-- Equipment + Referrals — 2026-05-13.
--
-- Two more thin tables for the minimum-viable surfaces.
-- tenant_equipment: fleet/asset roster
-- customer_referrals: who referred whom + status + reward

create table if not exists public.tenant_equipment (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  display_name text not null,
  -- 'truck' | 'mower' | 'blower' | 'trimmer' | 'lift' | 'trailer' | 'multimeter' | 'other'
  category text not null check (category in (
    'truck', 'mower', 'blower', 'trimmer', 'lift', 'trailer', 'multimeter', 'other'
  )),
  make text,
  model text,
  serial_no text,
  asset_tag text,
  purchase_date date,
  -- 'active' | 'in_shop' | 'retired' | 'lost'
  status text not null default 'active' check (status in ('active', 'in_shop', 'retired', 'lost')),
  assigned_to_crew_member_id uuid references public.crew_members(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tenant_equipment_tenant_idx
  on public.tenant_equipment (tenant_id, status, display_name);

alter table public.tenant_equipment enable row level security;
drop policy if exists "tenant rows" on public.tenant_equipment;
create policy "tenant rows"
  on public.tenant_equipment for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- =============================================================
-- customer_referrals — A referred B; reward and status
-- =============================================================
create table if not exists public.customer_referrals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  referrer_customer_id uuid not null references public.customers(id) on delete cascade,
  -- The referred customer may not yet exist in our customers table (we
  -- might capture "referred Mike Foster" as a freetext name before they
  -- become a paying customer). Both shapes supported.
  referred_customer_id uuid references public.customers(id) on delete set null,
  referred_name text,
  referred_phone text,
  referred_email text,
  -- 'pending' | 'contacted' | 'quoted' | 'won' | 'lost' | 'reward_paid'
  status text not null default 'pending' check (status in (
    'pending', 'contacted', 'quoted', 'won', 'lost', 'reward_paid'
  )),
  reward_cents integer,
  reward_kind text check (reward_kind in (
    'credit', 'cash', 'gift_card', 'free_visit', 'other'
  )),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_referrals_tenant_idx
  on public.customer_referrals (tenant_id, status, created_at desc);
create index if not exists customer_referrals_referrer_idx
  on public.customer_referrals (referrer_customer_id, created_at desc);

alter table public.customer_referrals enable row level security;
drop policy if exists "tenant rows" on public.customer_referrals;
create policy "tenant rows"
  on public.customer_referrals for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

comment on table public.tenant_equipment is
  'Per-tenant equipment roster — trucks, mowers, blowers, multimeters, etc.';
comment on table public.customer_referrals is
  'A referred B — referrer + referred (either by linked customer id or freetext) + status + reward.';
