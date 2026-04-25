import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  Database,
  FileSignature,
  Gift,
  Globe,
  Mail,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { CtaButton } from "@/components/cta-button";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TopographicBg } from "@/components/topographic-bg";

export const metadata: Metadata = {
  title: "Client Portal — Your customers stop calling.",
  description:
    "White-labeled portal where homeowners reschedule, book, pay, approve, and refer — without your office staff.",
  alternates: { canonical: "/portal" },
  openGraph: {
    title: "Client Portal — Your customers stop calling.",
    description:
      "White-labeled portal where homeowners reschedule, book, pay, approve, and refer — without your office staff.",
    type: "article",
    images: [{ url: "/crest.png", width: 600, height: 800 }],
  },
  twitter: {
    images: ["/crest.png"],
  },
};

const DEMO_HREF = "/portal/demo/sample-token-2026";

type Accent = "moss" | "honey" | "champagne";

type Capability = {
  eyebrow: string;
  icon: React.ReactNode;
  headline: string;
  body: string;
  bullets: string[];
  proof: string;
  flip?: boolean;
  bg?: "deep" | "mid";
  accent?: Accent;
  visual: "scheduling" | "payment" | "approval" | "history" | "referral";
};

const CAPABILITIES: Capability[] = [
  {
    eyebrow: "Self-serve scheduling",
    icon: <CalendarCheck className="h-3 w-3" />,
    headline: "Customers book the visits your office used to negotiate.",
    body: "The portal pulls live availability from the Field Crew App and filters it through Weather Pivot. The customer sees only the windows you can actually deliver — no double-bookings, no rain calls, no \"let me check with dispatch\" friction. Confirms by SMS in under 3 seconds.",
    bullets: [
      "Live crew availability — open windows only, no overbooking",
      "Weather Pivot filters out chemical-application risk days automatically",
      "Confirm-by-SMS lands in under 3 seconds, with calendar invite attached",
      "Crew's job board updates in real time — dispatcher never re-keys",
    ],
    proof: "73% fewer 'when are you coming?' calls in the first 60 days.",
    bg: "mid",
    accent: "champagne",
    visual: "scheduling",
  },
  {
    eyebrow: "One-tap payment",
    icon: <CreditCard className="h-3 w-3" />,
    headline: "The invoice gets paid before your office staff knows it landed.",
    body: "Stripe Connect under the hood. Card or ACH. Auto-receipt to the homeowner. Failed-payment retry runs three times across two card networks before any human touches it. If it still fails, the Cadence engine warms the customer over Day 3 / 7 / 14 — your team only steps in after the AI has already tried four times.",
    bullets: [
      "Stripe Connect — card, ACH, Apple Pay, Google Pay",
      "Auto-receipts emailed; PDF + line-item breakdown attached",
      "Failed-payment retry runs three times before any human escalation",
      "Late-pay nudges fire from Cadence — Day 3 / 7 / 14 then handoff",
    ],
    proof: "$12,800/mo recovered in late invoices on the average crew.",
    flip: true,
    bg: "deep",
    accent: "moss",
    visual: "payment",
  },
  {
    eyebrow: "Approve change orders",
    icon: <FileSignature className="h-3 w-3" />,
    headline: "Mid-job scope changes get approved in the time it takes to refill a coffee.",
    body: "Crew chief discovers the irrigation has to be moved. Snaps a photo. The portal sends the homeowner a one-card approval — \"Add $340 to move zone 4. Tap to approve.\" Customer signs once on glass, signature is timestamped + GPS-stamped, and the change order is logged with full audit trail. No paperwork. No callback game.",
    bullets: [
      "One-card approval — photo + price + scope on a single screen",
      "Single-tap signature, timestamped + GPS-anchored",
      "Audit log captures every approval, edit, and revocation",
      "Triggers a Stripe authorization hold the moment it's signed",
    ],
    proof: "Mid-job scope changes approved in under 9 minutes on average.",
    bg: "mid",
    accent: "champagne",
    visual: "approval",
  },
  {
    eyebrow: "View job history",
    icon: <Database className="h-3 w-3" />,
    headline: "Every visit, every photo, every invoice — for as long as the customer is yours.",
    body: "Photos auto-uploaded by the crew. Invoices, paid receipts, signed approvals, service notes — all searchable, exportable, and date-filterable. When a customer sells the house, they export their full grounds-care history as a PDF. When a new homeowner moves in, you've already got the irrigation map.",
    bullets: [
      "Searchable across visits, services, dates, and crew chiefs",
      "Photo galleries auto-EXIF-tagged with GPS + timestamps",
      "Exportable PDF — handy when the property changes hands",
      "Backed by the Site Memory engine — every detail survives turnover",
    ],
    proof: "100% of customer history, 24/7 self-serve, zero phone calls.",
    flip: true,
    bg: "deep",
    accent: "moss",
    visual: "history",
  },
  {
    eyebrow: "Refer + earn credits",
    icon: <Gift className="h-3 w-3" />,
    headline: "Your happiest customers become your sales team.",
    body: "The portal generates a per-customer share link. Neighbor clicks, books a quote, becomes a customer — and account credit lands on both sides automatically. Feeds the Referral Radar engine, which scores which neighborhoods produce real referrals and which reps are quietly killing them.",
    bullets: [
      "Per-customer share link — no codes, no forms, no friction",
      "Both parties credited automatically when the neighbor books",
      "Feeds Referral Radar to score neighborhoods + reps",
      "Anti-abuse rules: same-household and self-referral blocked",
    ],
    proof: "$180,000/yr in referral revenue most crews don't know they're losing.",
    bg: "mid",
    accent: "champagne",
    visual: "referral",
  },
];

