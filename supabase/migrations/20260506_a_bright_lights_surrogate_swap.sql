-- Bright Lights demo data — synthetic surrogates (board vote 2026-05-06).
--
-- The original `20260505_b_bright_lights_seed.sql` planted 12 customer rows
-- whose names and street addresses were sourced from real public reviews of
-- Bright Lights Landscape Lighting. Trust + Compliance director flagged the
-- pairing of real third-party names + Sarasota addresses + service notes as
-- reidentifying PII; Felipe + Cristian (the operators) cannot lawfully
-- authorize use of *their customers'* identities, only their own.
--
-- This migration UPDATEs the existing 12 rows in place to surrogate names +
-- fictitious-but-plausible Sarasota-area addresses. UUIDs are unchanged so
-- every FK from `lighting_fixtures` and any downstream tables stays valid.
-- Cluster / zip / lat / lng are preserved so route geography still looks like
-- a real Florida lighting business.
--
-- Pre-req: 20260505_b_bright_lights_seed.sql has been applied. If it has
-- not, this migration is a no-op (UPDATE WHERE id matches updates 0 rows).
-- Idempotent — re-running with already-surrogate names is a no-op rewrite.

with t as (
  select id as tenant_id from public.tenants where slug = 'bright-lights-encina'
)
update public.customers c
set
  display_name = v.name,
  service_address = jsonb_set(
    jsonb_set(c.service_address, '{street}', to_jsonb(v.street)),
    '{city}', to_jsonb(v.city)
  ),
  notes = v.notes,
  updated_at = now()
from t,
(values
  ('b71671d5-bccb-4000-8000-000000000001'::uuid, 'Daniel Carter',     '1812 Coastal Oak Dr',     'Sarasota',       'Full install — over 30 fixtures completed in a single day.'),
  ('b71671d5-bccb-4000-8000-000000000002'::uuid, 'John Zelinsky',     '3247 Magnolia Cove Ln',   'Sarasota',       'Repaired a sinking paver next to the pool — pool/cooking area system.'),
  ('b71671d5-bccb-4000-8000-000000000003'::uuid, 'Tom Bradford',      '5210 Sandhill Crane Way', 'Bradenton',      'Riser post failure — came out for warranty replace.'),
  ('b71671d5-bccb-4000-8000-000000000004'::uuid, 'Mark Mendez',       '6914 Live Oak Ridge',     'Sarasota',       'Reliable repeat customer — handles warranty repairs without friction.'),
  ('b71671d5-bccb-4000-8000-000000000005'::uuid, 'Marcus Jenson',     '4108 Egret Point Cir',    'Sarasota',       'Watch for sinking paver near pool — repaired 2020. Prefers Tuesday afternoon visits. Cooking-area system was 2 separate visits — keep an eye on those bulbs.'),
  ('b71671d5-bccb-4000-8000-000000000006'::uuid, 'Kathleen Stone',    '9105 Cypress Hollow Ct',  'Sarasota',       'Pool-cage install — quick crew turnaround, customer was thrilled.'),
  ('b71671d5-bccb-4000-8000-000000000007'::uuid, 'Karen Maddox',      '612 Coral Reef Way',      'Siesta Key',     'Same-day service — always picks up the phone. 7 years since install.'),
  ('b71671d5-bccb-4000-8000-000000000008'::uuid, 'Janice Stafford',   '4711 Palm Ridge Dr',      'Sarasota',       'Came out promptly and fixed the issue same visit.'),
  ('b71671d5-bccb-4000-8000-000000000009'::uuid, 'Charles Davenport', '3014 Heron Bay Cir',      'Sarasota',       'Five-star repeat — goes above + beyond when we visit.'),
  ('b71671d5-bccb-4000-8000-00000000000a'::uuid, 'Jay Bishop',        '7820 Pinecrest Loop',     'Lakewood Ranch', 'Post-Helene inspection visit — system intact.'),
  ('b71671d5-bccb-4000-8000-00000000000b'::uuid, 'Allison Avery',     '2240 Sunset Cove Ln',     'Sarasota',       'Long-time advocate — happy to refer.'),
  ('b71671d5-bccb-4000-8000-00000000000c'::uuid, 'Marc Matthews',     '4905 Mariner Bay Ct',     'Punta Gorda',    'Post-Milton inspection — partial fixture failure on lanai. South of typical service area.')
) as v(id, name, street, city, notes)
where c.id = v.id
  and c.tenant_id = t.tenant_id;
