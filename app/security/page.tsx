import type { Metadata } from "next";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  FileText,
  Key,
  Lock,
  Shield,
} from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  title: "Security — Multi-tenant by design. Audit-ready by default.",
  description:
    "App-layer tenant scoping today (RLS migration in progress), magic-link auth, Stripe-tokenized PCI scope = 0, TCPA consent ledger, AI run audit log, public DPA.",
  alternates: { canonical: "/security" },
};

const PRINCIPLES: { headline: string; body: string }[] = [
  {
    headline: "Your data is yours.",
    body: "Exportable to CSV any day, by any admin. No data hostage. We will help you migrate OUT if you ever leave — full schema dumps, every table, every record, your format. The day you sign is the day we start earning the right to keep you, and a contract is not a substitute for a product worth keeping.",
  },
  {
    headline: "Multi-tenant by design.",
    body: "Every record carries a tenant_id. Tenant scoping is enforced at the application layer — every server action and route handler reads the session cookie and filters every query by the authenticated tenant. Postgres Row-Level Security policies are also defined on every tenant table; we are migrating reads + writes from the service-role client to a per-tenant JWT'd client so RLS becomes the active boundary alongside application-layer scoping. Status: in progress, tracked on the roadmap.",
  },
  {
    headline: "No card data on our servers.",
    body: "Stripe handles all card data. We never see, store, or transmit a primary account number. PCI scope = zero. When a customer pays an invoice through the Client Portal, the card never touches our infrastructure — it travels directly from the browser to Stripe's tokenization endpoint.",
  },
  {
    headline: "TCPA-aware messaging.",
    body: "Consent is recorded as structured data, not free-text notes: every customer × channel has a row in customer_messaging_consent (status, source, consent text, version, IP, timestamps). Server-side canSend() check enforces opt-in status, per-tenant quiet-hours, and blocked weekdays before any dispatch. CSV import requires an attestation. Outbound auto-cadences ship behind this gate — never before.",
  },
  {
    headline: "Forensic AI audit trail.",
    body: "Every Ask Gladius and AI Quote Drafter call writes a row to ai_run with tenant_id, surface, model, prompt hash + version, token counts (including cached), estimated cost in cents, and a 4KB output excerpt. When a customer asks 'what did your AI tell me three weeks ago,' we can answer with the exact response, model version, and prompt fingerprint that produced it.",
  },
];

const AUTH_CARDS: { icon: React.ComponentType<{ className?: string }>; headline: string; body: string }[] = [
  {
    icon: Shield,
    headline: "Magic-link auth",
    body: "Tenants and operators sign in with a one-time link emailed via Resend. Tokens are HMAC-SHA256-signed with a per-environment secret, 15-minute TTL, single-use, rate-limited 5/hour per IP. No passwords on the operator-facing surface — phishing surface eliminated. SSO + SAML on the enterprise roadmap.",
  },
  {
    icon: Key,
    headline: "Role-based access",
    body: "Three roles today: tenant owner, tenant member, founder. Owners get full workspace access; members are reserved for upcoming team-seat features; founders have cross-tenant read access for support, disclosed in /legal/privacy §2.5 and migrating to per-incident opt-in grants.",
  },
  {
    icon: Lock,
    headline: "Session security",
    body: "Cookies are HttpOnly + Secure + SameSite=Lax with HMAC-signed payloads. Session TTL is 7 days; the cookie revalidates on every request against the tenant_invitations table so a revoked owner loses access on the next page load. Production hard-fails if the tenant session secret env var is missing.",
  },
  {
    icon: Eye,
    headline: "Founder access transparency",
    body: "When founders read a tenant's workspace for support, the access is disclosed in the privacy policy and we are shipping a per-tenant opt-in grant system so the tenant explicitly authorizes each support session. Until that ships, all founder cross-tenant reads are restricted to two named individuals on file.",
  },
];

type ComplianceItem = { label: string };
type ComplianceColumn = {
  status: "done" | "in-progress" | "roadmap";
  title: string;
  items: ComplianceItem[];
};

