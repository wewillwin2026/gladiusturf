# Gym-block plan — 2026-05-09

User left for the gym for ~1 hour and authorized board consensus on three deliverables:

1. **Demo → payment → contract → internalized tenant flow** (board memo below)
2. **7-vertical legendary landing pages** — full game plan beyond just copy (board memo below)
3. **HTML previews of all landing pages** — shipped at `/founders/war-room/landing-previews`

Plus carry-over from prior turn:
4. **Bright Lights Monday launch checklist** — shipped at `/founders/war-room/launch-checklist`
5. **gladiusturf code-lock contract** — captured below

---

## What I shipped during the gym block (commits live in prod)

| Commit | What |
|---|---|
| `1ccdf29` | Founders portal waitlist DB — search + status updates + CSV export |
| `3b0058f` | Legendary copy rewrite for the 7 sub-vertical waitlist pages (lighting untouched) |
| `28d8e92` | FAQ extension — 4 industry-specific FAQs per vertical + FAQPage JSON-LD + landing previews founders page |
| `c991221` | Bright Lights Monday launch checklist page (live data probes for migrations + invitations + tenant active) |

**3 founders portal pages now live (sign in at `/founders/login`):**
- `/founders/war-room/vertical-leads` — the waitlist database (search, status, CSV)
- `/founders/war-room/landing-previews` — all 8 landing pages with iframe previews
- `/founders/war-room/launch-checklist` — Monday readiness with live signal probes

---

## Plan 1 — Demo → payment → contract flow (board verdict)

**VERDICT (board majority):** Stripe Elements (in-page, never leaves our domain) + the Cristian touchscreen e-sign pattern (proven Sunday) + a single `/close/[token]` URL with internal stage state. NO DocuSign, NO Stripe Checkout redirect, NO three separate routes — keeps the founder's screen-share theatre uninterrupted.

**State machine** (10 states):
`draft → sent → paying → paid → awaiting_signature → signed → provisioning → active → (refunded/voided)`

Every transition writes a `deal_events` audit row. Stripe webhooks dedupe via `stripe_events` keyed by `event.id` — idempotence is non-negotiable (Engineering held the line).

**3-phase ship sequence post-Monday code-lock:**
- **Phase 1 (week of 5/13, ~3 days)**: `deals` + `deal_events` + `stripe_events` migration; `/founders/war-room/deals/new` form; `/close/[token]` order summary + Stripe Payment Element; webhook handler with idempotence dedupe. Dogfood with founder's own card on a $1 test tier.
- **Phase 2 (week of 5/20, ~2 days)**: touchscreen sign canvas at `/close/[token]` Stage 3; `/api/close/[token]/sign` adapted from Bright Lights route; PDF persistence to `contracts` Supabase Storage bucket; Resend dual-send to founder + signer; HTML fallback if @react-pdf/renderer fails.
- **Phase 3 (week of 5/27, ~1 day)**: provisioning automation. On `signed`, generate slug from company → upsert `tenants` row (active=true) → `ensureAuthUser` + `ensureTenantMembership(role='owner')` → magic-link via existing `/api/app/auth/verify` pattern. Deals dashboard polish + DealDetailDrawer + refund button.

**Total: 6 working days post Monday code-lock.**

**Buffett DISSENT (3-1, with compromise):** "We have one paying tenant. Six engineering days at this stage of the company is the most expensive currency we have, spent on a flow that converts a number we don't yet have." Recommends: ship Phase 1 only; close deals 2-3-4 manually with email + DocuSign + Stripe payment-link. If manual close takes <20 min twice in a row, **kill Phases 2-3 permanently**. Jobs concurs: "If the manual flow feels good, the automated flow is vanity."

**Board-compromise the user should approve before Phase 1 ships:**
1. Ship **Phase 1 only** week of 5/13 (deals table + war-room "New deal" form + Stripe payment-link generation; pipeline tracking + a payment URL we can SMS).
2. Close deals #2 #3 #4 manually using the Phase 1 + email + emailed PDF.
3. **Phases 2-3 unlock only if the manual close takes >20 min twice in a row.** If <20 min, kill them.

