import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Cpu,
  Database,
  FileText,
  Lock,
  Mail,
  MessageSquare,
  Shield,
  Workflow,
  Zap,
} from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { CtaButton } from "@/components/cta-button";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  title: "Platform — The infrastructure GladiusTurf runs on",
  description:
    "33 engines run on a serious platform: Clerk multi-tenant auth, tRPC type-safe API, Prisma + Postgres, Stripe Connect, Twilio voice + SMS, Resend email, Anthropic Claude AI orchestration, BullMQ async workers, Vercel + Railway deploy.",
};

type LayerCard = {
  index: string;
  name: string;
  tagline: string;
  body: string;
  bullets: string[];
  accent: "moss" | "honey";
};

const LAYERS: LayerCard[] = [
  {
    index: "Layer 01",
    name: "Edge & Field",
    tagline: "Where crews and customers actually live.",
    body: "An offline-first PWA that boots on a $200 phone in a service truck and survives a basement with no signal. Sub-200ms interactions. Mobile-optimized signature capture, GPS clock-in, photo punch-lists with EXIF, push notifications routed through native APN/FCM. Customers get a branded portal at your domain — no app store, no friction, no support ticket.",
    bullets: [
      "Installable PWA · iOS · Android · desktop",
      "Offline write queue with conflict-free merge on reconnect",
      "Sub-200ms interactions on LTE, 60fps animations",
      "Web Push for crew dispatch, magic-link for customers",
    ],
    accent: "moss",
  },
  {
    index: "Layer 02",
    name: "Operating System",
    tagline: "Thirty-three engines, five tiers, one orchestrator.",
    body: "Every engine is a self-contained module — its own router, its own schema slice, its own background workers, its own AI prompts. The orchestrator threads them together: an inbound call hits Quote Intercept, fires the Cadence engine, opens a thread in WinMemory, checks Site Memory, scores intent, and queues an outbound SMS. Twenty milliseconds end-to-end. You see one timeline. The platform sees fourteen system calls.",
    bullets: [
      "tRPC routers — one per engine, all type-safe end-to-end",
      "BullMQ workers handle every async path with retries",
      "Feature flags per engine, per tenant, per tier",
      "Engine-to-engine events on a typed message bus",
    ],
    accent: "honey",
  },
  {
    index: "Layer 03",
    name: "Data Spine",
    tagline: "Property memory, customer memory, outcome memory.",
    body: "One multi-tenant Postgres database with row-level security, soft-deletes everywhere, and pgvector for semantic recall. Every property has a memory of its visits, its quirks, its irrigation map. Every customer has a memory of every interaction — voice, SMS, email, portal. Every won deal feeds the outcome graph that trains tomorrow's pricing model. Nothing is ever truly deleted; everything is auditable forever.",
    bullets: [
      "Postgres 16 with pgvector, partitioned by companyId",
      "Soft-deletes on every row — no customer is ever gone",
      "CUID primary keys, deterministic across replicas",
      "Audit logs on every mutation, every login, every export",
    ],
    accent: "moss",
  },
];

type Primitive = {
  name: string;
  icon: React.ReactNode;
  category: string;
  body: string;
};

