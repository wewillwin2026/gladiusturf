import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Coins,
  FileText,
  Receipt,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { CtaButton } from "@/components/cta-button";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";
import { BOOKS_MODULES } from "@/content/books-modules";

export const metadata: Metadata = {
  title:
    "Payroll · GPS-verified hours · W-2 + 1099 ready",
  description:
    "Crew hours pulled from Field Crew App GPS clock-in / clock-out. Multi-state tax tables, OT calc, prevailing-wage rules, 1099-NEC for subcontractors, Stripe Connect direct deposit.",
  alternates: { canonical: "/payroll" },
};

type FlowStep = {
  index: string;
  title: string;
  body: string;
  icon: typeof Users;
  accent: "moss" | "honey" | "champagne";
};

const FLOW: FlowStep[] = [
  {
    index: "Step 01",
    title: "GPS clock-in",
    body: "Crew member arrives at the job site. Field Crew App geofences the property, prompts a one-tap clock-in, and stamps the time, the location, and the device ID. Clock-out at the polygon exit. Lunch breaks logged the same way.",
    icon: Users,
    accent: "champagne",
  },
  {
    index: "Step 02",
    title: "Hours auto-aggregated",
    body: "Daily, weekly, and pay-period totals roll up automatically. Overtime calculated against the right rule for the jurisdiction (CA daily-OT after 8, NY weekly after 40, prevailing-wage for municipal jobs). The foreman approves with a swipe — no spreadsheet rebuild.",
    icon: BarChart3,
    accent: "champagne",
  },
  {
    index: "Step 03",
    title: "Tax tables apply",
    body: "Federal + state + local withholding, SUI/SUTA, FICA, Medicare. Updated quarterly by our tax team. Multi-state crews get the right blend automatically based on which property they were physically standing on, hour by hour.",
    icon: Calculator,
    accent: "champagne",
  },
  {
    index: "Step 04",
    title: "W-2 / 1099 export",
    body: "Year-end packets prepped automatically. W-2s mailed to full-time crews by January 31, e-filed to the SSA. 1099-NECs sent to subcontractors by January 15. Audit-ready packets archived in the Books vault for the IRS' four-year window.",
    icon: FileText,
    accent: "champagne",
  },
];

type StateRule = {
  state: string;
  rule: string;
  detail: string;
};

const STATE_RULES: StateRule[] = [
  {
    state: "CA",
    rule: "Daily OT after 8h",
    detail:
      "1.5x over 8h, 2x over 12h. Seventh-consecutive-day OT. Meal-break premium tracked.",
  },
  {
    state: "NY",
    rule: "Weekly OT · spread of hours",
    detail:
      "1.5x over 40h. Spread-of-hours premium when shift exceeds 10 elapsed hours.",
  },
  {
    state: "NV",
    rule: "Daily OT after 8h",
    detail:
      "Daily-OT for hourly crew below 1.5x state min. Detailed audit packet pre-built.",
  },
  {
    state: "MA",
    rule: "Sunday + holiday premium",
    detail:
      "Retail-style premium for landscape ops working blue-law-restricted Sundays.",
  },
  {
    state: "WA",
    rule: "Paid sick leave accrual",
    detail:
      "1 hour per 40 worked. Accrual ledger maintained per crew member, exportable on demand.",
  },
  {
    state: "Federal",
    rule: "Davis-Bacon prevailing wage",
    detail:
      "Municipal jobs pay the local prevailing rate. Wage determinations refreshed weekly.",
  },
];

