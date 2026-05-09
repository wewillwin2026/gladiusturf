-- Add tenants.review_url so the manual review-ask SMS button + auto-review-ask
-- cron can substitute a real Google Business Profile URL into the
-- {review_url} token instead of the https://g.page/r/<placeholder> stub.
--
-- The consuming code in app/app/(authed)/customers/[id]/actions.ts and
-- app/api/cron/auto-review-ask/route.ts already does a defensive
-- .select("review_url") inside a try/catch, falling through to the
-- placeholder when the column is missing. So this migration is the
-- "flip-the-switch" — once applied, every tenant who fills out the
-- field on /app/settings starts getting real URLs in their outbound.
--
-- Validation: only allow https:// URLs (or NULL). Length cap is
-- generous (1024) so the column can hold any GBP review-link
-- variation without further alterations.

alter table public.tenants
  add column if not exists review_url text;

-- Soft constraint — empty strings normalize to NULL via app code; URL
-- shape constrained to https:// to prevent inserting plain text or
-- http:// (which most modern email clients block silently anyway).
alter table public.tenants
  drop constraint if exists tenants_review_url_https;
alter table public.tenants
  add constraint tenants_review_url_https
  check (review_url is null or review_url ~* '^https://');

comment on column public.tenants.review_url is
  'Google Business Profile (or equivalent) review-ask landing URL. Substituted into the {review_url} token in review-ask SMS/email. Edited from /app/settings.';