const PRIMITIVES: Primitive[] = [
  {
    name: "Clerk",
    icon: <Lock className="h-5 w-5" />,
    category: "Auth · Identity",
    body: "Multi-tenant auth with company orgs, role-based access (admin, crew chief, field tech, finance, customer), magic-link login, SSO-ready for the larger crews. Every record carries a companyId; every middleware enforces it before the query even reaches the database.",
  },
  {
    name: "tRPC + Zod",
    icon: <Workflow className="h-5 w-5" />,
    category: "API · Validation",
    body: "End-to-end type-safe API. Every input validated server-side with Zod before it touches the database. Compile-time check on every call from client to server — if the shape is wrong, the build fails. No drift between frontend expectations and backend reality.",
  },
  {
    name: "Prisma + Postgres",
    icon: <Database className="h-5 w-5" />,
    category: "Database · ORM",
    body: "Soft-delete pattern by default — deletedAt is a column, never a destructive action. CUIDs as primary keys for stable, sortable IDs. Multi-tenant row-level security enforced at the Postgres layer, not the app layer. Migrations versioned in git, reviewed before merge.",
  },
  {
    name: "Stripe Connect",
    icon: <Cpu className="h-5 w-5" />,
    category: "Payments · Billing",
    body: "Customer payments via card or ACH. Marketplace payouts power Surplus Yard sales and Service Upsell commissions. Subscription billing for the platform itself. PCI compliance handled by Stripe — we never see, store, or transmit a card number.",
  },
  {
    name: "Twilio Voice + SMS",
    icon: <MessageSquare className="h-5 w-5" />,
    category: "Communications",
    body: "Inbound call tracking with Dynamic Number Insertion. Outbound SMS for QuickHook, Cadence, and Ghost Recovery. Call recording with AI transcript scoring on every conversation. TCPA opt-in, opt-out, do-not-call, and quiet-hours rules enforced before a single message leaves the queue.",
  },
  {
    name: "Resend + React Email",
    icon: <Mail className="h-5 w-5" />,
    category: "Transactional Email",
    body: "Transactional email with JSX templates. Confirmations, invoices, weekly reports, ghost-recovery sequences — all designed components with components, not strings stitched together. Previewable in dev, version-controlled, A/B testable per template.",
  },
  {
    name: "Anthropic Claude",
    icon: <Brain className="h-5 w-5" />,
    category: "AI · Reasoning",
    body: "Sonnet 4.6 for the heavy reasoning, Haiku 4.5 for the high-volume scoring. Fourteen system prompts in production: first-touch, intent score, ghost recovery, voice quote, market anchor, upsell selection, cadence rewrite, objection genome, and more. Prompt registry lives in the database with canary rollouts and auto-rollback.",
  },
  {
    name: "BullMQ + Upstash Redis",
    icon: <Zap className="h-5 w-5" />,
    category: "Async Workers",
    body: "Async workers for AI scoring, cadence sends, DMS sync, payment webhooks, call scoring, weekly digests. Retry-on-failure with exponential backoff, dead-letter queue for permanent failures, observable from a dashboard, scaled per queue based on load.",
  },
];

type AiCard = {
  name: string;
  icon: React.ReactNode;
  body: string;
  proof: string;
  accent: "moss" | "honey";
};

const AI_CARDS: AiCard[] = [
  {
    name: "Intent Scorer",
    icon: <Brain className="h-5 w-5" />,
    body: "Claude scores every inbound inquiry 1–100 in under two seconds. Reads the voicemail transcript, the SMS thread, the form metadata, the time of day. Returns intent, urgency, channel preference, and a one-line summary your crew can act on. Cached aggressively for cost — repeated lookups on the same lead are free.",
    proof: "<2s p95 latency · cached · $0.0007 / score",
    accent: "moss",
  },
  {
    name: "WinMemory",
    icon: <Database className="h-5 w-5" />,
    body: "A pgvector store of every won deal you've ever closed, embedded with OpenAI text-embedding-3-large. When a new prospect arrives, the orchestrator retrieves the top-3 most similar historical wins and feeds them as few-shot examples to the response generator. Your platform gets smarter every Tuesday — automatically.",
    proof: "1536-dim embeddings · top-3 retrieval · <50ms",
    accent: "honey",
  },
  {
    name: "ResponseOptimizer",
    icon: <Workflow className="h-5 w-5" />,
    body: "Thompson Sampling bandit running over every prompt variant in production. Conversation closes? The winning variant gets bumped. Loser gets pruned, automatically. No more debating internally about which subject line works — the platform converges on the answer in two weeks of live traffic.",
    proof: "Thompson Sampling · 5% exploration · 95% exploit",
    accent: "moss",
  },
  {
    name: "Cortex Prompt Registry",
    icon: <FileText className="h-5 w-5" />,
    body: "Prompts live in the database, not in the codebase. Every change goes out as a 50% canary. The platform watches the conversion rate for 24 hours, and if the new variant regresses, the registry rolls itself back automatically. Your AI improves without a deploy and without a midnight pager incident.",
    proof: "50% canary · 24h watch · auto-rollback on regression",
    accent: "honey",
  },
];

