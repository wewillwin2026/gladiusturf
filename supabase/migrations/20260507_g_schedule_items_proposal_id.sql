-- Engineering Director's P1: schedule_items idempotency keyed off
-- a real column instead of an ilike scan over notes.
--
-- The acceptQuote auto-schedule flow currently dedupes by searching
-- notes for `proposal:{uuid}` substrings. That works at small scale
-- but turns into a sequential scan with 10k+ rows. Replace with a
-- proper foreign-key column + unique index per (tenant_id, proposal_id)
-- so the dedupe is O(1).
--
-- Backfill: existing rows have `notes` like 'Auto-scheduled from
-- accepted quote. proposal:{uuid}'. Extract the uuid via regex.

alter table public.schedule_items
  add column if not exists proposal_id uuid
  references public.proposals(id) on delete set null;

-- Backfill from notes substring. The regex is anchored on the literal
-- 'proposal:' marker our action wrote.
update public.schedule_items
set proposal_id = (
  substring(notes from 'proposal:([0-9a-f-]{36})')
)::uuid
where proposal_id is null
  and notes like '%proposal:%';

-- Unique partial index: at most one auto-scheduled install per
-- (tenant_id, proposal_id). The partial WHERE clause excludes rows
-- without a proposal_id from the constraint so a tenant can still
-- create multiple un-linked schedule items for the same proposal
-- manually if they want to.
create unique index if not exists schedule_items_tenant_proposal_uniq
  on public.schedule_items (tenant_id, proposal_id)
  where proposal_id is not null;

-- Lookup index for the JS-side dedupe path (cheap fallback when the
-- unique constraint is enforcing).
create index if not exists schedule_items_proposal_idx
  on public.schedule_items (proposal_id)
  where proposal_id is not null;
