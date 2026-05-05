-- Pre-seed Bright Lights' SKU catalog + ~20 sample units across aging
-- buckets so the inventory page demos the feature on day one.
--
-- Catalog: 7 fixtures + 6 infrastructure = 13 SKUs from
-- lib/demo-data/bright-lights.ts FIXTURE_CATALOG + INFRASTRUCTURE_CATALOG.
--
-- Sample units (one per aging bucket per top SKU): 5 Cast Path Light @ 3W
-- (fresh), 3 Cast Up-light (aging 60d), 2 Unique Pond (stale 120d), 4
-- Cast Wall Wash (dead 200d demo for the upsell visual). All idempotent.

-- =============================================================
-- 13-item catalog
-- =============================================================
with t as (
  select id as tenant_id from public.tenants where slug = 'bright-lights-encina'
)
insert into public.inventory_items (
  tenant_id, sku, category, group_label, name, description, brand,
  unit, unit_cost_cents, unit_price_cents, par_level
)
select t.tenant_id, v.sku, v.category, v.group_label, v.name, v.description,
       v.brand, v.unit, v.unit_cost_cents, v.unit_price_cents, v.par_level
from t,
(values
  -- fixtures (price = unitPrice from seed; cost = ~55% of price)
  ('CAST-PATH-LED3W',    'fixture', 'Path',       'Cast LED Path Light · 3W',    'Solid brass, 3W LED MR16, frosted lens. Lifetime warranty.', 'Cast Lighting',           'ea', 10175, 18500,  20),
  ('CAST-UPLT-MR16-5W',  'fixture', 'Up-light',   'Cast Up-light · 5W MR16',     'Brass adjustable knuckle, 5W LED, 35° beam.',                'Cast Lighting',           'ea', 11825, 21500,  15),
  ('UNIQUE-WELL-7W',     'fixture', 'Well',       'Unique Well Light · 7W',      'In-ground brass, 7W LED, drive-over rated.',                 'Unique Lighting Systems', 'ea', 13475, 24500,  10),
  ('CAST-STEP-LED',      'fixture', 'Step',       'Cast Step / Deck Light',      'Low-profile brass, hard-wired, surface mount.',              'Cast Lighting',           'ea', 10725, 19500,  10),
  ('FX-HARDSCAPE',       'fixture', 'Hardscape',  'FX Hardscape Light',          'Mortar-mounted under-cap, 1.5W LED, brass body.',            'FX Luminaire',            'ea', 14575, 26500,   8),
  ('UNIQUE-POND-9W',     'fixture', 'Underwater', 'Unique Underwater · 9W',      'Sealed brass for pond/pool, 9W LED, 50° beam.',              'Unique Lighting Systems', 'ea', 21175, 38500,   5),
  ('CAST-WALLWASH',      'fixture', 'Wall wash',  'Cast Wall Wash · 6W',         'Brass, asymmetric beam, ideal for stucco wall facades.',     'Cast Lighting',           'ea', 13475, 24500,  10),
  -- infrastructure
  ('TF-MULTI-300W',      'transformer', 'Transformer', 'Multi-tap Transformer · 300W', 'Stainless, 12/13/14/15V taps, photocell ready.',         null, 'ea', 38225, 69500, 4),
  ('TF-MULTI-600W',      'transformer', 'Transformer', 'Multi-tap Transformer · 600W', 'Stainless, 12-22V taps, dual circuit, photocell ready.', null, 'ea', 49225, 89500, 4),
  ('TF-MULTI-900W',      'transformer', 'Transformer', 'Multi-tap Transformer · 900W', 'Stainless, 4-circuit, smart-controller ready.',          null, 'ea', 65725, 119500, 2),
  ('WIRE-12-2',          'wire',     'Wire',       'Low-voltage Wire · 12-2',     'Direct-bury rated, copper.',                                  null, 'ft',     105,   195, 500),
  ('CTRL-WIFI',          'controller', 'Controller', 'Smart Controller · Wi-Fi', 'App + voice control, scheduling, vacation mode.',           null, 'ea', 26125, 47500,   3),
  ('PHOTO-CELL',         'sensor',   'Sensor',     'Photocell Sensor',           'Dusk-to-dawn auto-on/off.',                                   null, 'ea',  4675,  8500,   8)
) as v(sku, category, group_label, name, description, brand, unit, unit_cost_cents, unit_price_cents, par_level)
on conflict (tenant_id, sku) do nothing;

-- =============================================================
-- Sample units across aging buckets (idempotent via deterministic UUIDs)
-- =============================================================
with t as (
  select id as tenant_id from public.tenants where slug = 'bright-lights-encina'
),
items as (
  select id, sku from public.inventory_items
  where tenant_id = (select id from t)
)
insert into public.inventory_units (
  id, tenant_id, item_id, qr_code, status, location,
  cost_cents, received_at
)
select v.id::uuid, t.tenant_id, items.id, v.qr_code, v.status, v.location,
       v.cost_cents, v.received_at::timestamptz
