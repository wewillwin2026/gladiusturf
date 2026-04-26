-- War Room schema upgrade — extends demo_requests for full pipeline tracking
-- and adds pipeline_events for status history. Idempotent.

-- 1) Extend demo_requests with the fields the new booking flow captures
alter table public.demo_requests
  add column if not exists tier_interest text,           -- independent | professional | enterprise
  add column if not exists wants_bdc boolean default false,
  add column if not exists preferred_at timestamptz,
  add column if not exists alt_time_note text,
  add column if not exists status text default 'new',    -- new | scheduled | demoed | won | lost | no_show
  add column if not exists assigned_to text,             -- 'ricardo' | 'joshua' | null
  add column if not exists conversion_value_cents int,   -- est. annual MRR cents
  add column if not exists notes text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_term text,
  add column if not exists utm_content text,
  add column if not exists referrer text,
  add column if not exists source_page text,
  add column if not exists ip_hash text,                 -- sha256 of remote ip (privacy-respecting)
  add column if not exists updated_at timestamptz default now();

create index if not exists demo_requests_status_idx on public.demo_requests (status);
create index if not exists demo_requests_tier_idx on public.demo_requests (tier_interest);
create index if not exists demo_requests_preferred_at_idx on public.demo_requests (preferred_at);

-- 2) Pipeline events — append-only history of every status change / note / touch
create table if not exists public.pipeline_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.demo_requests(id) on delete cascade,
  event_type text not null,    -- 'created' | 'status_changed' | 'note' | 'email_sent' | 'demo_booked' | 'tier_changed'
  from_value text,
  to_value text,
  note text,
  actor text,                  -- 'system' | 'ricardo' | 'joshua' | 'prospect'
  created_at timestamptz not null default now()
);

create index if not exists pipeline_events_booking_id_idx on public.pipeline_events (booking_id, created_at desc);
create index if not exists pipeline_events_created_at_idx on public.pipeline_events (created_at desc);

-- 3) RLS — service_role bypasses; nothing public.
alter table public.pipeline_events enable row level security;

-- 4) Trigger to keep updated_at fresh on demo_requests
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists demo_requests_touch_updated_at on public.demo_requests;
create trigger demo_requests_touch_updated_at
  before update on public.demo_requests
  for each row execute function public.touch_updated_at();
