-- Phase 5.1 — universal tables per LIGHTING_LEGENDARY §6.
--
-- These tables exist in every tenant's workspace regardless of vertical:
-- proposals, schedule_items, conversations, messages, storm_events,
-- storm_responses, review_requests. Each is tenant-scoped via tenant_id
-- with RLS gated on is_tenant_member.
--
-- Empty initially. Future migrations will pre-seed Bright Lights data
-- (e.g. converting MIKE_JACKSON_HISTORY into schedule_items rows). The
-- /app/(authed)/{schedule,quotes,inbox,reports,invoices,jobs} pages
-- currently show TenantEmptyState for tenants — once these tables fill
-- with data, we can swap those empty states for real DataTable views.

-- =============================================================
-- Proposals — quote/estimate, lifecycle stages
-- =============================================================
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  vertical text not null,
  status text not null default 'draft' check (status in (
    'draft','sent','viewed','walked','sold','installed','lost'
  )),
  total_cents integer,
  language text not null default 'en' check (language in ('en','es')),
  ai_drafted boolean not null default false,
  ai_context jsonb,
  bom jsonb,
  pdf_url text,
  sent_at timestamptz,
  viewed_at timestamptz,
  walked_at timestamptz,
  sold_at timestamptz,
  installed_at timestamptz,
  lost_at timestamptz,
  lost_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists proposals_tenant_status_idx
  on public.proposals (tenant_id, status, created_at desc);
create index if not exists proposals_customer_idx
  on public.proposals (customer_id, status);

alter table public.proposals enable row level security;
drop policy if exists "tenant rows" on public.proposals;
create policy "tenant rows"
  on public.proposals for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- =============================================================
-- Schedule items — visits, installs, warranty calls
-- =============================================================
create table if not exists public.schedule_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  type text not null check (type in (
    'install','service','quote_visit','warranty','plan_visit',
    'holiday_install','storm_response','other'
  )),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled' check (status in (
    'scheduled','en_route','on_site','completed','canceled','no_show'
  )),
  assignee_user_id uuid references auth.users(id) on delete set null,
  route_position integer,
  notes text,
  completion_photos text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists schedule_items_tenant_starts_idx
  on public.schedule_items (tenant_id, starts_at);
create index if not exists schedule_items_assignee_idx
  on public.schedule_items (assignee_user_id, starts_at);
create index if not exists schedule_items_customer_idx
  on public.schedule_items (customer_id, starts_at desc);

alter table public.schedule_items enable row level security;
drop policy if exists "tenant rows" on public.schedule_items;
create policy "tenant rows"
  on public.schedule_items for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- =============================================================
-- Conversations + messages — inbox surface for SMS / email / voice
-- =============================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  channel text not null check (channel in ('sms','email','voice','portal','review','other')),
  external_thread_id text,
  language text not null default 'en' check (language in ('en','es')),
  last_message_at timestamptz,
  unread_count integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists conversations_tenant_recent_idx
  on public.conversations (tenant_id, last_message_at desc nulls last);
create index if not exists conversations_customer_idx
  on public.conversations (customer_id, last_message_at desc nulls last);

alter table public.conversations enable row level security;
drop policy if exists "tenant rows" on public.conversations;
create policy "tenant rows"
  on public.conversations for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  direction text not null check (direction in ('inbound','outbound')),
  body text,
  language text check (language in ('en','es')),
  attachments jsonb,
  ai_summary text,
  sent_at timestamptz not null default now()
);

create index if not exists messages_conversation_sent_idx
  on public.messages (conversation_id, sent_at desc);

alter table public.messages enable row level security;
drop policy if exists "tenant rows" on public.messages;
create policy "tenant rows"
  on public.messages for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- =============================================================
-- Storm response — NOAA-driven outreach engine
-- =============================================================
-- storm_events is GLOBAL (not tenant-scoped) — many tenants can be
-- affected by the same storm. Service-role writes only; reads are open
-- to authenticated users (a tenant member needs to see if their service
-- area is in a cone).
create table if not exists public.storm_events (
  id uuid primary key default gen_random_uuid(),
  noaa_event_id text unique,
  storm_name text,
  category text check (category in (
    'tropical_storm','hurricane','freeze','tornado','severe_thunderstorm','flood','other'
  )),
  cone_geojson jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  states_affected text[],
  zips_affected text[],
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists storm_events_active_idx
  on public.storm_events (active, starts_at desc);

alter table public.storm_events enable row level security;
drop policy if exists "authenticated read storms" on public.storm_events;
create policy "authenticated read storms"
  on public.storm_events for select
  using (auth.role() in ('authenticated','service_role'));
drop policy if exists "service writes storms" on public.storm_events;
create policy "service writes storms"
  on public.storm_events for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- storm_responses is the per-tenant activation log + outcome stats
create table if not exists public.storm_responses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  storm_event_id uuid not null references public.storm_events(id) on delete cascade,
  activated_at timestamptz not null default now(),
  customers_in_path integer,
  outreach_sent integer not null default 0,
  responses_received integer not null default 0,
  bookings_generated integer not null default 0,
  revenue_cents integer not null default 0,
  notes text,
  unique (tenant_id, storm_event_id)
);

create index if not exists storm_responses_tenant_recent_idx
  on public.storm_responses (tenant_id, activated_at desc);

alter table public.storm_responses enable row level security;
drop policy if exists "tenant rows" on public.storm_responses;
create policy "tenant rows"
  on public.storm_responses for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- =============================================================
-- Review requests — auto-ask after completed visits
-- =============================================================
create table if not exists public.review_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  schedule_item_id uuid references public.schedule_items(id) on delete set null,
  channel text not null check (channel in ('email','sms')),
  language text not null default 'en' check (language in ('en','es')),
  sent_at timestamptz,
  responded_at timestamptz,
  posted_at timestamptz,
  platform text,
  rating integer check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create index if not exists review_requests_tenant_recent_idx
  on public.review_requests (tenant_id, sent_at desc nulls last);

alter table public.review_requests enable row level security;
drop policy if exists "tenant rows" on public.review_requests;
create policy "tenant rows"
  on public.review_requests for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));
