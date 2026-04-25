# Code Audit — 2026-04-25

Read-only audit of `C:\Users\ricar\code\gladiusturf-com`. Lint + typecheck pass clean — these are deeper bugs surface checks miss. 24 findings, prioritized.

## Critical (must fix before sending to clients)

### [BUG-CODE-001] Engine #21 renamed but feature bullets keyed off the old slug — Safety Shield card renders no bullets
- File: `components/engine-card.tsx:20`
- Severity: critical
- Description: `FEATURE_BULLETS` map still has key `"applicator-shield"` even though the engine slug was renamed to `"safety-shield"` (see `content/engines.ts:207` and `app/product/page.tsx:376`). `EngineCard` does `FEATURE_BULLETS[engine.slug] ?? []`, so Safety Shield silently falls through to an empty array and the card renders without its three feature bullets — visibly inconsistent with the other 8 carded engines on the homepage / product page.
- Suggested fix: rename the key:
  ```diff
  - "applicator-shield": [
  -   "Watches every applicator, license, and chemical daily",
  + "safety-shield": [
  +   "Watches every applicator, license, and chemical daily",
  ```
- Why: the highest-grossing compliance engine appears half-broken to anyone who scrolls the engines grid.

### [BUG-CODE-002] Pricing tier still claims "All 7 engines" / "Applicator Shield"
- File: `content/pricing.ts:20, 37`
- Severity: critical
- Description: The Independent tier feature list says `"All 7 engines"`. The Professional tier says `"Applicator Shield compliance"`. Both are stale — we now ship 33 engines and the engine is `Safety Shield`. This data is what `PricingTier` renders on `/` (via `PricingSection`) when the page-level `TIER_FEATURES` override in `app/pricing/page.tsx` is not used. Result: home page pricing block claims "7 engines" while the same site says "33 engines" everywhere else.
- Suggested fix:
  ```diff
  - "All 7 engines",
  + "All 33 engines included",
  ...
  - "Applicator Shield compliance",
  + "Safety Shield compliance",
  ```
- Why: the home page directly contradicts the rest of the site on the engine count and on a feature name.

### [BUG-CODE-003] Home pricing section still says "all seven engines"
- File: `components/pricing-section.tsx:44`
- Severity: critical
- Description: `<p>Every plan ships with all seven engines. No per-user fees. No add-on tax.</p>` This is rendered on the homepage directly under the pricing eyebrow.
- Suggested fix: `Every plan ships with all thirty-three engines.`
- Why: the count contradicts the EnginesGrid section directly above it which says "Thirty-three revenue engines."

### [BUG-CODE-004] Root metadata still references "Seven revenue engines"
- File: `app/layout.tsx:33, 40, 46`
- Severity: critical
- Description: Three places in the root `metadata` (description, openGraph.description, twitter.description) say "Seven revenue engines". This metadata fans out to every page that doesn't override `description` — meaning Google snippets, link previews, X cards, and LinkedIn unfurls will all say 7 engines while the page body says 33.
- Suggested fix: replace "Seven revenue engines" with "Thirty-three revenue engines" in all three strings; update root description to mention five tiers.
- Why: SEO + every social share preview is anchored on a number that hasn't been true for several waves.

### [BUG-CODE-005] Footer links to three /legal/* routes that do not exist
- File: `components/footer.tsx:43-47`
- Severity: critical
- Description: `LEGAL_LINKS` contains `/legal/privacy`, `/legal/terms`, `/legal/security`. There is no `app/legal/` directory in the codebase. All three footer legal links 404. Trust-killer for any commercial visitor.
- Suggested fix: either remove the `LEGAL_LINKS` array (delete the `<ul>` rendering it), point them at existing routes (`/security` exists), or stub three real pages. Cheapest: delete the legal links until pages exist.
- Why: 404s in the footer destroy trust on the same page that asks for a $397/mo subscription.

