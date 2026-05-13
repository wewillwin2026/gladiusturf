-- Voltage tests — per-fixture electrical readings (2026-05-13).
--
-- The /lighting marketing copy has promised voltage-test tracking since
-- 2026-04. This table lands the schema. Each row is one reading at one
-- fixture on one date. Pulls from a multimeter reading (manual entry
-- v1; Bluetooth multimeter ingest is v2).
--
-- Why it matters: low-voltage outdoor lighting drift over time as
-- transformer caps age, wire runs corrode, and bulbs degrade. A fixture
-- that should read ~12 V but reads <10.8 V is past life-expectancy. A
-- reading >13.2 V is over-driven and shortens bulb life. Felipe's crew
-- chiefs log readings; the per-property history becomes a renewal
-- talking point at warranty cycles.

create table if not exists public.lighting_voltage_tests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  fixture_id uuid references public.lighting_fixtures(id) on delete set null,
  transformer_id uuid references public.lighting_transformers(id) on delete set null,
  -- Measured volts at the fixture, e.g. 11.8. nominal 12V LED system.
  measured_volts numeric(4, 2) not null,
  -- Volts at the transformer tap that fed the run, optional.
  source_tap_volts numeric(4, 2),
  -- "12V","15V","22V" — which tap on the transformer was used.
  tap_label text,
  -- 'pass' | 'low' | 'high' | 'open' | 'short' — derived from measured.
  result text not null check (result in ('pass', 'low', 'high', 'open', 'short')),
  notes text,
  measured_at timestamptz not null default now(),
  measured_by_user_id uuid references auth.users(id) on delete set null,
  -- Optional photo evidence from the truck.
  photo_urls text[] default array[]::text[],
  created_at timestamptz not null default now()
);

create index if not exists lighting_voltage_tests_tenant_customer_idx
  on public.lighting_voltage_tests (tenant_id, customer_id, measured_at desc);
create index if not exists lighting_voltage_tests_fixture_idx
  on public.lighting_voltage_tests (fixture_id, measured_at desc);
create index if not exists lighting_voltage_tests_result_idx
  on public.lighting_voltage_tests (tenant_id, result, measured_at desc);

alter table public.lighting_voltage_tests enable row level security;
drop policy if exists "tenant rows" on public.lighting_voltage_tests;
create policy "tenant rows"
  on public.lighting_voltage_tests for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

comment on table public.lighting_voltage_tests is
  'Per-fixture voltage readings for low-voltage outdoor lighting. v1: manual entry from a multimeter; v2: Bluetooth ingest.';