type EnginePill = { slug: string; name: string };

const FEEDING_ENGINES: EnginePill[] = [
  { slug: "cadence", name: "Cadence" },
  { slug: "site-memory", name: "Site Memory" },
  { slug: "weather-pivot", name: "Weather Pivot" },
  { slug: "showrate-max", name: "ShowRate Max" },
  { slug: "quality-radar", name: "Quality Radar" },
  { slug: "knowledge-codex", name: "Knowledge Codex" },
  { slug: "referral-radar", name: "Referral Radar" },
  { slug: "field-crew-app", name: "Field Crew App" },
  { slug: "intent-scorer", name: "Intent Scorer" },
  { slug: "winmemory", name: "WinMemory" },
  { slug: "upsell-whisperer", name: "Upsell Whisperer" },
  { slug: "ghost-recovery", name: "Ghost Recovery" },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "How do customers log in?",
    a: "Magic link only. No passwords. Customer taps the link in their welcome email or SMS, and the portal opens — authenticated, on any device. No app store. No support tickets. Magic links rotate every 30 days for security.",
  },
  {
    q: "Can customers pay if there's no Wi-Fi?",
    a: "Yes. The portal is a mobile-first PWA that works on cellular — including a $40 prepaid plan in a basement. Payments queue and confirm the moment signal returns; receipts deliver via SMS even if the email server is unreachable.",
  },
  {
    q: "What happens if a customer doesn't pay?",
    a: "The FollowUp engine warms the customer over Day 3 / 7 / 14 with messages that read different for the busy contractor vs the first-timer — the system knows the difference. Only after three soft touches does a human get a queued callback with the full thread + Site Memory context already pulled up.",
  },
  {
    q: "Can I disable certain features per customer?",
    a: "Yes. Per-customer feature flags. Premium accounts can have payment + approvals + referrals; volume accounts can keep just scheduling. Toggle from the admin panel; the portal re-renders the homeowner's view in real time.",
  },
  {
    q: "Does the portal show my pricing publicly?",
    a: "No. Each customer authenticates against their own record and only sees their own quotes, invoices, history, and referral credits. There is no public price list, no shared catalog, no leakage to competitors who might create a fake account.",
  },
  {
    q: "Can I have customers e-sign contracts here?",
    a: "Yes. Signature capture lives on every approval card and every annual-service contract. Signatures are timestamped, IP-stamped, GPS-stamped, and stored in an immutable audit log — admissible by every state bar we've checked with.",
  },
];

