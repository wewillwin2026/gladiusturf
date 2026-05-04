-- /lighting was the first vertical landing page. Per
-- ~/Downloads/gladius_lighting_prompt.md the lead-capture surface is shared
-- across 8 verticals (lighting + 7 waitlist verticals). Rename the existing
-- table + add the discriminator columns. lighting_leads is empty at the time
-- of this migration so no data backfill required.

alter table public.lighting_leads rename to vertical_leads;

alter table public.vertical_leads
  add column if not exists vertical text not null default 'lighting',
  add column if not exists status text not null default 'new';

alter table public.vertical_leads
  add constraint vertical_leads_vertical_check
  check (vertical in (
    'lighting','pool','irrigation','landscape',
    'lawn-care','tree-care','snow','commercial'
  ));

alter table public.vertical_leads
  add constraint vertical_leads_status_check
  check (status in ('new','contacted','converted','disqualified'));

-- Replace lighting-specific fields with the spec's wider set. Old columns
-- (full_name, phone, qualifying) stay; new columns (company, years_in_business,
-- crews, pain_point, ua) are added per spec. business_name maps to company so
-- the API will write to whichever column makes sense.
alter table public.vertical_leads
  rename column full_name to name;
alter table public.vertical_leads
  rename column business_name to company;
alter table public.vertical_leads
  rename column qualifying to pain_point;

alter table public.vertical_leads
  add column if not exists years_in_business text,
  add column if not exists crews text,
  add column if not exists ua text,
  add column if not exists source_ip text;

-- Drop the old lighting-specific service_area + crew_size NOT NULL constraints
-- (service_area is shared, crew_size is now `crews` and optional).
alter table public.vertical_leads
  alter column service_area drop not null,
  alter column crew_size drop not null;

-- Drop indexes that referenced the old name shape, recreate against new name.
drop index if exists lighting_leads_created_at_idx;
drop index if exists lighting_leads_email_idx;
drop index if exists lighting_leads_ip_created_idx;

create index if not exists vertical_leads_vertical_created_idx
  on public.vertical_leads (vertical, created_at desc);
create index if not exists vertical_leads_email_idx
  on public.vertical_leads (lower(email));
create index if not exists vertical_leads_ip_created_idx
  on public.vertical_leads (ip_hash, created_at desc);
