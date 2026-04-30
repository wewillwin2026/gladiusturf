import * as React from "react";
import { Compass, Fuel, MapPin, Sparkles } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { Button } from "./ui/Button";
import { type ProductKind } from "./engines";
import { demoState } from "@/lib/demo/state";
import { money, num } from "@/lib/shared/format";

export function RoutesBrowser({ product }: { product: ProductKind }) {
  const { customers } = demoState();
  const groups = new Map<string, number>();
  customers.forEach((c) => groups.set(c.routeId, (groups.get(c.routeId) || 0) + 1));

  const rows = Array.from(groups.entries()).map(([id, count]) => {
    const miles = 28 + Math.round((count % 11) * 1.6);
    const durationMin = 220 + (count * 3) % 80;
    const fuelCents = (28 + (count % 11)) * 240;
    const revenuePerMileCents = 1700 + (count * 12) % 600;
    return {
      id,
      customers: count,
      miles,
      durationMin,
      fuelCents,
      revenuePerMileCents,
      revenueCents: revenuePerMileCents * miles,
    };
  });
  rows.sort((a, b) => b.revenuePerMileCents - a.revenuePerMileCents);

  const maxRev = Math.max(...rows.map((r) => r.revenuePerMileCents));
  const totalMiles = rows.reduce((s, r) => s + r.miles, 0);
  const totalFuel = rows.reduce((s, r) => s + r.fuelCents, 0);
  const totalRev = rows.reduce((s, r) => s + r.revenueCents, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Routes"
        subtitle="Optimization & revenue density. Auto-balance reshuffles routes daily."
        actions={
          <Button variant="primary" size="sm">
            <Sparkles className="h-3.5 w-3.5" /> Auto-optimize all
          </Button>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Active routes" value={String(rows.length)} />
        <KPICard
          label="Avg. miles / day"
          value={String(Math.round(totalMiles / rows.length))}
          delta="−6.4%"
          trend="down"
        />
        <KPICard
          label="Revenue / mile"
          value={money(Math.round(totalRev / totalMiles))}
          delta="+$14"
          trend="up"
        />
        <KPICard
          label="Fuel · this week"
          value={money(totalFuel)}
          delta="−$48 vs last"
          trend="down"
        />
      </section>

      <div className="g-card overflow-hidden">
        <header className="px-5 py-3 border-b border-g-border-subtle flex items-center justify-between">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            Routes by revenue density
          </h2>
          <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
            $ per mile
          </span>
        </header>
        <div className="px-5 py-2">
          {rows.map((r, i) => (
            <RouteRow key={r.id} r={r} maxRev={maxRev} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RouteRow({
  r,
  maxRev,
  rank,
}: {
  r: {
    id: string;
    customers: number;
    miles: number;
    durationMin: number;
    fuelCents: number;
    revenuePerMileCents: number;
    revenueCents: number;
  };
  maxRev: number;
  rank: number;
}) {
  const pct = (r.revenuePerMileCents / maxRev) * 100;
  const tone = rank === 1 ? "bg-g-accent" : rank <= 3 ? "bg-g-info/80" : "bg-g-text-faint/60";
  return (
    <div className="grid grid-cols-[140px_1fr_180px] items-center gap-4 py-3 border-b border-g-border-subtle/60 last:border-b-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint font-mono">
          #{rank}
        </span>
        <Compass className="h-3.5 w-3.5 text-g-text-faint shrink-0" />
        <span className="font-mono text-[12px] text-g-text truncate">{r.id}</span>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-g-surface-2 overflow-hidden">
            <div
              className={`h-full ${tone}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-mono text-[12px] text-g-accent w-[64px] text-right">
            {money(r.revenuePerMileCents)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-g-text-faint">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {num(r.customers)} customers
          </span>
          <span className="inline-flex items-center gap-1">
            <Compass className="h-3 w-3" />
            {r.miles} mi
          </span>
          <span className="inline-flex items-center gap-1">
            <Fuel className="h-3 w-3" />
            {money(r.fuelCents)}
          </span>
        </div>
      </div>

      <div className="text-right">
        <div className="font-mono text-[14px] text-g-text">{money(r.revenueCents)}</div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
          weekly revenue
        </div>
      </div>
    </div>
  );
}
