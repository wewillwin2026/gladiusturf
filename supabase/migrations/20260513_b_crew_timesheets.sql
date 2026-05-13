-- Crew + Timesheets (2026-05-13).
--
-- Two thin tables for the minimum-viable labor-tracking surface.
-- crew_members:    the people Felipe and future tenants employ
-- timesheet_entries: clock-in/clock-out events tied to a member +
--                    optional schedule_item (so the field-crew app can
--                    associate hours with the job they were on)
--
-- v1 deliberately small. v2 ships: per-rate-class billing, overtime
-- thresholds, payroll-export to QB, geofence-aware clock-in.

create table if not exists public.crew_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  -- Auth-linked when the member has a login; null for crew chiefs we
  -- track but who don't sign into Gladius themselves.
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  role text not null default 'crew' check (role in ('owner', 'chief', 'crew', 'admin', 'apprentice')),
  -- Free-form internal title shown in the UI ("Crew Chief", "Lead
  -- Tech", "Apprentice"). role is the system-level rank; title is the
  -- public-facing label.
  title text,
  email text,
  phone text,
  hourly_rate_cents integer,
  hire_date date,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crew_members_tenant_idx
  on public.crew_members (tenant_id, active, display_name);

alter table public.crew_members enable row level security;
drop policy if exists "tenant rows" on public.crew_members;
create policy "tenant rows"
  on public.crew_members for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- =============================================================
-- Timesheet entries — one row per clock-in/out
-- =============================================================
create table if not exists public.timesheet_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  crew_member_id uuid not null references public.crew_members(id) on delete cascade,
  -- Optional: which schedule_item these hours were spent on (null for
  -- yard prep, shop maintenance, paid travel between routes, etc.).
  schedule_item_id uuid references public.schedule_items(id) on delete set null,
  -- Status: 'open' = clocked in, no end yet; 'closed' = both ends recorded
  status text not null default 'open' check (status in ('open', 'closed', 'voided')),
  started_at timestamptz not null,
  ended_at timestamptz,
  -- Cached at clock-out so payroll reports don't recompute.
  total_minutes integer,
  -- Cached at clock-out so historic-rate changes don't rewrite history.
  pay_cents integer,
  notes text,
  -- Field crew app: optional geofence assertion.
  geo_at_start jsonb,
  geo_at_end jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists timesheet_entries_tenant_member_idx
  on public.timesheet_entries (tenant_id, crew_member_id, started_at desc);
create index if not exists timesheet_entries_tenant_day_idx
  on public.timesheet_entries (tenant_id, started_at desc);
create index if not exists timesheet_entries_open_idx
  on public.timesheet_entries (tenant_id, status)
  where status = 'open';

alter table public.timesheet_entries enable row level security;
drop policy if exists "tenant rows" on public.timesheet_entries;
create policy "tenant rows"
  on public.timesheet_entries for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

comment on table public.crew_members is
  'Per-tenant labor roster. role is rank; title is the customer-facing label.';
comment on table public.timesheet_entries is
  'Clock-in/clock-out events. Open = on the clock, closed = recorded, voided = deleted by owner.';
