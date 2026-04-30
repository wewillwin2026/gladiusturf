import * as React from "react";
import {
  AlertTriangle,
  Beaker,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { StatusPill } from "./ui/StatusPill";
import { type ProductKind } from "./engines";

type Chem = {
  id: string;
  name: string;
  category: "Herbicide" | "Insecticide" | "Foliar" | "Adjuvant" | "Fungicide";
  lotNo: string;
  appliedToday: number;
  unit: string;
  lastApp: string;
  msdsUpToDate: boolean;
  reentryHours: number;
};

const CATEGORY_TONE: Record<Chem["category"], "warning" | "info" | "success" | "neutral" | "danger"> = {
  Herbicide: "warning",
  Insecticide: "danger",
  Foliar: "success",
  Adjuvant: "info",
  Fungicide: "neutral",
};

const CHEMS: Chem[] = [
  {
    id: "CH-001",
    name: "Lesco 24-0-11 Pre-emerge",
    category: "Herbicide",
    lotNo: "L4422",
    appliedToday: 1280,
    unit: "lbs",
    lastApp: "2026-04-22",
    msdsUpToDate: true,
    reentryHours: 24,
  },
  {
    id: "CH-002",
    name: "Roundup Pro Concentrate",
    category: "Herbicide",
    lotNo: "R8841",
    appliedToday: 14,
    unit: "oz",
    lastApp: "2026-04-29",
    msdsUpToDate: true,
    reentryHours: 4,
  },
  {
    id: "CH-003",
    name: "Bifenthrin 7.9% EC",
    category: "Insecticide",
    lotNo: "B2034",
    appliedToday: 22,
    unit: "oz",
    lastApp: "2026-04-28",
    msdsUpToDate: true,
    reentryHours: 12,
  },
  {
    id: "CH-004",
    name: "Iron HMA 6%",
    category: "Foliar",
    lotNo: "IH-617",
    appliedToday: 8,
    unit: "gal",
    lastApp: "2026-04-24",
    msdsUpToDate: true,
    reentryHours: 0,
  },
  {
    id: "CH-005",
    name: "Spreader-Sticker",
    category: "Adjuvant",
    lotNo: "SS-8810",
    appliedToday: 4,
    unit: "oz",
    lastApp: "2026-04-29",
    msdsUpToDate: true,
    reentryHours: 0,
  },
  {
    id: "CH-006",
    name: "MSMA 6.6",
    category: "Herbicide",
    lotNo: "M210",
    appliedToday: 0,
    unit: "—",
    lastApp: "2026-04-12",
    msdsUpToDate: true,
    reentryHours: 24,
  },
  {
    id: "CH-007",
    name: "Tenacity 4SC",
    category: "Herbicide",
    lotNo: "T-117",
    appliedToday: 6,
    unit: "oz",
    lastApp: "2026-04-26",
    msdsUpToDate: true,
    reentryHours: 4,
  },
  {
    id: "CH-008",
    name: "Imidacloprid 75 WSP",
    category: "Insecticide",
    lotNo: "I-22B",
    appliedToday: 2,
    unit: "oz",
    lastApp: "2026-04-23",
    msdsUpToDate: false,
    reentryHours: 12,
  },
];

const APP_LOG = [
  { ts: "08:42", chem: "Lesco 24-0-11", crew: "Riverside North", customer: "Heritage Oaks HOA", amount: "320 lbs" },
  { ts: "09:14", chem: "Bifenthrin 7.9%", crew: "Westshore", customer: "Bayshore Estates", amount: "8 oz" },
  { ts: "10:01", chem: "Iron HMA 6%", crew: "Hyde Park", customer: "Maria Quintana", amount: "2 gal" },
  { ts: "11:22", chem: "Tenacity 4SC", crew: "Bayshore", customer: "Henderson Property", amount: "3 oz" },
  { ts: "12:48", chem: "Roundup Pro", crew: "Tampa East", customer: "Beaumont House", amount: "6 oz" },
  { ts: "13:30", chem: "Spreader-Sticker", crew: "Ballast Point", customer: "Cypress Pointe HOA", amount: "2 oz" },
];

export function ChemicalsBrowser({ product }: { product: ProductKind }) {
  const totalAppsToday = APP_LOG.length;
  const expiringMsds = CHEMS.filter((c) => !c.msdsUpToDate).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Chemicals"
        subtitle="Applications, MSDS, regulatory log. Florida DACS-ready."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Active SKUs" value={String(CHEMS.length)} />
        <KPICard
          label="Applications · today"
          value={String(totalAppsToday)}
          delta="6 customers"
          trend="flat"
        />
        <KPICard
          label="MSDS up to date"
          value={`${CHEMS.length - expiringMsds} / ${CHEMS.length}`}
          delta={expiringMsds > 0 ? `${expiringMsds} renewing` : "100%"}
          trend={expiringMsds > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Inspections passed"
          value="3 / 3"
          delta="DACS · Q1 + Q2"
          trend="up"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <section>
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint mb-3">
            Active inventory · {CHEMS.length} SKUs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CHEMS.map((c) => (
              <div key={c.id} className="g-card p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-md bg-g-surface-2 border border-g-border-subtle flex items-center justify-center text-g-text-muted shrink-0">
                    <Beaker className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-g-text font-medium truncate">{c.name}</span>
                      <StatusPill tone={CATEGORY_TONE[c.category]}>
                        {c.category}
                      </StatusPill>
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-g-text-faint">
                      {c.id} · Lot {c.lotNo}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <div className="text-g-text-faint uppercase tracking-[0.12em]">
                      Applied today
                    </div>
                    <div className="font-mono text-g-text mt-0.5">
                      {c.appliedToday > 0 ? `${c.appliedToday} ${c.unit}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-g-text-faint uppercase tracking-[0.12em]">
                      Re-entry
                    </div>
                    <div className="font-mono text-g-text mt-0.5">
                      {c.reentryHours === 0 ? "—" : `${c.reentryHours}h`}
                    </div>
                  </div>
                  <div>
                    <div className="text-g-text-faint uppercase tracking-[0.12em]">
                      Last app
                    </div>
                    <div className="font-mono text-g-text mt-0.5">{c.lastApp}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-g-border-subtle/60">
                  {c.msdsUpToDate ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-g-success">
                      <ShieldCheck className="h-3 w-3" />
                      MSDS current
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-g-warning">
                      <AlertTriangle className="h-3 w-3" />
                      MSDS expiring
                    </span>
                  )}
                  <button className="inline-flex items-center gap-1 text-[11px] text-g-text-muted hover:text-g-text">
                    <FileText className="h-3 w-3" />
                    MSDS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="g-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
              Application log · today
            </h2>
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              {APP_LOG.length} entries
            </span>
          </div>
          <ol className="relative">
            <span className="absolute left-[15px] top-1 bottom-1 w-px bg-g-border-subtle" />
            {APP_LOG.map((a, i) => (
              <li key={i} className="relative pl-10 pb-4 last:pb-0">
                <span className="absolute left-2 top-1 h-3 w-3 rounded-full bg-g-accent border-2 border-g-surface" />
                <div className="font-mono text-[11px] text-g-text-faint">
                  {a.ts} · {a.crew}
                </div>
                <div className="mt-0.5 text-[12px] text-g-text">{a.chem}</div>
                <div className="mt-0.5 text-[11px] text-g-text-muted">
                  {a.customer} · {a.amount}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-3 pt-3 border-t border-g-border-subtle inline-flex items-center gap-1.5 text-[11px] text-g-success">
            <CheckCircle2 className="h-3 w-3" />
            All applications logged · ready for inspector
          </div>
        </section>
      </div>
    </div>
  );
}
