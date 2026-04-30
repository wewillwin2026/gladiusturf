-- Tracking layer for the Founders' Secret Tab. Captures every visit, session,
-- and event across gladiusturf.com (marketing), /app (demo CRM), /founders
-- (War Room). Reads gated by RLS to founder allowlist. Writes happen only via
-- the service role from app/api/track/route.ts.

create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  visitor_hash text unique not null,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  country text,
  region text,
  city text,
  user_agent text,
  screen_w int,
  screen_h int
);

create index if not exists visitors_hash_idx on public.visitors (visitor_hash);
create index if not exists visitors_last_seen_idx on public.visitors (last_seen_at desc);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid references public.visitors(id) on delete cascade,
  started_at timestamptz default now(),
  ended_at timestamptz,
  duration_ms int,
  product text,
  bounced boolean default false,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  entry_path text,
  exit_path text
);

create index if not exists sessions_visitor_idx on public.sessions (visitor_id, started_at desc);
create index if not exists sessions_started_idx on public.sessions (started_at desc);

create table if not exists public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade,
  visitor_id uuid references public.visitors(id) on delete cascade,
  ts timestamptz default now(),
  product text not null,
  type text not null,
  path text,
  target text,
  meta jsonb,
  conversion_value_cents int
);

create index if not exists tracking_events_ts_idx on public.tracking_events (ts desc);
create index if not exists tracking_events_visitor_idx on public.tracking_events (visitor_id, ts desc);
create index if not exists tracking_events_product_type_idx on public.tracking_events (product, type);

-- RLS: deny by default; founders can read; only service role writes.
alter table public.visitors enable row level security;
alter table public.sessions enable row level security;
alter table public.tracking_events enable row level security;

-- Drop old policies if re-running.
drop policy if exists "founders read visitors" on public.visitors;
drop policy if exists "founders read sessions" on public.sessions;
drop policy if exists "founders read events" on public.tracking_events;

-- Read policies via auth.email() — works against Supabase Auth JWT.
-- Hardcoded founder list mirrors lib/founders/auth.ts fallback. We keep the
-- list in the policy literal because the GLADIUS_FOUNDER_EMAILS env var only
-- lives in the Next.js runtime, not Postgres.
create policy "founders read visitors"
  on public.visitors for select
  using (
    auth.email() in ('ricardo.gamon99@icloud.com', 'joshuapyorke@gmail.com')
  );

create policy "founders read sessions"
  on public.sessions for select
  using (
    auth.email() in ('ricardo.gamon99@icloud.com', 'joshuapyorke@gmail.com')
  );

create policy "founders read events"
  on public.tracking_events for select
  using (
    auth.email() in ('ricardo.gamon99@icloud.com', 'joshuapyorke@gmail.com')
  );
