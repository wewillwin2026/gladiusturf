-- Maintenance plan campaign launcher (Day-90 success benchmark #1, contract §2.1).
--
-- Two tables:
--   campaigns           — tenant-scoped outbound campaign drafts/scheduled/sent.
--                         Bilingual (body_en + body_es). Channel toggles for
--                         SMS, email, or both. Optional target_tier
--                         (basics/care/guardian — references plans.tier slot)
--                         + audience filter (all / customers without an active
--                         plan subscription).
--   campaign_dispatches — per-customer per-channel audit row. One row per
--                         attempted send; status captures whether the
--                         dispatch went out, was blocked by canSend(),
--                         failed for an env / lookup reason, or was a
--                         test-mode preview.
--
-- Both RLS-gated on is_tenant_member(). Idempotent.

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  body_en text not null default '',
  body_es text not null default '',
  -- Stored as text[] so {sms}, {email}, or {sms,email} are all valid.
  channel text[] not null default '{sms,email}'
    check (
      array_length(channel, 1) is null
      or channel <@ array['sms','email']::text[]
    ),
  -- Nullable: when set, campaign promotes that plan tier slot.
  target_tier text check (target_tier in ('basics','care','guardian')),
  audience_filter text not null default 'all'
    check (audience_filter in ('all','no_plan')),
  status text not null default 'draft'
    check (status in ('draft','scheduled','sending','sent','failed')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  sent_count integer not null default 0,
  opened_count integer not null default 0,
  conversion_count integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaigns_tenant_status_idx
  on public.campaigns (tenant_id, status, created_at desc);
create index if not exists campaigns_tenant_scheduled_idx
  on public.campaigns (tenant_id, scheduled_for)
  where scheduled_for is not null;

alter table public.campaigns enable row level security;
drop policy if exists "tenant rows" on public.campaigns;
create policy "tenant rows"
  on public.campaigns for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

create table if not exists public.campaign_dispatches (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  -- tenant_id denormalized so the RLS policy can gate without joining
  -- through campaigns on every row read; the FK above keeps integrity.
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  channel text not null check (channel in ('sms','email')),
  status text not null check (status in ('sent','dry_run','blocked','failed')),
  error_detail text,
  body_excerpt text,
  dispatched_at timestamptz not null default now()
);

create index if not exists campaign_dispatches_campaign_idx
  on public.campaign_dispatches (campaign_id, dispatched_at desc);
create index if not exists campaign_dispatches_tenant_customer_idx
  on public.campaign_dispatches (tenant_id, customer_id);

alter table public.campaign_dispatches enable row level security;
drop policy if exists "tenant rows" on public.campaign_dispatches;
create policy "tenant rows"
  on public.campaign_dispatches for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));