export default function PayrollPage() {
  const payrollModules = BOOKS_MODULES.filter((m) => m.surface === "payroll");

  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-bone/10 bg-obsidian py-28 md:py-36">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[700px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(245,191,89,0.10),transparent_60%)]"
          />
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <Eyebrow tone="champagne">Payroll · GPS-verified</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h1 className="mt-4 max-w-5xl font-serif text-5xl font-semibold leading-[1.05] tracking-[-0.02em] text-bone md:text-7xl">
                Paper time sheets killed{" "}
                <span className="text-moss-bright">
                  your last good crew chief.
                </span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="mt-8 max-w-3xl space-y-5 text-lg text-bone/60 md:text-xl">
                <p>
                  Every landscape shop has the same fight, every Friday
                  afternoon. The crew member says he was on the property at 7.
                  The manager pulls the GPS and says the truck didn&apos;t
                  cross the polygon until 7:34. Neither has receipts the
                  other will accept. The Friday huddle becomes a Friday war.
                  The good crew chief — the one who&apos;s been holding three
                  routes together — quits by the end of the month.
                </p>
                <p>
                  Payroll ends the fight. The Field Crew App&apos;s GPS becomes
                  the source of truth — geofenced, timestamped,
                  device-verified. Hours roll up to multi-state tax tables,
                  overtime applies the right rule for the right jurisdiction,
                  W-2s and 1099-NECs prep automatically by year-end. Direct
                  deposit lands in 1–2 business days via Stripe Connect. Your
                  crew gets paid the way they should — on time, with no
                  arguments, on the strength of data nobody can dispute.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <CtaButton href="/demo" variant="primary" size="lg">
                  See Payroll on a 30-min demo
                </CtaButton>
                <CtaButton
                  href="#flow"
                  variant="ghost-champagne"
                  withArrow
                >
                  Read the workflow
                </CtaButton>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Pill tone="champagne">Engine 30 · Payroll</Pill>
                <Pill tone="moss">Powered by Field Crew App GPS</Pill>
                <Pill tone="champagne">Stripe Connect direct deposit</Pill>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* How it works · 4-step flow */}
        <section
          id="flow"
          className="border-b border-bone/10 bg-slate-deep py-28"
        >
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">How it works</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  GPS clock-in.{" "}
                  <span className="text-champagne-bright">
                    Direct deposit.
                  </span>{" "}
                  <span className="text-bone/55">No middle layer.</span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  Four steps from the truck arriving at the property to the
                  paycheck landing in the crew member&apos;s account. Every
                  step has a documented audit trail; every transition is
                  posted as a journal entry into Books the moment it fires.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-6 md:grid-cols-2">
              {FLOW.map((step, i) => {
                const accentText =
                  step.accent === "honey"
                    ? "text-honey-bright"
                    : step.accent === "moss"
                      ? "text-moss-bright"
                      : "text-champagne-bright";
                const accentBorder =
                  step.accent === "honey"
                    ? "border-honey/30"
                    : step.accent === "moss"
                      ? "border-moss/30"
                      : "border-champagne/30";
                const Icon = step.icon;
                return (
                  <ScrollReveal key={step.index} delay={(i % 2) * 0.06}>
                    <article
                      className={`relative h-full rounded-2xl border ${accentBorder} bg-gradient-to-b from-bone/[0.04] to-transparent p-8`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${accentBorder} bg-bone/[0.03] ${accentText}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`mt-5 block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] ${accentText}`}
                      >
                        {step.index}
                      </span>
                      <h3 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-bone md:text-3xl">
                        {step.title}
                      </h3>
                      <p className="mt-4 text-[15px] leading-[1.65] text-bone/65">
                        {step.body}
                      </p>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Multi-state */}
        <section className="border-b border-bone/10 bg-obsidian py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Multi-state</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  All 50 states.{" "}
                  <span className="text-champagne-bright">
                    Every overtime rule.
                  </span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  CA crews get daily-OT. NY crews get spread-of-hours
                  premium. Davis-Bacon municipal jobs get prevailing wage.
                  Multi-state crews get the right blend hour-by-hour, based on
                  which property the GPS recorded them on. Tax tables refresh
                  quarterly — your bookkeeper doesn&apos;t track regulatory
                  bulletins; we do.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {STATE_RULES.map((row, i) => (
                <ScrollReveal key={row.state} delay={(i % 3) * 0.05}>
                  <article className="flex h-full flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-champagne/30 bg-champagne/5 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.16em] text-champagne-bright">
                        {row.state}
                      </span>
                      <h3 className="font-serif text-lg font-semibold tracking-tight text-bone">
                        {row.rule}
                      </h3>
                    </div>
                    <p className="mt-4 text-[13px] leading-[1.65] text-bone/60">
                      {row.detail}
                    </p>
                  </article>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.2}>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
                <Pill tone="champagne">Federal + 50 states</Pill>
                <Pill tone="moss">Local jurisdictions per ZIP</Pill>
                <Pill tone="champagne">Quarterly tax-table refresh</Pill>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Subcontractor handling */}
        <section className="border-b border-bone/10 bg-slate-deep py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <ScrollReveal>
                <div>
                  <Eyebrow tone="champagne">Subcontractors · 1099-NEC</Eyebrow>
                  <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                    TIN at the first job.{" "}
                    <span className="text-champagne-bright">
                      No January scramble.
                    </span>
                  </h2>
                  <p className="mt-5 text-lg text-bone/60">
                    Every subcontractor — tree-removal crews, dumpster vendors,
                    irrigation specialists — completes a W-9 inside the
                    onboarding flow before they get paid the first time.
                    Year-to-date payouts track against the TIN. 1099-NEC
                    packets are e-filed to the IRS by January 15 and mailed to
                    the vendor — without an emergency call to your bookkeeper
                    on December 28.
                  </p>
                  <ul className="mt-8 space-y-3 text-[14px] text-bone/70">
                    {[
                      "TIN matching against IRS records before first payout",
                      "Backup-withholding triggers automatically on TIN mismatch",
                      "YTD payouts visible to the vendor in their portal",
                      "1099-NEC + 1099-MISC + 1096 transmittal packets",
                      "Past-year archives kept for the IRS' four-year window",
                    ].map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <Receipt className="mt-0.5 h-4 w-4 flex-none text-champagne-bright" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="rounded-2xl border border-bone/10 bg-obsidian/60 p-6 shadow-pop md:p-8">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/45">
                    Subcontractor cohort · 2026
                  </div>
                  <table className="mt-5 w-full text-left text-[12.5px]">
                    <thead className="border-b border-bone/10 font-mono text-[10px] uppercase tracking-[0.16em] text-bone/45">
                      <tr>
                        <th className="py-2 font-semibold">Vendor</th>
                        <th className="py-2 font-semibold">YTD payout</th>
                        <th className="py-2 font-semibold">TIN</th>
                        <th className="py-2 font-semibold">1099 status</th>
                      </tr>
                    </thead>
                    <tbody className="text-bone/80">
                      {[
                        ["Hawthorne Tree Co.", "$18,420", "8x-2814", "Ready"],
                        ["Granite Hauling LLC", "$11,755", "9x-4422", "Ready"],
                        ["Aqua Drip Irrigation", "$7,640", "5x-9180", "Ready"],
                        ["Stones &amp; Slabs Inc.", "$4,890", "—", "Pending TIN"],
                        ["Riverside Mulch Co.", "$2,210", "1x-7755", "Below $600"],
                      ].map((r) => (
                        <tr key={r[0]} className="border-b border-bone/[0.06]">
                          <td className="py-3">{r[0]}</td>
                          <td className="py-3 font-mono text-bone/85">{r[1]}</td>
                          <td className="py-3 font-mono text-bone/55">{r[2]}</td>
                          <td className="py-3">
                            <span
                              className={
                                r[3] === "Ready"
                                  ? "rounded-full border border-moss/30 bg-moss/10 px-2 py-0.5 font-mono text-[10px] text-moss-bright"
                                  : r[3] === "Pending TIN"
                                    ? "rounded-full border border-rose-400/30 bg-rose-400/5 px-2 py-0.5 font-mono text-[10px] text-rose-300"
                                    : "rounded-full border border-bone/15 bg-bone/[0.03] px-2 py-0.5 font-mono text-[10px] text-bone/55"
                              }
                            >
                              {r[3]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-5 rounded-lg border border-bone/10 bg-bone/[0.03] p-3 font-mono text-[11px] text-bone/60">
                    <span className="text-champagne-bright">Auto-prep deadline:</span>{" "}
                    January 15 · 4 packets ready · 1 awaiting W-9
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Direct deposit */}
        <section className="border-b border-bone/10 bg-obsidian py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Direct deposit</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Stripe Connect-powered.{" "}
                  <span className="text-champagne-bright">
                    1–2 business days.
                  </span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  Every crew member onboards through a Stripe Connect Express
                  flow — bank-account verification, KYC, tax-form collection.
                  Payday lands in 1–2 business days; same-day available for
                  emergencies. Paystubs auto-generate, sign, and archive
                  inside the Field Crew App so the team never asks &quot;where&apos;s
                  my check?&quot; again.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {[
                {
                  h: "Bank-grade onboarding",
                  b: "Stripe handles KYC, account verification, tax-form W-9 / W-4 collection. The crew member does it from their phone — no paper, no manager-as-notary.",
                  icon: Shield,
                  accent: "champagne" as const,
                },
                {
                  h: "1–2 day standard payout",
                  b: "ACH-based same-day for emergencies, standard 1–2 day for the regular run. Failed transfers retry automatically; the crew chief gets pinged before the crew member notices.",
                  icon: Coins,
                  accent: "champagne" as const,
                },
                {
                  h: "Paystubs in the app",
                  b: "Auto-generated PDF paystubs with hours, gross, deductions, net. Stored in the Field Crew App profile, signable from a phone, archived for the seven-year DOL window.",
                  icon: Wallet,
                  accent: "moss" as const,
                },
              ].map((row, i) => {
                const accentText =
                  row.accent === "moss"
                    ? "text-moss-bright"
                    : "text-champagne-bright";
                const accentBorder =
                  row.accent === "moss"
                    ? "border-moss/30"
                    : "border-champagne/30";
                const Icon = row.icon;
                return (
                  <ScrollReveal key={row.h} delay={(i % 3) * 0.05}>
                    <article
                      className={`flex h-full flex-col rounded-2xl border ${accentBorder} bg-bone/[0.02] p-7`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${accentBorder} bg-bone/[0.03] ${accentText}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 font-serif text-xl font-semibold tracking-tight text-bone">
                        {row.h}
                      </h3>
                      <p className="mt-3 text-[14px] leading-[1.65] text-bone/65">
                        {row.b}
                      </p>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="border-b border-bone/10 bg-slate-deep py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Compliance</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  DOL-ready audit packets.{" "}
                  <span className="text-champagne-bright">
                    Prevailing-wage support.
                  </span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  Wage-and-hour audits don&apos;t announce themselves. When the
                  letter arrives, you have ninety days to produce time records,
                  pay records, and policy documentation — for every crew
                  member, for the past three years. Payroll keeps the packet
                  warm at all times.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {[
                {
                  h: "Time records · 3-year retention",
                  b: "Every GPS clock-in and clock-out, signed by the crew member, archived in cold storage for three years. The auditor asks; you click; the packet exports.",
                },
                {
                  h: "Pay records · 7-year retention",
                  b: "Paystubs, deductions, OT calculations, prevailing-wage declarations. Seven years matches the IRS document-retention window — one packet covers both.",
                },
                {
                  h: "Davis-Bacon prevailing wage",
                  b: "Municipal jobs auto-detect the prevailing-wage determination from the contracting agency. Wage decisions refresh weekly; certified payroll forms generate on-demand.",
                },
                {
                  h: "Workers' comp + EPLI proofs",
                  b: "Proof of coverage documents auto-mailed to the GC at job start. Renewal reminders fired thirty days out. No more crew showing up to a closed gate.",
                },
              ].map((row, i) => (
                <ScrollReveal key={row.h} delay={(i % 2) * 0.05}>
                  <article className="flex h-full flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-7">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-champagne/20 bg-champagne/5 text-champagne-bright">
                      <Shield className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-serif text-xl font-semibold tracking-tight text-bone">
                      {row.h}
                    </h3>
                    <p className="mt-3 text-[14px] leading-[1.65] text-bone/65">
                      {row.b}
                    </p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Modules */}
        <section className="border-b border-bone/10 bg-obsidian py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Payroll modules</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Four modules.{" "}
                  <span className="text-champagne-bright">One paycheck.</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {payrollModules.map((m, i) => (
                <ScrollReveal key={m.slug} delay={(i % 4) * 0.05}>
                  <article className="flex h-full flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
                    <h3 className="font-serif text-lg font-semibold tracking-tight text-bone">
                      {m.name}
                    </h3>
                    <p className="mt-3 text-[13px] leading-[1.65] text-bone/65">
                      {m.description}
                    </p>
                  </article>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.15}>
              <div className="mt-12 text-center">
                <Link
                  href="/retention"
                  className="inline-flex items-center gap-1.5 text-sm text-lime-bright transition-colors hover:text-lime"
                >
                  See Retention Radar · churn predicted 60 days out
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
