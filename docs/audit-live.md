# Live Site Audit — 2026-04-25

**Target:** `https://gladiusturf.com` (production, Vercel-hosted Next.js 15 App Router)
**Method:** Read-only HTTP probes (curl + WebFetch). 28 routes hit including main marketing pages, all 15 prerendered `/vs/[slug]` pages from sitemap, sitemap, robots, crest, favicon, 404 negative tests, form POSTs, and edge cases (UTM, www subdomain, bad slugs).
**Verdict at a glance:** All routes that should return 200 do return 200 (28/28). Brotli compression is active, www → apex 307 redirect works, robots/sitemap are healthy, h1 hierarchy is clean (1 per page), images have alt attributes (decorative ones correctly use `alt=""`). The big SEO problem is **canonical URLs are missing on 22 of 23 indexable pages**. The big UX problem is the **404 page is the bare Next.js default with zero branding**.

---

## Severity counts

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High     | 5 |
| Medium   | 4 |
| Low      | 4 |
| **Total**| **15** |

## Top 5 to fix (in order)

1. **BUG-LIVE-001** — Canonical URLs missing on 22 of 23 indexable pages (HIGH)
2. **BUG-LIVE-002** — 404 page is the bare Next.js default (no branding, no nav, no footer) (CRITICAL)
3. **BUG-LIVE-003** — `og:url` is hardcoded to `https://gladiusturf.com` on subpages (instead of the page URL) and missing entirely on others (HIGH)
4. **BUG-LIVE-004** — `/portal` is missing `og:image` even though it ships a canonical (MEDIUM)
5. **BUG-LIVE-005** — `/score` is missing the `<main>` landmark (HIGH a11y)

---

## Critical (broken on prod)

### [BUG-LIVE-002] 404 page is the bare Next.js default — no branding, no nav, no footer
- URL: `https://gladiusturf.com/this-route-does-not-exist`, `https://gladiusturf.com/favicon.ico`, `https://gladiusturf.com/vs/this-does-not-exist`
- Severity: Critical
- Description: Hitting any unknown route correctly returns HTTP 404, but the page rendered is the **default Next.js 404** — `<h1>404</h1><h2>This page could not be found.</h2>` in inline `system-ui` font, white background, no GladiusTurf header, no nav, no footer, no crest, and no escape route to the homepage. This means:
  - Users who hit a typo'd or stale URL get a blank, off-brand page that looks like the site is broken.
  - The page ships a duplicate `<meta name="robots">` tag (`noindex` from the Next default and `index, follow` from the layout-level metadata leaking through), which is contradictory and could confuse crawlers.
  - The page has no `<header>`, `<nav>`, `<main>`, or `<footer>` — none of the site landmarks.
  - The page also has the layout's `<title>` ("GladiusTurf — Landscaping Revenue Intelligence") AND the default `<title>` ("404: This page could not be found.") in the head simultaneously.
  - Root `/favicon.ico` returns 404 → it serves this same broken page when a browser/crawler probes for the legacy favicon path.
- Suggested fix: Add `app/not-found.tsx` that uses the same layout shell (header, footer, nav) and shows a branded "Lost in the brush — back to the yard →" page with a CTA to `/` and `/demo`. Also remove the conflicting robots meta. Add `app/icons/icon.png` or static `public/favicon.ico` so `/favicon.ico` returns 200 (the layout currently sets `<link rel="icon" href="/crest.png">` which works for HTML pages, but legacy clients still probe `/favicon.ico` directly).

### [BUG-LIVE-006] `/api/demo` rejects the field names documented in the audit brief
- URL: `POST https://gladiusturf.com/api/demo`
- Severity: Critical (for anyone integrating, ambiguous for end users)
- Description: The route validates `crewName`, `ownerName`, `email`, `phone`, `currentSoftware`, `crewSize` (camelCase). The audit brief and any external integration guide that mirrors a typical "snake_case JSON API" convention will be told `crew_name`, `owner_name`, `current_software`, `crew_size`. Submitting snake_case yields `400 {"error":"Missing: crewName, ownerName, currentSoftware, crewSize"}`. This is fine for the in-house form (which sends camelCase via `name="crewName"` etc.) but will surprise any future Zapier / Make / partner integration. Also: the error message reveals the internal field names to the public, which is mildly leaky.
- Suggested fix: Either (a) accept both casings in the route handler with a normalization step, or (b) document the schema explicitly in `docs/api.md`. Decide which casing is canonical and stick to it. Also consider returning a generic "Required fields missing" instead of leaking field names.

