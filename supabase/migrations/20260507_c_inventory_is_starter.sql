-- Add `is_starter` flag to inventory_items + inventory_units.
--
-- When a new tenant signs up, we want to ship a useful inventory catalog
-- on day one (Cast / Unique / FX SKUs that any FL lighting shop carries)
-- without misleading the tenant into thinking it's their actual stock.
-- The flag lets the inventory page render a "These are starter SKUs —
-- customize or clear them" banner and gives the operator a one-click
-- "Clear all starter rows" path once they've imported their own data.
--
-- Backfills TRUE for the 13 items + 17 units already seeded for the
-- Bright Lights tenant on 2026-05-05 (the live demo cohort). New rows
-- created via the Receive flow default to FALSE — only seeded rows are
-- starter rows.
--
-- Idempotent.

alter table public.inventory_items
  add column if not exists is_starter boolean not null default false;

alter table public.inventory_units
  add column if not exists is_starter boolean not null default false;

-- Backfill starter flags for the existing Bright Lights seed so the
-- post-wipe state for that tenant is: 0 customers, 13 starter items,
-- 17 starter units — all clearly marked as suggestions.
with t as (
  select id as tenant_id from public.tenants where slug = 'bright-lights-encina'
)
update public.inventory_items
set is_starter = true
where tenant_id = (select tenant_id from t)
  and is_starter = false;

with t as (
  select id as tenant_id from public.tenants where slug = 'bright-lights-encina'
)
update public.inventory_units
set is_starter = true
where tenant_id = (select tenant_id from t)
  and is_starter = false;

-- Helpful index for "show me only starter rows" queries.
create index if not exists inventory_items_starter_idx
  on public.inventory_items (tenant_id, is_starter)
  where is_starter = true;

create index if not exists inventory_units_starter_idx
  on public.inventory_units (tenant_id, is_starter)
  where is_starter = true;
