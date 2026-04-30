import * as React from "react";
import { MapPin, TrendingUp } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { type ProductKind } from "./engines";
import { demoState } from "@/lib/demo/state";
import { money, num } from "@/lib/shared/format";

export function TerritoryBrowser({ product }: { product: ProductKind }) {
  const { customers } = demoState();

  const groups = new Map<string, { count: number; ltv: number }>();
  customers.forEach((c) => {
    const g = groups.get(c.zip) || { count: 0, ltv: 0 };
    groups.set(c.zip, { count: g.count + 1, ltv: g.ltv + c.ltvCents });
  });

  const rows = Array.from(groups.entries())
    .map(([zip, g]) => ({
      zip,
      count: g.count,
      ltv: g.ltv,
      avg: Math.round(g.ltv / g.count),
    }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...rows.map((r) => r.count));
  const maxAvg = Math.max(...rows.map((r) => r.avg));
  const totalLtv = rows.reduce((s, r) => s + r.ltv, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Territory"
        subtitle="Zip-level coverage and customer density. Heatmap of where Cypress Lawn earns its money."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="ZIPs covered" value={String(rows.length)} />
        <KPICard
          label="Densest ZIP"
          value={rows[0]?.zip || "—"}
          delta={`${rows[0]?.count ?? 0} customers`}
          trend="up"
        />
        <KPICard
          label="Avg customers / ZIP"
          value={String(Math.round(customers.length / rows.length))}
        />
        <KPICard
          label="Highest avg LTV"
          value={(() => {
            const top = [...rows].sort((a, b) => b.avg - a.avg)[0];
            return top ? top.zip : "—";
          })()}
          delta="+18% vs avg"
          trend="up"
        />
      </section>

      <section className="g-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
              ZIP heatmap · density
            </h3>
            <p className="mt-1 text-[12px] text-g-text-muted">
              Tile size = customer count. Color saturation = average LTV.
            </p>
          </div>
          <span className="font-mono text-[12px] text-g-accent">
            Total LTV {money(totalLtv)}
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {rows.map((r) => {
            const intensity = Math.max(0.18, r.avg / maxAvg);
            const sizeClass =
              r.count >= maxCount * 0.66
                ? "row-span-2 col-span-2"
                : r.count >= maxCount * 0.4
                  ? "col-span-2"
                  : "";
            return (
              <div
                key={r.zip}
                className={`relative rounded-lg border border-g-border-subtle p-3 transition-all hover:border-g-accent/40 ${sizeClass}`}
                style={{
                  background: `linear-gradient(180deg, rgba(0, 210, 106, ${intensity * 0.18}) 0%, rgba(0, 210, 106, ${intensity * 0.04}) 100%)`,
                }}
                title={`${r.zip} — ${r.count} customers · avg ${money(r.avg)} LTV`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] text-g-text">
                    {r.zip}
                  </span>
                  <MapPin className="h-3 w-3 text-g-text-faint" />
                </div>
                <div className="mt-1.5 font-mono text-[14px] text-g-text">
                  {num(r.count)}
                </div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                  customers
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono text-g-accent">
                  <TrendingUp className="h-2.5 w-2.5" />
                  {money(r.avg)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="g-card overflow-hidden">
        <header className="px-5 py-3 border-b border-g-border-subtle">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            ZIP performance · ranked
          </h2>
        </header>
        <div className="px-5 py-2">
          {rows.slice(0, 18).map((r, i) => (
            <div
              key={r.zip}
              className="grid grid-cols-[40px_1fr_2fr_100px_100px] items-center gap-3 py-2.5 border-b border-g-border-subtle/60 last:border-b-0 text-[12px]"
            >
              <span className="font-mono text-[10px] text-g-text-faint">
                #{i + 1}
              </span>
              <span className="font-mono text-g-text">{r.zip}</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-g-surface-2 overflow-hidden">
                  <div
                    className="h-full bg-g-accent"
                    style={{ width: `${(r.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] text-g-text-muted w-[36px] text-right">
                  {num(r.count)}
                </span>
              </div>
              <span className="font-mono text-g-text-muted text-right">
                {money(r.ltv)}
              </span>
              <span className="font-mono text-g-accent text-right">
                {money(r.avg)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