const COMPLIANCE: ComplianceColumn[] = [
  {
    status: "done",
    title: "Done now",
    items: [
      { label: "PCI scope = 0 (Stripe-tokenized; no PAN ever touches us)" },
      { label: "Encryption at rest + in transit (Supabase-managed, TLS 1.2+)" },
      { label: "Per-tenant scoping at the application layer" },
      { label: "TCPA consent ledger + send-time canSend() gate" },
      { label: "AI run audit log (model, prompt hash, tokens, cost, output)" },
      { label: "Data Processing Agreement at /legal/dpa" },
    ],
  },
  {
    status: "in-progress",
    title: "In progress",
    items: [
      { label: "RLS as the primary security boundary (per-tenant JWT'd client)" },
      { label: "Per-tenant opt-in grant for founder support access" },
      { label: "SOC 2 Type II audit (target Q4 2026)" },
      { label: "Outbound auto-cadence behind the consent gate" },
    ],
  },
  {
    status: "roadmap",
    title: "Roadmap",
    items: [
      { label: "External penetration test (twice yearly)" },
      { label: "California CCPA portal" },
      { label: "ISO 27001" },
      { label: "Pesticide license verification (regulated chemicals engine)" },
    ],
  },
];

const LEGAL_DOCS: { label: string; href: string; note: string }[] = [
  {
    label: "Master Services Agreement (MSA)",
    href: "mailto:legal@gladiusturf.com?subject=MSA%20request",
    note: "PDF — request via email",
  },
  {
    label: "Data Processing Addendum (DPA)",
    href: "mailto:legal@gladiusturf.com?subject=DPA%20request",
    note: "PDF — request via email",
  },
  {
    label: "Privacy Policy",
    href: "/legal/privacy",
    note: "Public — gladiusturf.com/legal/privacy",
  },
  {
    label: "Terms of Service",
    href: "/legal/terms",
    note: "Public — gladiusturf.com/legal/terms",
  },
];

