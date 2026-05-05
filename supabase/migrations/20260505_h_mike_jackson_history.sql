-- Phase 7 — Mike Jackson's 5 service visits as schedule_items rows.
--
-- Source: lib/demo-data/bright-lights.ts MIKE_JACKSON_HISTORY §314-346.
-- Each visit becomes a `schedule_items` row scoped to bright-lights-encina,
-- linked to Mike's customer row (b71671d5-bccb-4000-8000-000000000005),
-- with status='completed' and the original detail in notes.
--
-- The famous BL-MJ-024 in-the-rain warranty replacement (2025-09-21) lands
-- here so the customer-detail Timeline section can render the story
-- verbatim — Cristian's 5-star review reference becomes a clickable card.
--
-- Idempotent via (tenant_id, customer_id, type, starts_at) deterministic
-- keys + ON CONFLICT DO NOTHING. Re-running this file is a no-op.

with t as (
  select id as tenant_id from public.tenants where slug = 'bright-lights-encina'
),
mj as (
  select id as customer_id from public.customers
  where id = 'b71671d5-bccb-4000-8000-000000000005'::uuid
)
insert into public.schedule_items (
  id, tenant_id, customer_id, type, title,
  starts_at, ends_at, status, notes
)
select
  v.id::uuid,
  t.tenant_id,
  mj.customer_id,
  v.type,
  v.title,
  v.starts_at::timestamptz,
  v.ends_at::timestamptz,
  'completed',
  v.notes
from t, mj,
(values
  ('11111111-1111-4111-8111-000000000001',
   'install',
   'Initial install — 24 fixtures',
   '2020-04-14T13:00:00-04:00',
   '2020-04-14T19:00:00-04:00',
   'Cast LED system, architectural + path + driveway + pool cage. 1-day install.'),
  ('11111111-1111-4111-8111-000000000002',
   'service',
   'Sinking paver near pool — repaired',
   '2021-08-22T14:00:00-04:00',
   '2021-08-22T15:30:00-04:00',
   'Customer noticed paver settling next to pool. Lifted, re-leveled, re-set fixture in CWL5 path. No charge.'),
  ('11111111-1111-4111-8111-000000000003',
   'service',
   'Cooking-area bulb refresh (visit 1 of 2)',
   '2023-06-09T13:00:00-04:00',
   '2023-06-09T14:00:00-04:00',
   'First of two cooking-area visits — bulb upgrade on CDL3 pair. Customer requested.'),
  ('11111111-1111-4111-8111-000000000004',
   'service',
   'Cooking-area bulb refresh (visit 2 of 2)',
   '2023-08-15T13:00:00-04:00',
   '2023-08-15T14:00:00-04:00',
   'Second visit — additional CDL3 + lens polish.'),
  ('11111111-1111-4111-8111-000000000005',
   'warranty',
   'Up-light replacement — in the rain — warranty',
   '2025-09-21T15:00:00-04:00',
   '2025-09-21T16:30:00-04:00',
   'Cristian came out the day Mike called and replaced BL-MJ-024 in the rain. New 5-yr Cast warranty issued to 2030-09. Customer''s Google review references this visit verbatim.')
) as v(id, type, title, starts_at, ends_at, notes)
on conflict (id) do nothing;