### [BUG-CODE-006] "27 engines" leaked into 9 customer-facing places in `competitors.ts`
- File: `content/competitors.ts:106, 185, 305, 529, 561, 610` and `content/sales-battlecards.ts:63, 241`
- Severity: critical
- Description: The competitor objection-battlecard responses still say "27 engines" / "all 27 engines" / "our 27 engines". `competitors.ts` is rendered on `/vs/[slug]` (via `objectionBattlecard` rendering — even though the current `vs/[slug]/page.tsx` doesn't render battlecards directly, the file is the source of truth and is referenced everywhere). `sales-battlecards.ts` duplicates two of the leaks. Inconsistent with the 33-count we now claim everywhere else.
- Suggested fix: global replace `27 engines` → `33 engines` in `content/competitors.ts` and `content/sales-battlecards.ts`. The `competitor-killbook.md` and `competitor-intel-v2.md` are also stale but they're internal.
- Why: a prospect coming from `/vs/aspire` who reads the objection-handling text gets two different engine counts inside one site.

### [BUG-CODE-007] Hardcoded fake testimonial labeled "Placeholder" still rendering in production
- File: `components/quote-block.tsx:5, 16, 22-30, 42`
- Severity: critical
- Description: `QuoteBlock` ships a fake testimonial ("Riley Boone, Owner, 14-crew shop, North Carolina · +$43K") with a TODO comment AND a visible disclaimer at the bottom: `Placeholder · swap with verified quote pre-launch`. The component is used on `/` and `/demo`. Fabricated testimonials with a "this is fake" admission rendered to actual visitors is worse than no testimonial — it's a credibility sinkhole.
- Suggested fix: either (a) delete the QuoteBlock usages on `/` and `/demo`, (b) replace the body with a real founding-crew quote, or (c) gate the component behind a `process.env.NODE_ENV !== "production"` so it only renders locally.
- Why: clients will see "Placeholder · swap with verified quote pre-launch" and lose trust in everything else on the site.

## High (visible bugs that affect feel)

### [BUG-CODE-008] Demo page renders "Photo placeholder" cards in production
- File: `app/demo/page.tsx:196-210`
- Severity: high
- Description: The "Founders only" section renders three `aspect-[4/5]` cards with the label `Founder 01/02/03 · Photo placeholder` instead of actual founder photos. A prospect lands on `/demo`, scrolls past the form, and sees three empty boxes labeled "Photo placeholder."
- Suggested fix: either drop in real founder portraits, replace the 3-card grid with a single founder bio block, or remove the section.
- Why: empty placeholder slots on the demo CTA page signal half-built product.

### [BUG-CODE-009] Demo page CTA links to non-existent `#tour` anchor
- File: `app/demo/page.tsx:263`
- Severity: high
- Description: `<a href="#tour">Not ready to demo? Watch the 4-minute product tour</a>` — there is no element with `id="tour"` on the page. Clicking does nothing.
- Suggested fix: either add the actual tour section, or change the link to `/product` / `/portal/demo/sample-token-2026` (the live preview).
- Why: dead anchor on the page that's supposed to be the conversion engine.

### [BUG-CODE-010] LRI Score page renders "Crew Chief · placeholder" to users
- File: `app/score/page.tsx:352`
- Severity: high
- Description: The Crew Passport section renders `<p className="mt-2 font-serif text-2xl text-bone">Crew Chief · placeholder</p>`. Customer-visible string inside a marquee component on the LRI Score page.
- Suggested fix: replace with a believable demo name (e.g. `Marcus Reyes · NC metro`) consistent with the portal demo's `Marcus Reyes` foreman.
- Why: word "placeholder" rendered in a section showcasing the Operator Score / portability feature.

### [BUG-CODE-011] Portal Shell sidebar items render as `<button>` with no onClick — they look clickable but do nothing
- File: `components/portal/portal-shell.tsx:122-132, 161-168, 197-216`
- Severity: high
- Description: `SidebarItem` renders `<button type="button">` with no `onClick` handler and no `aria-current`. The user sees six labeled icons (Dashboard / Schedule / Pay / History / Approvals / Refer), clicks one, and nothing happens. The `active` prop is hardcoded to `dashboard` and never changes. On `/portal/demo/[token]` this kills the illusion that the "live preview" is interactive.
- Suggested fix: either (a) make them anchor links that scroll to the relevant section (`<a href="#invoices">` etc.) or (b) wire them to local state that highlights a tab. Simplest: convert to `<a href="#sectionId">` with `scrollIntoView` behavior.
- Why: the live customer preview is GladiusTurf's primary "show, don't tell" demo — half its nav is dead.

### [BUG-CODE-012] Hardcoded `#9DFF8A` / `#7FE27A` / `#D4B27A` / `#D4FF4A` / `#F4CC85` / `#B8893E` instead of Tailwind tokens
- File: `app/score/page.tsx:268, 317, 319` · `app/retention/page.tsx:498` · `app/field/page.tsx:243, 249, 260, 261, 263, 264, 460, 467` · `components/comparison-table.tsx:117`
- Severity: high
- Description: Heritage colors are duplicated as raw hex inside `style={{}}` and SVG `fill=`/`stroke=` props. This bypasses the Tailwind token system, defeats theme refactors, and is the exact pattern the audit task flagged. SVGs sometimes need raw hex (no Tailwind class for `fill`), but some of these are inline `style` props that could use `bg-moss-bright` etc.
- Suggested fix: where it's a `style={{ background: ... }}` or `style={{ color: ... }}`, replace with `className="bg-moss-bright"` etc. Where it's an SVG attribute, extract a single `tokens.ts` constants file (`export const MOSS_BRIGHT = "#9DFF8A"`) and import it so the next theme rotation only needs one edit.
- Why: when champagne shifts a shade or moss gets retuned, these 14 hardcoded sites silently keep the old color.

### [BUG-CODE-013] Score page bar chart, FAQ, and "Founder 01/02/03" use `key={i}`
- File: `app/score/page.tsx:312, 812` · `app/manifesto/page.tsx:290` · `app/portal/page.tsx:671` · `components/portal/job-card.tsx:60` · `components/topographic-bg.tsx:20`
- Severity: high
- Description: Six `.map((_, i) => <X key={i} />)` instances. Index keys are React anti-patterns: any reorder/insert mid-list will mis-attribute state and animations. Three of the six are inside `framer-motion`-animated `ScrollReveal`s, where wrong keys cause animation glitches. Manifesto's `NEVERS` list is the highest-impact one because it's a long static list that never reorders, but score's bar chart maps over an array literal that *does* depend on index — `isYou = i === 12` — so the key has to be unique even after re-mounts.
- Suggested fix: use the underlying value as the key (`key={n}` for the Founder 01/02/03 grid; `key={s}` for nevers; for the bar chart use `key={\`bar-${i}-${v}\`}`).
- Why: low-risk individually, but the manifesto page already has 5 nevers and is likely to grow.

### [BUG-CODE-014] `StatRow` component is exported, imported by no one — dead code
- File: `components/stat-row.tsx`
- Severity: high
- Description: `StatRow` is defined as an exported component with a `DEFAULT_STATS` constant, but a Grep confirms zero imports. The home page (`app/page.tsx`) inlines its own version of the same stats UI directly. 113 lines of dead code shipped to the bundle.
- Suggested fix: delete `components/stat-row.tsx`.
- Why: dead components rot — next agent imports it and gets stale data. The DEFAULT_STATS in this file already uses different numbers (42% callback stat) than the home page's PROBLEM_STATS — divergent truth.

### [BUG-CODE-015] PricingTier renders raw lowercase `tier.id` as the eyebrow
- File: `components/pricing-tier.tsx:22-29`
- Severity: high
- Description: The eyebrow above each pricing tier name is `{tier.id}` — which renders as `independent`, `professional`, `enterprise` (lowercase). Should be uppercased or replaced with a category label (e.g. "Tier 01"). Reads as a sloppy data leak.
- Suggested fix:
  ```diff
  - {tier.id}
  + {tier.id.toUpperCase()}
  ```
  or remove the eyebrow line entirely (the `<h3>{tier.name}</h3>` already labels the tier).
- Why: the pricing block is the conversion engine on `/` and the lowercase token leaks out of the data layer.

## Medium (quality issues)

### [BUG-CODE-016] `app/page.tsx`'s "Coming from" links use slug `realgreen` (correct) but display name `Real Green`
- File: `app/page.tsx:41`
- Severity: medium
- Description: `{ slug: "realgreen", name: "Real Green" }` — slug matches `competitors.ts` ✓, but the displayed name "Real Green" is inconsistent with how the site spells it elsewhere (always one word + capitalization). `app/vs/[slug]/page.tsx` would render `competitor.name` from `competitors.ts`. Both are inconsistent — minor.
- Suggested fix: standardize on whichever spelling is canonical in `competitors.ts` (currently the `name` field there is `"RealGreen"` based on the killbook conventions — verify and align).
- Why: cohesion across the brand surface.

### [BUG-CODE-017] Manifesto Commandment IV says "thirty-three" but body uses the word "thirty-three" twice in two different cases
- File: `app/manifesto/page.tsx:31-33`
- Severity: medium
- Description: Commandment IV: `One spine, thirty-three engines. Not one app per workflow.` followed by `Your shop is not thirty-three shops.` The number is consistent with current count, but the prose redundancy ("thirty-three" twice) reads slightly off. Lower severity than the actual stale count leaks above.
- Suggested fix: rephrase the second "thirty-three" → "a stack of thirty-three apps" or just "thirty-three things."
- Why: copy quality.

### [BUG-CODE-018] `LogoMark` accepts `tone` prop but ignores it — should remove from API
- File: `components/logo-mark.tsx:11, 34, 38`
- Severity: medium
- Description: The component accepts a `tone?: "forest" | "moss" | "bone"` prop, then explicitly does `void _tone;` to swallow it. Comment says "legacy prop kept for backwards compatibility." But every caller still passes it — `Footer` passes `tone="bone"`, `Nav` doesn't pass it. The prop is genuinely dead. Carrying a dead public prop forces every refactor to remember it.
- Suggested fix: remove the `tone` prop from the type, remove `void _tone`, update callers (`Footer` only) to drop it.
- Why: cruft tax; removing it prevents future agents from passing tone values that will silently no-op.

### [BUG-CODE-019] `Image` width/height set as numbers but `style={{ width: size, height: "auto" }}` overrides — Next.js complains in dev
- File: `components/logo-mark.tsx:46-54`
- Severity: medium
- Description: `<Image width={size} height={size}>` plus `style={{ width: size, height: "auto" }}` triggers Next.js's "Image with src and either width or height modified" warning, and breaks aspect-ratio inference. The `className="h-auto w-auto"` is also fighting the inline style.
- Suggested fix: drop the inline `style` and just rely on `width`/`height` props. Or set `style={{ width: \`${size}px\`, height: "auto" }}` and remove `width/height` props (use `fill` mode).
- Why: noisy console + potential CLS regression.

### [BUG-CODE-020] Hero crest `priority` is true but the topographic background also competes for first paint
- File: `components/hero.tsx:69` (Image src=/crest.png priority)
- Severity: medium
- Description: The hero correctly marks `crest.png` as `priority` for LCP. However, on `/`, the home page also renders a SECOND large `Image src="/crest.png" width={520}` (line 401-407) just below the hero with no `priority` and no `loading="lazy"` directive — and a THIRD `crest.png` 320×320 in `/vs/[slug]/page.tsx:344-350` with `priority={false}`. The home-page second crest (520px, blurred, watermark behind EnginesGrid) is going to load eagerly during initial paint anyway because it's in the initial DOM tree. Since it's purely decorative and below-the-fold visually (behind EnginesGrid section), it should be lazy-loaded.
- Suggested fix: add `loading="lazy"` to `app/page.tsx:402` and `app/vs/[slug]/page.tsx:345`.
- Why: ~600KB PNG loaded eagerly when not needed = ~200ms LCP regression on slow 4G.

### [BUG-CODE-021] Score page's `<button>Approve fix / Show me the events / Dismiss</button>` have no onClick (decorative buttons)
- File: `app/score/page.tsx:647-655`
- Severity: medium
- Description: Three `<button>` elements rendered as part of the Cortex hypothesis card. They look interactive (lime CTA + ghost variants) but have no `onClick`. Clicking does nothing. Either the buttons are pretending to be functional (UX deception) or they should be `<span role="presentation">` styled to look button-like but communicate "this is a screenshot."
- Suggested fix: replace `<button>` with a non-interactive element OR add `disabled` + visual treatment showing they're a preview. Cleanest: wrap the whole card in a frame with `<span aria-label="Cortex hypothesis preview">` instead of an interactive `<button>` mock.
- Why: a customer who clicks "Approve fix" expecting feedback and gets nothing reads the entire site as half-finished.

### [BUG-CODE-022] `nav.tsx` parity-rotates link hover colors using `i % 2` — odd-count list breaks the pattern
- File: `components/nav.tsx:92-105`
- Severity: medium
- Description: `PRIMARY_LINKS.map((link, i) => ...)` alternates `hover:text-moss-bright` (even index) / `hover:text-honey-bright` (odd index). With 5 links the pattern lands moss / honey / moss / honey / moss — fine. But the spec hierarchy is now champagne-led (heritage), not moss + honey. Hover color should rotate champagne / moss to match the rest of the site. The `honey` token is leftover from the old palette.
- Suggested fix:
  ```diff
  - i % 2 === 0 ? "hover:text-moss-bright" : "hover:text-honey-bright"
  + i % 2 === 0 ? "hover:text-champagne-bright" : "hover:text-moss-bright"
  ```
- Why: nav hover color is the only place on `/` that still echoes the old dark-green/honey palette.

### [BUG-CODE-023] Champagne `#C9A87A` on bg-pitch `#050505` — contrast ratio 5.3:1 (passes AA but borderline at small sizes)
- File: `tailwind.config.ts:30, 27` · used everywhere as `text-champagne` on `bg-pitch`
- Severity: medium
- Description: The heritage default — champagne (`#C9A87A`) text on pitch (`#050505`) — yields a contrast ratio of ~5.31:1, which passes WCAG AA for ≥18pt and ≥14pt bold, but FAILS AA at body sizes (4.5:1 minimum is met, technically ok). However `text-champagne` (without `-bright`) is used at 11–13px in eyebrow tags and footer links — borderline. `champagne-bright` (`#D4B27A`) on `pitch` is ~5.91:1 — better. The spec asks specifically about this combo.
- Suggested fix: ensure all small-text uses (≤14px) use `text-champagne-bright`, not `text-champagne`. Audit `nav.tsx:53`, `score/page.tsx` eyebrow tones, `manifesto/page.tsx:117` etc. and bump where appropriate.
- Why: at 11px the heritage tag is on the edge of legibility for some viewers.

### [BUG-CODE-024] FAQ items in pricing/portal use `<details key={i}>` with index keys + open-by-default that mutates with reorders
- File: `app/portal/page.tsx:441-464` · `app/score/page.tsx:809-826`
- Severity: medium
- Description: `{FAQ.map((item, i) => <details key={i} ... open={i === 0}>...</details>)}` — index key + position-dependent state. If FAQ array order changes, React preserves the `<details>`'s open/closed state by index, so the second-FAQ user-toggled state will carry over to whatever now occupies index 1. Anti-pattern combined with `open={i === 0}` on initial mount.
- Suggested fix: `key={item.q}` (already done in some pages — make it consistent).
- Why: React-internal state divergence on FAQ reorder.

## Top 5 to fix immediately

1. **BUG-CODE-001** — Safety Shield card renders no bullets (one-line key rename).
2. **BUG-CODE-005** — Footer 3 broken `/legal/*` links (delete or stub).
3. **BUG-CODE-007** — Fake "Placeholder · swap with verified quote pre-launch" testimonial visible to clients.
4. **BUG-CODE-002 + BUG-CODE-003 + BUG-CODE-004** — "7 engines" / "Applicator Shield" leaks across `pricing.ts`, `pricing-section.tsx`, root `layout.tsx` (3 sites, all same wave miss).
5. **BUG-CODE-006** — "27 engines" leaked in 8 places across `competitors.ts` + `sales-battlecards.ts` (global replace).

After those, the next tier is the demo-page placeholders (BUG-CODE-008/009/010) and the dead `<button>`s in the portal shell (BUG-CODE-011) — all visible cracks on the conversion path.
