-- AI Director P0 follow-on: now that priority_decision is rolled into
-- the daily Merkle root (lib/audit/merkle.ts), the transparency_roots
-- snapshot table needs a column to store the per-day count alongside
-- the existing ai_runs_count / audit_events_count / etc.
--
-- Backfilled to 0 — pre-existing snapshot rows didn't include priority
-- decisions in their root, but the count column on those rows can stay
-- at 0 (a tenant can recompute the historical root and verify it
-- matches their snapshot, which it will because the table didn't exist
-- before the migration that created it).

alter table public.transparency_roots
  add column if not exists priority_decisions_count integer not null default 0;