export default function SecurityPage() {
  return (
    <>
      <Nav />
      <main className="bg-obsidian">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[700px] bg-[radial-gradient(ellipse_at_top,rgba(127,226,122,0.10),transparent_60%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[600px] opacity-[0.08] [background-image:linear-gradient(to_right,rgba(245,241,232,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,241,232,0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-28 md:py-32">
            <Pill className="mb-8">
              <Shield className="h-3.5 w-3.5" aria-hidden /> Security
            </Pill>
            <h1 className="font-serif text-5xl tracking-[-0.02em] leading-[1.05] text-bone md:text-7xl">
              Built honestly.
              <br />
              Audit-ready in motion.
            </h1>
            <div className="mt-10 grid max-w-4xl gap-6 text-lg leading-relaxed text-bone/70 md:text-xl">
              <p>
                This page describes our security posture as it exists today,
                not as marketing aspires to it. Some controls are live, some
                are mid-migration, and a few are roadmap. We label them
                accordingly — every claim should hold up to a procurement
                review, a customer DPA addendum, or a 2 a.m. incident
                postmortem.
              </p>
              <p>
                Most landscape software ships security as a marketing
                surface — RLS-on-the-box, &ldquo;enterprise-grade,&rdquo;
                SOC&nbsp;2 banners that paper over the actual code. We&apos;re
                doing the opposite: shipping the architecture honestly, naming
                the gaps, and closing them in public on the changelog.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-6 border-t border-bone/10 pt-10 md:grid-cols-4">
              {[
                { value: "App-layer", label: "Tenant scoping (RLS landing)" },
                { value: "AI", label: "Audit log live" },
                { value: "TCPA", label: "Consent gate ready" },
                { value: "DPA", label: "Public at /legal/dpa" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-mono text-3xl text-champagne-bright md:text-4xl">
                    {s.value}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-bone/50">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRINCIPLES */}
        <section className="border-t border-bone/5 bg-slate-deep">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="max-w-3xl">
              <Eyebrow className="mb-6">Principles</Eyebrow>
              <h2 className="font-serif text-4xl tracking-[-0.01em] leading-[1.1] text-bone md:text-5xl">
                Five things that are non-negotiable.
              </h2>
            </div>

            <ol className="mt-20 flex flex-col gap-6">
              {PRINCIPLES.map((p, i) => {
                const numeralCls =
                  i === 0
                    ? "text-moss-bright/40"
                    : "text-champagne-bright/40";
                return (
                  <ScrollReveal key={p.headline} delay={i * 0.04}>
                    <li className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-8 md:p-10">
                      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-10">
                        <div
                          className={`font-mono text-6xl leading-none md:text-7xl ${numeralCls}`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="flex flex-col gap-4">
                          <h3 className="font-serif text-2xl tracking-[-0.01em] leading-[1.2] text-bone md:text-3xl">
                            {p.headline}
                          </h3>
                          <p className="text-base leading-relaxed text-bone/60 md:text-lg">
                            {p.body}
                          </p>
                        </div>
                      </div>
                    </li>
                  </ScrollReveal>
                );
              })}
            </ol>
          </div>
        </section>

        {/* AUTH */}
        <section className="border-t border-bone/5">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="max-w-3xl">
              <Eyebrow tone="champagne" className="mb-6">
                Auth
              </Eyebrow>
              <h2 className="font-serif text-4xl tracking-[-0.01em] leading-[1.1] text-bone md:text-5xl">
                Auth that an actual security team would approve.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-bone/60">
                We do not roll our own identity. We do not store password
                hashes. We rent the hard problem from the people who solve it
                full-time, and we audit them.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2">
              {AUTH_CARDS.map((c, i) => {
                const Icon = c.icon;
                const tone =
                  i === 0 ? "text-moss-bright" : "text-champagne-bright";
                return (
                  <div
                    key={c.headline}
                    className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-8"
                  >
                    <Icon className={`h-8 w-8 ${tone}`} aria-hidden />
                    <h3 className="mt-6 font-serif text-2xl tracking-[-0.01em] leading-[1.2] text-bone md:text-3xl">
                      {c.headline}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-bone/60">
                      {c.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* DATA ISOLATION */}
        <section className="border-t border-bone/5 bg-slate-deep">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="max-w-3xl">
              <Eyebrow className="mb-6">Isolation</Eyebrow>
              <h2 className="font-serif text-4xl tracking-[-0.01em] leading-[1.1] text-bone md:text-5xl">
                Two layers between any two crews&apos; data.
              </h2>
            </div>

            <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-20">
              <div className="flex flex-col gap-6 text-base leading-relaxed text-bone/65 md:text-lg">
                <p>
                  Every tenant-owned row in the database carries a{" "}
                  <code className="font-mono text-[13px] text-bone/85">tenant_id</code>{" "}
                  foreign key to{" "}
                  <code className="font-mono text-[13px] text-bone/85">tenants</code>.
                  The column is not nullable, the FK cascades on tenant
                  deletion, and the application layer fills it in from the
                  authenticated session — never from client-supplied input.
                </p>
                <ul className="flex flex-col gap-4 border-l border-champagne/30 pl-6">
                  <li>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-moss-bright">
                      Layer 1 — application (live)
                    </span>
                    <p className="mt-1">
                      Every server action and route handler under{" "}
                      <code className="font-mono text-[11px] text-bone/85">/app/(authed)</code>{" "}
                      reads the signed session cookie via{" "}
                      <code className="font-mono text-[11px] text-bone/85">readAppSession()</code>,
                      asserts <code className="font-mono text-[11px] text-bone/85">session.kind === &quot;tenant&quot;</code>,
                      and filters every query by{" "}
                      <code className="font-mono text-[11px] text-bone/85">tenant_id</code>.
                      This is the active boundary today.
                    </p>
                  </li>
                  <li>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-champagne-bright">
                      Layer 2 — database (in progress)
                    </span>
                    <p className="mt-1">
                      Row-Level Security policies are defined on every tenant
                      table — they will become the active second boundary
                      once we finish migrating server-side reads + writes from
                      the service-role client to a per-request JWT&apos;d
                      client. Until that lands, RLS is a defense-in-depth
                      backstop, not a primary boundary.
                    </p>
                  </li>
                  <li>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-champagne-bright">
                      Layer 3 — tests (roadmap)
                    </span>
                    <p className="mt-1">
                      A cross-tenant leak suite that spins up two synthetic
                      tenants and asserts neither can read the other&apos;s
                      rows on every release. Lands alongside the RLS
                      migration above.
                    </p>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-bone/10 bg-obsidian/60 p-8 md:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bone/50">
                  Request lifecycle
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  {/* Browser */}
                  <div className="rounded-xl border border-bone/10 bg-bone/[0.03] px-5 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/50">
                      Browser
                    </p>
                    <p className="mt-1 text-sm text-bone/80">
                      HMAC-signed session cookie · tenant_id = bright-lights
                    </p>
                  </div>
                  <div className="mx-auto h-6 w-px bg-bone/15" aria-hidden />

                  {/* App layer */}
                  <div className="rounded-xl border border-moss/30 bg-moss/[0.06] px-5 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-moss-bright">
                      Layer 1 — server action (live)
                    </p>
                    <p className="mt-1 text-sm text-bone/80">
                      readAppSession() · .eq(&quot;tenant_id&quot;, session.tenant.id)
                    </p>
                  </div>
                  <div className="mx-auto h-6 w-px bg-bone/15" aria-hidden />

                  {/* Postgres */}
                  <div className="rounded-xl border border-champagne/30 bg-champagne/[0.06] px-5 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne-bright">
                      Layer 2 — Postgres RLS (migrating)
                    </p>
                    <p className="mt-1 text-sm text-bone/80">
                      USING (is_tenant_member(tenant_id)) · activates once
                      reads move off service-role
                    </p>
                  </div>

                  {/* Tenants */}
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-moss-bright/30 bg-obsidian/40 p-5 text-center">
                      <Database
                        className="mx-auto h-6 w-6 text-moss-bright"
                        aria-hidden
                      />
                      <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-moss-bright">
                        Tenant A
                      </p>
                      <p className="mt-1 text-sm text-bone/70">Lighting shop</p>
                    </div>
                    <div className="rounded-xl border border-champagne-bright/30 bg-obsidian/40 p-5 text-center">
                      <Database
                        className="mx-auto h-6 w-6 text-champagne-bright"
                        aria-hidden
                      />
                      <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-champagne-bright">
                        Tenant B
                      </p>
                      <p className="mt-1 text-sm text-bone/70">Irrigation crew</p>
                    </div>
                  </div>
                  <p className="mt-6 text-center text-xs text-bone/40">
                    Two silos. No shared rows. Ever.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPLIANCE */}
        <section className="border-t border-bone/5">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="max-w-3xl">
              <Eyebrow tone="champagne" className="mb-6">
                Compliance
              </Eyebrow>
              <h2 className="font-serif text-4xl tracking-[-0.01em] leading-[1.1] text-bone md:text-5xl">
                Where we are. Where we&apos;re going.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-bone/60">
                Public roadmap. We update this page when an item ships, when an
                audit closes, when a date slips. No vapor.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {COMPLIANCE.map((col) => {
                const isDone = col.status === "done";
                const isInProgress = col.status === "in-progress";
                const Icon = isDone
                  ? CheckCircle2
                  : isInProgress
                    ? Clock
                    : AlertTriangle;
                const iconCls = isDone
                  ? "text-champagne-bright"
                  : isInProgress
                    ? "text-moss-bright"
                    : "text-bone/50";
                const labelCls = isDone
                  ? "text-champagne-bright"
                  : isInProgress
                    ? "text-moss-bright"
                    : "text-bone/50";
                return (
                  <div
                    key={col.title}
                    className="flex flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-8"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-6 w-6 ${iconCls}`} aria-hidden />
                      <p
                        className={`font-mono text-xs font-semibold uppercase tracking-[0.2em] ${labelCls}`}
                      >
                        {col.title}
                      </p>
                    </div>
                    <ul className="mt-8 flex flex-col gap-4">
                      {col.items.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-start gap-3 border-t border-bone/5 pt-4 first:border-0 first:pt-0"
                        >
                          <span
                            className={`mt-2 inline-block h-1.5 w-1.5 flex-none rounded-full ${
                              isDone
                                ? "bg-champagne-bright"
                                : isInProgress
                                  ? "bg-moss-bright"
                                  : "bg-bone/30"
                            }`}
                            aria-hidden
                          />
                          <p
                            className={`text-base leading-relaxed ${
                              isDone || isInProgress
                                ? "text-bone/75"
                                : "text-bone/55"
                            }`}
                          >
                            {item.label}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* DISCLOSURE */}
        <section className="border-t border-bone/5 bg-slate-deep">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="grid gap-16 md:grid-cols-2 md:gap-20">
              <div>
                <Eyebrow className="mb-6">Disclosure</Eyebrow>
                <h2 className="font-serif text-4xl tracking-[-0.01em] leading-[1.1] text-bone md:text-5xl">
                  We pay for security research.
                </h2>
                <div className="mt-10 flex flex-col gap-6 text-base leading-relaxed text-bone/65 md:text-lg">
                  <p>
                    If you&apos;ve found a vulnerability — anything from a
                    cross-tenant leak to an authentication bypass to a TCPA
                    consent loophole — please report it. We will not sue you,
                    we will not threaten you, we will thank you, and if the
                    finding holds up we will pay you.
                  </p>
                  <p>
                    Our SLA: initial response in 24 hours, triage decision in
                    72 hours, fix or mitigation timeline communicated within
                    seven days. Critical findings get a same-day patch and a
                    public post-mortem when the dust settles.
                  </p>
                  <p>
                    A formal bug bounty program is in active development with a
                    third-party platform. Until it&apos;s live, contact us
                    directly and we&apos;ll handle reward and disclosure
                    one-on-one.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-champagne/30 bg-champagne/[0.05] p-8 md:p-10 shadow-pop-champagne">
                <Lock className="h-7 w-7 text-champagne-bright" aria-hidden />
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-bone/50">
                  Security inbox
                </p>
                <a
                  href="mailto:security@gladiusturf.com"
                  className="mt-3 block break-all font-mono text-2xl text-champagne-bright transition-colors hover:text-bone md:text-3xl"
                >
                  security@gladiusturf.com
                </a>

                <div className="mt-10 border-t border-bone/10 pt-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bone/50">
                    PGP key
                  </p>
                  <p className="mt-3 font-mono text-base text-bone/80">
                    4096R / AB12 CD34
                  </p>
                  <p className="mt-2 text-sm text-bone/55">
                    Full key on request — reply to the address above and
                    we&apos;ll send the armored block.
                  </p>
                </div>

                <div className="mt-10 border-t border-bone/10 pt-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bone/50">
                    Response SLA
                  </p>
                  <ul className="mt-3 flex flex-col gap-2 text-sm text-bone/70">
                    <li>
                      <span className="font-mono text-champagne-bright">24h</span>{" "}
                      — initial human response
                    </li>
                    <li>
                      <span className="font-mono text-champagne-bright">72h</span>{" "}
                      — triage decision
                    </li>
                    <li>
                      <span className="font-mono text-champagne-bright">7d</span>{" "}
                      — remediation timeline
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LEGAL */}
        <section className="border-t border-bone/5">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="max-w-3xl">
              <Eyebrow tone="champagne" className="mb-6">
                Legal
              </Eyebrow>
              <h2 className="font-serif text-4xl tracking-[-0.01em] leading-[1.1] text-bone md:text-5xl">
                DPAs and MSAs available.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-bone/60">
                Procurement-friendly. We don&apos;t hide the contracts behind a
                sales conversation.
              </p>
            </div>

            <ul className="mt-16 flex flex-col rounded-2xl border border-bone/10 bg-bone/[0.02]">
              {LEGAL_DOCS.map((doc, i) => (
                <li
                  key={doc.label}
                  className={`flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between md:gap-8 md:p-8 ${
                    i === 0 ? "" : "border-t border-bone/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <FileText
                      className={`h-6 w-6 flex-none ${
                        i === 0 ? "text-moss-bright" : "text-champagne-bright"
                      }`}
                      aria-hidden
                    />
                    <div>
                      <p className="font-serif text-xl text-bone md:text-2xl">
                        {doc.label}
                      </p>
                      <p className="mt-1 text-sm text-bone/50">{doc.note}</p>
                    </div>
                  </div>
                  <a
                    href={doc.href}
                    className="inline-flex items-center gap-2 rounded-full border border-champagne-bright/40 px-5 py-2.5 text-sm font-semibold text-champagne-bright transition-all hover:border-champagne-bright hover:bg-champagne/10"
                  >
                    Request →
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-bone/50">
              All available pre-purchase. Email{" "}
              <a
                href="mailto:legal@gladiusturf.com"
                className="text-champagne-bright transition-colors hover:text-bone"
              >
                legal@gladiusturf.com
              </a>{" "}
              to receive.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
