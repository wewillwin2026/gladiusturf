-- AI run audit table.
--
-- Every AI call from a customer-facing surface (Ask Gladius, AI Quote
-- Drafter, future agents) writes a row here so we can:
--   1. Replay any decision when a customer asks "what did your AI tell my
--      dealer 3 weeks ago" — promised in the privacy policy + DPA.
--   2. Track per-tenant cost so a single curious tenant exploring AI can't
--      surprise the Anthropic bill.
--   3. Catch regressions when prompts change (we'll join on prompt_version
--      to find the introduced bug once an `evals` set lands).
--
-- The table stores the prompt fingerprint (sha256 of the system prompt) +
-- output, NOT the full prompt body — keeps row size bounded while still
-- letting us look up "which prompt version did this come from."

create table if not exists public.ai_run (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete set null,
  -- "demo" / "tenant" / "founders" — which session class triggered the call.
  session_kind text not null check (session_kind in ('demo','tenant','founders','unknown')),
  -- Surface name so we can split cost by feature ("ask-gladius","quote-drafter").
  surface text not null,
  model text not null,
  -- sha256 of the rendered system prompt; empty string if not applicable.
  prompt_hash text not null default '',
  -- Optional version label that ships in code (e.g. "ask-gladius@v3").
  prompt_version text,
  input_tokens integer,
  cached_input_tokens integer,
  output_tokens integer,
  cost_cents integer,
  -- Truncated last 4KB of the model output so debug + replay is fast.
  output_excerpt text,
  -- Free-form metadata: latency_ms, customer_id, error string, etc.
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_run_tenant_created_idx
  on public.ai_run (tenant_id, created_at desc);
create index if not exists ai_run_surface_created_idx
  on public.ai_run (surface, created_at desc);
create index if not exists ai_run_prompt_hash_idx
  on public.ai_run (prompt_hash);

alter table public.ai_run enable row level security;

-- Tenant rows readable by tenant members; demo/founders rows only readable
-- by founders (via cross-tenant access). Writes always via service-role
-- from the server actions / route handlers.
drop policy if exists "ai_run tenant read" on public.ai_run;
create policy "ai_run tenant read"
  on public.ai_run for select
  using (
    tenant_id is not null
    and public.is_tenant_member(tenant_id)
  );
