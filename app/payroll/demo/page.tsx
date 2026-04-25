import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Database,
  FileCheck2,
  FileText,
  Landmark,
  Scale,
  ShieldCheck,
} from "lucide-react";
import {
  COMPLIANCE_FOOTER,
  FEDERAL_WITHHOLDING,
  OT_RULES,
  PAY_PERIOD,
  STATE_FILINGS,
} from "@/content/payroll-demo-data";
import { CrewHoursTable } from "@/components/payroll-sandbox/crew-hours-table";
import { RunPayrollTrigger } from "@/components/payroll-sandbox/run-payroll-trigger";
import { SandboxBanner } from "@/components/payroll-sandbox/sandbox-banner";
import { TinRequestButton } from "@/components/payroll-sandbox/tin-request-button";

function fmtMoney(n: number, opts: { cents?: boolean } = {}): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : 0,
  });
}

export default function PayrollDemoPage() {
  const stateTotal = STATE_FILINGS.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <SandboxBanner />

      {/* 1. Pay-period header */}
      <section className="overflow-hidden rounded-2xl border border-bone/10 bg-gradient-to-br from-slate-deep to-pitch p-6 shadow-pop-champagne md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.6fr_1fr] md:items-center">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-champagne-bright">
              Pay Period · {PAY_PERIOD.label}
            </div>
            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.02em] text-bone md:text-4xl">
              Greenleaf Crew · run #PR-2026-04-27
            </h1>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <Stat
                label="Crew"
                value={String(PAY_PERIOD.crewCount)}
                suffix="members"
              />
              <Stat
                label="Hours"
                value={PAY_PERIOD.totalHours.toLocaleString()}
                suffix="GPS-verified"
              />
              <Stat
                label="Gross"
                value={fmtMoney(PAY_PERIOD.totalGross)}
                accent
              />
            </div>
            <p className="mt-5 max-w-lg text-[13.5px] leading-[1.6] text-bone/65">
              Direct deposit lands{" "}
              <span className="font-semibold text-bone">
                {PAY_PERIOD.depositLands}
              </span>
              . Tax filings auto-prepped for FL / GA / TX / NC. 1 vendor still
              needs a TIN before 1099-NEC packets are filed.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 md:items-end">
            <RunPayrollTrigger />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/45 md:text-right">
              Last reviewed: 18 min ago by Marcus T.
            </span>
            <div className="rounded-xl border border-bone/10 bg-bone/[0.02] p-3 text-[12px] text-bone/65 md:max-w-[280px]">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-bone/45">
                <ShieldCheck className="h-3 w-3 text-moss-bright" />
                Pre-flight checks
              </div>
              <ul className="mt-2 space-y-1 text-[12px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-moss-bright" />
                  GPS hours reconciled
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-moss-bright" />
                  Foreman-approved · 12 / 12
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-moss-bright" />
                  Stripe Connect funded
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Crew hours table */}
      <CrewHoursTable />

      {/* 3. Multi-state tax + OT rules */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TaxCard
          icon={<Landmark className="h-4 w-4" />}
          eyebrow="Federal · 941"
          title={fmtMoney(FEDERAL_WITHHOLDING)}
          subtitle="Withholding · FICA · Medicare"
          tone="champagne"
        >
          <ul className="space-y-1 text-[11.5px] text-bone/60">
            <li className="flex items-baseline justify-between gap-2">
              <span>Federal income tax</span>
              <span className="font-mono text-bone/80">
                {fmtMoney(4920)}
              </span>
            </li>
            <li className="flex items-baseline justify-between gap-2">
              <span>FICA · Medicare</span>
              <span className="font-mono text-bone/80">{fmtMoney(1920)}</span>
            </li>
            <li className="flex items-baseline justify-between gap-2 border-t border-bone/[0.08] pt-1">
              <span className="text-bone/45">Deposit due</span>
              <span className="font-mono text-bone/80">May 2</span>
            </li>
          </ul>
        </TaxCard>

        <TaxCard
          icon={<Building2 className="h-4 w-4" />}
          eyebrow="State filings · 4"
          title={fmtMoney(stateTotal)}
          subtitle="Auto-prepped · multi-state"
          tone="champagne"
        >
          <ul className="space-y-1 text-[11.5px] text-bone/60">
            {STATE_FILINGS.map((row) => (
              <li
                key={row.state}
                className="flex items-baseline justify-between gap-2"
              >
                <span>
                  <span className="mr-1.5 inline-block rounded-full border border-bone/15 bg-bone/[0.03] px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.12em] text-bone/70">
                    {row.state}
                  </span>
                  {row.filings}
                </span>
                <span className="font-mono text-bone/80">
                  {row.amount === 0 ? "—" : fmtMoney(row.amount)}
                </span>
              </li>
            ))}
          </ul>
        </TaxCard>

        <TaxCard
          icon={<Scale className="h-4 w-4" />}
          eyebrow="Overtime · multi-state"
          title="2 rules"
          subtitle="Triggered this period"
          tone="moss"
        >
          <ul className="space-y-2 text-[11.5px] text-bone/65">
            {OT_RULES.map((rule) => (
              <li key={rule.rule} className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-moss/30 bg-moss/10 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.12em] text-moss-bright">
                    {rule.state}
                  </span>
                  <span className="font-medium text-bone/85">{rule.rule}</span>
                </div>
                <div className="pl-7 text-bone/55">{rule.triggered}</div>
              </li>
            ))}
          </ul>
        </TaxCard>

        <TaxCard
          icon={<FileCheck2 className="h-4 w-4" />}
          eyebrow="Prevailing wage · municipal"
          title={fmtMoney(185, { cents: true })}
          subtitle="Davis-Bacon supplemental"
          tone="champagne"
        >
          <ul className="space-y-1 text-[11.5px] text-bone/60">
            <li className="flex items-baseline justify-between gap-2">
              <span>Sarasota County · park reseed</span>
              <span className="font-mono text-bone/80">$185.00</span>
            </li>
            <li className="flex items-baseline justify-between gap-2">
              <span>Crew certified</span>
              <span className="font-mono text-bone/80">M. Thompson</span>
            </li>
            <li className="flex items-baseline justify-between gap-2 border-t border-bone/[0.08] pt-1">
              <span className="text-bone/45">Form WH-347</span>
              <span className="font-mono text-moss-bright">Auto-prepped</span>
            </li>
          </ul>
        </TaxCard>
      </section>

      {/* 4. 1099 packet preview */}
      <section className="overflow-hidden rounded-2xl border border-bone/10 bg-bone/[0.02] p-6 shadow-card md:p-7">
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-champagne-bright">
              <FileText className="h-3.5 w-3.5" />
              1099-NEC packet status
            </div>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-[-0.01em] text-bone md:text-3xl">
              11 / 12 vendors TIN-verified ·{" "}
              <span className="text-champagne-bright">1 missing</span>
            </h2>
            <p className="mt-3 max-w-md text-[13px] leading-[1.6] text-bone/65">
              Year-to-date vendor payouts tracked against the IRS-matched TIN.
              One subcontractor still needs a W-9; backup-withholding will trigger
              automatically if it&apos;s missing at first payout.
            </p>

            <div className="mt-5 max-w-md">
              <div className="flex items-baseline justify-between text-[10px] font-semibold uppercase tracking-[0.16em]">
                <span className="text-bone/45">Verified</span>
                <span className="font-mono text-champagne-bright">92%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bone/[0.08]">
                <div
                  className="h-full rounded-full bg-champagne"
                  style={{ width: "92%" }}
                />
              </div>
            </div>

            <div className="mt-6">
              <TinRequestButton />
            </div>
          </div>

          <div className="rounded-xl border border-bone/10 bg-pitch/40 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/45">
              Vendor cohort · YTD
            </div>
            <ul className="mt-3 space-y-2.5 text-[12px]">
              {[
                ["Hawthorne Tree Co.", "$18,420", true],
                ["Aqua Drip Irrigation", "$7,640", true],
                ["Granite Hauling LLC", "$11,755", true],
                ["Stones & Slabs Inc.", "$4,890", false],
              ].map(([name, ytd, ok]) => (
                <li
                  key={name as string}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="font-serif text-bone">{name}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-bone/65">{ytd}</span>
                    {ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-moss-bright" />
                    ) : (
                      <span className="rounded-full border border-champagne/40 bg-champagne/10 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-champagne-bright">
                        Pending
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-bone/[0.08] pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-bone/45">
              Filing deadline · Jan 31, 2027
            </div>
          </div>
        </div>
      </section>

      {/* 6. Compliance footer */}
      <section className="rounded-2xl border border-bone/10 bg-bone/[0.02] px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-bone/60">
          <span className="inline-flex items-center gap-1.5">
            <ClipboardList className="h-3.5 w-3.5 text-bone/55" />
            {COMPLIANCE_FOOTER.auditPacket}
          </span>
          <span className="text-bone/25">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-bone/55" />
            {COMPLIANCE_FOOTER.qbSync}
          </span>
          <span className="text-bone/25">·</span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-moss-bright" />
            {COMPLIANCE_FOOTER.unposted}
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-bone/45">
            <CalendarDays className="h-3.5 w-3.5" />
            Next run · May 11, 2026
          </span>
        </div>
      </section>

      <p className="pt-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-bone/35">
        Powered by GladiusTurf · Payroll · Sandbox preview
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-bone/45">
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-2xl font-semibold tracking-[-0.01em] md:text-3xl ${accent ? "text-champagne-bright" : "text-bone"}`}
      >
        {value}
      </div>
      {suffix && (
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40">
          {suffix}
        </div>
      )}
    </div>
  );
}

function TaxCard({
  icon,
  eyebrow,
  title,
  subtitle,
  tone,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  tone: "champagne" | "moss";
  children: React.ReactNode;
}) {
  const accentText =
    tone === "moss" ? "text-moss-bright" : "text-champagne-bright";
  const accentBorder = tone === "moss" ? "border-moss/30" : "border-champagne/30";
  return (
    <article
      className={`flex h-full flex-col rounded-2xl border ${accentBorder} bg-bone/[0.02] p-5`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg border ${accentBorder} bg-bone/[0.03] ${accentText}`}
      >
        {icon}
      </div>
      <div
        className={`mt-4 font-mono text-[10px] uppercase tracking-[0.18em] ${accentText}`}
      >
        {eyebrow}
      </div>
      <div className="mt-1.5 font-serif text-2xl font-semibold tracking-[-0.01em] text-bone">
        {title}
      </div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-bone/45">
        {subtitle}
      </div>
      <div className="mt-4 flex-1 border-t border-bone/[0.08] pt-3">
        {children}
      </div>
    </article>
  );
}