**Required env vars before Phase 1 ships:**
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_ENTERPRISE`, `STRIPE_PRICE_ADDON_BDC`

**Why I did NOT start coding Phase 1 during the gym block:** Stripe integration touches money, contracts touch legal artifacts, and the user's instruction was "make a plan and wait." Per Claude Code defaults, payment + contract infrastructure isn't autonomous-ship territory even under blanket auth. Awaiting your sign-off on the Buffett-compromise scope before any deals/Stripe code lands.

---

## Plan 2 — 7-vertical legendary landing pages game plan

**VERDICT (board unanimous on phasing):** **One vertical at a time, gated by 50 qualified signups, with Bright Lights' Day-21 case-study post as the unlock for vertical #2.** No simultaneous bespoke rewrites. The 7 stay on the shared `VerticalWaitlist` component (now with FAQ + JSON-LD shipped this gym block) until each clears the floor.

**Ship sequence:**

| # | Vertical | Why now | Tripwire to bespoke fork | ETA |
|---|---|---|---|---|
| 1 | **Pool** | FL-dense, multi-trade angle has zero competitor; pricing simple ($197 pilot/mo) | 30 qualified signups (FL density) | 2026-05-23 (14 days post Bright Lights case study) |
| 2 | **Irrigation** | BSI Online + 67-county per-utility moat real | 50 qualified signups | 2026-06-15 |
| 3 | **Snow** | Seasonal — must ship by Aug 1 or skip a year | 30 qualified signups | 2026-08-01 |
| 4 | **Commercial** | Highest-ACV vertical (one $5K/mo HOA contract = 50 lighting subs) | 25 qualified signups | 2026-09-15 |
| 5 | **Tree-Care** | High-margin, ANSI-A300 moat | 50 qualified signups | 2026-11-01 |
| 6 | **Lawn-Care** | Largest TAM but most competitive | 100 qualified signups (must be louder) | 2027-01-15 |
| 7 | **Landscape** | Q1 2027 spec — bottom of stack | 50 qualified signups | 2027-02-01 |

**Per-vertical bespoke differentiators (when each forks):**
- **Pool**: LSI calculator widget (3 sliders → live Langelier readout)
- **Irrigation**: Live FL utilities map showing 14 portals we file to
- **Snow**: NWS storm-trigger countdown widget (mock data on first ship)
- **Tree-Care**: ANSI A300 prune-class interactive diagram
- **Lawn-Care**: Live application-log card with real EPA reg numbers
- **Commercial**: 40-property dashboard mock with COI/NTE indicators
- **Landscape**: Phase Gantt strip (demo/grade/hardscape/plant/irrigation/lighting)

**Measurement framework** (already running on `/founders/war-room/vertical-leads`):
- Per-vertical signup targets: conservative / base / stretch (Pool: 8/15/30, Irrigation: 6/12/25, Snow: 4/10/20, Commercial: 3/7/15, Tree-Care: 5/10/20, Lawn-Care: 10/25/50, Landscape: 4/8/18)
- Conversion floor: 1.2% visitor → form-submission. Below for 14 consecutive days = page is broken.
- Quality threshold: ≥ 60% of signups have pain_point > 0 chars + reachable phone.

**Kill criteria (Buffett line — "we don't run pages for products we don't sell"):**
- 30 days post v2: ≤ 4 signups + no qualified pain points → vertical killed
- 60 days post v2: < 15 signups + < 1% conversion → page 410-redirected to `/pricing` with "we paused this" honest note

**Jobs DISSENT (1-6, Buffett broke tie with compromise):** Wanted to kill **Landscape** + **Lawn-Care** outright today. "A waitlist for products we won't ship for 8-9 months is fiction with better adjectives." Buffett's tie-break: keep Landscape's page but mark **"early concept · no waitlist yet,"** strip its lead-form, retain ecosystem-strip presence. Strategy + Jobs both partially satisfied. Revisit Sept 1.

**Action item from this plan:** Apply the Landscape "early concept" badge — strip the form on `/landscape`, replace with "Get notified when landscape opens" link. ~30 min. Want me to ship this now or wait?

---

## Plan 3 — gladiusturf code-lock contract (effective EOD Monday 2026-05-12)

Per the prior 7-director board memo (still in `project_gladiusturf_pricing_followup.md` in memory):

**Freeze scope:** `app/app/(authed)/**`, `lib/app/**`, `lib/vertical/registry.ts`, `lib/messaging/**`, `lib/ai/**`, `supabase/migrations/**`. No new files, no schema changes, no new engines.

**Bug-fix exception window:** Mon-Fri week of 5/12. ONLY changes that meet ALL three:
- Felipe-reported or cron-failure-detected
- < 50 LOC diff
- Reviewed by board-deferral memo before merge
- Tag every such commit `[bl-hotfix]`

**v2 boundary** — anything below moves to next week:
- Demo → payment → contract flow (Phase 1 only per Buffett compromise)
- Pool bespoke fork (post-case-study)
- Storm Mode v2 LangGraph state machine
- supabaseAdmin → per-tenant JWT refactor (~26 files)
- Chemicals + payroll regulated schemas
- Crew at Door PWA, BrainMemory, AI eval harness

**Public surfaces stay open:** `/`, `/lighting`, `/pricing`, `/pricing/cfo`, `/legal/*`, `/security`, `/vs/[slug]`. Sales motion ≠ product code.

**Branch hygiene:** Cut `release/v1.0-bright-lights` Sunday night. Main becomes the next-iteration branch. Hotfixes branch from the release tag.

---

## What needs your decision before more code ships

1. **Demo flow scope:** approve Buffett-compromise (Phase 1 only week of 5/13, gate Phases 2-3 on >20-min manual close pattern)? Or full 6-day Phase-1-2-3 sequence?
2. **Landscape "early concept" badge:** ship now (30 min) or hold?
3. **Felipe's email:** I still don't have it. Once you give it, the launch-checklist's #1 blocking item flips green. Either paste it here or paste it directly into Supabase via the SQL block I sent earlier.
4. **Resend domain verification status:** is `founders@gladiusturf.com` Resend-verified? If not, fix before Felipe's first sign-in attempt.
5. **Apply migration `20260509_c_tenant_user_secrets.sql`** — gives Felipe (and you) password + TOTP MFA on /app/account/security.
6. **Apply migration `20260507_f_support_access_grants.sql`** — closes the Trust Console silent-zero-rows gap.

---

## Live URLs to eyeball when you're back

- **Founders portal entry:** https://gladiusturf.com/founders/login
- **Landing previews (all 8):** https://gladiusturf.com/founders/war-room/landing-previews
- **Launch checklist with live probes:** https://gladiusturf.com/founders/war-room/launch-checklist
- **Waitlist database:** https://gladiusturf.com/founders/war-room/vertical-leads
- **The 7 new legendary pages:** /pool /irrigation /landscape /lawn-care /tree-care /snow /commercial
- **Lighting (untouched):** /lighting

Each of the 7 verticals now has 4 industry-specific FAQs at the bottom with FAQPage JSON-LD for Google.
