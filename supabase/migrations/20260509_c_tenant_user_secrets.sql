-- Tenant-side TOTP + recovery-code storage for the password-MFA upgrade
-- (2026-05-09 auth upgrade).
--
-- Mirrors the founder_secrets pattern from 20260429: service-role-only
-- access, RLS denies anon/authenticated outright. The TOTP secret is the
-- seed for the tenant user's authenticator app; recovery_codes_hashed
-- stores SHA-256 hashes of one-time codes (we never store the plaintext).
--
-- Password storage lives in auth.users (Supabase Auth), NOT this table —
-- this table is only the second-factor + recovery substrate.

create table if not exists public.tenant_user_secrets (
  email text primary key,
  totp_secret text,
  enrolled_at timestamptz,
  last_login_at timestamptz,
  -- Array of SHA-256 hex hashes; entries are removed as codes are consumed.
  recovery_codes_hashed text[] default array[]::text[],
  recovery_codes_generated_at timestamptz,
  password_set_at timestamptz,
  created_at timestamptz default now()
);

alter table public.tenant_user_secrets enable row level security;

-- No RLS policies: only the service role can touch this table.
revoke all on table public.tenant_user_secrets from anon, authenticated;

comment on table public.tenant_user_secrets is
  'Per-tenant-user MFA secrets + recovery codes. Service-role only. Password lives in auth.users.encrypted_password.';
comment on column public.tenant_user_secrets.totp_secret is
  'Base32-encoded TOTP seed for the authenticator app. Null until enrolled.';
comment on column public.tenant_user_secrets.recovery_codes_hashed is
  'SHA-256 hex of each unused one-time recovery code. Never stores plaintext.';
comment on column public.tenant_user_secrets.password_set_at is
  'Stamp when this user set/changed their password via /app/account/security. Used to nag stale-password users.';
