-- War Room TOTP secret store — replaces the legacy shared-creds HMAC cookie.
-- Each founder enrolls once; the secret is the seed for their authenticator app.
-- Reads/writes happen exclusively via the Supabase service-role key from
-- lib/founders/auth.ts; RLS denies anon and authenticated reads outright.

create table if not exists public.founder_secrets (
  email text primary key,
  totp_secret text,
  enrolled_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz default now()
);

alter table public.founder_secrets enable row level security;

-- No RLS policies: only service role can touch this table.
revoke all on table public.founder_secrets from anon, authenticated;
