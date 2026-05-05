-- Phase 3.A — Bright Lights demo seed → real Supabase rows.
--
-- Source: lib/demo-data/bright-lights.ts (12 customers + 24 Mike Jackson
-- fixtures). Values transcribed verbatim. Customer order matches the seed
-- file's CUSTOMERS[] array so a UUID's last byte = (1-based index in the
-- seed array). Mike Jackson is index 5 → UUID ends in 05.
--
-- Idempotent. Re-running this file is a no-op via:
--   - Customers: deterministic UUIDs + ON CONFLICT (id) DO NOTHING
--   - Fixtures:  unique(tenant_id, external_id) + ON CONFLICT DO NOTHING
--
-- Pre-req: 20260504_multitenant.sql + 20260505_a_lighting_tables.sql
-- Pre-req: tenants row WHERE slug='bright-lights-encina' (live since
--          2026-05-04, id=6f7c602a-42c3-4475-84de-410deb5a5679).

-- =============================================================
-- Customers — 12 rows. UUIDs are deterministic + hex-valid:
-- prefix `b71671d5-bccb-4000-8000-` (mnemonic for "bright lights customer")
-- followed by a 12-char hex suffix encoding the 1-based seed index.
-- =============================================================
with t as (
  select id as tenant_id from public.tenants where slug = 'bright-lights-encina'
)
insert into public.customers (
  id, tenant_id, display_name, primary_email, primary_phone,
  preferred_language, service_address, customer_tier, notes,
  acquired_at, source
)
select
  v.id::uuid,
  t.tenant_id,
  v.name,
  null,
  null,
  v.lang,
  jsonb_build_object(
    'street', v.street,
    'city',   v.city,
    'state',  'FL',
    'zip',    v.zip,
    'lat',    v.lat,
    'lng',    v.lng,
    'cluster', v.cluster
  ),
  null,
  v.notes,
  make_timestamptz(v.install_year, 1, 1, 0, 0, 0),
  'demo-seed-bright-lights'
from t,
(values
  ('b71671d5-bccb-4000-8000-000000000001', 'Dave Caiati',       '2840 Bay Shore Rd',     'Sarasota',       '34234', 'Sarasota',       2020, 27.378,  -82.555, 'en', 'Finished install of over 30 lights in a single day.'),
  ('b71671d5-bccb-4000-8000-000000000002', 'John Zagelmeier',   '6125 Hollywood Blvd',   'Sarasota',       '34231', 'Sarasota',       2019, 27.295,  -82.524, 'en', 'Helped me to repair a sinking paver next to my pool — pool/cooking area system.'),
  ('b71671d5-bccb-4000-8000-000000000003', 'Tom Brammeier',     '4521 Riverview Blvd',   'Bradenton',      '34209', 'Bradenton',      2018, 27.499,  -82.622, 'en', 'Riser post failure — came out for warranty replace.'),
  ('b71671d5-bccb-4000-8000-000000000004', 'Manav Malik',       '7204 Skyline Dr',       'Sarasota',       '34243', 'Sarasota',       2021, 27.398,  -82.481, 'en', 'If there is any warranty repair or issue, he happily takes care of it.'),
  ('b71671d5-bccb-4000-8000-000000000005', 'Mike Jackson',      '3315 Bayview Pkwy',     'Sarasota',       '34239', 'Sarasota',       2020, 27.314,  -82.519, 'en', 'Watch for sinking paver near pool — repaired 2020. Customer prefers Tuesday afternoon visits. Cooking area system was 2 separate visits — keep an eye on those bulbs.'),
  ('b71671d5-bccb-4000-8000-000000000006', 'Kathleen Smith',    '8819 Misty Creek Dr',   'Sarasota',       '34241', 'Sarasota',       2023, 27.260,  -82.395, 'en', 'Cristian and his son did an awesome job — pool cage.'),
  ('b71671d5-bccb-4000-8000-000000000007', 'Karen Magno',       '412 Beach Rd',          'Siesta Key',     '34242', 'Siesta Key',     2017, 27.260,  -82.557, 'en', 'Always get prompt service — came out the day I called. 7 years since install.'),
  ('b71671d5-bccb-4000-8000-000000000008', 'Janice Scott',      '5602 Macadamia Ln',     'Sarasota',       '34232', 'Sarasota',       2019, 27.323,  -82.467, 'en', 'Came out promptly and fixed our problem.'),
  ('b71671d5-bccb-4000-8000-000000000009', 'Charles Diehl',     '2107 Bayshore Dr',      'Sarasota',       '34239', 'Sarasota',       2021, 27.305,  -82.541, 'en', 'Five star service & then some — goes above & beyond.'),
  ('b71671d5-bccb-4000-8000-00000000000a', 'Jayant Bhalerao',   '6730 Spring Hill Dr',   'Lakewood Ranch', '34202', 'Lakewood Ranch', 2022, 27.421,  -82.420, 'en', 'Post-Helene inspection visit — system intact.'),
  ('b71671d5-bccb-4000-8000-00000000000b', 'Allison Archer',    '1815 Avenida del Mare', 'Sarasota',       '34242', 'Siesta Key',     2020, 27.276,  -82.553, 'en', 'Christian is the best!'),
  ('b71671d5-bccb-4000-8000-00000000000c', 'Marc Matusewitch',  '5102 Cape Cole Blvd',   'Punta Gorda',    '33955', 'Punta Gorda',    2021, 26.886,  -82.103, 'en', 'Post-Milton inspection — partial fixture failure on lanai. South of typical service area.')
) as v(id, name, street, city, zip, cluster, install_year, lat, lng, lang, notes)
on conflict (id) do nothing;

