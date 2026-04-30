import * as React from "react";
import { DollarSign, Pencil, TrendingUp } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { StatusPill } from "./ui/StatusPill";
import { Button } from "./ui/Button";
import { type ProductKind } from "./engines";
import { SERVICE_RATES, type ServiceRate } from "@/lib/shared/pricing";
import { money } from "@/lib/shared/format";

const CATEGORY_TONE: Record<ServiceRate["category"], "info" | "accent" | "warning" | "success"> = {
  Maintenance: "accent",
  Application: "info",
  Installation: "warning",
  OneTime: "success",
};

const CATEGORY_BLURB: Record<ServiceRate["category"], string> = {
  Maintenance: "Recurring upkeep — what keeps the route economics healthy.",
  Application: "Chemical & fertilizer programs — highest-margin recurring spend.",
  Installation: "Heavy-touch jobs — sod, mulch, irrigation. Margins north of 40%.",
  OneTime: "Seasonal one-shots — aeration, overseed, leaf cleanup.",
};

export function PricingBrowser({ product }: { product: ProductKind }) {
  const grouped = new Map<ServiceRate["category"], ServiceRate[]>();
  for (const r of SERVICE_RATES) {
    const arr = grouped.get(r.category) || [];
    arr.push(r);
    grouped.set(r.category, arr);
  }

  const avgMin =
    SERVICE_RATES.reduce((s, r) => s + r.minCharge, 0) / SERVICE_RATES.length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Pricing tables"
        subtitle="Per-unit service rates that feed the AI Quote Drafter. Edit once — every quote rolls forward."
        actions={
          <Button variant="secondary" size="sm">
            <Pencil className="h-3.5 w-3.5" /> Bulk edit
          </Button>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Service categories"
          value={String(grouped.size)}
        />
        <KPICard
          label="Active SKUs"
          value={String(SERVICE_RATES.length)}
          delta="all priced"
          trend="flat"
        />
        <KPICard
          label="Avg. minimum charge"
          value={money(Math.round(avgMin) * 100)}
          delta="protects margin"
          trend="flat"
        />
        <KPICard
          label="Highest-margin SKU"
          value="Mulch refresh"
          delta="44.8% avg"
          trend="up"
        />
      </section>

      <div className="flex flex-col gap-6">
        {Array.from(grouped.entries()).map(([category, items]) => (
          <section key={category} className="g-card overflow-hidden">
            <header className="px-5 py-4 border-b border-g-border-subtle flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <StatusPill tone={CATEGORY_TONE[category]}>{category}</StatusPill>
                  <span className="text-[11px] text-g-text-faint">
                    {items.length} service{items.length > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] text-g-text-muted">
                  {CATEGORY_BLURB[category]}
                </p>
              </div>
              <TrendingUp className="h-4 w-4 text-g-text-faint" />
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
              {items.map((s) => (
                <RateCard key={s.slug} s={s} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function RateCard({ s }: { s: ServiceRate }) {
  const unitLabel =
    s.unit === "sqft"
      ? "/ sqft"
      : s.unit === "linear_ft"
        ? "/ ft"
        : "/ each";
  const isFractional = s.rate < 1;
  const display = isFractional
    ? `$${s.rate.toFixed(4)}`
    : `$${s.rate.toFixed(2)}`;

  return (
    <div className="rounded-lg border border-g-border-subtle bg-g-surface-2/40 p-3 hover:bg-g-surface-2 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-g-text font-medium truncate">{s.name}</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint font-mono">
            {s.slug}
          </div>
        </div>
        <DollarSign className="h-3.5 w-3.5 text-g-accent shrink-0 mt-1" />
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-mono text-[18px] text-g-text">{display}</span>
        <span className="text-[10px] text-g-text-faint">{unitLabel}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-g-text-faint">
        <span>Min charge</span>
        <span className="font-mono text-g-text-muted">${s.minCharge}</span>
      </div>
    </div>
  );
}
