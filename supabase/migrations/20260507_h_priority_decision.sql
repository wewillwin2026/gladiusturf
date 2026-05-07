-- AI Director's P0 covenant: before any AI touches the Owner's Daily
-- One-Liner pickNextMove() ranking, we need a substrate that records
-- what was shown vs. what the operator clicked vs. what closed that
-- day. Without this table, the day AI re-ranks, we cannot tell whether
-- it's improving on the deterministic baseline or silently making
-- worse decisions.
--
-- Write semantics:
--   - One row per (tenant_id, shown_date_utc, shown_choice). Refreshes
--     within the same UTC day are no-ops.
--   - clicked_at + outcome populated by separate flows:
--       * /api/priority-decision/click  (when CTA tapped)
--       * a future cron that joins to closed deals on the same day
--
-- Privacy: inputs is a small JSONB summary of the briefing — counts
-- only, no customer PII. Trust Director's audit-chain principle: this
-- table is part of the daily Merkle root once stable.

create table if not exists public.priority_decision (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  shown_at timestamptz not null default now(),
  shown_date_utc date generated always as (date(shown_at at time zone 'UTC')) stored,
  shown_choice text not null check (shown_choice in (
    'schedule_today',
    'open_questions',
    'storm_zip',
    'stale_inventory',
    'draft_quotes',
    'first_customer',
    'first_visit',
    'quiet_day'
  )),
  inputs jsonb not null,
  href text not null,
  cta text not null,
  clicked_at timestamptz,
  outcome text check (outcome in ('deal_closed','ignored','dismissed','unknown')),
  created_at timestamptz not null default now()
);

create unique index if not exists priority_decision_dedupe
  on public.priority_decision (tenant_id, shown_date_utc, shown_choice);

create index if not exists priority_decision_tenant_shown_idx
  on public.priority_decision (tenant_id, shown_at desc);

alter table public.priority_decision enable row level security;

drop policy if exists "members read priority_decision" on public.priority_decision;
create policy "members read priority_decision"
  on public.priority_decision for select
  using (public.is_tenant_member(tenant_id));

drop policy if exists "service writes priority_decision" on public.priority_decision;
create policy "service writes priority_decision"
  on public.priority_decision for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
