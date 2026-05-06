-- Daily transparency-root snapshots — Trust Director v2 stretch goal.
--
-- Each UTC day we compute the SHA-256 Merkle root over the audit chain
-- (ai_run + audit_log + cross_tenant_access_log + customer_messaging_consent)
-- and persist it here. The persisted root + the public /transparency page
-- + the /api/transparency/root/[date] verify endpoint together prevent
-- silent history rewrites: once we've published the root for May 8, any
-- after-the-fact mutation of a May-8 row breaks verification.
--
-- v3 will publish each daily root to an external timestamping authority
-- (e.g. OpenTimestamps anchored to Bitcoin) so even Gladius can't deny
-- what it published when. v1 just persists the snapshot.
--
-- Rows are append-only — `created_at` records when the snapshot was
-- taken, `date` is the UTC day it summarizes. (date, tenant_id) is the
-- natural key; one row per tenant per day, plus one all-tenants row
-- with tenant_id NULL.

create table if not exists public.transparency_roots (
  id uuid primary key default gen_random_uuid(),
  -- Nullable: NULL = all-tenants root (engineering forensics).
  tenant_id uuid references public.tenants(id) on delete cascade,
  date date not null,
  root_hex text not null,
  ai_runs_count integer not null default 0,
  audit_events_count integer not null default 0,
  cross_tenant_reads_count integer not null default 0,
  consent_events_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- One snapshot per (tenant, date). Re-running the cron for the same day
-- updates rather than appending — but we expose the original creation
-- time so downstream verifiers can detect a re-snapshot.
create unique index if not exists transparency_roots_tenant_date_idx
  on public.transparency_roots (coalesce(tenant_id::text, ''), date);
create index if not exists transparency_roots_date_idx
  on public.transparency_roots (date desc);

alter table public.transparency_roots enable row level security;

-- Tenants read their own snapshots; the all-tenants (NULL tenant_id)
-- snapshots are not customer-visible (they're for engineering + legal).
drop policy if exists "tenant rows" on public.transparency_roots;
create policy "tenant rows"
  on public.transparency_roots for select
  using (
    tenant_id is not null
    and public.is_tenant_member(tenant_id)
  );
