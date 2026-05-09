-- Owner's Daily One-Liner SMS — opt-in scaffolding.
--
-- Adds two columns to tenants so the cron at
-- /api/cron/owners-daily-briefing can fire a 7 AM ET SMS to the owner
-- with the same one-sentence briefing rendered on the /app dashboard.
--
-- daily_briefing_sms_enabled defaults to FALSE — the cron is opt-in
-- per tenant; flipping it on is an explicit decision on /app/settings.
--
-- owner_phone holds an E.164 number (e.g. +19412050000). The cron
-- skips tenants where this is NULL even if the toggle is on.
--
-- This is a tenant-internal SMS (owner -> owner), not a consumer
-- message — TCPA / canSend() applies to customer-facing messages,
-- not to owner self-notifications they explicitly turned on.

alter table public.tenants
  add column if not exists owner_phone text;

alter table public.tenants
  drop constraint if exists tenants_owner_phone_e164;
alter table public.tenants
  add constraint tenants_owner_phone_e164
  check (owner_phone is null or owner_phone ~ '^\+[1-9][0-9]{6,14}$');

alter table public.tenants
  add column if not exists daily_briefing_sms_enabled boolean not null default false;

comment on column public.tenants.owner_phone is
  'E.164 phone number for tenant-internal SMS (owner alerts, daily briefing). Edited from /app/settings.';
comment on column public.tenants.daily_briefing_sms_enabled is
  'When true, /api/cron/owners-daily-briefing sends a 7 AM ET SMS with the one-liner briefing. Default off.';
