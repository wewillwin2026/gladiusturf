-- /lighting marketing page lead capture.
-- Separate from demo_requests because the schemas don't overlap cleanly:
-- /lighting captures business + service area + crew tier + qualifying question
-- but no preferred slot, no software-they're-coming-from, no BDC add-on.
create table if not exists public.lighting_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  business_name text not null,
  service_area text not null,
  crew_size text not null,
  qualifying text,
  idempotency_key text,
  ip_hash text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  source_page text,
  created_at timestamptz not null default now(),
  unique (idempotency_key)
);

create index if not exists lighting_leads_created_at_idx
  on public.lighting_leads (created_at desc);
create index if not exists lighting_leads_email_idx
  on public.lighting_leads (email);
create index if not exists lighting_leads_ip_created_idx
  on public.lighting_leads (ip_hash, created_at desc);

-- RLS on; service_role bypasses automatically. No public reads, no public writes.
alter table public.lighting_leads enable row level security;
