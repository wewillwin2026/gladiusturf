-- Pre-seed Bright Lights' three maintenance plans per the seed in
-- lib/demo-data/bright-lights.ts §362-411. Zero subscribers (the
-- pre-launch state — Cristian's whole upsell motion is converting his
-- 12 existing customers onto plans).

with t as (
  select id as tenant_id from public.tenants where slug = 'bright-lights-encina'
)
insert into public.plans (
  tenant_id, vertical, tier, display_name, annual_price_cents,
  visits_per_year, cadence, features, badge, most_popular, recommended_for
)
select
  t.tenant_id,
  'lighting',
  v.tier,
  v.display_name,
  v.annual_price_cents,
  v.visits_per_year,
  v.cadence,
  v.features::jsonb,
  v.badge,
  v.most_popular,
  v.recommended_for
from t,
(values
  ('basics',   'Bright Basics',   24900,  1, '1 annual visit',
    '["Fixture cleaning","Lens polish","Aim adjustment","Plant trim within 2 ft","16-point inspection"]',
    'Bronze', false, '~30% of your book'),
  ('care',     'Bright Care',     34900,  2, 'Semi-annual',
    '["Everything in Basics","Bulb replacements at cost","10% off any service calls","Priority booking window"]',
    'Silver', true, '~50% of your book'),
  ('guardian', 'Bright Guardian', 58900,  4, 'Quarterly',
    '["Everything in Care","Free warranty repairs","1 free bulb replacement per visit","24-hour SLA after named storms","Lifetime warranty extension on Cast fixtures"]',
    'Gold',   false, '~20% of your book')
) as v(tier, display_name, annual_price_cents, visits_per_year, cadence, features, badge, most_popular, recommended_for)
on conflict (tenant_id, tier) do nothing;
