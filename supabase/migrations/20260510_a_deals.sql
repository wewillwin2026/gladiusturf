-- Deal pipeline — close-during-demo flow (Phase 1, board memo 2026-05-09).
--
-- Three tables:
--   deals              — one row per close-attempt; carries status, tier,
--                        Stripe IDs, contract artifacts, prospect contact
--   deal_events        — append-only audit row per state transition
--   stripe_events      — webhook event_id dedupe substrate (idempotence)
--
-- The /close/[token] route looks up by token (base62, 16 chars) and the
-- token IS the auth — no session required. RLS denies anon/authenticated
-- on all three; service-role only.
--
-- Phase 1 ships up through `paid`. Phases 2-3 (signing + provisioning)
-- gate on the manual-close benchmark per Buffett.

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  status text not null default 'draft' check (status in (
    'draft','sent','paying','paid','awaiting_signature',
    'signed','provisioning','active','refunded','voided'
  )),

  prospect_email text not null,
  prospect_company text not null,
  prospect_phone text,

  tier text not null check (tier in ('starter','growth','enterprise')),
  custom_price_cents int not null,
  addon_bdc boolean not null default false,
  notes text,

  founder_owner_email text not null,

  -- Provisioned tenant — null until status='active'.
  tenant_id uuid references public.tenants(id),

  -- Stripe linkage. Customer + subscription + first PI captured on the
  -- first /close/[token] interaction; we never touch cards directly.
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_payment_intent_id text,

  -- Contract artifacts (Phase 2). Path is in supabase storage:
  --   contracts/deals/{deal_id}/{signed_at}.pdf
  contract_pdf_path text,

  sent_at timestamptz,
  paid_at timestamptz,
  signed_at timestamptz,
  activated_at timestamptz,
  refunded_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deals_token_idx on public.deals (token);
create index if not exists deals_owner_status_idx
  on public.deals (founder_owner_email, status, created_at desc);
create index if not exists deals_status_idx
  on public.deals (status, created_at desc);

alter table public.deals enable row level security;
revoke all on table public.deals from anon, authenticated;

-- Append-only audit. One row per state transition, plus arbitrary
-- founder/system action notes. Reads via service-role from the deal
-- detail drawer in the war-room.
create table if not exists public.deal_events (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  from_state text,
  to_state text,
  -- 'founder' | 'prospect' | 'stripe' | 'system'
  actor text not null,
  actor_email text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists deal_events_deal_idx
  on public.deal_events (deal_id, created_at desc);

alter table public.deal_events enable row level security;
revoke all on table public.deal_events from anon, authenticated;

-- Stripe webhook idempotence dedupe. The webhook handler INSERTS this
-- row BEFORE side effects; if the row already exists the handler
-- returns 200 immediately. This keeps event reordering / replay safe.
create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  deal_id uuid references public.deals(id) on delete set null,
  processed boolean not null default false,
  processed_at timestamptz not null default now()
);

create index if not exists stripe_events_type_idx
  on public.stripe_events (type, processed_at desc);

alter table public.stripe_events enable row level security;
revoke all on table public.stripe_events from anon, authenticated;

comment on table public.deals is
  'Close-during-demo pipeline. /close/[token] is the prospect-facing flow; /founders/war-room/deals is the founder dashboard. Token is auth.';
comment on column public.deals.token is
  'base62, 16 chars. Unique per deal. Treat as a bearer secret — anyone with the URL can complete payment.';
comment on column public.deals.custom_price_cents is
  'First-month total in cents. Allows grandfathering (Bright Lights at $397) and pilot pricing.';
