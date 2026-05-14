-- WordPress plugin integration — 2026-05-14.
--
-- Bright Lights' new WordPress site ships with a plugin that talks to
-- three endpoints: /leads, /webhooks, /health. This migration adds
-- the supporting schema:
--
--   tenants.api_key             — bearer token for plugin auth
--   web_events.web_session_id   — relaxed to nullable so /webhooks
--                                 events without session context land
--   tenant_inbound_leads        — raw provenance of every /leads call
--                                 (so we can replay if matching logic
--                                 needs to change later)
--
-- The plugin authenticates with `Authorization: Bearer <api_key>`.
-- Each tenant gets a unique key on tenant creation; existing tenants
-- are backfilled below.

-- =============================================================
-- tenants.api_key — per-tenant bearer token
-- =============================================================
alter table public.tenants
  add column if not exists api_key text;

-- Backfill any existing tenants without a key.
update public.tenants
  set api_key = 'glx_' || encode(gen_random_bytes(24), 'hex')
  where api_key is null;

alter table public.tenants
  alter column api_key set not null;

alter table public.tenants
  alter column api_key set default 'glx_' || encode(gen_random_bytes(24), 'hex');

create unique index if not exists tenants_api_key_unique
  on public.tenants (api_key);

comment on column public.tenants.api_key is
  'Bearer token used by the WordPress plugin (and any future integrations). Rotatable via founder UI.';

-- =============================================================
-- web_events.web_session_id — relax to nullable for server webhooks
-- =============================================================
alter table public.web_events
  alter column web_session_id drop not null;

-- =============================================================
-- tenant_inbound_leads — raw lead provenance from /leads endpoint
-- =============================================================
create table if not exists public.tenant_inbound_leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  -- Resolved customer if our matching logic found / created one.
  customer_id uuid references public.customers(id) on delete set null,
  -- External lead ID from the upstream system (WP plugin's lead row id).
  external_id text,
  -- Source endpoint — useful when we add more integrations.
  source_endpoint text not null default 'wp_leads' check (source_endpoint in (
    'wp_leads', 'wp_webhooks', 'manual', 'other'
  )),
  -- Flattened core fields for indexed queries.
  name text,
  email text,
  phone text,
  address text,
  service text,
  notes text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  page_url text,
  referrer text,
  -- Full payload kept verbatim for replay / debugging.
  raw_payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists tenant_inbound_leads_tenant_idx
  on public.tenant_inbound_leads (tenant_id, created_at desc);
create index if not exists tenant_inbound_leads_customer_idx
  on public.tenant_inbound_leads (tenant_id, customer_id)
  where customer_id is not null;
create index if not exists tenant_inbound_leads_external_idx
  on public.tenant_inbound_leads (tenant_id, external_id)
  where external_id is not null;

alter table public.tenant_inbound_leads enable row level security;
drop policy if exists "tenant rows" on public.tenant_inbound_leads;
create policy "tenant rows"
  on public.tenant_inbound_leads for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

comment on table public.tenant_inbound_leads is
  'Raw provenance for every /api/integrations/leads call — kept verbatim so we can replay matching logic without losing data.';
