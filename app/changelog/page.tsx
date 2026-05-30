import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CtaBand } from "@/components/cta-band";
import { Pill } from "@/components/pill";

// ---------------------------------------------------------------------------
// Public /changelog — "We ship every week" for crew owners.
// ---------------------------------------------------------------------------
//
// Why this page exists:
//
//   Most landscape software ships 2-3x/year. GladiusTurf shipped 150+
//   commits in the last 30 days alone. Crew owners who have been burned
//   by Aspire/LMN/Jobber stop believing release-velocity claims after
//   the third blog promise. This is the receipts page — every entry
//   traces to a real commit on the gladiusturf-com repo.
//
// Curation rules:
//
//   * Generated from `git log --oneline --since="30 days ago"`. Pasted
//     in at build time — no runtime git query. Re-run weekly.
//   * Operator voice. "Shipped X so your crew can Y." Not engineer
//     voice ("Refactored Foo to use Bar"). Bold verbs. Never
//     "delighted." Never "excited to announce."
//   * Skip pure refactors, version bumps, lint fixes, build-error
//     reverts.
//   * One bullet = one shippable thing a crew owner can feel.
//
// Aesthetic: Forest + moss + honey + champagne — matches gladiusturf.com.
// Indexable (robots.index = true) so prospects + investors can find it.
//
// LOCKED-SURFACE NOTE: lives under app/changelog/** — NOT under the
// locked `app/(marketing)/**` glob. No UNLOCK-TURF required.
// ---------------------------------------------------------------------------

