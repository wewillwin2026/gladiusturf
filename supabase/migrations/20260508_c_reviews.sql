-- Reviews module v1 — Bright Lights pilot launches Monday May 11.
--
-- Per the Bright Lights contract Section 2.1 (reputation/reviews module)
-- and Section 2.2 ("moderation of the public-facing reviews section to
-- remove spam, bot, or off-topic submissions"). Bright Lights has 171
-- five-star Google reviews — Cristian backfills those manually for v1
-- (Google Business Profile API integration ships later).
--
-- Tables:
--   reviews                 — one row per public review (Google, Facebook,
--                             or manually entered). Status drives the
--                             moderation queue: 'published' | 'spam' |
--                             'hidden'. Spam suspects are pre-flagged at
--                             insert time by lib/reviews/spam.ts.
--
-- We also extend tenants with a single boolean (`review_ask_enabled`)
-- for the "auto-send review-ask SMS 3 days after a service visit"
-- toggle. Picked column-on-tenants over a separate settings table for
-- v1 — one boolean is overkill for a join.
--
-- RLS: tenant-scoped via is_tenant_member().
-- Idempotent.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  source text not null check (source in ('google','facebook','manual','yelp','nextdoor')),
  source_url text,
  reviewer_name text not null,
  rating int not null check (rating between 1 and 5),
  body text not null,
  replied boolean not null default false,
  reply_body text,
  replied_at timestamptz,
  status text not null default 'published'
    check (status in ('published','spam','hidden')),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_tenant_submitted_idx
  on public.reviews (tenant_id, submitted_at desc);

create index if not exists reviews_tenant_status_idx
  on public.reviews (tenant_id, status);

alter table public.reviews enable row level security;
drop policy if exists "tenant rows" on public.reviews;
create policy "tenant rows"
  on public.reviews for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- Tenant-level toggle for the post-job review-ask cadence. Default off
-- so we don't silently enrol a tenant into a TCPA-adjacent SMS flow at
-- migration time — they have to opt in from /app/reviews.
alter table public.tenants
  add column if not exists review_ask_enabled boolean not null default false;
