-- Messaging consent ledger for TCPA + CAN-SPAM compliance.
--
-- Trust director made this a pre-Friday hard requirement: every outbound
-- SMS or marketing email needs a recordable basis (consent timestamp, IP,
-- the exact text the contact saw, where they consented). The platform is
-- co-liable with the tenant if a customer sues for an unsolicited message.
--
-- Schema is intentionally simple v1: one row per (customer × channel)
-- captures the latest consent + revocation. STOP/HELP keyword inbound
-- triggers an immediate revoke row.
--
-- For the upcoming CSV import flow, we add an `attestation` source value
-- so a tenant ticking "I have lawful basis to message these contacts at
-- import time" creates one default-pending consent row per imported
-- customer + channel combo.
--
-- Idempotent.

create table if not exists public.customer_messaging_consent (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  channel text not null check (channel in ('sms', 'email', 'voice')),
  -- 'opted_in' | 'opted_out' | 'pending' (e.g. attestation but not confirmed)
  status text not null check (status in ('opted_in','opted_out','pending')),
  -- 'attestation' (CSV import), 'web_form', 'reply_keyword', 'verbal_logged_by_crew'
  source text not null,
  consent_text text,
  consent_at timestamptz,
  consent_ip text,
  consent_version text,
  revoked_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, customer_id, channel)
);

create index if not exists customer_messaging_consent_tenant_idx
  on public.customer_messaging_consent (tenant_id, customer_id);

alter table public.customer_messaging_consent enable row level security;
drop policy if exists "tenant rows" on public.customer_messaging_consent;
create policy "tenant rows"
  on public.customer_messaging_consent for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- Per-tenant quiet-hours table — defaults to 8 PM local → 8 AM local
-- Mon-Sat, all day Sun. State-specific overrides ship later when we have
-- more than one paying tenant per state.
create table if not exists public.tenant_messaging_settings (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  quiet_hours_start integer not null default 20 check (quiet_hours_start between 0 and 23),
  quiet_hours_end integer not null default 8 check (quiet_hours_end between 0 and 23),
  -- comma-separated weekday numbers (0=Sun) when sending is blocked entirely.
  blocked_weekdays text not null default '',
  timezone text not null default 'America/New_York',
  attestation_text_version text not null default 'v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tenant_messaging_settings enable row level security;
drop policy if exists "tenant rows" on public.tenant_messaging_settings;
create policy "tenant rows"
  on public.tenant_messaging_settings for all
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- Backfill default messaging settings for the live Bright Lights tenant so
-- the first row exists and the canSend() helper has a baseline to read.
insert into public.tenant_messaging_settings (tenant_id, timezone)
select id, 'America/New_York' from public.tenants
where slug = 'bright-lights-encina'
on conflict (tenant_id) do nothing;
