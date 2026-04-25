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
    "Postgres RLS, Clerk multi-tenant auth, Stripe-managed PCI, TCPA compliance built in, SOC 2 Type II in progress.",
};

const PRINCIPLES: { headline: string; body: string }[] = [
  {
    headline: "Your data is yours.",
    body: "Exportable to CSV any day, by any admin. No data hostage. We will help you migrate OUT if you ever leave — full schema dumps, every table, every record, your format. The day you sign is the day we start earning the right to keep you, and a contract is not a substitute for a product worth keeping.",
  },
  {
    headline: "Multi-tenant means truly multi-tenant.",
    body: "Every record carries a companyId. Postgres Row-Level Security policies enforce isolation at the database layer. tRPC middleware enforces it again at the API layer. Two-layer defense, audited on every release. No tenant has ever seen another tenant's data, and that is a guarantee we engineer for, not a marketing line.",
  },
  {
    headline: "No card data on our servers.",
    body: "Stripe handles all card data. We never see, store, or transmit a primary account number. PCI scope = zero. When a customer pays an invoice through the Client Portal, the card never touches our infrastructure — it travels directly from the browser to Stripe's tokenization endpoint.",
  },
  {
    headline: "TCPA compliance is built in, not bolted on.",
    body: "Every outbound SMS checks consent, state-specific rules, and DNC lists before sending. Quiet-hours logic per state. Stop-keyword honored within 30 seconds. Audit log on every send, exportable. We learned this discipline in the regulated automotive market — class-action exposure starts at $500 per text, and we will not be the reason your shop is named in a complaint.",
  },
  {
    headline: "Audit log everything.",
    body: "Every change to a customer record, property memory, payment, or quote is logged with who, what, when, and why. Append-only. Tamper-evident. Exportable to your own SIEM. If a foreman edits a recurring price on a route, the trail starts in your audit log and ends in your inbox if your policy says it should.",
  },
];