export default function PortalMarketingPage() {
  return (
    <>
      <Nav />
      <main>
        {/* a. Hero */}
        <section className="relative overflow-hidden bg-pitch pb-24 pt-16 md:pb-32 md:pt-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] bg-[radial-gradient(ellipse_at_top,rgba(201,168,122,0.18),transparent_60%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[200px] -z-10 h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(127,226,122,0.06),transparent_65%)]"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <TopographicBg />
          </div>

          <div className="relative mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-4xl text-center">
              <ScrollReveal>
                <div className="mb-7 flex items-center justify-center">
                  <Pill tone="champagne">
                    <Sparkles className="h-3 w-3" />
                    Client Portal · Engine 09
                  </Pill>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.05}>
                <h1 className="font-serif text-5xl font-semibold leading-[1.05] tracking-[-0.02em] text-bone md:text-7xl">
                  Your phone stops ringing.
                  <br />
                  Your office stops{" "}
                  <span className="text-moss-bright">drowning</span>.
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <p className="mx-auto mt-8 max-w-2xl text-lg text-bone/70 md:text-xl">
                  The average landscape office answers 14–22 &quot;when are you
                  coming?&quot; calls a day, sends 30+ reschedule emails a week,
                  and chases invoices the third Friday of every month with a
                  spreadsheet that forgets a few. Every single one of those
                  hours is unbillable.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <p className="mx-auto mt-5 max-w-2xl text-base text-bone/60">
                  The Client Portal kills all of it. White-labeled, your domain,
                  your brand. Customers reschedule, book, pay, approve, and
                  refer themselves — and every action lands in your dispatch
                  board the instant it happens. The phone goes quiet. The
                  receivables come in early.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                  <CtaButton href="/demo" variant="primary" size="md">
                    Book a demo
                  </CtaButton>
                  <CtaButton
                    href={DEMO_HREF}
                    variant="ghost-champagne"
                    withArrow
                  >
                    Try the live preview
                  </CtaButton>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.4}>
                <p className="mt-10 text-xs text-bone/50">
                  <span className="font-medium text-bone/70">
                    Magic-link login
                  </span>
                  <span className="mx-2 text-bone/30">·</span>
                  Mobile-first PWA
                  <span className="mx-2 text-bone/30">·</span>
                  Stripe Connect
                  <span className="mx-2 text-bone/30">·</span>
                  GDPR + CCPA-aware
                  <span className="mx-2 text-bone/30">·</span>
                  Deploys in 7 days
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* b. Live preview band */}
        <section className="relative overflow-hidden border-y border-bone/10 bg-slate-deep py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[400px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(201,168,122,0.12),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <ScrollReveal>
              <Eyebrow tone="champagne">Live preview</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                Click the button. See what your{" "}
                <span className="text-champagne-bright">customer</span> sees.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="mx-auto mt-5 max-w-xl text-lg text-bone/65">
                A real, interactive sandbox. Reschedule a visit, pay an
                invoice, copy a referral link. Every click is wired to working
                UI — no salesperson required.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <div className="mt-10">
                <Link
                  href={DEMO_HREF}
                  className="group inline-flex items-center gap-3 rounded-full bg-champagne-bright px-10 py-5 text-lg font-semibold text-pitch shadow-pop-champagne transition-all hover:bg-champagne hover:shadow-pop-champagne md:text-xl"
                >
                  <PlayCircle className="h-6 w-6" />
                  Try the live customer preview
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p className="mt-5 text-xs text-bone/45">
                No login required. No data captured. It&apos;s a sandbox.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* c. Capabilities — 5 alternating sections */}
        {CAPABILITIES.map((cap, idx) => (
          <CapabilitySection key={cap.eyebrow} cap={cap} index={idx} />
        ))}

        {/* d. White-label */}
        <section className="border-t border-bone/10 bg-obsidian py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center">
                <Eyebrow tone="champagne">White-label</Eyebrow>
                <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Your logo. Your colors.
                  <br />
                  <span className="text-champagne-bright">Your domain.</span>
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg text-bone/65">
                  Customers never see GladiusTurf. They see your brand —
                  on your subdomain, with your logo and your sender names —
                  every time they reschedule, pay, or approve.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mt-14 grid gap-6 md:grid-cols-3">
                <WhiteLabelCard
                  icon={<Sparkles className="h-5 w-5" />}
                  title="Logo + brand kit"
                  body="Drop your logo, primary + accent colors, and serif/sans pairings. The portal adopts the kit instantly across every screen, every email, every SMS."
                />
                <WhiteLabelCard
                  icon={<Globe className="h-5 w-5" />}
                  title="Custom subdomain"
                  body="portal.[yourcompany].com runs on our infrastructure but speaks your DNS. SSL provisioned automatically. SPF/DKIM aligned to your domain."
                />
                <WhiteLabelCard
                  icon={<Mail className="h-5 w-5" />}
                  title="Email + SMS sender"
                  body="Receipts, magic-links, reminders, and reschedule confirmations all send from your business name and number — never from GladiusTurf."
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="mt-16 grid gap-6 lg:grid-cols-2">
                <BeforeMock />
                <AfterMock />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* e. Engines that power it */}
        <section className="border-t border-bone/10 bg-slate-deep py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center">
                <Eyebrow>Engines that power it</Eyebrow>
                <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Twelve engines feed the portal
                  <br />
                  <span className="text-champagne-bright">in real time.</span>
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg text-bone/65">
                  The portal isn&apos;t a separate product — it&apos;s the
                  visible surface of the system below. Every customer-facing
                  pixel pulls live data from the engines below.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mt-12 flex flex-wrap justify-center gap-3">
                {FEEDING_ENGINES.map((e, i) => (
                  <Link
                    key={e.slug}
                    href={`/product#${e.slug}`}
                    className={
                      i % 2 === 0
                        ? "inline-flex items-center gap-2 rounded-full border border-champagne/30 bg-champagne/5 px-4 py-2 text-sm font-medium text-champagne-bright transition-all hover:border-champagne-bright hover:bg-champagne/10"
                        : "inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/5 px-4 py-2 text-sm font-medium text-moss-bright transition-all hover:border-moss-bright hover:bg-moss/10"
                    }
                  >
                    {e.name}
                  </Link>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-bone/50">
                See all 33 engines on the{" "}
                <Link
                  href="/product"
                  className="text-champagne-bright underline-offset-4 hover:underline"
                >
                  product page
                </Link>
                .
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* f. FAQ */}
        <section className="border-t border-bone/10 bg-obsidian py-28">
          <div className="mx-auto max-w-3xl px-6">
            <ScrollReveal>
              <div className="text-center">
                <Eyebrow tone="champagne">Frequently asked</Eyebrow>
                <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Everything your office is wondering.
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mt-12 divide-y divide-bone/10 rounded-2xl border border-bone/10 bg-bone/[0.02]">
                {FAQ.map((item, i) => (
                  <details
                    key={item.q}
                    className="group px-5 py-5 md:px-7"
                    open={i === 0}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-bone marker:hidden md:text-lg">
                      <span className="font-serif tracking-[-0.01em]">
                        {item.q}
                      </span>
                      <span
                        aria-hidden
                        className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-bone/15 text-bone/60 transition-transform group-open:rotate-45 group-open:border-champagne-bright/40 group-open:text-champagne-bright"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 max-w-prose text-[15px] leading-[1.6] text-bone/70">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* g. CTA */}
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}

function CapabilitySection({
  cap,
  index,
}: {
  cap: Capability;
  index: number;
}) {
  const accent: Accent =
    cap.accent ?? (index % 2 === 0 ? "champagne" : "moss");
  const accentText =
    accent === "honey"
      ? "text-honey-bright"
      : accent === "moss"
        ? "text-moss-bright"
        : "text-champagne-bright";
  const accentBullet =
    accent === "honey"
      ? "bg-honey-bright"
      : accent === "moss"
        ? "bg-moss-bright"
        : "bg-champagne-bright";
  const altBullet = accent === "moss" ? "bg-champagne-bright" : "bg-moss-bright";
  const bgCls = cap.bg === "deep" ? "bg-obsidian" : "bg-slate-deep";

  return (
    <section
      className={`border-t border-bone/10 ${bgCls} py-24 md:py-28`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <ScrollReveal className={cap.flip ? "md:order-2" : undefined}>
            <div>
              <Pill className="mb-4" tone={accent}>
                {cap.icon}
                {cap.eyebrow}
              </Pill>
              <h3 className="font-serif text-3xl font-semibold tracking-[-0.01em] text-bone md:text-[40px] md:leading-[1.1]">
                {cap.headline}
              </h3>
              <p className="mt-5 text-lg text-bone/70">{cap.body}</p>
              <ul className="mt-6 space-y-3 text-[15px] text-bone/85">
                {cap.bullets.map((b, i) => (
                  <li key={b} className="flex items-start gap-3">
                    <span
                      className={`mt-2 h-1.5 w-1.5 flex-none rounded-full ${
                        i % 2 === 0 ? accentBullet : altBullet
                      }`}
                    />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-bone/10 bg-bone/[0.04] px-4 py-1.5 text-xs">
                <CheckCircle2 className={`h-3.5 w-3.5 ${accentText}`} />
                <span className={`font-semibold ${accentText}`}>
                  {cap.proof}
                </span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal
            delay={0.1}
            className={cap.flip ? "md:order-1" : undefined}
          >
            <CapabilityVisual kind={cap.visual} accent={accent} />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function CapabilityVisual({
  kind,
  accent,
}: {
  kind: Capability["visual"];
  accent: Accent;
}) {
  const grad =
    accent === "honey"
      ? "from-honey/10 via-bone/[0.02] to-transparent"
      : accent === "moss"
        ? "from-moss/10 via-bone/[0.02] to-transparent"
        : "from-champagne/10 via-bone/[0.02] to-transparent";
  const wrapper =
    "aspect-[4/3] overflow-hidden rounded-2xl border border-bone/10 bg-gradient-to-br p-1 " +
    grad;
  const inner =
    "flex h-full w-full flex-col gap-4 rounded-xl bg-obsidian p-5 text-left";

  if (kind === "scheduling") {
    const slots = [
      { day: "Tue · May 5", window: "1–3 PM", state: "open" },
      { day: "Thu · May 7", window: "9–11 AM", state: "selected" },
      { day: "Fri · May 8", window: "Weather hold", state: "blocked" },
    ];
    return (
      <div className={wrapper}>
        <div className={inner}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-serif text-sm font-semibold text-moss-bright">
              Pick a new visit window
            </span>
            <span className="rounded-full bg-moss/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-moss-bright">
              Live
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {slots.map((s) => (
              <li
                key={s.day}
                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-[12px] ${
                  s.state === "selected"
                    ? "border-moss-bright/50 bg-moss/15 text-bone"
                    : s.state === "blocked"
                      ? "border-bone/10 bg-bone/[0.02] text-bone/40 line-through"
                      : "border-bone/10 bg-bone/[0.04] text-bone/85"
                }`}
              >
                <span className="font-medium">{s.day}</span>
                <span className="font-mono text-[11px]">{s.window}</span>
                {s.state === "selected" && (
                  <CheckCircle2 className="h-4 w-4 text-moss-bright" />
                )}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center justify-between border-t border-bone/10 pt-3 text-[10px] text-bone/50">
            <span>Confirms by SMS · 3 sec</span>
            <span className="text-moss-bright">73% fewer status calls</span>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "payment") {
    return (
      <div className={wrapper}>
        <div className={inner}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-serif text-sm font-semibold text-honey-bright">
              Invoice #2118 · Spring Cleanup
            </span>
            <span className="rounded-full bg-honey/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-honey-bright">
              Open
            </span>
          </div>
          <div className="rounded-lg border border-bone/10 bg-bone/[0.04] p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-bone/55">Due May 15</span>
              <span className="font-serif text-2xl font-semibold text-bone">
                $487.50
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-md border border-bone/10 bg-slate-deep/60 px-2.5 py-2 text-[11px] text-bone/85">
              <CreditCard className="h-3.5 w-3.5 text-honey-bright" />
              4242 4242 4242 4242
              <span className="ml-auto font-mono text-[10px] text-bone/55">
                04 / 28
              </span>
            </div>
          </div>
          <button
            type="button"
            className="rounded-full bg-honey-bright px-3 py-2 text-center text-[12px] font-semibold text-forest-deep"
          >
            Pay $487.50
          </button>
          <div className="mt-auto flex items-center justify-between border-t border-bone/10 pt-3 text-[10px] text-bone/50">
            <span>Stripe · ACH · Apple Pay</span>
            <span className="text-honey-bright">$12,800/mo recovered</span>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "approval") {
    return (
      <div className={wrapper}>
        <div className={inner}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-serif text-sm font-semibold text-moss-bright">
              Change order · Zone 4 irrigation
            </span>
            <span className="rounded-full bg-moss/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-moss-bright">
              Awaiting approval
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                aria-hidden
                className="aspect-square rounded-md bg-gradient-to-br from-moss/15 to-bone/5"
              />
            ))}
          </div>
          <div className="rounded-lg border border-bone/10 bg-bone/[0.04] p-3 text-[12px] text-bone/85">
            <div className="font-medium text-bone">
              Move zone 4 head 8 ft east of new patio
            </div>
            <div className="mt-1 text-bone/55">
              + $340.00 · 45 min crew time · same visit
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-full bg-moss-bright px-3 py-2 text-center text-[12px] font-semibold text-forest-deep"
            >
              Approve
            </button>
            <button
              type="button"
              className="flex-1 rounded-full border border-bone/15 px-3 py-2 text-center text-[12px] font-medium text-bone/70"
            >
              Decline
            </button>
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-bone/10 pt-3 text-[10px] text-bone/50">
            <span>Signed + GPS-stamped</span>
            <span className="text-moss-bright">9-min avg approval</span>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "history") {
    const rows = [
      { date: "Apr 28", svc: "Spring Cleanup", price: "$487.50" },
      { date: "Apr 22", svc: "Hardscape touchup", price: "$215.00" },
      { date: "Apr 15", svc: "Bi-weekly mowing", price: "$72.00" },
      { date: "Apr 03", svc: "Bi-weekly mowing", price: "$72.00" },
    ];
    return (
      <div className={wrapper}>
        <div className={inner}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-serif text-sm font-semibold text-honey-bright">
              Sarah&apos;s service history
            </span>
            <span className="rounded-full bg-honey/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-honey-bright">
              42 entries
            </span>
          </div>
          <table className="w-full table-fixed text-[11px]">
            <thead>
              <tr className="text-left text-[9px] font-semibold uppercase tracking-[0.16em] text-bone/40">
                <th className="pb-2">Date</th>
                <th className="pb-2">Service</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.date} className="border-t border-bone/5">
                  <td className="py-2 pr-2 text-bone/60">{r.date}</td>
                  <td className="py-2 pr-2 text-bone/85">{r.svc}</td>
                  <td className="py-2 text-right font-mono text-bone/80">
                    {r.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            className="mt-1 rounded-full border border-bone/15 px-3 py-1.5 text-center text-[11px] font-medium text-bone/80"
          >
            Export PDF · last 12 months
          </button>
          <div className="mt-auto flex items-center justify-between border-t border-bone/10 pt-3 text-[10px] text-bone/50">
            <span>Searchable · exportable</span>
            <span className="text-honey-bright">24/7 self-serve</span>
          </div>
        </div>
      </div>
    );
  }

  // referral
  return (
    <div className={wrapper}>
      <div className={inner}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-serif text-sm font-semibold text-moss-bright">
            Refer a neighbor → both earn $50
          </span>
          <span className="rounded-full bg-moss/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-moss-bright">
            Active
          </span>
        </div>
        <div className="rounded-lg border border-bone/10 bg-bone/[0.04] p-3 text-[12px] text-bone/85">
          <div className="text-[10px] text-bone/55">Your share link</div>
          <div className="mt-1 truncate font-mono text-[11px] text-moss-bright">
            portal.greenleaf-crew.com/r/sarah-m-2026
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-bone/10 bg-bone/[0.03] p-3">
            <div className="text-[9px] uppercase tracking-[0.2em] text-bone/45">
              Earned
            </div>
            <div className="mt-1 font-serif text-xl text-bone">$50</div>
          </div>
          <div className="rounded-lg border border-bone/10 bg-bone/[0.03] p-3">
            <div className="text-[9px] uppercase tracking-[0.2em] text-bone/45">
              Pending
            </div>
            <div className="mt-1 font-serif text-xl text-bone">$50</div>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-bone/10 pt-3 text-[10px] text-bone/50">
          <span>Anti-abuse · auto-tracked</span>
          <span className="text-moss-bright">$180K/yr recovered</span>
        </div>
      </div>
    </div>
  );
}

function WhiteLabelCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-champagne/20 bg-bone/[0.02] p-6">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-champagne/10 text-champagne-bright">
        {icon}
      </span>
      <h3 className="mt-4 font-serif text-lg font-semibold text-bone">
        {title}
      </h3>
      <p className="mt-2 text-[14px] leading-[1.6] text-bone/65">{body}</p>
    </div>
  );
}

function BeforeMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-bone/10 bg-bone/[0.03]">
      <div className="flex items-center justify-between border-b border-bone/10 px-5 py-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/45">
          Before · generic Aspire/Jobber portal
        </span>
        <span className="rounded-full bg-bone/10 px-2 py-0.5 text-[9px] font-medium text-bone/55">
          Their brand
        </span>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-bone/10 font-mono text-[10px] text-bone/55">
            J
          </span>
          <span className="font-serif text-[13px] text-bone/70">
            Jobber · customer-hub.jobber.com
          </span>
        </div>
        <div className="rounded-lg border border-bone/10 bg-obsidian/40 p-4">
          <div className="text-[11px] text-bone/45">
            &quot;Welcome to your Jobber Hub!&quot;
          </div>
          <div className="mt-2 h-2 w-3/4 rounded-full bg-bone/10" />
          <div className="mt-1.5 h-2 w-2/3 rounded-full bg-bone/10" />
          <div className="mt-1.5 h-2 w-1/2 rounded-full bg-bone/10" />
        </div>
        <div className="text-[11px] text-bone/45">
          Generic everything. Customers know they&apos;re using software you
          rent. Brand equity → zero.
        </div>
      </div>
    </div>
  );
}

function AfterMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-champagne/30 bg-bone/[0.04] shadow-pop-champagne">
      <div className="flex items-center justify-between border-b border-bone/10 px-5 py-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-champagne-bright">
          After · your branded portal
        </span>
        <span className="rounded-full bg-champagne/15 px-2 py-0.5 text-[9px] font-medium text-champagne-bright">
          Your brand
        </span>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-champagne/15 font-serif text-[11px] font-semibold text-champagne-bright">
            GL
          </span>
          <span className="font-serif text-[13px] text-bone">
            GreenLeaf Crew · portal.greenleaf-crew.com
          </span>
        </div>
        <div className="rounded-lg border border-champagne/20 bg-pitch/60 p-4">
          <div className="text-[11px] font-medium text-bone">
            &quot;Hi Sarah — your next visit is Thursday.&quot;
          </div>
          <div className="mt-2 h-2 w-3/4 rounded-full bg-bone/15" />
          <div className="mt-1.5 h-2 w-2/3 rounded-full bg-bone/12" />
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-champagne/15 px-2.5 py-1 text-[10px] font-semibold text-champagne-bright">
            Reschedule · Pay · Approve
          </div>
        </div>
        <div className="text-[11px] text-bone/65">
          Your domain. Your sender. Your colors. Customers think you built it.
        </div>
      </div>
    </div>
  );
}

