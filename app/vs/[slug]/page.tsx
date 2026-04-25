import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, X } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { CtaButton } from "@/components/cta-button";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TopographicBg } from "@/components/topographic-bg";
import { COMPETITORS, type Competitor } from "@/content/competitors";

// Pure RSC. Static-prerender all competitor slugs at build time.

export function generateStaticParams() {
  return COMPETITORS.map((c) => ({ slug: c.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

function findCompetitor(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const competitor = findCompetitor(slug);
  if (!competitor) {
    return {
      title: "Versus — competitor not found",
      description: "The competitor comparison page you're looking for doesn't exist.",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `GladiusTurf vs ${competitor.name}`,
    description: competitor.killHeadline,
    alternates: { canonical: `/vs/${slug}` },
  };
}

// ─── Comparison matrix engines ─────────────────────────────────
//
// The eleven marquee engines we ship a side-by-side on for every
// /vs/[slug] page. The competitor row is driven by a heuristic over
// weaknessKeywords + a small per-engine override map below.

type MatrixEngine = {
  name: string;
  description: string;
  // Keywords that, when present in a competitor's weaknessKeywords[],
  // mean the competitor effectively does NOT ship this engine.
  weaknessTriggers: string[];
};

const MATRIX_ENGINES: MatrixEngine[] = [
  {
    name: "Quote Intercept",
    description: "After-hours estimates routed and re-priced in 90 seconds",
    weaknessTriggers: [
      "no offline",
      "weak crm",
      "no ai",
      "manual reconciliation",
      "missing features",
      "irrigation-only",
    ],
  },
  {
    name: "QuickHook",
    description: "12-second first-touch with property-aware opener",
    weaknessTriggers: [
      "no ai",
      "weak crm",
      "missing features",
      "manual reconciliation",
    ],
  },
  {
    name: "Ghost Recovery",
    description: "Dead leads resurrected with reason-lost playbooks",
    weaknessTriggers: [
      "no ai",
      "no automation",
      "weak crm",
      "manual reconciliation",
      "missing features",
    ],
  },
  {
    name: "Intent Scorer",
    description: "Per-request 0-100 close-likelihood score",
    weaknessTriggers: ["no ai", "no automation", "manual reconciliation"],
  },
  {
    name: "UrgencySync",
    description: "Reads urgency cues to set reply tempo",
    weaknessTriggers: [
      "no ai",
      "no automation",
      "manual reconciliation",
      "weak crm",
    ],
  },
  {
    name: "Field Crew App",
    description: "Offline-first PWA — works in dead zones",
    weaknessTriggers: [
      "no offline",
      "buggy crew app",
      "deletes job cards",
      "field app crashes",
      "battery drain",
      "data loss",
      "app freezes",
      "2.7-star",
      "buggy updates",
      "mobile bugs",
      "office staff refuses",
    ],
  },
  {
    name: "Client Portal",
    description: "White-labeled self-serve portal — pay, schedule, approve",
    weaknessTriggers: [
      "missing features",
      "no in-app payment",
      "irrigation-only",
      "office staff refuses",
      "feature gating",
    ],
  },
  {
    name: "LRI Score",
    description: "Nightly 0-100 retention benchmark per customer + crew",
    weaknessTriggers: [
      "no ai",
      "no automation",
      "no crew profitability",
      "manual reconciliation",
    ],
  },
  {
    name: "Books",
    description: "Native general ledger — not a QuickBooks bolt-on",
    weaknessTriggers: [
      "quickbooks-only",
      "manual reconciliation",
      "missing features",
      "irrigation-only",
      "every module costs extra",
      "add-on cost creep",
    ],
  },
  {
    name: "Payroll",
    description: "GPS-verified hours · W-2 + 1099 ready",
    weaknessTriggers: [
      "missing features",
      "every module costs extra",
      "manual reconciliation",
      "no automation",
      "feature gating",
      "add-on cost creep",
    ],
  },
  {
    name: "Retention Radar",
    description: "60-day churn forecast + auto-fired save plays",
    weaknessTriggers: [
      "no ai",
      "no automation",
      "manual reconciliation",
      "weak crm",
      "missing features",
    ],
  },
];

// Per-competitor overrides where the heuristic isn't tight enough.
// `partial` means the competitor technically does it but at a depth
// that's not landscape-grade.
type Support = "yes" | "partial" | "no";

const COMPETITOR_OVERRIDES: Record<string, Partial<Record<string, Support>>> = {
  // Aspire ships ERP-grade ops, but no AI engines.
  aspire: {
    "Quote Intercept": "partial",
    "Field Crew App": "partial",
    "Client Portal": "partial",
    Books: "partial",
    Payroll: "partial",
  },
  // ServiceTitan covers everything but is HVAC-bolted-onto-green.
  servicetitan: {
    "Quote Intercept": "partial",
    "Field Crew App": "partial",
    "Client Portal": "partial",
    Books: "partial",
    Payroll: "partial",
    "Intent Scorer": "partial",
  },
  jobber: {
    "Client Portal": "partial",
    Payroll: "partial",
  },
  workwave: {
    "Field Crew App": "partial",
    Books: "partial",
  },
  realgreen: {
    "Field Crew App": "partial",
    "Client Portal": "partial",
  },
  fieldroutes: {
    "Field Crew App": "partial",
    "Client Portal": "partial",
  },
  "service-autopilot": {
    "Field Crew App": "partial",
    "Client Portal": "partial",
  },
  "housecall-pro": {
    "Field Crew App": "partial",
    "Client Portal": "partial",
  },
  // Method:CRM is QuickBooks-bolted, so Books is technically there.
  "method-crm": {
    Books: "partial",
  },
  quickbooks: {
    Books: "yes",
    Payroll: "partial",
  },
};

function competitorSupportFor(
  competitor: Competitor,
  engine: MatrixEngine
): Support {
  const override = COMPETITOR_OVERRIDES[competitor.slug]?.[engine.name];
  if (override) return override;

  const lowerKeywords = competitor.weaknessKeywords.map((k) => k.toLowerCase());
  const triggered = engine.weaknessTriggers.some((trigger) =>
    lowerKeywords.some((kw) => kw.includes(trigger))
  );
  if (triggered) return "no";
  return "partial";
}

// Migration timeline — generated inline based on migrationDays.
function buildMigrationSteps(
  competitorName: string,
  migrationDays: number
): { day: string; title: string; body: string }[] {
  const milestones: number[] = [];
  if (migrationDays >= 1) milestones.push(1);
  if (migrationDays >= 3) milestones.push(3);
  if (migrationDays >= 7) milestones.push(7);
  if (migrationDays >= 14 && migrationDays !== 14) milestones.push(14);
  if (migrationDays >= 14) milestones.push(migrationDays);

  // Dedup + sort
  const uniq = Array.from(new Set(milestones)).sort((a, b) => a - b);

  return uniq.map((day) => {
    if (day === 1) {
      return {
        day: `Day 1`,
        title: "Discovery + export",
        body: `30-minute discovery call. We pull your data export from ${competitorName} and you grant read-only access to QuickBooks. No commitment yet.`,
      };
    }
    if (day === 3) {
      return {
        day: `Day 3`,
        title: "Sample import + verification",
        body: `We map your customers, properties, services, and crews into GladiusTurf on a sandbox tenant. You verify 50 randomly-sampled records before we touch production.`,
      };
    }
    if (day === 7) {
      return {
        day: `Day 7`,
        title: "All 33 engines live · training started",
        body: `By day 7 every engine is firing on your real data — Quote Intercept, Field Crew App, Books, Payroll, Retention Radar, all of it. Two 60-minute training sessions: one for the office, one for the foremen.`,
      };
    }
    if (day === 14) {
      return {
        day: `Day 14`,
        title: "Full cutover + first ROI report",
        body: `${competitorName} goes read-only. We hand you the first revenue intelligence review — stalled quotes recovered, upsells surfaced, Referral Radar live, LRI Score baselined. The first leak we closed usually shows up here.`,
      };
    }
    return {
      day: `Day ${day}`,
      title: "Retention Radar baseline · save plays firing",
      body: `Retention Radar has a full 60-day signal window on your book. Save plays are auto-firing through Cadence. Your first month of net revenue retention is on the dashboard. The cutover is done.`,
    };
  });
}

// ─── Page ──────────────────────────────────────────────────────

export default async function VersusPage({ params }: Props) {
  const { slug } = await params;
  const competitor = findCompetitor(slug);
  if (!competitor) {
    notFound();
  }

  const migrationSteps = buildMigrationSteps(
    competitor.name,
    competitor.migrationDays
  );

  return (
    <>
      <Nav />
      <main className="bg-obsidian">
        {/* 1. Hero — champagne eyebrow + crest watermark behind H1 */}
        <section className="relative overflow-hidden border-b border-bone/10 bg-obsidian">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <TopographicBg />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] bg-[radial-gradient(ellipse_at_top,rgba(201,168,122,0.14),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow tone="champagne">Versus · {competitor.name}</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <div className="relative mt-6 max-w-5xl">
                {/* crest watermark — behind the H1 */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-8 -top-8 -z-10 opacity-5 md:-left-12 md:-top-16"
                >
                  <Image
                    src="/crest.png"
                    alt=""
                    width={320}
                    height={320}
                    priority={false}
                  />
                </div>
                <h1 className="font-serif text-5xl font-semibold leading-[1.05] tracking-[-0.02em] text-bone md:text-7xl">
                  {competitor.killHeadline}
                </h1>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="mt-10 max-w-3xl space-y-5 text-lg leading-[1.6] text-bone/65 md:text-xl">
                <p>
                  Crews leaving {competitor.name} for GladiusTurf have one thing
                  in common: they stopped paying for software that reports on
                  what already happened and started paying for software that
                  intervenes before the dollar walks. Thirty-three engines, one
                  spine, per-crew pricing.
                </p>
                <p className="text-base text-bone/55">
                  This page is the side-by-side. The matrix below covers the
                  marquee engines competitors don&apos;t ship — Quote Intercept,
                  Ghost Recovery, the Field Crew App PWA, the LRI Score,
                  Retention Radar, native Books and Payroll. Below the matrix is
                  the {competitor.migrationDays}-day migration plan we run when
                  you switch.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="mt-12 flex flex-wrap items-center gap-4">
                <CtaButton href="/demo" variant="primary" size="lg">
                  Book a 30-minute demo
                </CtaButton>
                <CtaButton href="/pricing" variant="ghost-champagne" size="lg">
                  See pricing →
                </CtaButton>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 2. Why crews switch — champagne / moss / champagne */}
        <section className="border-b border-bone/10 bg-slate-deep">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center">
                <Eyebrow tone="champagne" className="mb-3">
                  Why crews switch
                </Eyebrow>
                <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Three reasons crews leave {competitor.name}.
                </h2>
              </div>
            </ScrollReveal>

            <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
              {competitor.whySwitch.map((reason, i) => {
                // pattern: 0 → champagne, 1 → moss, 2 → champagne
                const isMoss = i % 2 === 1;
                const numCls = isMoss ? "text-moss-bright" : "text-champagne-bright";
                const borderCls = isMoss
                  ? "border-moss/30 hover:border-moss-bright/60"
                  : "border-champagne/30 hover:border-champagne-bright/60";
                return (
                  <ScrollReveal key={reason} delay={i * 0.05}>
                    <div
                      className={`flex h-full flex-col rounded-2xl border bg-bone/[0.02] p-8 transition-colors ${borderCls}`}
                    >
                      <span
                        className={`font-mono text-3xl font-semibold ${numCls}`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="mt-5 font-serif text-2xl leading-[1.25] tracking-tight text-bone">
                        {reason}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Side-by-side feature matrix */}
        <section className="border-b border-bone/10 bg-obsidian">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center">
                <Eyebrow tone="moss" className="mb-3">
                  Feature by feature
                </Eyebrow>
                <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  GladiusTurf vs. {competitor.name}.
                </h2>
                <p className="mt-4 text-base leading-[1.65] text-bone/60">
                  Eleven marquee engines, side by side. Moss check means
                  GladiusTurf ships it. Champagne check means the competitor
                  ships it too. Tilde means partial — they technically do it,
                  but not at the depth a serious crew needs. Dim X means not
                  available.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mt-14 rounded-2xl border border-bone/10 bg-obsidian p-6 md:p-8">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse">
                    <thead>
                      <tr className="border-b border-bone/10">
                        <th className="py-5 pr-6 text-left text-xs font-semibold uppercase tracking-[0.14em] text-bone/40">
                          Engine
                        </th>
                        <th className="relative py-5 text-center">
                          <div
                            aria-hidden
                            className="absolute inset-x-2 inset-y-0 -z-10 rounded-t-xl bg-gradient-to-b from-moss-bright/15 to-transparent"
                          />
                          <div className="font-serif text-lg font-semibold text-moss-bright">
                            GladiusTurf
                          </div>
                          <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-moss-bright/70">
                            33-engine layer
                          </div>
                        </th>
                        <th className="py-5 text-center">
                          <div className="text-sm font-semibold text-bone">
                            {competitor.name}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {MATRIX_ENGINES.map((engine, i) => {
                        const support = competitorSupportFor(competitor, engine);
                        return (
                          <tr
                            key={engine.name}
                            className={
                              i === MATRIX_ENGINES.length - 1
                                ? ""
                                : "border-b border-bone/5"
                            }
                          >
                            <td className="py-5 pr-6 align-top">
                              <div className="font-serif text-base font-semibold text-bone">
                                {engine.name}
                              </div>
                              <div className="mt-1 text-xs leading-[1.5] text-bone/50">
                                {engine.description}
                              </div>
                            </td>
                            <td className="py-5 text-center align-top">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-moss-bright/15">
                                <Check
                                  className="h-4 w-4 text-moss-bright"
                                  strokeWidth={3}
                                  aria-hidden
                                />
                              </span>
                            </td>
                            <td className="py-5 text-center align-top">
                              {support === "yes" ? (
                                // Competitor ✓ → champagne-bright (signature heritage)
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-champagne-bright/10">
                                  <Check
                                    className="h-4 w-4 text-champagne-bright"
                                    strokeWidth={3}
                                    aria-hidden
                                  />
                                </span>
                              ) : support === "partial" ? (
                                // Partial ~ → champagne-bright/60
                                <span
                                  aria-label="partial"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-champagne-bright/[0.06] font-mono text-xs text-champagne-bright/60"
                                >
                                  ~
                                </span>
                              ) : (
                                // Missing − → bone/20
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-bone/[0.03]">
                                  <X
                                    className="h-4 w-4 text-bone/20"
                                    strokeWidth={2.5}
                                    aria-hidden
                                  />
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 4. Migration plan — alternate champagne / moss numbered badges */}
        <section className="border-b border-bone/10 bg-slate-deep">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center">
                <Eyebrow tone="champagne" className="mb-3">
                  Migration plan
                </Eyebrow>
                <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Switch in {competitor.migrationDays} days.
                </h2>
                <p className="mt-4 text-base leading-[1.65] text-bone/60">
                  We import. We parallel-run. We reconcile every job and every
                  dollar before {competitor.name} goes read-only. We pay your
                  overlap month if it takes longer — that hasn&apos;t happened
                  yet.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mt-14 flex flex-col gap-6 md:flex-row md:gap-4">
                {migrationSteps.map((s, i) => {
                  // Alternate: 0 → champagne, 1 → moss, 2 → champagne, …
                  const isMoss = i % 2 === 1;
                  const dotCls = isMoss
                    ? "bg-moss-bright/15 text-moss-bright ring-moss-bright/30"
                    : "bg-champagne-bright/15 text-champagne-bright ring-champagne-bright/30";
                  const labelCls = isMoss
                    ? "text-moss-bright"
                    : "text-champagne-bright";
                  return (
                    <div
                      key={s.day}
                      className="relative flex-1 rounded-2xl border border-bone/10 bg-bone/[0.02] p-6 md:p-8"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ${dotCls}`}
                        >
                          {i + 1}
                        </span>
                        <p
                          className={`font-mono text-[11px] font-semibold uppercase tracking-crest ${labelCls}`}
                        >
                          {s.day}
                        </p>
                      </div>
                      <h3 className="mt-4 font-serif text-xl font-semibold leading-[1.25] text-bone">
                        {s.title}
                      </h3>
                      <p className="mt-3 text-sm leading-[1.6] text-bone/60">
                        {s.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 5. Founders block — pitch monolith, big champagne accents */}
        <section className="border-b border-bone/10 bg-pitch">
          <div className="mx-auto max-w-5xl px-6 py-28 text-center">
            <ScrollReveal>
              <Pill tone="champagne" className="mb-5">
                Talk to the founders
              </Pill>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-6xl">
                Talk to the founders.
                <br />
                <span className="text-champagne-bright">No SDR. No deck.</span>{" "}
                <span className="text-bone/55">Just your data.</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-[1.6] text-bone/65">
                Send us a CSV from {competitor.name} or screen-share the
                dashboard. We&apos;ll load your real book of business before
                the call and walk you through the stalled quotes, missed
                upsells, and the dollars sitting in your ghosted lead pile —
                line by line.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <CtaButton href="/demo" variant="primary" size="lg">
                  Book a 30-minute demo
                </CtaButton>
                <CtaButton href="/compare" variant="ghost-champagne" size="lg">
                  See full comparison →
                </CtaButton>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 6. Final CTA band */}
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
