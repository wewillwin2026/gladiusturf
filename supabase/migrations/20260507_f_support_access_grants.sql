-- Per-tenant founder support-access opt-in grants.
--
-- Board Decision 4 (2026-05-06, 4-1) was REBRAND founder cross-tenant
-- access from "always on, disclosed in privacy" to "off by default,
-- tenants explicitly grant per-incident access." Trust + AI directors
-- both flagged this as the cleanest answer for SOC-2 access-control
-- review and the easiest to wire alongside the unified ai_run / audit_log
-- chain.
--
-- v1 lands the storage path:
--   * support_access_grants (one row per tenant × time-bound grant)
--   * cross_tenant_access_log (every founder cross-tenant read writes a row)
--
-- The UI for tenants to grant / revoke ships in a follow-up. Until then,
-- the privacy policy §2.5 disclosure remains the user-facing notice and
-- founders' cross-tenant queries write to the log table on every call so
-- the audit chain is real even before the toggle exists.

create table if not exists public.support_access_grants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  granted_to_email text not null,
  -- Free-text scope description (e.g. "Investigate stuck quote 4521" or
  -- "Onboarding support — full read for first 30 days").
  scope text,
  -- 'active' | 'expired' | 'revoked' — not enforced beyond a check
  -- constraint; the application layer flips state when expires_at
  -- passes or the tenant clicks revoke.
  status text not null default 'active' check (status in ('active','expired','revoked')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  created_by_email text,
  revoked_at timestamptz,
  revoked_by_email text
);

create index if not exists support_access_grants_tenant_idx
  on public.support_access_grants (tenant_id, status, expires_at);

alter table public.support_access_grants enable row level security;
drop policy if exists "tenant rows" on public.support_access_grants;
create policy "tenant rows"
  on public.support_access_grants for select
  using (public.is_tenant_member(tenant_id));

-- Cross-tenant access log — every founder read against another tenant's
-- data writes a row here. Append-only, tenant-scoped read.
create table if not exists public.cross_tenant_access_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_email text not null,
  surface text not null,
  action text not null,
  resource_id uuid,
  reason text,
  granted_by_id uuid references public.support_access_grants(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists cross_tenant_access_log_tenant_created_idx
  on public.cross_tenant_access_log (tenant_id, created_at desc);

alter table public.cross_tenant_access_log enable row level security;
drop policy if exists "tenant rows" on public.cross_tenant_access_log;
create policy "tenant rows"
  on public.cross_tenant_access_log for select
  using (public.is_tenant_member(tenant_id));
