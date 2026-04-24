-- demo_requests: captures /demo submissions
create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  crew_name text not null,
  owner_name text not null,
  email text not null,
  phone text not null,
  current_software text not null,
  crew_size text not null,
  created_at timestamptz not null default now()
);

create index if not exists demo_requests_created_at_idx on public.demo_requests (created_at desc);
create index if not exists demo_requests_email_idx on public.demo_requests (email);

-- waitlist: captures surplus-yard / find-a-crew email captures
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null,
  created_at timestamptz not null default now(),
  unique (email, source)
);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

-- RLS on, service_role bypasses automatically.
alter table public.demo_requests enable row level security;
alter table public.waitlist enable row level security;