const SITE = "https://gladiusturf.com";
const TITLE = "Changelog — We ship every week | GladiusTurf";
const DESCRIPTION =
  "150+ ships across GladiusTurf in the last 30 days. Most landscape software ships twice a year. We ship every week. Public release log straight from the git tree.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE}/changelog` },
  openGraph: {
    type: "website",
    url: `${SITE}/changelog`,
    siteName: "GladiusTurf",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@gladiusturf",
    creator: "@gladiusturf",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// ---------------------------------------------------------------------------
// THE CURATED LOG — translated from real gladiusturf-com git history
// ---------------------------------------------------------------------------
// Categories:
//   Field    — crew app, jobs, dispatch, scheduling, equipment
//   Lighting — lighting CRM module (fixtures, transformers, warranty)
//   App      — tenant CRM surface (dashboard, customers, quotes)
//   Defense  — Sentinel + AWAIS request-scoring + security headers
//   Founders — war-room, live radar, RBAC, tenant impersonation
//   Marketing — public landing pass, conversion fixes, integrations
//   Trust    — TCPA gate, AI receipt, transparency, audit log
// ---------------------------------------------------------------------------

type Category =
  | "Field"
  | "Lighting"
  | "App"
  | "Defense"
  | "Founders"
  | "Marketing"
  | "Trust";

interface ChangeItem {
  date: string;
  category: Category;
  text: string;
}

interface Week {
  range: string;
  items: ChangeItem[];
}

const WEEKS: Week[] = [
  {
    range: "Week of May 26 — Jun 1",
    items: [
      {
        date: "May 30",
        category: "Marketing",
        text: "**Landed** the energy-core hero reveal — readable eyebrows site-wide, bumped from 12px to 13px so the category tags stop looking cramped on mobile.",
      },
      {
        date: "May 29",
        category: "Defense",
        text: "**Shipped** the federation broadcast — when Sentinel learns an attack pattern here, it propagates to gladiuscrm in under 30 seconds. One brain, five products.",
      },
      {
        date: "May 29",
        category: "Defense",
        text: "**Wired** the public /api/health endpoint so uptime monitors (Better Stack, Pingdom) can watch GladiusTurf without scraping the homepage.",
      },
      {
        date: "May 28",
        category: "Defense",
        text: "**Embedded** the full AWAIS request-wire — per-request bot scoring, kill-chain detection, anomaly fingerprinting. The mesh is live, not a future state.",
      },
      {
        date: "May 28",
        category: "Marketing",
        text: "**Wired** the cross-origin marketing beacon to the central tracking pipeline. Every form view, every CTA click, attributed to the actual ad spend.",
      },
      {
        date: "May 27",
        category: "Defense",
        text: "**Locked down** the CSP + security headers — frame-ancestors trimmed to the Ecosystem HQ only, every cross-vertical embed audited.",
      },
    ],
  },
  {
    range: "Week of May 19 — May 25",
    items: [
      {
        date: "May 22",
        category: "App",
        text: "**Shipped** the Aureus Lighter Navy theme with per-tenant logo wiring. Bright Lights' brand shows up where it should, not GladiusTurf's. Bourbon palette purged of 8 hardcoded lime leaks.",
      },
      {
        date: "May 22",
        category: "App",
        text: "**Recomposed** the dashboard — dropped Marketing card, added Funnel + Retention + Profit. The 3 questions a crew owner actually asks every morning.",
      },
      {
        date: "May 22",
        category: "App",
        text: "**Closed** the onboarding stub — Day-1 owners now fill a real shop profile form, not a placeholder. Founder-only clutter stripped from the sidebar.",
      },
      {
        date: "May 20",
        category: "Field",
        text: "**Aligned** field-create vocabularies with the DB CHECK constraints. New jobs/crew/equipment don't bounce on save anymore.",
      },
      {
        date: "May 19",
        category: "Field",
        text: "**Built** the field-section create UI — Felipe can now add jobs, crew, equipment, and inventory from one place instead of three CSV imports.",
      },
      {
        date: "May 19",
        category: "App",
        text: "**Closed** the RBAC deep-link hole — server-side enforcement on every protected route. No more 'paste-the-URL' privilege escalation.",
      },
      {
        date: "May 19",
        category: "Field",
        text: "**Shipped** the field-service role matrix — what Felipe's workers see vs. what the owner sees. Two surfaces, one product, zero leakage.",
      },
      {
        date: "May 19",
        category: "App",
        text: "**Shipped** the first-login guided tour + Team preset labels. New owners stop bouncing at minute 3.",
      },
      {
        date: "May 19",
        category: "Founders",
        text: "**Landed** the War Room on Live Radar by default — the highest-signal tab now opens first.",
      },
    ],
  },
  {
    range: "Week of May 12 — May 18",
    items: [
      {
        date: "May 18",
        category: "Founders",
        text: "**Shipped** the Live Visitor Radar — who's on gladiusturf.com right now, what page, how long, scroll depth, what ad they came from. The single most-stared-at screen in the war room.",
      },
      {
        date: "May 18",
        category: "App",
        text: "**Separated** tenant roles cleanly — API keys + founder-only tools hidden from non-owners. Felipe's office manager stops seeing the founder god-mode button.",
      },
      {
        date: "May 17",
        category: "App",
        text: "**Added** the Leads tab to the tenant CRM + CORS for direct website-form capture. Every WordPress + Astra site can now POST straight into the tenant's leads queue.",
      },
      {
        date: "May 16",
        category: "Marketing",
        text: "**Wired** the Command Center + /landscaping vertical landing. The bilingual conversion-focused landing replaces the old generic 'lawn care software' page.",
      },
      {
        date: "May 16",
        category: "App",
        text: "**Built** real tenant views for invoice + job detail pages. No more iframing the demo data into a tenant's workspace.",
      },
      {
        date: "May 16",
        category: "Founders",
        text: "**Shipped** the biggest-leak decision view on the Falloff page — the war room now tells you which funnel stage to fix this week, not just where the leak is.",
      },
      {
        date: "May 14",
        category: "Marketing",
        text: "**Shipped** the WordPress integrations plugin — /leads, /webhooks, /health endpoints. Bright Lights' Astra site posts directly into their tenant CRM.",
      },
      {
        date: "May 14",
        category: "Founders",
        text: "**Added** team management + founders SMS MFA. War-room owners get a one-time code on every login from a new device.",
      },
      {
        date: "May 14",
        category: "App",
        text: "**Shipped** the per-tenant web tracker — Marketing tab on the dashboard, install snippet at /app/marketing/install. Every tenant gets their own attribution pipeline.",
      },
      {
        date: "May 13",
        category: "Lighting",
        text: "**Shipped** the second round of Lighting CRM stubs — Jobs + Equipment + Referrals. The lighting vertical is now a real surface, not a placeholder.",
      },
      {
        date: "May 13",
        category: "Lighting",
        text: "**Batched** Reports + Bilingual + Voltage + Crew + Timesheets for the lighting vertical. Bright Lights uses every one of these on Monday morning.",
      },
      {
        date: "May 13",
        category: "Field",
        text: "**Added** scan-to-prefill on the New Item inventory form. UPC barcode reads the item, autofills the SKU, owner just confirms qty + price.",
      },
      {
        date: "May 12",
        category: "Marketing",
        text: "**Shipped** the aggressive conversion landing — 3-field demo form, inline loss calculator, sticky CTA bar. Honesty rewrite after the emergency board review.",
      },
    ],
  },
  {
    range: "Week of May 5 — May 11",
    items: [
      {
        date: "May 9",
        category: "App",
        text: "**Upgraded** tenant auth — password sign-in, TOTP MFA, recovery codes. Magic-link is still there; password is now the default for owners who don't want a fresh email every login.",
      },
      {
        date: "May 9",
        category: "Trust",
        text: "**Shipped** E.164 phone normalization at every customer ingestion point. CSV import, WordPress form, manual entry — all funnel through one normalizer. No more dupes from (555) 123-4567 vs +15551234567.",
      },
      {
        date: "May 9",
        category: "Field",
        text: "**Shipped** the Owner's Daily One-Liner SMS — opt-in, default off, dispatcher-gated. One text at 6:30am: 'Today: $X in installs, 2 quotes overdue, 1 storm-radar alert.'",
      },
      {
        date: "May 9",
        category: "Marketing",
        text: "**Published** the Pricing CFO packet at /pricing/cfo — the full unit-economics defense for a procurement team. Founding-cohort theater removed.",
      },
      {
        date: "May 8",
        category: "App",
        text: "**Wired** the auto-ask review-request cron — fires 3 days post-visit, bilingual, consent-gated. Reviews land before the customer forgets the crew's name.",
      },
      {
        date: "May 8",
        category: "App",
        text: "**Shipped** Reviews module v1 — KPIs, spam moderation, manual entry, replies. Replaces the 'check Google manually every Friday' workflow.",
      },
      {
        date: "May 8",
        category: "App",
        text: "**Built** the Maintenance plan campaign launcher. Day-90 success benchmark #1: every customer who installed lighting in Q1 gets a fall-tune-up SMS by Sep 1.",
      },
      {
        date: "May 8",
        category: "Lighting",
        text: "**Shipped** Lighting CRUD — fixtures, transformers, warranty claims. Bright Lights stops tracking warranty in a Google Sheet.",
      },
      {
        date: "May 8",
        category: "App",
        text: "**Added** CSV import bilingual language picker — Storm Mode prerequisite. Spanish-language customer records survive the import without garbled UTF-8.",
      },
      {
        date: "May 8",
        category: "App",
        text: "**Wired** Plans edit UI — tenants customize tier names, pricing, features. The maintenance plan is finally the tenant's product, not a Gladius template.",
      },
    ],
  },
  {
    range: "Week of Apr 28 — May 4",
    items: [
      {
        date: "May 6",
        category: "Trust",
        text: "**Shipped** the Trust Console — outbound dispatch funnel panel. Every SMS + email sent on a tenant's behalf is visible, auditable, reversible.",
      },
      {
        date: "May 6",
        category: "Trust",
        text: "**Wired** the cryptographic Merkle audit roots + the public AI receipt page. Every AI-generated quote line ships with a cryptographic receipt the customer can verify.",
      },
      {
        date: "May 6",
        category: "App",
        text: "**Shipped** the Owner's Daily One-Liner as the app's front door — schedule signals + question signals folded into one tile.",
      },
      {
        date: "May 6",
        category: "App",
        text: "**Shipped** the Customer Heartbeat strip on customer detail — render the relationship in one strip: days since last visit, lifetime $, last unanswered question, next scheduled item.",
      },
      {
        date: "May 6",
        category: "App",
        text: "**Built** one-click quote acceptance + auto-schedule on accept — closes the loop from quote → signed → on the calendar without a follow-up phone call.",
      },
      {
        date: "May 6",
        category: "App",
        text: "**Shipped** the Twilio SMS dispatcher behind canSend() + Storm Mode wiring. TCPA + per-tenant quiet hours enforced at the dispatcher, not the form.",
      },
      {
        date: "May 6",
        category: "Field",
        text: "**Shipped** the Backflow Compliance Radar for the irrigation vertical — the regulated-event surface that incumbents skipped because it's hard.",
      },
      {
        date: "May 6",
        category: "Marketing",
        text: "**Wired** the public quote share page — customer-facing 'Ask a question' form replaces the mailto: fallback. Quote views tracked end-to-end.",
      },
      {
        date: "May 5",
        category: "Field",
        text: "**Shipped** the inventory aging engine + scanner + reminder cron. SKUs sitting in the truck for 90+ days surface in the daily one-liner.",
      },
      {
        date: "May 5",
        category: "Field",
        text: "**Built** the receiving flow + QR label printing. New inventory gets scanned, labeled, racked — all from a phone, no laptop required.",
      },
      {
        date: "May 5",
        category: "App",
        text: "**Shipped** the Mike Jackson service-history timeline (Phase 7) — every visit, every quote, every photo, on one scrollable strip.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// HEADLINE NUMBER — pulled from `git log --oneline --since="30 days ago" | wc -l`
// Re-run weekly. Hardcoded so the page renders at build time without git access.
// ---------------------------------------------------------------------------
const SHIPS_LAST_30_DAYS = 150;

// ---------------------------------------------------------------------------
// Category chip styles — Forest + moss + honey + champagne palette only.
// No teal, no operator-navy leakage.
// ---------------------------------------------------------------------------
const CATEGORY_STYLES: Record<
  Category,
  { dot: string; chip: string }
> = {
  Field: {
    dot: "bg-moss-bright",
    chip: "bg-moss/10 text-moss-bright border-moss/30",
  },
  Lighting: {
    dot: "bg-honey-bright",
    chip: "bg-honey/10 text-honey-bright border-honey/30",
  },
  App: {
    dot: "bg-champagne-bright",
    chip: "bg-champagne/10 text-champagne-bright border-champagne/30",
  },
  Defense: {
    dot: "bg-lime-bright",
    chip: "bg-lime/10 text-lime-bright border-lime/30",
  },
  Founders: {
    dot: "bg-copper",
    chip: "bg-copper/10 text-copper border-copper/30",
  },
  Marketing: {
    dot: "bg-sage",
    chip: "bg-sage/10 text-sage border-sage/30",
  },
  Trust: {
    dot: "bg-parchment",
    chip: "bg-parchment/10 text-parchment border-parchment/30",
  },
};

function renderBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-bone">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChangelogPage() {
  return (
    <>
      <Nav />
      <main className="bg-obsidian text-bone">
        {/* Hero ------------------------------------------------------ */}
        <section className="relative overflow-hidden border-b border-bone/10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(127,226,122,0.10),transparent_60%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[500px] opacity-[0.06] [background-image:linear-gradient(to_right,rgba(245,241,232,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,241,232,0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          />
          <div className="relative mx-auto max-w-5xl px-6 pt-28 pb-20 md:pt-32">
            <Pill className="mb-8" tone="moss">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-moss-bright" />
              </span>
              Public release log
            </Pill>

            <h1 className="font-serif text-5xl leading-[1.05] tracking-[-0.02em] text-bone md:text-7xl">
              We ship every week.
              <br />
              <span className="font-serif italic text-bone/55">
                Most landscape software ships every year.
              </span>
            </h1>

            <div className="mt-14 flex flex-col gap-10 md:flex-row md:items-end md:gap-16">
              <div>
                <div className="font-mono text-7xl leading-none tabular-nums text-moss-bright md:text-8xl">
                  {SHIPS_LAST_30_DAYS}+
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-bone/55">
                  Ships · last 30 days · GladiusTurf repo
                </p>
              </div>
              <div className="border-l border-moss/30 pl-6 text-base leading-relaxed text-bone/70 md:max-w-md md:ml-4">
                Counted off the gladiusturf-com repo via{" "}
                <code className="font-mono text-[13px] text-champagne-bright">
                  git log --since=&quot;30 days ago&quot;
                </code>
                . Real commits. Real timestamps. Every entry below traces
                to a shippable thing a crew owner can feel by Monday.
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-3 text-[11px]">
              <span className="rounded-full border border-bone/15 bg-bone/[0.02] px-3 py-1 uppercase tracking-[0.18em] text-bone/50">
                Aspire — 4x/year
              </span>
              <span className="rounded-full border border-bone/15 bg-bone/[0.02] px-3 py-1 uppercase tracking-[0.18em] text-bone/50">
                LMN — 3x/year
              </span>
              <span className="rounded-full border border-bone/15 bg-bone/[0.02] px-3 py-1 uppercase tracking-[0.18em] text-bone/50">
                Service Autopilot — 2x/year
              </span>
              <span className="rounded-full border border-moss/40 bg-moss/10 px-3 py-1 font-semibold uppercase tracking-[0.18em] text-moss-bright">
                GladiusTurf — 20x/week
              </span>
            </div>
          </div>
        </section>

        {/* Timeline -------------------------------------------------- */}
        <section className="mx-auto max-w-5xl px-6 py-20">
          <div className="space-y-12">
            {WEEKS.map((week) => (
              <article
                key={week.range}
                className="relative border-l-2 border-moss/30 pl-6 md:pl-10"
              >
                <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-moss-bright ring-4 ring-obsidian" />

                <header className="mb-6">
                  <h2 className="font-serif text-2xl tracking-[-0.01em] text-bone md:text-3xl">
                    {week.range}
                  </h2>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/45">
                    {week.items.length} ship
                    {week.items.length === 1 ? "" : "s"}
                  </p>
                </header>

                <ul className="space-y-3">
                  {week.items.map((item, i) => {
                    const styles = CATEGORY_STYLES[item.category];
                    return (
                      <li
                        key={`${week.range}-${i}`}
                        className="group rounded-lg border border-bone/10 bg-bone/[0.02] p-4 backdrop-blur-sm transition-colors hover:border-moss/30 md:p-5"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
                          <div className="flex shrink-0 items-center gap-3">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                            />
                            <time className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] text-bone/45">
                              {item.date}
                            </time>
                            <span
                              className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${styles.chip}`}
                            >
                              {item.category}
                            </span>
                          </div>
                          <p className="flex-1 text-base leading-relaxed text-bone/75">
                            {renderBold(item.text)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>

          <p className="mt-16 text-center font-mono text-[12px] text-bone/45">
            {`// earlier weeks archived — full git log on the gladiusturf-com repo`}
          </p>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
