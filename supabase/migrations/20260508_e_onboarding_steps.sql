-- Day-1 onboarding checklist substrate (Bright Lights pilot, 2026-05-08).
--
-- Adds a single jsonb column to `tenants` that holds dismissible checklist
-- flags (plans_reviewed, review_ask_dismissed, ...). Using one jsonb instead
-- of N booleans means future steps don't require a migration each — the
-- server action just sets onboarding_steps.<step> = true.
--
-- The OnboardingChecklist component reads this column alongside the live
-- tables (customers, lighting_fixtures, plan_subscriptions, campaigns,
-- review_ask_enabled) to compute completion. Idempotent.

alter table public.tenants
  add column if not exists onboarding_steps jsonb not null default '{}'::jsonb;

comment on column public.tenants.onboarding_steps is
  'Day-1 checklist dismissible flags. Keys: plans_reviewed, review_ask_dismissed. Read by components/app/OnboardingChecklist.tsx.';
