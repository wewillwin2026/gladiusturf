-- Relax NOT NULL on demo_requests.owner_name / current_software / crew_size
-- (2026-05-12 — aggressive-conversion form rewrite from 11 fields → 3).
--
-- The /demo form now only collects crew name + phone + email (plus an
-- optional "best window" freetext). Everything else moves to the demo
-- call itself, so the columns become nullable.
--
-- Existing rows are untouched (they already have values for these
-- columns). Going forward, the founder gathers them on the call and a
-- back-office tool can fill them in if desired — not blocked at insert.

alter table public.demo_requests
  alter column owner_name drop not null,
  alter column current_software drop not null,
  alter column crew_size drop not null;