type Integration = {
  category: string;
  description: string;
  items: { name: string; tag: "Native" | "API" | "CSV" }[];
};

const INTEGRATIONS: Integration[] = [
  {
    category: "Accounting",
    description:
      "Keep the books your CPA already trusts. Two-way sync on customers, invoices, and payments — no double entry, no monthly reconcile.",
    items: [
      { name: "QuickBooks Online", tag: "Native" },
      { name: "QuickBooks Desktop", tag: "API" },
      { name: "Xero", tag: "API" },
    ],
  },
  {
    category: "Industry CRM",
    description:
      "Bring your history with you. Import in 48 hours from the platforms you're trying to leave — or run side-by-side until your team is ready.",
    items: [
      { name: "Aspire", tag: "API" },
      { name: "Aspire Bulk Import", tag: "CSV" },
      { name: "LMN", tag: "CSV" },
      { name: "Service Autopilot", tag: "CSV" },
      { name: "Jobber", tag: "API" },
    ],
  },
  {
    category: "Field & Fleet",
    description:
      "The crew tools your dispatcher already lives in. Job dispatch, route plans, fleet GPS — the platform reads them and writes back.",
    items: [
      { name: "ServiceTitan Dispatch", tag: "API" },
      { name: "Samsara Fleet", tag: "API" },
      { name: "GPS Insight", tag: "API" },
    ],
  },
  {
    category: "Communications",
    description:
      "Voice, SMS, and chat — already in production. Bring your own numbers, port them in, or buy fresh DNI numbers from the platform.",
    items: [
      { name: "Twilio", tag: "Native" },
      { name: "Mailgun", tag: "API" },
      { name: "Apple Business Chat", tag: "API" },
    ],
  },
];

type Security = {
  name: string;
  icon: React.ReactNode;
  body: string;
};

const SECURITY: Security[] = [
  {
    name: "Multi-tenant isolation",
    icon: <Shield className="h-5 w-5" />,
    body: "Postgres row-level security plus tRPC middleware enforce companyId on every query before it leaves the application server. A bug that returned someone else's data is impossible at the database layer — not just unlikely.",
  },
  {
    name: "PCI compliance",
    icon: <Lock className="h-5 w-5" />,
    body: "Stripe handles the card data. We never see it, we never store it, we never log it. Stripe Elements iframes are loaded directly in the customer's browser; the card never crosses our infrastructure.",
  },
  {
    name: "TCPA compliance",
    icon: <MessageSquare className="h-5 w-5" />,
    body: "SMS opt-in tracked at the timestamp, do-not-call lists honored before the queue, state-specific quiet hours enforced per jurisdiction. STOP, HELP, and UNSUBSCRIBE keywords processed before any human sees them.",
  },
  {
    name: "Audit logs",
    icon: <FileText className="h-5 w-5" />,
    body: "Every action recorded with actor, timestamp, IP, and intent. Who edited which property memory, when, and why. Exportable for legal review, retained on a seven-year cold-storage policy by default.",
  },
];

type PerfStat = {
  value: string;
  label: string;
  detail: string;
  accent: "moss" | "honey";
};

const PERF_STATS: PerfStat[] = [
  {
    value: "<60s",
    label: "first-touch SMS dispatch",
    detail: "From inbound call to outbound personalized message — measured at p95 in production.",
    accent: "moss",
  },
  {
    value: "<200ms",
    label: "PWA interactions",
    detail: "Tap-to-paint on the field app, measured on a mid-tier Android over LTE in a service truck.",
    accent: "honey",
  },
  {
    value: "<5ms",
    label: "deterministic signal detection",
    detail: "130+ deterministic signal patterns evaluated on every event — no LLM call required.",
    accent: "moss",
  },
];

