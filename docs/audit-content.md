# Content Audit — 2026-04-25

Read-only narrative + factual audit across all 22 routes plus shared components and `/content/*` data files. Top focus: stale engine counts (27 → 33), the renamed `applicator-shield` → `safety-shield` slug, stat consistency, broken anchor/internal links, escaped placeholder copy, and tone/CTA inconsistency.

**Issue counts**

- Critical: 7
- High: 11
- Medium: 13
- Low: 9
- Total: 40

**Top 5 most important**

1. **BUG-CONTENT-001** — `engine-card.tsx` keys feature bullets to `applicator-shield`, but the engine slug was renamed to `safety-shield`. Result: the bullets render for NO engine. Silent regression on the homepage Engines grid for what should be one of the marquee compliance engines.
2. **BUG-CONTENT-002** — `app/layout.tsx` site-wide metadata still says **"Seven revenue engines"**. This is the OG/Twitter description that Google, LinkedIn, and X scrape for every share. Single highest-impact stale string.
3. **BUG-CONTENT-003** — `components/pricing-section.tsx` (rendered on the homepage) says **"Every plan ships with all seven engines."** Directly contradicts the hero's "Thirty-three engines" — same page, two different counts.
4. **BUG-CONTENT-004** — Footer links `/legal/privacy`, `/legal/terms`, `/legal/security` that do not exist (no `app/legal/*` routes). Three guaranteed 404s on every page.
5. **BUG-CONTENT-005** — Quote block (`components/quote-block.tsx`) ships a fake testimonial ("Riley Boone · Pinehurst Greens · +$43K · first 30 days") on the homepage; only marker is a tiny `Placeholder · swap with verified quote pre-launch` line at the bottom. This is fabricated proof rendered above the fold-and-a-half.

---

## Critical (false claims, broken links, placeholder copy that escaped)

### [BUG-CONTENT-001] Engine card feature bullets keyed to dead slug
- File: `components/engine-card.tsx:20`
- Current text: `"applicator-shield": [ "Watches every applicator, license, and chemical daily", ... ]`
- Suggested fix: rename key to `"safety-shield"` to match `content/engines.ts:207` (`slug: "safety-shield"`).
- Severity: critical
- Why: the lookup is `FEATURE_BULLETS[engine.slug]` and `engine.slug === "safety-shield"`, so this card now silently renders zero bullets — a visible regression for the most-talked-about compliance engine.

### [BUG-CONTENT-002] Site-wide metadata says "Seven revenue engines"
- File: `app/layout.tsx:33,40,46`
- Current text: `"...Seven revenue engines for landscape crew owners. Flat per-crew pricing."` (description, OG description, Twitter description).
- Suggested fix: replace all three strings with the 33-engine narrative used on the homepage, e.g. `"Thirty-three engines across five tiers. Flat per-crew pricing. Not a CRM."`
- Severity: critical
- Why: this is the metadata every social/scraper/SEO crawler picks up. Wrong claim, propagated everywhere.

### [BUG-CONTENT-003] Homepage pricing section says "all seven engines"
- File: `components/pricing-section.tsx:44`
- Current text: `"Every plan ships with all seven engines. No per-user fees. No add-on tax."`
- Suggested fix: `"Every plan ships with all thirty-three engines."`
- Severity: critical
- Why: rendered on `/` directly under the 33-engine hero; contradicts the headline.

### [BUG-CONTENT-004] Footer links to nonexistent /legal/* routes
- File: `components/footer.tsx:43-47`
- Current text: `LEGAL_LINKS = [{ href: "/legal/privacy" }, { href: "/legal/terms" }, { href: "/legal/security" }]`
- Suggested fix: either create the routes, or temporarily point Privacy/Terms to `/security` (or `mailto:legal@gladiusturf.com`) until pages ship. Three confirmed 404s — there is no `app/legal/` directory.
- Severity: critical
- Why: appears on every page in the site.

