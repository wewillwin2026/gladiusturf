-- Phase 4 — DB-backed invitation map.
--
-- Replaces the hardcoded INVITATIONS object in lib/app/tenant-auth.ts.
-- The auth flow now queries this table during /api/app/auth/magic +
-- /api/app/auth/verify, which means founders can invite a new tenant
-- (or revoke an existing invitation) without a deploy — the next sign-in
-- attempt picks up the change.
--
-- Pre-existing hardcoded entries (ricardo + joshua → bright-lights-encina)
-- are seeded inline so the refactor is a no-op for them.

create table if not exists public.tenant_invitations (
  email text not null,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  role text not null check (role in ('owner','admin','operator','viewer')),
  invited_by uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('active','revoked')),
  notes text,
  created_at timestamptz not null default now(),
  primary key (email, tenant_id)
);

create index if not exists tenant_invitations_email_idx
  on public.tenant_invitations (lower(email)) where status = 'active';
create index if not exists tenant_invitations_tenant_idx
  on public.tenant_invitations (tenant_id, status);

alter table public.tenant_invitations enable row level security;

-- Founders read all invitations via the founders' War Room (service-role
-- read at the layout level). Tenant members can read invitations to their
-- own tenant (so an admin in a tenant can see who's been invited but not
-- yet signed in). Service role does all writes.
drop policy if exists "members read tenant invitations" on public.tenant_invitations;
create policy "members read tenant invitations"
  on public.tenant_invitations for select
  using (public.is_tenant_member(tenant_id));

drop policy if exists "service writes invitations" on public.tenant_invitations;
create policy "service writes invitations"
  on public.tenant_invitations for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Seed: backward-compat with the pre-existing hardcoded INVITATIONS map.
with t as (
  select id from public.tenants where slug = 'bright-lights-encina'
)
insert into public.tenant_invitations (email, tenant_id, role, status, notes)
select v.email, t.id, v.role, 'active',
       'Seeded from lib/app/tenant-auth.ts hardcoded INVITATIONS map'
from t,
(values
  ('ricardo.gamon99@icloud.com', 'owner'),
  ('joshuapyorke@gmail.com',     'owner')
) as v(email, role)
on conflict (email, tenant_id) do nothing;
