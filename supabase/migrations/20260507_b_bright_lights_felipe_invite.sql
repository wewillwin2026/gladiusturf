-- Bright Lights tenant — owner invitation for Felipe Encina.
--
-- Companion to 20260507_a_bright_lights_wipe.sql. Felipe (the operator) needs
-- a `tenant_invitations` row with role='owner' so:
--   1) The magic-link login flow at /api/app/auth/magic resolves his email to
--      the bright-lights-encina tenant when he clicks "send me a link."
--   2) The weekly inventory-aging cron's owner-resolver picks his email
--      (currently picks the earliest-created owner row; backdated below).
--
-- IMPORTANT — before applying, replace `<FELIPE_EMAIL>` with the real
-- address. Two existing owner rows (ricardo.gamon99@icloud.com and
-- joshuapyorke@gmail.com) are kept additive — we still have admin access for
-- support during week 1.
--
-- The created_at is set to '2026-05-04 00:00:00+00' so it's earlier than the
-- existing rows (`2026-05-05 03:12:56+00`); the cron's
-- `.order('created_at', ascending: true)` then resolves Felipe as the
-- recipient of the Monday inventory-aging email.
--
-- Idempotent — re-running with the row in place is a no-op via the unique
-- (email, tenant_id) constraint.

with t as (
  select id as tenant_id from public.tenants where slug = 'bright-lights-encina'
)
insert into public.tenant_invitations (
  email, tenant_id, role, status, created_at
)
select
  '<FELIPE_EMAIL>',
  t.tenant_id,
  'owner',
  'active',
  '2026-05-04 00:00:00+00'::timestamptz
from t
on conflict (email, tenant_id) do nothing;
