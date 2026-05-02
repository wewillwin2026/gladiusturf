import { Bell, Clock, FileSpreadsheet, ShieldCheck, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

type Quadrant = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  badge: string;
  badgeTone: "info" | "amber";
  bullets: string[];
};

const QUADRANTS: Quadrant[] = [
  {
    icon: Clock,
    title: "Time Tracking",
    badge: "Coming July 2026",
    badgeTone: "amber",
    bullets: [
      "Crew clocks in via the mobile app",
      "Hours feed automatically into this page — no spreadsheet",
      "GPS-stamped at the property so the timesheet writes itself",
      "First crews tracked: Cristian, Felipe",
    ],
  },
  {
    icon: Wallet,
    title: "Payroll Runs",
    badge: "Coming Q3 2026",
    badgeTone: "amber",
    bullets: [
      "One-click run from clocked hours",
      "Direct deposit to your team",
      "Tax filing handled",
      "W-2s and 1099s generated",
    ],
  },
  {
    icon: FileSpreadsheet,
    title: "QuickBooks Sync",
    badge: "Coming Q3 2026",
    badgeTone: "amber",
    bullets: [
      "Two-way sync to QuickBooks Online",
      "Invoices, payments, payroll entries — all reconciled",
      "Your books stay your books",
      "Your accountant doesn't have to learn anything new",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Tax & Compliance",
    badge: "Coming Q3 2026",
    badgeTone: "amber",
    bullets: [
      "Florida payroll tax automatic",
      "1099s for subcontractor helpers",
      "State unemployment, FUTA, FICA",
      "Quarterly filings on schedule",
    ],
  },
];

export default function PayrollPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="bl-eyebrow-muted">Business · Payroll</span>
        <h1
          className="bl-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--bl-text)" }}
        >
          Run payroll without leaving Bright Lights.
        </h1>
        <p
          className="mt-1 max-w-2xl text-[13px] leading-[1.55]"
          style={{ color: "var(--bl-text-muted)" }}
        >
          When Payroll ships in Q3 2026, time tracking, payroll runs, books, and
          tax compliance live under one tab. No QuickBooks switch, no
          re-training your accountant, no second app for your crew.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {QUADRANTS.map((q) => (
          <Quadrant key={q.title} q={q} />
        ))}
      </section>

      <section
        className="bl-card flex flex-col items-start gap-3 p-5 md:flex-row md:items-center md:justify-between"
        style={{
          background:
            "linear-gradient(180deg, rgba(244,184,96,0.08) 0%, rgba(244,184,96,0.0) 100%)",
          border: "1px solid rgba(244,184,96,0.32)",
        }}
      >
        <div>
          <h3
            className="bl-serif text-[18px]"
            style={{ color: "var(--bl-text)" }}
          >
            We&rsquo;ll tell you the day Payroll ships.
          </h3>
          <p
            className="mt-1 text-[12px] leading-[1.5]"
            style={{ color: "var(--bl-text-muted)" }}
          >
            One email, one click, and the new module turns on in your workspace
            — no migration call, no upgrade fee.
          </p>
        </div>
        <button type="button" className="bl-btn-primary shrink-0">
          <Bell className="h-3.5 w-3.5" />
          Notify me when Payroll ships
        </button>
      </section>
    </div>
  );
}

function Quadrant({ q }: { q: Quadrant }) {
  const Icon = q.icon;
  return (
    <div className="bl-card flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
            style={{
              background: "rgba(244,184,96,0.18)",
              color: "var(--bl-accent)",
              border: "1px solid rgba(244,184,96,0.4)",
            }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <span className="bl-eyebrow">Module</span>
            <h3
              className="bl-serif mt-0.5 text-[18px] leading-tight"
              style={{ color: "var(--bl-text)" }}
            >
              {q.title}
            </h3>
          </div>
        </div>
        <span
          className="bl-pill bl-pill-amber shrink-0"
          style={{ fontSize: 10 }}
        >
          {q.badge}
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {q.bullets.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2 text-[12px]"
            style={{ color: "var(--bl-text-muted)" }}
          >
            <span
              className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: "var(--bl-accent)" }}
            />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