### [BUG-CONTENT-005] Fake testimonial rendered as homepage proof
- File: `components/quote-block.tsx:5-43`
- Current text: `"We killed five subscriptions in our first 30 days on GladiusTurf and added $43K in upsell revenue..." — Riley Boone · Owner · 14-crew shop, North Carolina · +$43K`
- Suggested fix: gate this component behind a `verified={true}` prop and render nothing (or a generic stat band) when no real quote exists; or hide entirely until a verified quote is in.
- Severity: critical
- Why: the only disclaimer is `text-bone/35` micro-copy at the bottom — visually buried. Marketing risk + trust risk.

### [BUG-CONTENT-006] /demo `#tour` anchor link has no target
- File: `app/demo/page.tsx:263`
- Current text: `<a href="#tour">Not ready to demo? Watch the 4-minute product tour</a>`
- Suggested fix: either add `id="tour"` to a tour section, or replace the link with a real video URL / route. Currently the click does nothing.
- Severity: critical
- Why: only CTA in that section; broken on the page where every CTA matters most.

### [BUG-CONTENT-007] Public phone number listed in footer + demo form
- File: `components/footer.tsx:30`, `components/demo-form.tsx:60`
- Current text: `tel:+18134420253` rendered as `Call (813) 442-0253` in footer; demo-form has the same `tel:` href.
- Suggested fix: per audit guidelines we don't list a phone publicly yet — remove the entry or replace with `mailto:founders@gladiusturf.com`.
- Severity: critical
- Why: the audit prompt explicitly flags any phone number; this one is exposed site-wide.

---

## High (typos, wrong stats, mismatched headlines)

### [BUG-CONTENT-008] /platform body says "$14,000 voicemail" instead of $14,200
- File: `app/platform/page.tsx:313`
- Current text: `"...recover a $14,000 voicemail by Tuesday afternoon..."`
- Suggested fix: `$14,200` to match the locked Quote Intercept stat on `/`, `/product`, `/pricing`, and `content/engines.ts`.
- Severity: high
- Why: only place in the site that says $14,000 — direct stat mismatch.

### [BUG-CONTENT-009] /pricing page sidesteps the $397 — Independent feature list says "All 7 engines"
- File: `content/pricing.ts:19`
- Current text: `features: [ "All 7 engines", "Unlimited seats per crew", ... ]` for the Independent tier.
- Suggested fix: `"All 33 engines"` (matches what `app/pricing/page.tsx` overrides via `TIER_FEATURES`, but the `content/pricing.ts` data is consumed by `components/pricing-section.tsx` on the homepage and renders "All 7 engines" there).
- Severity: high
- Why: feeds the homepage pricing tiles via `<PricingSection>`. Customers see "All 7 engines" on `/`.

### [BUG-CONTENT-010] /pricing Professional tier feature list says "Applicator Shield compliance"
- File: `content/pricing.ts:37`
- Current text: `"Applicator Shield compliance"`
- Suggested fix: `"Safety Shield compliance"` (engine renamed).
- Severity: high
- Why: stale engine name shown on homepage pricing tiles.

### [BUG-CONTENT-011] Engine-tiers blurb says "Nine engines" for Operations
- File: `content/engine-tiers.ts:39`
- Current text: `"Nine engines for compliance, quality, crew reputation, offline field tooling, per-job costing, books, expense capture, payroll, and tax."`
- Suggested fix: count Operations engines in `engines.ts` — there are 5 native (21–25) + Books, Expense Brain, Payroll, Tax Engine = 9 (matches!). HOWEVER the audit prompt flags "9 engines" as stale. Verify intent: if the spec is the total of 33 and "9 engines" is fine for a single tier, leave; otherwise rephrase to remove the literal "Nine".
- Severity: high
- Why: ambiguous against the "no '9 engines'" rule. Recommend rephrase to "Compliance, quality, crew reputation, offline field tooling, per-job costing, books, expense capture, payroll, and tax — the boring stuff that decides whether you make money." (drops the literal numeral; the count is right).