export default function PlatformPage() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero — true black stage; the marquee H1 emphasis word KEEPS moss
            (one of the strategic moss-bright spots per spec). */}
        <section className="relative overflow-hidden border-b border-bone/10 bg-pitch py-28 md:py-36">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[700px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(201,168,122,0.12),transparent_60%)]"
          />
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <Eyebrow tone="champagne">Platform</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h1 className="mt-4 max-w-5xl font-serif text-5xl font-semibold leading-[1.05] tracking-[-0.02em] text-bone md:text-7xl">
                The boring tech that makes{" "}
                <span className="text-moss-bright">33 engines</span> possible.
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="mt-8 max-w-3xl space-y-5 text-lg text-bone/60 md:text-xl">
                <p>
                  Great products are built on serious foundations. The reason a
                  founding crew can install GladiusTurf on Monday morning and
                  recover a $14,000 voicemail by Tuesday afternoon isn&apos;t
                  the marketing copy — it&apos;s the platform underneath. Every
                  engine is a thin layer over a stack that&apos;s already been
                  hardened in production at our sister products.
                </p>
                <p>
                  GladiusTurf inherits the same production-grade infrastructure
                  that powers Gladius CRM (50,000+ leads scored, 130+
                  deterministic signal patterns) and Gladius BDC (autonomous
                  voice, 14 prompts in canary, sub-2s response). This page
                  tells you exactly what&apos;s under the hood — the
                  primitives, the AI architecture, the integration framework,
                  the security posture, the performance budget. No marketing
                  fog. Read it like a request-for-proposal.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <CtaButton href="/demo" variant="primary" size="lg">
                  Book a technical demo
                </CtaButton>
                <CtaButton
                  href="#architecture"
                  variant="ghost-champagne"
                  withArrow
                >
                  Read the architecture
                </CtaButton>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Architecture — 3-layer card grid: rotate champagne / moss /
            champagne per spec. */}
        <section
          id="architecture"
          className="border-b border-bone/10 bg-slate-deep py-28"
        >
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Architecture</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  One platform.{" "}
                  <span className="text-champagne-bright">Three layers.</span>{" "}
                  <span className="text-bone/55">Zero glue code.</span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  Most landscaping software is a CRM bolted onto a billing
                  module bolted onto a dispatch board, held together by CSV
                  exports and crossed fingers. GladiusTurf is one platform —
                  edge, operating system, and data spine — designed together
                  from day one.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-6 lg:grid-cols-3">
              {LAYERS.map((layer, i) => {
                // Rotate champagne / moss / champagne across the three layers.
                const useChampagne = i % 2 === 0;
                const accentText = useChampagne
                  ? "text-champagne-bright"
                  : "text-moss-bright";
                const accentBorder = useChampagne
                  ? "border-champagne/30"
                  : "border-moss/30";
                const accentDot = useChampagne
                  ? "bg-champagne-bright"
                  : "bg-moss-bright";
                return (
                  <ScrollReveal key={layer.name} delay={i * 0.08}>
                    <article
                      className={`relative h-full rounded-2xl border ${accentBorder} bg-gradient-to-b from-bone/[0.04] to-transparent p-8`}
                    >
                      <span
                        className={`font-mono text-[10px] font-semibold uppercase tracking-crest ${accentText}`}
                      >
                        {layer.index}
                      </span>
                      <h3 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-bone md:text-3xl">
                        {layer.name}
                      </h3>
                      <p
                        className={`mt-2 text-sm font-medium italic ${accentText}`}
                      >
                        {layer.tagline}
                      </p>
                      <p className="mt-5 text-sm leading-[1.65] text-bone/65">
                        {layer.body}
                      </p>
                      <ul className="mt-6 space-y-2.5 border-t border-bone/10 pt-5 text-[13px] text-bone/75">
                        {layer.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2.5">
                            <span
                              className={`mt-2 h-1.5 w-1.5 flex-none rounded-full ${accentDot}`}
                            />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Primitives — all champagne accents per spec (infrastructure, not
            marquee). */}
        <section className="border-b border-bone/10 bg-obsidian py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Primitives</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Built on{" "}
                  <span className="text-champagne-bright">
                    serious infrastructure.
                  </span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  Eight production primitives — the same ones that run every
                  Stripe checkout, every Vercel deploy, every Anthropic API
                  call you already trust. We don&apos;t reinvent the
                  foundation. We compose it.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PRIMITIVES.map((p, i) => (
                <ScrollReveal key={p.name} delay={(i % 4) * 0.05}>
                  <article className="flex h-full flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-7 transition-colors hover:border-champagne/20">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-champagne/20 bg-champagne/5 text-champagne-bright">
                      {p.icon}
                    </div>
                    <span className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-crest text-bone/40">
                      {p.category}
                    </span>
                    <h3 className="mt-1 font-serif text-xl font-semibold tracking-tight text-bone">
                      {p.name}
                    </h3>
                    <p className="mt-3 text-[13px] leading-[1.65] text-bone/60">
                      {p.body}
                    </p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* AI Architecture — 4 cards alternate champagne / moss / champagne /
            moss. ONE winner card keeps shadow-pop (moss halo, signature),
            another gets shadow-pop-champagne. */}
        <section className="border-b border-bone/10 bg-slate-deep py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">AI</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  <span className="text-moss-bright">Self-improving,</span>{" "}
                  every night.
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  The platform doesn&apos;t just run AI — it learns from it.
                  Four systems work together so the response your crew sends
                  next Tuesday is provably better than the one they sent last
                  Tuesday. No prompt engineering team required.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-6 md:grid-cols-2">
              {AI_CARDS.map((c, i) => {
                // Alternate champagne/moss across the four cards.
                const useChampagne = i % 2 === 0;
                const accentText = useChampagne
                  ? "text-champagne-bright"
                  : "text-moss-bright";
                const accentBorder = useChampagne
                  ? "border-champagne/40"
                  : "border-moss/40";
                // Card 0 = champagne halo (heritage). Card 3 = the ONE moss
                // halo signature (the most-magical winner card).
                const champagneHalo = i === 0;
                const mossHalo = i === 3;
                const cls = champagneHalo
                  ? `relative h-full rounded-2xl border ${accentBorder} bg-gradient-to-b from-champagne/10 to-transparent p-8 shadow-pop-champagne`
                  : mossHalo
                    ? `relative h-full rounded-2xl border ${accentBorder} bg-gradient-to-b from-moss/10 to-transparent p-8 shadow-pop`
                    : `relative h-full rounded-2xl border border-bone/10 bg-bone/[0.02] p-8`;
                return (
                  <ScrollReveal key={c.name} delay={(i % 2) * 0.08}>
                    <article className={cls}>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${accentBorder} bg-bone/[0.03] ${accentText}`}
                      >
                        {c.icon}
                      </div>
                      <h3 className="mt-5 font-serif text-2xl font-semibold tracking-tight text-bone">
                        {c.name}
                      </h3>
                      <p className="mt-3 text-[15px] leading-[1.65] text-bone/65">
                        {c.body}
                      </p>
                      <div className="mt-6 inline-block rounded-full border border-bone/10 bg-bone/[0.03] px-3 py-1.5 font-mono text-[11px] text-bone/75">
                        <span className={accentText}>{c.proof}</span>
                      </div>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="border-b border-bone/10 bg-obsidian py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Integrations</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Plays with the stack you{" "}
                  <span className="text-champagne-bright">
                    already pay for.
                  </span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  Your CPA isn&apos;t leaving QuickBooks. Your dispatcher
                  isn&apos;t learning a new tool. The platform reads from and
                  writes to the systems your shop already trusts — natively
                  where it counts, via API where it&apos;s warranted, via CSV
                  for the legacy stragglers.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-14 space-y-5">
              {INTEGRATIONS.map((row, i) => (
                <ScrollReveal key={row.category} delay={i * 0.05}>
                  <div className="grid gap-6 rounded-2xl border border-bone/10 bg-bone/[0.02] p-7 md:grid-cols-[260px_1fr] md:gap-10 md:p-8">
                    <div>
                      <h3 className="font-serif text-xl font-semibold tracking-tight text-bone">
                        {row.category}
                      </h3>
                      <p className="mt-2 text-[13px] leading-[1.6] text-bone/55">
                        {row.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-start gap-2.5">
                      {row.items.map((item) => {
                        const tagCls =
                          item.tag === "Native"
                            ? "border-moss/40 bg-moss/10 text-moss-bright"
                            : item.tag === "API"
                              ? "border-champagne/30 bg-champagne/5 text-champagne-bright"
                              : "border-bone/15 bg-bone/[0.03] text-bone/55";
                        return (
                          <span
                            key={item.name}
                            className="inline-flex items-center gap-2 rounded-full border border-bone/10 bg-obsidian/60 px-3 py-1.5 text-[13px] text-bone/85"
                          >
                            <span className="font-medium">{item.name}</span>
                            <span
                              className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-crest ${tagCls}`}
                            >
                              {item.tag}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.15}>
              <div className="mt-10 text-center">
                <Link
                  href="/integrations"
                  className="inline-flex items-center gap-1.5 text-sm text-lime-bright transition-colors hover:text-lime"
                >
                  See full integration list
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Security & Compliance — heritage champagne accent */}
        <section className="border-b border-bone/10 bg-slate-deep py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Security</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Multi-tenant by design.{" "}
                  <span className="text-champagne-bright">
                    Audit-ready by default.
                  </span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  Security isn&apos;t a checklist we tape on at the end. The
                  platform was designed multi-tenant on day one, with
                  isolation enforced at the database layer and audit trails
                  baked into every mutation. When the auditor calls, you have
                  the answer in two clicks.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {SECURITY.map((s, i) => (
                <ScrollReveal key={s.name} delay={(i % 4) * 0.05}>
                  <article className="flex h-full flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-7">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-champagne/20 bg-champagne/5 text-champagne-bright">
                      {s.icon}
                    </div>
                    <h3 className="mt-5 font-serif text-lg font-semibold tracking-tight text-bone">
                      {s.name}
                    </h3>
                    <p className="mt-3 text-[13px] leading-[1.65] text-bone/60">
                      {s.body}
                    </p>
                  </article>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.2}>
              <div className="mt-10 text-center">
                <Link
                  href="/security"
                  className="inline-flex items-center gap-1.5 text-sm text-lime-bright transition-colors hover:text-lime"
                >
                  Read the full security posture
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Performance & Scale — alternate champagne / moss / champagne. */}
        <section className="border-b border-bone/10 bg-obsidian py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Performance</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Built for the floor,{" "}
                  <span className="text-bone/55">
                    not the conference room.
                  </span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  Performance budgets are documented, monitored, and gated.
                  Every release runs against a synthetic crew on a real LTE
                  network. Regression past the budget blocks the deploy
                  automatically. These aren&apos;t aspirations — they&apos;re
                  the SLOs we ship against.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {PERF_STATS.map((stat, i) => {
                // Alternate: 0 champagne, 1 moss, 2 champagne.
                const useChampagne = i % 2 === 0;
                const accentText = useChampagne
                  ? "text-champagne-bright"
                  : "text-moss-bright";
                const accentBorder = useChampagne
                  ? "border-champagne/30"
                  : "border-moss/30";
                return (
                  <ScrollReveal key={stat.label} delay={i * 0.08}>
                    <article
                      className={`h-full rounded-2xl border ${accentBorder} bg-gradient-to-b from-bone/[0.03] to-transparent p-8 text-center`}
                    >
                      <div
                        className={`font-serif text-6xl font-semibold tracking-tight md:text-7xl ${accentText}`}
                      >
                        {stat.value}
                      </div>
                      <div className="mt-4 text-sm font-semibold uppercase tracking-crest text-bone/85">
                        {stat.label}
                      </div>
                      <p className="mt-3 text-[13px] leading-[1.6] text-bone/55">
                        {stat.detail}
                      </p>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>

            <ScrollReveal delay={0.2}>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
                <Pill tone="champagne">99.95% uptime SLO</Pill>
                <Pill tone="moss">Vercel Edge · Railway workers</Pill>
                <Pill tone="champagne">Postgres 16 · multi-AZ</Pill>
                <Pill tone="honey">Grafana · Sentry · OpenTelemetry</Pill>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Final CTA */}
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