-- =============================================================
-- Mike Jackson's 24 fixtures — the "Cristian-as-bottleneck" demo
-- =============================================================
with t as (
  select id as tenant_id from public.tenants where slug = 'bright-lights-encina'
),
mj as (
  select id as customer_id from public.customers
  where id = 'b71671d5-bccb-4000-8000-000000000005'::uuid
)
insert into public.lighting_fixtures (
  tenant_id, customer_id, external_id, fixture_type, brand, model,
  wattage_text, install_date, warranty_status, warranty_end, notes
)
select
  t.tenant_id,
  mj.customer_id,
  v.external_id,
  v.fixture_type,
  v.brand,
  v.model,
  v.wattage_text,
  v.install_date::date,
  v.warranty_status,
  case when v.warranty_end = '' then null else v.warranty_end::date end,
  v.fixture_notes
from t, mj,
(values
  ('BL-MJ-001', 'Path Light',                        'Cast',   'CPL11', '3W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-002', 'Up Light (Royal Palm)',             'Cast',   'CWL5',  '5W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-003', 'Up Light (Royal Palm)',             'Cast',   'CWL5',  '5W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-004', 'Path Light',                        'Cast',   'CPL11', '3W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-005', 'Path Light',                        'Cast',   'CPL11', '3W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-006', 'Tree Up Light (Live Oak)',          'Cast',   'CWL5',  '5W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-007', 'Tree Up Light (Live Oak)',          'Cast',   'CWL5',  '5W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-008', 'Spot Light (Architectural)',        'Cast',   'CSP10', '5W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-009', 'Spot Light (Architectural)',        'Cast',   'CSP10', '5W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-010', 'Driveway Bollard',                  'Cast',   'CBL2',  '5W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-011', 'Driveway Bollard',                  'Cast',   'CBL2',  '5W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-012', 'Cooking Area Down Light',           'Cast',   'CDL3',  '3W', '2020-04-14', 'expired',  '2025-04-14', 'Cooking-area system — keep eye on bulbs.'),
  ('BL-MJ-013', 'Cooking Area Down Light',           'Cast',   'CDL3',  '3W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-014', 'Pool Cage Light',                   'Unique', 'Demi',  '2W', '2020-04-14', 'lifetime', '',           'Lifetime fixture — 5-yr LED chip warranty active to 2025-04.'),
  ('BL-MJ-015', 'Pool Cage Light',                   'Unique', 'Demi',  '2W', '2020-04-14', 'lifetime', '',           null),
  ('BL-MJ-016', 'Step Light',                        'Cast',   'CST7',  '1W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-017', 'Step Light',                        'Cast',   'CST7',  '1W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-018', 'Wall Wash (Front Column)',          'Cast',   'CWW8',  '4W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-019', 'Wall Wash (Front Column)',          'Cast',   'CWW8',  '4W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-020', 'Path Light',                        'Cast',   'CPL11', '3W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-021', 'Path Light',                        'Cast',   'CPL11', '3W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-022', 'Up Light (Sabal Palm)',             'Cast',   'CWL5',  '5W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-023', 'Up Light (Sabal Palm)',             'Cast',   'CWL5',  '5W', '2020-04-14', 'expired',  '2025-04-14', null),
  ('BL-MJ-024', 'Replacement Up Light (in rain)',    'Cast',   'CWL5',  '5W', '2025-09-21', 'active',   '2030-09-21', 'Replaced in the rain by Cristian — customer''s note in their review.')
) as v(external_id, fixture_type, brand, model, wattage_text, install_date, warranty_status, warranty_end, fixture_notes)
on conflict (tenant_id, external_id) do nothing;