from t,
(values
  -- 5 fresh CAST-PATH-LED3W (received 7d ago) — top stock
  ('22222222-2222-4222-8222-000000000001', 'CAST-PATH-LED3W', 'BL-INV-CPL11-A1', 'in_stock', 'Truck 1 · Bay A', 10175, '2026-04-28T09:00:00-04:00'),
  ('22222222-2222-4222-8222-000000000002', 'CAST-PATH-LED3W', 'BL-INV-CPL11-A2', 'in_stock', 'Truck 1 · Bay A', 10175, '2026-04-28T09:00:00-04:00'),
  ('22222222-2222-4222-8222-000000000003', 'CAST-PATH-LED3W', 'BL-INV-CPL11-A3', 'in_stock', 'Truck 1 · Bay A', 10175, '2026-04-28T09:00:00-04:00'),
  ('22222222-2222-4222-8222-000000000004', 'CAST-PATH-LED3W', 'BL-INV-CPL11-A4', 'in_stock', 'Shelf B · Workshop', 10175, '2026-04-28T09:00:00-04:00'),
  ('22222222-2222-4222-8222-000000000005', 'CAST-PATH-LED3W', 'BL-INV-CPL11-A5', 'in_stock', 'Shelf B · Workshop', 10175, '2026-04-28T09:00:00-04:00'),
  -- 3 Cast Up-light, aging (60d)
  ('22222222-2222-4222-8222-000000000006', 'CAST-UPLT-MR16-5W', 'BL-INV-CWL5-B1', 'in_stock', 'Shelf C · Workshop', 11825, '2026-03-06T09:00:00-04:00'),
  ('22222222-2222-4222-8222-000000000007', 'CAST-UPLT-MR16-5W', 'BL-INV-CWL5-B2', 'in_stock', 'Shelf C · Workshop', 11825, '2026-03-06T09:00:00-04:00'),
  ('22222222-2222-4222-8222-000000000008', 'CAST-UPLT-MR16-5W', 'BL-INV-CWL5-B3', 'in_stock', 'Shelf C · Workshop', 11825, '2026-03-06T09:00:00-04:00'),
  -- 2 Unique Pond, stale (120d) — expensive at $385/unit, $770 capital tied up
  ('22222222-2222-4222-8222-000000000009', 'UNIQUE-POND-9W', 'BL-INV-PND-C1', 'in_stock', 'Shelf D · Specialty', 21175, '2026-01-05T09:00:00-04:00'),
  ('22222222-2222-4222-8222-00000000000a', 'UNIQUE-POND-9W', 'BL-INV-PND-C2', 'in_stock', 'Shelf D · Specialty', 21175, '2026-01-05T09:00:00-04:00'),
  -- 4 Cast Wall Wash, DEAD (220d) — biggest aging-capital problem
  ('22222222-2222-4222-8222-00000000000b', 'CAST-WALLWASH', 'BL-INV-CWW8-D1', 'in_stock', 'Shelf D · Specialty', 13475, '2025-09-27T09:00:00-04:00'),
  ('22222222-2222-4222-8222-00000000000c', 'CAST-WALLWASH', 'BL-INV-CWW8-D2', 'in_stock', 'Shelf D · Specialty', 13475, '2025-09-27T09:00:00-04:00'),
  ('22222222-2222-4222-8222-00000000000d', 'CAST-WALLWASH', 'BL-INV-CWW8-D3', 'in_stock', 'Shelf D · Specialty', 13475, '2025-09-27T09:00:00-04:00'),
  ('22222222-2222-4222-8222-00000000000e', 'CAST-WALLWASH', 'BL-INV-CWW8-D4', 'in_stock', 'Shelf D · Specialty', 13475, '2025-09-27T09:00:00-04:00'),
  -- 1 Multi-tap 600W transformer, fresh (3d)
  ('22222222-2222-4222-8222-00000000000f', 'TF-MULTI-600W', 'BL-INV-TF600-E1', 'in_stock', 'Truck 1 · Cab',     49225, '2026-05-02T09:00:00-04:00'),
  -- 1 Smart controller, fresh (10d)
  ('22222222-2222-4222-8222-000000000010', 'CTRL-WIFI',     'BL-INV-CTRL-F1', 'in_stock', 'Workshop · Office',  26125, '2026-04-25T09:00:00-04:00'),
  -- 1 Cast Step Light, deployed (last week to Mike Jackson)
  ('22222222-2222-4222-8222-000000000011', 'CAST-STEP-LED', 'BL-INV-CST7-G1', 'deployed', 'Mike Jackson — BL-MJ',
     10725, '2026-04-15T09:00:00-04:00')
) as v(id, item_sku, qr_code, status, location, cost_cents, received_at)
join items on items.sku = v.item_sku
on conflict (id) do nothing;
