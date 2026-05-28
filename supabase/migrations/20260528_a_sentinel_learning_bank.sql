-- ---------------------------------------------------------------------------
-- GladiusSentinel — Learning Bank for gladiusturf.com
-- ---------------------------------------------------------------------------
-- Three Supabase tables that mirror the gladius-crm SentinelLearnedPattern /
-- SentinelEvent / SentinelIQScore Prisma models. Same column shape, snake_case
-- to match the rest of the gladiusturf schema, RLS DISABLED because all
-- Sentinel writes/reads are service-role only (cron + founders page).
--
-- Brief intent:
--   * sentinel_learned_patterns — long-lived attack-pattern bank. The
--     archetype/specter/predictor scans upsert into this table by
--     pattern_key; subsequent hits bump hit_count + recompute accuracy.
--   * sentinel_events — every meaningful Sentinel verdict (BLOCK, FLAG,
--     KILL_CHAIN_DETECTED, SCHEMA_DRIFT, TENANT_ISOLATION_BREACH,
--     LOCKED_SURFACE_VIOLATION). `federated=false` is the queue the
--     hourly federation cron picks up.
--   * sentinel_iq_scores — every IQ recompute (cron once per 6h). The
--     founders page reads the latest row + plots the 30d series.
-- ---------------------------------------------------------------------------

create table if not exists sentinel_learned_patterns (
  id            uuid primary key default gen_random_uuid(),
  pattern_key   text not null unique,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  hit_count     integer not null default 1,
  accuracy      double precision not null default 1.0,
  vertical      text not null default 'gladiusturf',
  signature     jsonb not null,
  active        boolean not null default true
);

create index if not exists sentinel_learned_patterns_last_seen_idx
  on sentinel_learned_patterns (last_seen_at desc);
create index if not exists sentinel_learned_patterns_active_idx
  on sentinel_learned_patterns (active);

create table if not exists sentinel_events (
  id        uuid primary key default gen_random_uuid(),
  ts        timestamptz not null default now(),
  kind      text not null,
  severity  text not null,
  payload   jsonb not null,
  federated boolean not null default false
);

create index if not exists sentinel_events_ts_idx
  on sentinel_events (ts desc);
create index if not exists sentinel_events_federated_idx
  on sentinel_events (federated)
  where federated = false;
create index if not exists sentinel_events_kind_idx
  on sentinel_events (kind, ts desc);

create table if not exists sentinel_iq_scores (
  id                   uuid primary key default gen_random_uuid(),
  computed_at          timestamptz not null default now(),
  score                integer not null,
  component_breakdown  jsonb not null
);

create index if not exists sentinel_iq_scores_computed_at_idx
  on sentinel_iq_scores (computed_at desc);

-- Service-role only. RLS off because Sentinel is internal infrastructure;
-- no anon/auth user ever touches these rows directly.
alter table sentinel_learned_patterns disable row level security;
alter table sentinel_events disable row level security;
alter table sentinel_iq_scores disable row level security;