### [BUG-CONTENT-012] Stale "27 engines" / "27 AI-native engines" across content data files
- Files: `content/competitors.ts:106,185,305,529,561,610`, `content/sales-battlecards.ts:63,148,241`, `content/competitor-killbook.md` (≥9 hits), `content/competitor-intel-v2.md` (3 hits).
- Suggested fix: replace all `"27 engines"` with `"33 engines"` and `"27 AI-native engines"` with `"33 AI-native engines"` (match the rest of the site).
- Severity: high
- Why: `content/competitors.ts` is consumed by `app/vs/[slug]/page.tsx`. Every competitor page that uses the affected battlecard rows shows "27 engines" copy live. Battlecards are also rendered.

### [BUG-CONTENT-013] Nav primary CTA says "Try the live demo" — every other CTA says "Book a 30-minute demo"
- File: `components/nav.tsx:112,181`
- Current text: `Try the live demo` (top-bar + mobile drawer)
- Suggested fix: `Book a 30-minute demo` to match `Hero`, `CtaBand`, `vs`, `compare`, `demo` page.
- Severity: high
- Why: the most-clicked CTA in the site uses different copy than the rest.

### [BUG-CONTENT-014] CTA wording fragmented across pages
- Files: `app/field/page.tsx:604`, `app/portal/page.tsx:246`, `app/score/page.tsx:426`, `app/product/page.tsx:669` ("Book a demo"); `app/manifesto/page.tsx:366` ("Book the demo"); `app/platform/page.tsx:333` ("Book a technical demo")
- Suggested fix: standardize on "Book a 30-minute demo" everywhere except where a contextual variant is intentional (Platform's "technical demo" is fine). Drop "Book the demo" / "Book a demo" plain.
- Severity: high
- Why: brand-voice inconsistency; readers parse this as variation in product seriousness.

### [BUG-CONTENT-015] Hero crest tagline + proof strip claim "Founding crews" — homepage proof strip lists 5 crews with crew counts that read like real customers
- File: `app/page.tsx:45-51`
- Current text: `[{name:"Pinehurst Greens", region:"NC · 14 crews"}, {name:"Cobblestone Land Co.", region:"TX · 9 crews"}, ...]` rendered under "Trusted by founding crews".
- Suggested fix: either mark as "Pilot crews — names changed" or replace with placeholders that read as such (e.g. "Crew A · NC"). Currently they read as real customer names.
- Severity: high
- Why: companion problem to BUG-CONTENT-005. Five fabricated brands rendered as social proof.

### [BUG-CONTENT-016] Score page renders "Crew Chief · placeholder" as visible text
- File: `app/score/page.tsx:352`
- Current text: `<p className="mt-2 font-serif text-2xl text-bone">Crew Chief · placeholder</p>`
- Suggested fix: replace with a stylized example (`"Crew Chief · J. Boone"` or `"Sample crew"`) and lower the typeface to a `text-sm` muted treatment so it reads as illustrative, not real.
- Severity: high
- Why: the literal word "placeholder" appears in the rendered Crew Passport mock — looks unfinished.

### [BUG-CONTENT-017] Demo page has visible "Photo placeholder" string
- File: `app/demo/page.tsx:206`
- Current text: rendered text `"Photo placeholder"` inside the demo page mock.
- Suggested fix: replace with a styled mock thumbnail or remove the text.
- Severity: high
- Why: visible "placeholder" wording on a high-intent route.

### [BUG-CONTENT-018] Service Autopilot battlecard objection still says "27 AI-native engines"
- File: `content/competitors.ts:148`
- Current text: `"...We shipped 27 AI-native engines. Quote Intercept alone..."`
- Suggested fix: `"33 AI-native engines"` (or 19 of 33, matching the killbook).
- Severity: high
- Why: feeds the Service Autopilot `/vs` page.

---

## Medium (inconsistencies across pages)

### [BUG-CONTENT-019] Founding-crew slot count differs across pages
- Files: `components/pricing-section.tsx:23` ("4 of 12 founding crew slots remaining"), `app/pricing/page.tsx:243` ("8 of 20 founding crew slots remaining")
- Suggested fix: pick one canonical number and source it from `/content`.
- Severity: medium
- Why: same scarcity claim, two different cohort sizes — undermines authority.

### [BUG-CONTENT-020] Pricing section "May cohort starts Apr 22" vs current date 2026-04-24
- File: `components/pricing-section.tsx:25`
- Current text: `"Founder-led white-glove setup. May cohort starts Apr 22."`
- Suggested fix: roll forward to next cohort date or remove the date and keep only "May cohort".
- Severity: medium
- Why: today's date is 2026-04-24 (per system context); "Apr 22" already passed.

### [BUG-CONTENT-021] BDC addon is described as "manned weekend phone coverage" in metadata but "24/7 AI phone answering, outbound re-engagement, spring-rush overflow" in content
- Files: `app/pricing/page.tsx:15` vs `content/pricing.ts:67-69`
- Suggested fix: pick one — recommend matching the more-detailed `content/pricing.ts` blurb in metadata.
- Severity: medium
- Why: the meta description that ships to Google says the BDC is for weekends only; the page itself says 24/7.

### [BUG-CONTENT-022] /find-a-crew "10 metros" claim vs "seven core service lines"
- File: `app/find-a-crew/page.tsx:201,237`
- Current text: `"We're starting with 10 metros."` then `"...the seven core service lines."` Two unrelated counts.
- Suggested fix: spell out the seven service lines somewhere visible (or trim the second claim) so the reader doesn't go hunting.
- Severity: medium
- Why: the page asserts a "7 service line" rule that's never enumerated.

### [BUG-CONTENT-023] Engine count split: "33" vs "thirty-three" used inconsistently
- Files: `app/pricing/page.tsx:26,35,46,166,358` ("All 33 engines"); `app/pricing/page.tsx:13,15,269,594` ("thirty-three engines"). Same on `/product` and `/compare`.
- Suggested fix: pick a rule — recommend numerals in feature lists/bullets ("All 33 engines"), spelled out in prose ("thirty-three engines"). Currently both forms appear in adjacent paragraphs on the same pages.
- Severity: medium
- Why: not strictly wrong, but visibly inconsistent.

### [BUG-CONTENT-024] Stat-row component duplicates homepage hero stats with stale text
- File: `components/stat-row.tsx:26`
- Current text: `value: 21000` (visible on `/` separately from `app/page.tsx:61`).
- Suggested fix: Consolidate the source of truth; the StatRow component appears unused on `/` (HomePage uses `PROBLEM_STATS` inline) — verify and remove the orphan or wire it up.
- Severity: medium
- Why: dead duplicate creates drift risk.

### [BUG-CONTENT-025] /platform pill row says "Sentry · OpenTelemetry" while /security might not enumerate Sentry
- File: `app/platform/page.tsx:723`
- Current text: pill `<Pill tone="honey">Grafana · Sentry · OpenTelemetry</Pill>`
- Suggested fix: confirm Sentry is actually wired (CLAUDE.md context says "Sentry deferred"). If deferred, drop Sentry from the marketing pill.
- Severity: medium
- Why: marketing claims an observability tool that may not be live.

### [BUG-CONTENT-026] Homepage proof strip mentions "Supabase · QuickBooks" but `/integrations` list emphasizes Stripe/Twilio/Resend/Anthropic
- File: `app/page.tsx:315`
- Current text: `"Stripe · Twilio · Supabase · QuickBooks · Vercel"` (homepage proof strip)
- vs Hero `components/hero.tsx:120-124`: `"Trusted by founding crews · Built on Stripe · Twilio · Anthropic Claude"`
- Suggested fix: align the two lists or pick one canonical 4-stack mention.
- Severity: medium
- Why: same page (`/`), two different "trusted infrastructure" mini-lists. Mild credibility hit.

### [BUG-CONTENT-027] /pricing FAQ on cancellation references CSV export but says "your customers, properties, route history, and invoice ledger"
- File: `app/pricing/page.tsx:131`
- Current text: implies a 4-table export.
- Suggested fix: align with `app/security/page.tsx` data-export claims (verify scope).
- Severity: medium
- Why: minor — verify export scope is consistent with what `/security` advertises.

### [BUG-CONTENT-028] /score Cortex eyebrow uses `tone="lime"` (valid for Eyebrow) but Pill `tone="lime"` is not supported
- File: `app/score/page.tsx:613`, `app/find-a-crew/page.tsx:342`, `app/manifesto/page.tsx:354`, `app/surplus-yard/page.tsx:344`, `app/field/page.tsx:886`
- Current text: `<Eyebrow tone="lime">…`
- Status: VALID — `Eyebrow` accepts `"moss" | "lime" | "honey" | "champagne"`. Note: `Pill` does NOT accept `lime` (only `moss | honey | champagne`). No Pill `tone="lime"` was found in the audit, so this passes. Filed as MEDIUM only because the asymmetry between Pill and Eyebrow tone allowlists is a footgun for future agents.
- Suggested fix: either add `lime` to Pill or drop it from Eyebrow for parity. Document either way.
- Severity: medium

### [BUG-CONTENT-029] Hero proof strip uses "Anthropic Claude" but homepage section uses "Anthropic"
- Files: `components/hero.tsx:124` ("Anthropic Claude"), various others ("Anthropic")
- Suggested fix: minor — pick one. "Anthropic Claude" reads better in marketing prose.
- Severity: low/medium
- Why: brand voice nit.

### [BUG-CONTENT-030] /portal Stripe demo card shows live-looking test card "4242 4242 4242 4242"
- File: `app/portal/page.tsx:635`
- Current text: card number rendered as if real.
- Suggested fix: keep (Stripe's universal test card; widely understood in dev/marketing audiences) but consider redacting last 4 to reinforce "demo".
- Severity: low/medium
- Why: not strictly a bug; a polish nit.

### [BUG-CONTENT-031] /retention metadata title duplicates engine 32 outcome verbatim
- File: `app/retention/page.tsx:23-24`
- Current text: `title: "Retention Radar · churn predicted 60 days out · +18% NRR"`
- Suggested fix: the meta title doesn't include "GladiusTurf" or a value prop suitable for SERP. Title template appends `· GladiusTurf` so output is okay; but consider rephrasing to a benefit-led sentence.
- Severity: medium
- Why: SEO polish.

---

## Low (nits, polish)

### [BUG-CONTENT-032] `components/logo-mark.tsx:22` comment still says "moss-green linework"
- File: `components/logo-mark.tsx:22`
- Current text: comment `(black field, moss-green linework, formal wordmark) untouched`
- Suggested fix: comment-only — update for posterity to "champagne linework on black" if the asset is now champagne-leaning. (Audit prompt flags "moss-green" prose only; comments aren't shipped to users — file as low.)
- Severity: low

### [BUG-CONTENT-033] `app/security/page.tsx` mailto subject lines are URL-encoded (`?subject=MSA%20request`) — fine, but inconsistent with footer mailto which has no subject
- Files: `app/security/page.tsx:114,119`
- Suggested fix: pick a convention; both work, but document.
- Severity: low

### [BUG-CONTENT-034] `app/pricing/page.tsx:101` — Ghost Recovery body uses "Voss-style" in prose; not glossed
- File: `app/pricing/page.tsx:103`
- Current text: `"Voss-style escalation that reawakens the leads everyone else gave up on."`
- Suggested fix: `"Chris Voss-style escalation"` on first reference for non-sales-trained readers.
- Severity: low

### [BUG-CONTENT-035] Stat-row content "$232,200 leaks per year" cites a specific Aspire 2026 report
- File: `app/page.tsx:388-390`
- Current text: `"Sources: Aspire 2026 Commercial Landscape Industry Report; founding-crew pipeline audits, 2026."`
- Suggested fix: verify the Aspire 2026 report is real and quotable; if it's a derivation, soften the citation.
- Severity: low
- Why: claiming a specific 3rd-party report by name is high-confidence; if not directly sourceable, swap for a softer attribution.

### [BUG-CONTENT-036] /find-a-crew "10 metros" never lists the metros
- File: `app/find-a-crew/page.tsx:201`
- Suggested fix: render `FOUNDING_CITIES` count (the array is iterated below but the H2 hardcodes "10").
- Severity: low

### [BUG-CONTENT-037] Footer says "Built for crew owners." but copyright is "Gladius Inc."
- File: `components/footer.tsx:128`
- Current text: `© 2026 Gladius Inc. · Built for crew owners.`
- Suggested fix: confirm legal entity; if "Gladius Inc." is the actual operating entity, fine. If it's "Gladius LLC" or another form, correct.
- Severity: low
- Why: legal-name accuracy.

### [BUG-CONTENT-038] Manifesto mentions "$115B industry" twice — same paragraph cluster
- Files: `app/manifesto/page.tsx:12,119`
- Status: probably fine (metadata + h1) — flagged as a low only because some readers see both via SERP + page.
- Severity: low

### [BUG-CONTENT-039] Various `tone="lime"` Eyebrows have no surrounding moss/honey context — fine but visually jumpy
- Files: `app/find-a-crew/page.tsx:342`, `app/manifesto/page.tsx:354`, `app/surplus-yard/page.tsx:344`
- Suggested fix: stylistic; consider switching to `champagne` for heritage consistency.
- Severity: low

### [BUG-CONTENT-040] Pricing FAQ Q "Are all 33 engines really on every plan?" — mismatch with Independent feature list (`content/pricing.ts:19` says "All 7 engines")
- Files: `app/pricing/page.tsx:166-167` vs `content/pricing.ts:19`
- Suggested fix: covered by BUG-CONTENT-009; flagged here because the FAQ on the same page literally states "All 33" while the homepage tile (rendered from same content file) says "All 7". Race condition between data layer and copy.
- Severity: low (duplicate of 009, but high-visibility on same page).

---

## Notes / non-issues verified

- All CTA `href` paths to internal routes (`/demo`, `/pricing`, `/compare`, `/platform`, `/integrations`, `/security`, `/field`, `/score`, `/portal`, `/books`, `/payroll`, `/retention`, `/surplus-yard`, `/find-a-crew`, `/manifesto`, `/product`, `/vs/<slug>`) all resolve to existing files in `app/`. Only the three `/legal/*` footer links 404.
- All in-page anchors verified except `#tour` on `/demo` (BUG-CONTENT-006). `#flow`, `#signals`, `#engineering`, `#data-spine`, `#methodology`, `#architecture`, `#invoices`, `#feed` all have matching `id=` targets.
- No `Lorem ipsum`, `TODO` (except the deliberate dev-comment in `quote-block.tsx`), or other dev-only strings escaped to user-facing copy.
- Hero copy "Your software books the job. We close the revenue." is preserved verbatim per spec.
- Locked stats verified consistent (except BUG-CONTENT-008): Quote Intercept $14,200, Upsell Whisperer $38,000, Referral Radar $180,000, Cadence $12,800, QuickHook $8,400, Ghost Recovery $11,200 — all match across `/`, `/product`, `/pricing`, `content/engines.ts`.
- Sister-product naming: `Gladius CRM`, `Gladius BDC`, `GladiusBDC for Turf` (as a product line), `GladiusStone` — all spaced correctly. Consider whether `GladiusBDC for Turf` (no space) is intentional vs `Gladius BDC for Turf` (with space). Currently mixed but minor.
- No instances of "moss-green" or "all-green" in user-facing copy. Only one stale comment in `components/logo-mark.tsx` (BUG-CONTENT-032).
- All `Pill tone=`/`Eyebrow tone=` calls use values valid for their components. No invalid `tone="warm"` or `tone="gold"` strings found.
- Phone exposure (BUG-CONTENT-007) is the only externally-disclosed contact channel beyond email; flagged critical.