const AUTH_CARDS: { icon: React.ComponentType<{ className?: string }>; headline: string; body: string }[] = [
  {
    icon: Shield,
    headline: "Clerk-managed",
    body: "SOC 2 Type II certified identity provider. Magic-link login, SSO via SAML, MFA on Pro and above. Session lifecycle, password rotation, and breach-list checks handled by a vendor whose entire product is identity.",
  },
  {
    icon: Key,
    headline: "Role-based access control",
    body: "Six roles ship out of the box: Admin, Crew Chief, Field Tech, Finance, Customer, Read-Only. Granular permissions per role — Finance can void an invoice, Field Tech cannot. Custom roles available on Enterprise.",
  },
  {
    icon: Lock,
    headline: "Session security",
    body: "JWTs with rotating signing keys (90-day rotation). HttpOnly + Secure cookies, SameSite=Lax. CSRF tokens on every state-changing request. Sessions invalidated server-side on password change or admin revoke.",
  },
  {
    icon: Eye,
    headline: "Customer access",
    body: "Magic-link only on the Client Portal. No passwords for end customers — phishing surface eliminated. 30-day session, revocable any time by the crew owner. One-tap log-out clears every device.",
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
      { label: "PCI compliance via Stripe" },
      { label: "TCPA compliance for SMS and voice" },
      { label: "GDPR data-export endpoint" },
      { label: "Multi-tenant Postgres RLS" },
      { label: "Encrypted at rest (AES-256) + in transit (TLS 1.3)" },
    ],
  },
  {
    status: "in-progress",
    title: "In progress",
    items: [
      { label: "SOC 2 Type II audit (Q3 2026)" },
      { label: "HIPAA-readiness for crews servicing hospitals and care facilities" },
      { label: "State pesticide license API integration — auto-verify before dispatch" },
    ],
  },
  {
    status: "roadmap",
    title: "Roadmap",
    items: [
      { label: "ISO 27001 (Q1 2027)" },
      { label: "California CCPA portal" },
      { label: "Penetration test schedule (twice yearly, by an external firm)" },
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
              Multi-tenant by design.
              <br />
              Audit-ready by default.
            </h1>
            <div className="mt-10 grid max-w-4xl gap-6 text-lg leading-relaxed text-bone/70 md:text-xl">
              <p>
                We&apos;re built on the same security foundation as Gladius CRM
                (which serves regulated automotive dealers) and Gladius BDC
                (which handles TCPA-regulated outbound voice). The same
                Postgres RLS policies, the same Clerk-managed auth stack, the
                same audit-log infrastructure that survives quarterly review by
                automotive group risk officers.
              </p>
              <p>
                Most landscape software treats security as an afterthought —
                bolted on after a customer asks, retrofitted after a leak,
                described in marketing copy that doesn&apos;t survive
                contact with a procurement reviewer. We built the foundation
                first, because we serve regulated industries first, and the
                landscape product inherited the discipline.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-6 border-t border-bone/10 pt-10 md:grid-cols-4">
              {[
                { value: "100%", label: "RLS coverage" },
                { value: "0", label: "Cross-tenant leaks" },
                { value: "90-day", label: "Rotating keys" },
                { value: "Every", label: "Action audit-logged" },
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
                  Every row in our database carries a companyId. That field is
                  not optional, not nullable, not editable by application code.
                  It is set once at row-creation time inside a transactional
                  hook and never moves.
                </p>
                <ul className="flex flex-col gap-4 border-l border-champagne/30 pl-6">
                  <li>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-moss-bright">
                      Layer 1 — database
                    </span>
                    <p className="mt-1">
                      Postgres Row-Level Security policies on every tenant
                      table. The current companyId is set per-request from the
                      authenticated session — queries cannot read or write rows
                      they don&apos;t own, even if application code tries.
                    </p>
                  </li>
                  <li>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-champagne-bright">
                      Layer 2 — API
                    </span>
                    <p className="mt-1">
                      tRPC middleware re-checks the companyId on every
                      procedure. Defense in depth: even if a future RLS policy
                      regresses, the API layer catches it before a response
                      leaves the server.
                    </p>
                  </li>
                  <li>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-champagne-bright">
                      Layer 3 — tests
                    </span>
                    <p className="mt-1">
                      Every release runs a cross-tenant leak suite that spins
                      up two synthetic companies and asserts neither can see
                      the other&apos;s rows through any code path. The build
                      fails if it does.
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
                      Authenticated session · companyId = ACME
                    </p>
                  </div>
                  <div className="mx-auto h-6 w-px bg-bone/15" aria-hidden />

                  {/* tRPC */}
                  <div className="rounded-xl border border-champagne/30 bg-champagne/[0.06] px-5 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne-bright">
                      Layer 2 — tRPC middleware
                    </p>
                    <p className="mt-1 text-sm text-bone/80">
                      Asserts session.companyId === input.companyId. Reject
                      otherwise.
                    </p>
                  </div>
                  <div className="mx-auto h-6 w-px bg-bone/15" aria-hidden />

                  {/* Postgres */}
                  <div className="rounded-xl border border-moss/30 bg-moss/[0.06] px-5 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-moss-bright">
                      Layer 1 — Postgres RLS
                    </p>
                    <p className="mt-1 text-sm text-bone/80">
                      USING (company_id = current_setting(&apos;app.company_id&apos;))
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
                      <p className="mt-1 text-sm text-bone/70">ACME crew</p>
                    </div>
                    <div className="rounded-xl border border-champagne-bright/30 bg-obsidian/40 p-5 text-center">
                      <Database
                        className="mx-auto h-6 w-6 text-champagne-bright"
                        aria-hidden
                      />
                      <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-champagne-bright">
                        Tenant B
                      </p>
                      <p className="mt-1 text-sm text-bone/70">Banner Lawn</p>
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
