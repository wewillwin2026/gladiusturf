import * as React from "react";
import { AlertTriangle, Clock, MapPin } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { StatusPill } from "./ui/StatusPill";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { type ProductKind } from "./engines";
import { demoState } from "@/lib/demo/state";
import { rng } from "@/lib/shared/prng";
import { num } from "@/lib/shared/format";

export function TimesheetsBrowser({ product }: { product: ProductKind }) {
  const { crews } = demoState();
  const r = rng(150);
  const techs = crews.flatMap((c) =>
    c.members.map((m, i) => ({
      id: `${c.id}_${i}`,
      crew: c.name,
      tech: m.name,
      role: m.role,
      hoursWeek: Number(r.float(28, 44).toFixed(1)),
      otHours: Number(r.float(0, 4).toFixed(1)),
      stops: r.int(40, 86),
    })),
  );

  const sorted = [...techs].sort((a, b) => b.hoursWeek + b.otHours - (a.hoursWeek + a.otHours));
  const totalHours = techs.reduce((s, t) => s + t.hoursWeek, 0);
  const totalOt = techs.reduce((s, t) => s + t.otHours, 0);
  const otPct = (totalOt / totalHours) * 100;
  const overOT = techs.filter((t) => t.otHours > 2).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Timesheets"
        subtitle="Hours by employee with overtime flags. Live from GPS check-in."
        actions={
          <Button variant="secondary" size="sm">
            Approve all
          </Button>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Techs" value={String(techs.length)} />
        <KPICard label="Hours · this week" value={totalHours.toFixed(1)} delta="−2.4%" trend="down" />
        <KPICard
          label="OT hours"
          value={totalOt.toFixed(1)}
          delta={`${otPct.toFixed(1)}% of total`}
          trend="down"
        />
        <KPICard
          label="Avg stops / tech"
          value={String(Math.round(techs.reduce((s, t) => s + t.stops, 0) / techs.length))}
          delta={overOT > 0 ? `${overOT} over OT` : "all within"}
          trend="flat"
        />
      </section>

      <section className="g-card overflow-hidden">
        <header className="px-5 py-3 border-b border-g-border-subtle flex items-center justify-between">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            Hours · this week
          </h2>
          <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
            Reg + OT
          </span>
        </header>
        <div className="px-5 py-2">
          {sorted.map((t) => {
            const total = t.hoursWeek + t.otHours;
            const regPct = (t.hoursWeek / 60) * 100;
            const otPctLine = (t.otHours / 60) * 100;
            const isOver = t.otHours > 2;
            return (
              <div
                key={t.id}
                className="grid grid-cols-[200px_1fr_120px] items-center gap-3 py-2.5 border-b border-g-border-subtle/60 last:border-b-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar name={t.tech} size="sm" />
                  <div className="min-w-0">
                    <div className="text-[12px] text-g-text truncate">{t.tech}</div>
                    <div className="text-[10px] text-g-text-faint">
                      {t.crew} · {t.role}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-g-surface-2 overflow-hidden flex">
                      <div
                        className="h-full bg-g-accent"
                        style={{ width: `${regPct}%` }}
                      />
                      <div
                        className={`h-full ${isOver ? "bg-g-warning" : "bg-g-info/70"}`}
                        style={{ width: `${otPctLine}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-g-text w-[64px] text-right">
                      {total.toFixed(1)}h
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-g-text-faint">
                    <span className="font-mono">{t.hoursWeek}h reg</span>
                    {t.otHours > 0 && (
                      <span
                        className={`font-mono ${isOver ? "text-g-warning" : "text-g-info"}`}
                      >
                        +{t.otHours}h OT
                      </span>
                    )}
                    <span className="font-mono inline-flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5" />
                      {num(t.stops)} stops
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {isOver ? (
                    <StatusPill tone="warning">
                      <AlertTriangle className="h-2.5 w-2.5" /> OT
                    </StatusPill>
                  ) : (
                    <StatusPill tone="success">
                      <Clock className="h-2.5 w-2.5" /> OK
                    </StatusPill>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
