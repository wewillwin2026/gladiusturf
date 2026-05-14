-- Marketing Tracker — 2026-05-14.
--
-- Per-tenant web tracker. Bright Lights ships a new website with a
-- custom tracker pixel that POSTs to /api/marketing/track. Events
-- land scoped to the tenant via the tenant slug supplied in the
-- payload. Two thin tables:
--
--   web_sessions  → one row per visitor session (cookie / fp)
--   web_events    → many rows per session (page_view, form_start,
--                   form_submit, click, etc.)
--
-- A new boolean on `tenants.marketing_tab_enabled` gates the sidebar
-- tab so it only appears once the tenant's site is pointing at the
-- endpoint. Until then we still show the Dashboard summary card
-- (empty-state until data arrives).

-- =============================================================
-- tenants.marketing_tab_enabled — sidebar visibility flag
-- =============================================================
alter table public.tenants
  add column if not exists marketing_tab_enabled boolean not null default false;

comment on column public.tenants.marketing_tab_enabled is
  'When true, /app/marketing tab is visible. Flip to true once the tenant''s site is pointing at /api/marketing/track and at least 24h of data has landed.';

-- =============================================================
-- web_sessions — one row per visitor session
-- =============================================================
create table if not exists public.web_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  -- Deterministic visitor hash (IP + UA salted). Same visitor on the
  -- same device returns the same hash, so repeat visits stitch.
  visitor_hash text not null,
  -- Optional customer match. The ingest endpoint resolves this when
  -- the tracker payload includes a phone or email (e.g. form submit).
  customer_id uuid references public.customers(id) on delete set null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  -- Marketing attribution captured on first event of the session.
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  landing_path text,
  -- Device + geography (best-effort from headers).
  device text check (device in ('mobile', 'tablet', 'desktop', 'bot', 'unknown')),
  country text,
  region text,
  city text,
  user_agent text,
  -- Rollup counters maintained by the ingest endpoint for cheap
  -- dashboard reads (no need to GROUP BY web_events every render).
  page_view_count integer not null default 0,
  form_start_count integer not null default 0,
  form_submit_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists web_sessions_tenant_idx
  on public.web_sessions (tenant_id, last_seen_at desc);
create index if not exists web_sessions_visitor_idx
  on public.web_sessions (tenant_id, visitor_hash);
create index if not exists web_sessions_customer_idx
  on public.web_sessions (tenant_id, customer_id)
  where customer_id is not null;
create index if not exists web_sessions_utm_idx
  on public.web_sessions (tenant_id, utm_source, last_seen_at desc);

alter table public.web_sessions enable row level security;
drop policy if exists "tenant rows" on public.web_sessions;
create policy "tenant rows"
  on public.web_sessions for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- =============================================================
-- web_events — every page view / interaction
-- =============================================================
create table if not exists public.web_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  web_session_id uuid not null references public.web_sessions(id) on delete cascade,
  kind text not null check (kind in (
    'page_view',
    'form_start',
    'form_submit',
    'click',
    'scroll_depth',
    'phone_click',
    'email_click',
    'cta_click',
    'exit',
    'custom'
  )),
  path text,
  target text,
  meta jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists web_events_session_idx
  on public.web_events (web_session_id, occurred_at desc);
create index if not exists web_events_tenant_idx
  on public.web_events (tenant_id, occurred_at desc);
create index if not exists web_events_kind_idx
  on public.web_events (tenant_id, kind, occurred_at desc);

alter table public.web_events enable row level security;
drop policy if exists "tenant rows" on public.web_events;
create policy "tenant rows"
  on public.web_events for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

comment on table public.web_sessions is
  'Per-tenant web tracker sessions — one row per visitor session, stitched by visitor_hash.';
comment on table public.web_events is
  'Per-tenant web tracker events — page views, form starts, clicks, etc.';