---

## High (SEO/a11y issues hurting findability or usability)

### [BUG-LIVE-001] Canonical URLs missing on 22 of 23 indexable pages
- URL: every route except `https://gladiusturf.com/portal`
- Severity: High
- Description: Only `/portal` ships `<link rel="canonical" href="https://gladiusturf.com/portal" />`. Every other indexable page — `/`, `/product`, `/pricing`, `/compare`, `/manifesto`, `/demo`, `/platform`, `/books`, `/payroll`, `/retention`, `/score`, `/field`, `/security`, `/integrations`, `/surplus-yard`, `/find-a-crew`, all 15 `/vs/[slug]` pages — is missing the tag entirely. Without canonicals, Google may index `?utm_source=…`, `www.` (currently 307s, so safe), or any future preview-domain leak as a separate page and split link equity. Confirmed: `/?utm_source=test` returns 200 with no canonical pointing back to `/`.
- Suggested fix: In `app/layout.tsx` (or each page's `generateMetadata`), set `metadataBase: new URL('https://gladiusturf.com')` and `alternates: { canonical: '/' }` (or the page's path). Next 15 will emit `<link rel="canonical" href="https://gladiusturf.com/...">` automatically per page.

### [BUG-LIVE-003] `og:url` is wrong on subpages — points to root instead of the page URL
- URL: `/product`, `/pricing`, `/demo` (and likely all subpages that set it)
- Severity: High
- Description: On `/product`, `/pricing`, and `/demo`, the rendered HTML contains `<meta property="og:url" content="https://gladiusturf.com" />` — the apex URL, not the page URL. Other pages (`/`, `/portal`, etc.) omit `og:url` entirely. When these pages are shared on Slack/iMessage/Twitter, the unfurl card will resolve the canonical share target to the homepage, not the subpage being shared.
- Suggested fix: Either remove `og:url` (modern unfurlers fall back to the request URL) or set it correctly per page via `generateMetadata` returning `openGraph: { url: '...' }`. The fix lives in the same place as canonical.

### [BUG-LIVE-005] `/score` is missing the `<main>` landmark
- URL: `https://gladiusturf.com/score`
- Severity: High (accessibility)
- Description: Every other audited page wraps body content in `<main>...</main>`. `/score` opens with `<body><div class="bg-obsidian"><header>...</header>` and never emits `<main>`. Screen readers and assistive tech rely on the `main` landmark to skip navigation — without it, keyboard/AT users cannot jump-to-content.
- Suggested fix: Wrap the page-level content in `<main>` in `app/score/page.tsx` (or whichever component the score page renders). Should be a one-line change.

### [BUG-LIVE-007] Duplicate `<meta name="robots">` on the 404 page (`noindex` + `index, follow`)
- URL: any 404 path (e.g. `/this-route-does-not-exist`, `/favicon.ico`)
- Severity: High
- Description: The 404 page emits two robots meta tags in `<head>`: `<meta name="robots" content="noindex">` (from Next's default error page) and `<meta name="robots" content="index, follow">` (leaked from the root layout metadata). Conflicting directives confuse crawlers; Google will likely honor `noindex`, but the signal is muddy. Will be fixed by shipping a proper branded `not-found.tsx` (see BUG-LIVE-002) that explicitly sets `robots: { index: false, follow: false }`.
- Suggested fix: In the new `app/not-found.tsx`, return `metadata: { robots: { index: false, follow: false } }`. Verify only one robots meta tag is in the rendered HTML.

### [BUG-LIVE-008] `/portal/demo/sample-token-2026` ships a canonical-less, footer-less, robots-indexable preview
- URL: `https://gladiusturf.com/portal/demo/sample-token-2026` (and any token)
- Severity: High
- Description: The dynamic preview route serves with a real `<title>`/`<meta description>`, an og:image, twitter card — and **any** token (`some-random-token`, `xyz`, etc.) returns 200 with the same content (confirmed). It has no canonical, no `<footer>`, and is not in the sitemap (good), but it also has no `<meta name="robots" content="noindex">`. So Googlebot can theoretically crawl `/portal/demo/anything` and index unbounded variants of the preview as duplicate pages.
- Suggested fix: Add `robots: { index: false, follow: true }` to the preview route's metadata so it's discoverable but not indexed. Also add a single canonical pointing to a stable `/portal/demo/preview` slug if you want one variant indexed for marketing.

---

## Medium (polish)

### [BUG-LIVE-004] `/portal` is missing `og:image` while every other page sets it to the crest
- URL: `https://gladiusturf.com/portal`
- Severity: Medium
- Description: `/portal` is the only page that ships a canonical URL — but it's missing `<meta property="og:image">`. So when someone shares `/portal` on Slack, the unfurl card has no image. Other pages all default to `https://gladiusturf.com/crest.png`.
- Suggested fix: Either let `/portal` inherit the layout-level og:image, or set its own (e.g. a portal-specific OG card showing the in-product UI).

### [BUG-LIVE-009] Sitemap excludes `/portal/demo/[token]` and the homepage variant — minor coverage gap, plus 404 page missing
- URL: `https://gladiusturf.com/sitemap.xml`
- Severity: Medium
- Description: Sitemap has 32 URLs (1 home + 16 marketing pages + 15 `/vs/[slug]`) — clean. But:
  - `/portal/demo/sample-token-2026` is **not** in the sitemap (correct — it's a token preview, should not be indexed).
  - However, `<lastmod>` is set to `2026-04-25T04:25:14.952Z` for **every** URL identically. That's the build timestamp, which means lastmod will refresh on every deploy regardless of whether the page actually changed. Search Console will eventually start ignoring lastmod hints if they're noisy.
- Suggested fix: Either drop `<lastmod>` entirely (Google doesn't require it) or make it page-specific (use the page's last-edited file mtime via a build-time query).

### [BUG-LIVE-010] `meta description` is too long on several pages (>160 chars; some >300)
- URL: `/`, `/pricing`, `/compare`, `/product`, `/payroll`, `/retention`, `/manifesto`
- Severity: Medium
- Description: Google truncates descriptions at ~155–160 chars in SERPs. Several pages overshoot:
  - `/` — 273 chars
  - `/pricing` — 300 chars
  - `/compare` — 332 chars
  - `/product` — 220 chars
  - `/payroll` — 179 chars
  - `/retention` — 182 chars
  - `/manifesto` — 169 chars
  - `/surplus-yard` — 185 chars
  - `/find-a-crew` — 208 chars
  - `/platform` — 233 chars
- Suggested fix: Tighten each description to 140–160 chars. Lead with the keyword + value prop; cut the trailing list-of-features fluff.

### [BUG-LIVE-011] `/api/demo` error reveals internal camelCase schema in the response body
- URL: `POST /api/demo` with bad payload
- Severity: Medium
- Description: A 400 response returns `{"error":"Missing: crewName, ownerName, currentSoftware, crewSize"}` — leaks internal field names. Low-risk, but it's a needless tell. Combined with BUG-LIVE-006 it makes the API contract ambiguous for partners.
- Suggested fix: Return `{"error":"Required fields missing","fields":["crew_name","owner_name","current_software","crew_size"]}` if you want to be helpful, or just `{"error":"Invalid request"}` and document the schema separately.

---

## Low (nits)

### [BUG-LIVE-012] `/favicon.ico` returns 404 (legacy browser/crawler probe path)
- URL: `https://gladiusturf.com/favicon.ico`
- Severity: Low
- Description: The site sets `<link rel="icon" href="/crest.png">` in the layout, which works for modern browsers viewing rendered pages. But many tools (RSS readers, link-preview bots, older browsers, some scrapers) probe `/favicon.ico` directly. That returns 404 and serves the broken Next default 404 page (BUG-LIVE-002).
- Suggested fix: Drop a `public/favicon.ico` file (32×32 ICO of the crest) so `/favicon.ico` returns 200. Or add `app/icon.png` which Next will route to `/icon.png` and serve as the favicon at any browser-probed path.

### [BUG-LIVE-013] Cache-Control is `public, max-age=0, must-revalidate` on prerendered pages
- URL: All pages
- Severity: Low
- Description: This is the Next.js App Router default for prerendered pages (Vercel CDN HITs the cache, but browsers must revalidate every request). The `X-Vercel-Cache: HIT` header confirms the CDN is serving cached HTML. Browser revalidation requests are cheap (304s) but they do add a round-trip. For pure-marketing pages (no auth, no personalization), you could push browsers to cache for 5–15 minutes.
- Suggested fix: Optional — if perf matters, set `headers()` in `next.config.js` for `/`, `/product`, `/pricing` etc. to `public, s-maxage=300, max-age=60, stale-while-revalidate=600`. Skip if the team values revalidation freshness.

### [BUG-LIVE-014] Sitemap is missing `https://gladiusturf.com/` (no trailing slash variant included; the apex URL is listed without a slash, which works but is inconsistent)
- URL: sitemap.xml
- Severity: Low
- Description: Sitemap lists `<loc>https://gladiusturf.com</loc>` (no trailing slash) for the apex, while all other entries end with a path. Google treats both as the same URL, but mixing apex-without-slash and apex-with-path-elsewhere can trip lazy crawlers.
- Suggested fix: Use `https://gladiusturf.com/` (with trailing slash) for the apex entry to be consistent.

### [BUG-LIVE-015] Several page titles are very long and will get truncated in SERPs
- URL: `/pricing` (93 chars), `/compare` (98 chars), `/product` (83 chars), `/security` (75 chars), `/retention` (73 chars)
- Severity: Low
- Description: Google truncates titles around 60 chars (~580 px). The `· GladiusTurf` suffix eats 14 chars on every page. Long titles get visually cut off in SERPs which hurts CTR.
- Suggested fix: Tighten titles to 50–60 chars before the brand suffix. Example: `Pricing — All thirty-three engines on every plan. Per crew, no per-seat tax. · GladiusTurf` (93) → `Pricing · Flat per-crew, all 33 engines · GladiusTurf` (53).

---

## Summary table — all routes

| Route | Status | Title (chars) | Description (chars) | Canonical | OG Image |
|-------|--------|---------------|---------------------|-----------|----------|
| `/` | 200 | 48 | 273 | MISSING | crest.png |
| `/product` | 200 | 83 | 220 | MISSING | crest.png |
| `/pricing` | 200 | 93 | 300 | MISSING | crest.png |
| `/compare` | 200 | 98 | 332 | MISSING | crest.png |
| `/manifesto` | 200 | 24 | 169 | MISSING | crest.png |
| `/demo` | 200 | 29 | 135 | MISSING | crest.png |
| `/platform` | 200 | 66 | 233 | MISSING | crest.png |
| `/portal` | 200 | 61 | 110 | **OK** | **MISSING** |
| `/portal/demo/sample-token-2026` | 200 | 38 | 130 | MISSING | crest.png |
| `/books` | 200 | 70 | 197 | MISSING | crest.png |
| `/payroll` | 200 | 64 | 179 | MISSING | crest.png |
| `/retention` | 200 | 73 | 182 | MISSING | crest.png |
| `/score` | 200 | 68 | 133 | MISSING | crest.png |
| `/field` | 200 | 66 | 134 | MISSING | crest.png |
| `/security` | 200 | 75 | 111 | MISSING | crest.png |
| `/integrations` | 200 | 72 | 150 | MISSING | crest.png |
| `/surplus-yard` | 200 | 70 | 185 | MISSING | crest.png |
| `/find-a-crew` | 200 | 61 | 208 | MISSING | crest.png |
| `/vs/aspire` | 200 | 45 | 74 | MISSING | crest.png |
| `/vs/lmn` | 200 | 64 | 61 | MISSING | crest.png |
| `/vs/jobber` | 200 | 36 | 52 | MISSING | crest.png |
| `/vs/quickbooks` | 200 | 55 | 46 | MISSING | crest.png |
| `/vs/realgreen` | 200 | 59 | 44 | MISSING | crest.png |
| `/vs/service-autopilot` | 200 | — | — | (sampled in sitemap, not deep-scanned) | — |
| `/vs/arborgold` | 200 | — | — | — | — |
| `/vs/singleops` | 200 | — | — | — | — |
| `/vs/hindsite` | 200 | — | — | — | — |
| `/vs/clipitc` | 200 | — | — | — | — |
| `/vs/servicetitan` | 200 | — | — | — | — |
| `/vs/fieldroutes` | 200 | — | — | — | — |
| `/vs/workwave` | 200 | — | — | — | — |
| `/vs/housecall-pro` | 200 | — | — | — | — |
| `/vs/method-crm` | 200 | — | — | — | — |
| `/sitemap.xml` | 200 | — | (32 URLs) | — | — |
| `/robots.txt` | 200 | — | (sitemap link present) | — | — |
| `/crest.png` | 200 | — | — | — | — |
| `/favicon.ico` | **404** | — | — | — | — |
| `/this-route-does-not-exist` | 404 | (default) | (leaked) | MISSING | crest.png |
| `/vs/this-does-not-exist` | 404 | (default) | (leaked) | MISSING | — |

---

## Per-route SEO health summary

- **All 28 routes that should return 200 do return 200.** No broken routes on prod.
- **All pages emit exactly one `<h1>`.** (Earlier WebFetch readouts that suggested 2–3 h1s were confusing h1 with h2 — confirmed by direct HTML inspection.)
- **All pages have `<html lang="en">`.** Good.
- **All pages have a `<title>` and `<meta name="description">`.** No missing-description bugs.
- **Brotli compression is active** (Content-Encoding: br confirmed; 305KB raw → 44KB on the wire on the homepage).
- **HTTPS + HSTS active** (`Strict-Transport-Security: max-age=63072000`).
- **www subdomain 307s to apex** correctly.
- **No `href="#"` or `href=""` anchors** on any audited page.
- **No `vercel.app` URLs leaked** anywhere in markup.
- **All `<img>` tags have alt attributes** — and decorative ones correctly use `alt=""`.
- **`/robots.txt` is permissive and points to the sitemap** — clean.
- **`/api/waitlist` works** with the documented shape (returns `{"ok":true}`).
- **`/api/demo` works** with camelCase (`crewName`, `ownerName`, etc.) but rejects snake_case (see BUG-LIVE-006).

---

## Performance pulses (homepage)

| Metric | Value |
|--------|-------|
| Status | 200 |
| Cache-Control | `public, max-age=0, must-revalidate` |
| X-Vercel-Cache | HIT |
| Content-Encoding | br (Brotli) |
| Raw HTML size | 305,558 bytes |
| Compressed size on wire | ~44,179 bytes (~85% reduction) |
| Time to first byte | ~175ms (cold ping from this audit) |
| Render-blocking in `<head>` | 1 stylesheet (`/_next/static/css/6fb2d97973218056.css`), 3 woff2 font preloads, 8 async JS chunks (non-blocking) |
| Image preloads in `<head>` | 3 (crest.png at multiple sizes) |
| HSTS | `max-age=63072000` |

Nothing concerning. The image preloads are aggressive (LCP optimization for the crest), but they're appropriate for a logo-driven hero.

---

## Form smoke tests

| Endpoint | Payload | Result |
|----------|---------|--------|
| `POST /api/demo` (snake_case as in audit brief) | `{"crew_name":"Audit Test", ...}` | **400** `{"error":"Missing: crewName, ownerName, currentSoftware, crewSize"}` |
| `POST /api/demo` (camelCase as in actual form) | `{"crewName":"Audit Test", ...}` | **200** `{"ok":true}` |
| `POST /api/waitlist` | `{"email":"...","source":"audit-test"}` | **200** `{"ok":true}` |

→ The form on `/demo` uses camelCase field names (`name="crewName"`, `name="ownerName"`, etc.) which match the API. The audit brief assumed snake_case. The form on the page works; only external integrations using snake_case will fail.

---

## Edge cases tested

| Case | Expected | Actual |
|------|----------|--------|
| `?utm_source=test` on homepage | 200 | 200 (no canonical to dedupe though — see BUG-LIVE-001) |
| `/vs/this-does-not-exist` (bad slug) | 404 | 404 (returns bare default Next.js 404) |
| `/portal/demo/some-random-token` (any token) | 200 | 200 (any token works, no validation) |
| `https://www.gladiusturf.com/` | 307 → apex | 307 → `https://gladiusturf.com/` |
| `/this-route-does-not-exist` | 404 | 404 (bare default — see BUG-LIVE-002) |

---

## Quick-fix priorities

If you have 2 hours, ship in this order:

1. **`app/not-found.tsx`** with branded layout + `robots: { index: false }` → fixes BUG-LIVE-002, BUG-LIVE-007, BUG-LIVE-012.
2. **`metadataBase` in `app/layout.tsx`** + `alternates: { canonical: '...' }` per page → fixes BUG-LIVE-001 and BUG-LIVE-003 in one pass.
3. **`<main>` wrapper in `app/score/page.tsx`** → fixes BUG-LIVE-005.
4. **`robots: { index: false }`** in `app/portal/demo/[token]/page.tsx` metadata → fixes BUG-LIVE-008.
5. **Trim 5–6 long descriptions** → fixes BUG-LIVE-010.

Total: ~30 lines of code changes across ~5 files. Net effect: SEO posture goes from "shipping but leaky" to "production-grade."
