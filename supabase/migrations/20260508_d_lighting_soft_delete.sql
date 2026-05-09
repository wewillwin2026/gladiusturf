-- Phase: Bright Lights pilot, 2026-05-08.
--
-- Soft-delete on lighting_fixtures + lighting_transformers so warranty
-- claims (which FK fixture_id ON DELETE SET NULL) preserve their referent
-- and we can audit deleted assets. Today's hard-delete severs that link.
--
-- Pattern: nullable deleted_at timestamptz. Application-layer queries
-- filter `deleted_at is null` for the active list and drive the
-- "Archived" expandable section from rows where it is not null. Owners
-- can still purge archived rows permanently via a separate action that
-- guards on `deleted_at is not null`.
--
-- Idempotent: if not exists on column + index.

alter table public.lighting_fixtures
  add column if not exists deleted_at timestamptz;

alter table public.lighting_transformers
  add column if not exists deleted_at timestamptz;

-- Partial index — only the soft-deleted rows. Most reads are for the
-- active list (deleted_at is null) and don't benefit from this; the
-- partial keeps the index small and aligned to the Archived view query.
create index if not exists lighting_fixtures_archived_idx
  on public.lighting_fixtures (tenant_id, deleted_at)
  where deleted_at is not null;

create index if not exists lighting_transformers_archived_idx
  on public.lighting_transformers (tenant_id, deleted_at)
  where deleted_at is not null;
