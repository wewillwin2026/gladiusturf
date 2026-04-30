import * as React from "react";
import { Crown, Truck, Users } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { Avatar } from "./ui/Avatar";
import { StatusPill } from "./ui/StatusPill";
import { type ProductKind } from "./engines";
import { demoState } from "@/lib/demo/state";
import { money, num } from "@/lib/shared/format";

const ON_TIME_RATE: Record<string, number> = {
  cr_north: 96.2,
  cr_west: 95.4,
  cr_south: 94.8,
  cr_downtown: 96.8,
  cr_bayshore: 98.4,
  cr_east: 91.0,
};

const NPS_BY_CREW: Record<string, number> = {
  cr_north: 74,
  cr_west: 71,
  cr_south: 70,
  cr_downtown: 76,
  cr_bayshore: 84,
  cr_east: 61,
};

export function CrewBrowser({ product }: { product: ProductKind }) {
  const { crews, jobs } = demoState();

  const rows = crews.map((c) => {
    const cjobs = jobs.filter((j) => j.crewId === c.id);
    const completedJobs = cjobs.filter((j) => j.status === "Complete");
    const revenue = completedJobs.reduce((s, j) => s + j.priceCents, 0);
    const onTime = ON_TIME_RATE[c.id] ?? 95;
    const nps = NPS_BY_CREW[c.id] ?? 70;
    return { crew: c, completedJobs, revenue, onTime, nps };
  });

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalTechs = crews.reduce((s, c) => s + c.members.length, 0);
  const bestOnTime = rows.sort((a, b) => b.onTime - a.onTime)[0];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Crew"
        subtitle="Roster, vehicles, and per-crew performance."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Crews" value={String(crews.length)} delta="6 / 6 active" trend="flat" />
        <KPICard label="Techs total" value={String(totalTechs)} />
        <KPICard
          label="Avg revenue / crew"
          value={money(Math.round(totalRevenue / rows.length))}
          delta="YTD"
          trend="up"
        />
        <KPICard
          label="Best on-time rate"
          value={`${bestOnTime?.onTime.toFixed(1)}%`}
          delta={bestOnTime?.crew.name}
          trend="up"
        />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map(({ crew, completedJobs, revenue, onTime, nps }) => (
          <div key={crew.id} className="g-card p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-g-text font-medium truncate">
                    {crew.name}
                  </span>
                  <StatusPill tone="success">Active</StatusPill>
                </div>
                <div className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-[11px] text-g-text-faint">
                  <Truck className="h-3 w-3" />
                  {crew.vehiclePlate}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[14px] text-g-accent">
                  {money(revenue)}
                </div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                  YTD revenue
                </div>
              </div>
            </div>

            {/* Member chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {crew.members.map((m, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-md border border-g-border-subtle bg-g-surface-2/40 pl-1 pr-2 py-1"
                  title={`${m.name} · ${m.role}`}
                >
                  <Avatar name={m.name} size="sm" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-g-text truncate flex items-center gap-1">
                      {m.role === "Lead" && (
                        <Crown className="h-2.5 w-2.5 text-g-warning" />
                      )}
                      {m.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* On-time + NPS gauges */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-g-border-subtle/60">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                    On-time
                  </span>
                  <span className="font-mono text-[12px] text-g-text">
                    {onTime.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-g-surface-2 overflow-hidden">
                  <div
                    className="h-full bg-g-accent"
                    style={{ width: `${Math.min(100, onTime)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                    NPS
                  </span>
                  <span className="font-mono text-[12px] text-g-text">{nps}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-g-surface-2 overflow-hidden">
                  <div
                    className="h-full bg-g-info"
                    style={{ width: `${Math.min(100, nps + 20)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-g-text-faint">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                {crew.members.length} techs
              </span>
              <span>{num(completedJobs.length)} jobs YTD</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
