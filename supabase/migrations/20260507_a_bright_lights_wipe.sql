-- Bright Lights tenant wipe (board vote 2026-05-06, ratified 2026-05-07).
--
-- Bright Lights Landscape Lighting is becoming a real paying tenant by
-- Friday 2026-05-09. The previously-seeded 12 customer rows + 24 fixture
-- rows were sourced from public reviews of their actual customers — both
-- a PII issue (real third-party names + Sarasota addresses) and a UX
-- issue (Felipe will see customers he never imported, labeled as his).
--
-- Board's 3-1 vote (Strategy/Product/Trust over Engineering's
-- surrogate-with-banner): WIPE customer + lighting_fixtures rows so
-- Felipe lands on a clean tenant when he signs in. The shim onboarding
-- flow + CSV import wizard will be his first-run experience.
--
-- Inventory items (13) + inventory_units (17) STAY — they're SKU/unit
-- catalog data, not customer PII, FK-independent of customers, and the
-- weekly inventory-aging cron emails owners about them. They will be
-- flagged with `is_starter = true` in a follow-up migration so Felipe
-- knows they're suggestions to keep, customize, or clear.
--
-- Pre-req: 20260505_a_lighting_tables.sql + 20260505_b_bright_lights_seed.sql.
-- This migration is destructive but tenant-scoped + idempotent (re-running
-- after data is gone is a no-op).

with t as (
  select id as tenant_id from public.tenants where slug = 'bright-lights-encina'
)
delete from public.lighting_fixtures
where tenant_id = (select tenant_id from t);

with t as (
  select id as tenant_id from public.tenants where slug = 'bright-lights-encina'
)
delete from public.customers
where tenant_id = (select tenant_id from t);
