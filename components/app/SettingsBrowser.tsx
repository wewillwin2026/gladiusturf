import * as React from "react";
import {
  Building2,
  Check,
  CreditCard,
  Globe,
  Mail,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { StatusPill } from "./ui/StatusPill";
import { Button } from "./ui/Button";
import { Avatar } from "./ui/Avatar";
import { type ProductKind } from "./engines";
import { money } from "@/lib/shared/format";

type Replaced = {
  name: string;
  category: string;
  monthlyCents: number;
  note: string;
};

const REPLACED: Replaced[] = [
  {
    name: "RealGreen",
    category: "Field service ops",
    monthlyCents: 120000,
    note: "Routes + scheduling + invoicing",
  },
  {
    name: "Hatch",
    category: "Outbound BDC",
    monthlyCents: 120000,
    note: "SMS + voice cadence engine",
  },
  {
    name: "SiteRecon",
    category: "Property measurement",
    monthlyCents: 20000,
    note: "Satellite measure-to-quote",
  },
  {
    name: "OptimoRoute",
    category: "Route optimization",
    monthlyCents: 15000,
    note: "Daily auto-balance & GPS",
  },
  {
    name: "Generic CRM",
    category: "Pipeline + inbox",
    monthlyCents: 24900,
    note: "Customer database + email",
  },
];

const TEAM = [
  {
    name: "Marcus Cypress",
    email: "admin@gladiuscrm.com",
    role: "Owner",
    status: "Active",
    online: true,
  },
  {
    name: "Joshua Pyorke",
    email: "joshua@cypresslawn.com",
    role: "Sales",
    status: "Active",
    online: true,
  },
  {
    name: "Diana Reyes",
    email: "diana@cypresslawn.com",
    role: "Ops manager",
    status: "Active",
    online: false,
  },
  {
    name: "Eddie Vargas",
    email: "eddie@cypresslawn.com",
    role: "Crew lead · Riverside",
    status: "Active",
    online: false,
  },
  {
    name: "Tony Ramirez",
    email: "tony@cypresslawn.com",
    role: "Crew lead · Bayshore",
    status: "Active",
    online: false,
  },
  {
    name: "All techs (12)",
    email: "—",
    role: "Read-only",
    status: "Active",
    online: false,
  },
];

const COMPANY = [
  {
    icon: Building2,
    label: "Legal name",
    value: "Cypress Lawn & Landscape, LLC",
  },
  { icon: Globe, label: "Service area", value: "30 mi from 33606 (Tampa, FL)" },
  { icon: Mail, label: "Billing email", value: "billing@cypresslawn.com" },
  { icon: ShieldCheck, label: "License", value: "FL CGC1521889" },
];

export function SettingsBrowser({ product }: { product: ProductKind }) {
  const totalReplacedMonthly = REPLACED.reduce(
    (s, r) => s + r.monthlyCents,
    0,
  );
  const totalReplacedAnnual = totalReplacedMonthly * 12;
  const planAnnualCents = 99700;
  const savingsAnnual = totalReplacedAnnual - planAnnualCents;
  const replacedMonthlyDollars = totalReplacedMonthly / 100;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Settings"
        subtitle="Company, team, and billing — including everything GladiusTurf replaced."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Plan" value="Professional" delta="Annual prepay" trend="flat" />
        <KPICard label="Seats" value="12" delta="Unlimited included" trend="flat" />
        <KPICard
          label="What you replaced"
          value={`$${replacedMonthlyDollars.toLocaleString()}/mo`}
          delta="5 tools · gone"
          trend="down"
        />
        <KPICard
          label="Saved · this year"
          value={money(savingsAnnual)}
          delta="vs old stack"
          trend="up"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Billing column — competitive gut-punch */}
        <section className="g-card overflow-hidden">
          <header className="px-5 py-4 border-b border-g-border-subtle flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                Billing
              </div>
              <h2 className="mt-1 text-g-text font-medium">
                Everything GladiusTurf replaced
              </h2>
            </div>
            <StatusPill tone="success">
              <Check className="h-3 w-3" /> Migrated
            </StatusPill>
          </header>

          <div className="px-5 py-2">
            {REPLACED.map((r, i) => (
              <div
                key={r.name}
                className={
                  "flex items-center gap-4 py-4 " +
                  (i < REPLACED.length - 1
                    ? "border-b border-g-border-subtle/60"
                    : "")
                }
              >
                <div className="h-10 w-10 rounded-md bg-g-surface-2 border border-g-border-subtle flex items-center justify-center text-[11px] font-mono text-g-text-faint">
                  {r.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 line-through decoration-g-danger decoration-2">
                    <span className="text-g-text-muted">{r.name}</span>
                    <span className="text-[11px] text-g-text-faint">
                      · {r.category}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-g-text-faint">
                    {r.note}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-mono text-g-text-muted line-through decoration-g-danger decoration-1">
                    {money(r.monthlyCents)}/mo
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                    canceled
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t-2 border-g-border-subtle/80 mt-2 pt-4 pb-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-md bg-g-accent-faint border border-g-accent/40 flex items-center justify-center">
                <Zap className="h-4 w-4 text-g-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-g-text font-medium">GladiusTurf</span>
                  <StatusPill tone="accent">Professional</StatusPill>
                </div>
                <div className="mt-0.5 text-[11px] text-g-text-faint">
                  Routes + Quote AI + BDC + measurement + CRM — bundled.
                </div>
              </div>
              <div className="text-right">
                <div className="text-[15px] font-mono text-g-accent">
                  {money(planAnnualCents)}/yr
                </div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                  ≈ ${(planAnnualCents / 1200).toFixed(0)}/mo
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-g-border-subtle bg-g-surface-2/40 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                Saved · per year
              </div>
              <div className="mt-0.5 text-[28px] font-mono text-g-success leading-none">
                {money(savingsAnnual)}
              </div>
            </div>
            <div className="text-right text-[11px] text-g-text-muted max-w-[180px]">
              That&rsquo;s {(savingsAnnual / 100 / 12).toFixed(0)} a month going
              back to the crew, the trucks, or your kid&rsquo;s 529.
            </div>
          </div>
        </section>

        {/* Right column: company + plan card */}
        <div className="flex flex-col gap-6">
          <section className="g-card p-5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Plan
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl text-g-text">Professional</span>
              <StatusPill tone="success">Active</StatusPill>
            </div>
            <div className="mt-1 font-mono text-[13px] text-g-text-muted">
              {money(planAnnualCents)} / year · annual prepay
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
              <div className="rounded-md border border-g-border-subtle px-3 py-2">
                <div className="text-g-text-faint">Renews</div>
                <div className="text-g-text font-mono">May 12, 2027</div>
              </div>
              <div className="rounded-md border border-g-border-subtle px-3 py-2">
                <div className="text-g-text-faint">Last bill</div>
                <div className="text-g-text font-mono">Apr 12, 2026 · paid</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" size="sm">
                <CreditCard className="h-3.5 w-3.5" /> Update card
              </Button>
              <Button variant="ghost" size="sm">
                Download invoice
              </Button>
            </div>
          </section>

          <section className="g-card p-5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Company
            </div>
            <h3 className="mt-2 text-g-text">Cypress Lawn & Landscape</h3>
            <div className="mt-3 flex flex-col gap-2.5">
              {COMPANY.map((c) => (
                <div key={c.label} className="flex items-start gap-2.5">
                  <c.icon className="h-3.5 w-3.5 text-g-text-faint mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                      {c.label}
                    </div>
                    <div className="text-[12px] text-g-text truncate">
                      {c.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Team section */}
      <section className="g-card overflow-hidden">
        <header className="px-5 py-4 border-b border-g-border-subtle flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Team
            </div>
            <h2 className="mt-1 text-g-text font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-g-text-faint" />
              {TEAM.length} members
            </h2>
          </div>
          <Button variant="primary" size="sm">
            Invite teammate
          </Button>
        </header>
        <div className="px-5 py-2">
          {TEAM.map((m, i) => (
            <div
              key={m.email + i}
              className={
                "flex items-center gap-3 py-3 " +
                (i < TEAM.length - 1
                  ? "border-b border-g-border-subtle/60"
                  : "")
              }
            >
              <div className="relative">
                <Avatar name={m.name} size="sm" />
                {m.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-g-success border-2 border-g-surface" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-g-text">{m.name}</div>
                <div className="text-[11px] text-g-text-faint font-mono">
                  {m.email}
                </div>
              </div>
              <div className="text-[11px] text-g-text-muted">{m.role}</div>
              <StatusPill tone={m.status === "Active" ? "success" : "neutral"}>
                {m.status}
              </StatusPill>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
