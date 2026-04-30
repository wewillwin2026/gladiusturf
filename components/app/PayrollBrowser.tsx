import * as React from "react";
import { CheckCircle2, Download, FileSpreadsheet, Send } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { type ProductKind } from "./engines";
import { demoState } from "@/lib/demo/state";
import { rng } from "@/lib/shared/prng";
import { money, pct } from "@/lib/shared/format";

export function PayrollBrowser({ product }: { product: ProductKind }) {
  const { crews } = demoState();
  const r = rng(160);
  const rows = crews.flatMap((c) =>
    c.members.map((m, i) => {
      const hourly = m.role === "Lead" ? r.float(28, 32) : r.float(20, 24);
      const hours = r.float(34, 44);
      const ot = r.float(0, 4);
      const reg = hourly * hours;
      const otGross = hourly * 1.5 * ot;
      const gross = reg + otGross;
      return {
        id: `${c.id}_${i}`,
        tech: m.name,
        crew: c.name,
        role: m.role,
        rate: hourly,
        hours,
        ot,
        reg: Math.round(reg * 100),
        otGross: Math.round(otGross * 100),
        gross: Math.round(gross * 100),
      };
    }),
  );

  const totalGross = rows.reduce((s, t) => s + t.gross, 0);
  const totalReg = rows.reduce((s, t) => s + t.reg, 0);
  const totalOt = rows.reduce((s, t) => s + t.otGross, 0);
  const totalHours = rows.reduce((s, t) => s + t.hours, 0);
  const totalOtHours = rows.reduce((s, t) => s + t.ot, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Payroll"
        subtitle="Weekly run preview. Exports to Gusto, ADP, Paychex."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button variant="primary" size="sm">
              <Send className="h-3.5 w-3.5" /> Run payroll
            </Button>
          </div>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Gross · this week" value={money(totalGross)} delta="+$280" trend="up" />
        <KPICard label="Techs" value={String(rows.length)} />
        <KPICard
          label="OT % of hours"
          value={pct((totalOtHours / totalHours) * 100, 1)}
          delta="−0.4 pts"
          trend="down"
        />
        <KPICard label="Run unblocked" value="Yes" delta="Friday 12:00" trend="flat" />
      </section>

      <section className="g-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            This week&rsquo;s composition
          </h3>
          <span className="font-mono text-[12px] text-g-text">
            {money(totalGross)}
          </span>
        </div>
        <div className="flex h-9 rounded-md overflow-hidden border border-g-border-subtle">
          <div
            className="bg-g-accent flex items-center justify-end pr-2 text-[10px] font-mono text-obsidian"
            style={{ width: `${(totalReg / totalGross) * 100}%` }}
          >
            REG {money(totalReg)}
          </div>
          <div
            className="bg-g-warning/70 flex items-center justify-end pr-2 text-[10px] font-mono text-obsidian"
            style={{ width: `${(totalOt / totalGross) * 100}%` }}
          >
            OT {money(totalOt)}
          </div>
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
          <span>Regular hours · {totalHours.toFixed(1)}h</span>
          <span>OT hours · {totalOtHours.toFixed(1)}h</span>
        </div>
      </section>

      <section className="g-card overflow-hidden">
        <header className="px-5 py-3 border-b border-g-border-subtle flex items-center justify-between">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            Per-tech preview
          </h2>
          <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
            Auto-pull Friday 12:00
          </span>
        </header>
        <div className="px-5 py-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[200px_120px_100px_100px_120px] items-center gap-3 py-2.5 border-b border-g-border-subtle/60 last:border-b-0 text-[12px]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Avatar name={row.tech} size="sm" />
                <div className="min-w-0">
                  <div className="text-g-text truncate">{row.tech}</div>
                  <div className="text-[10px] text-g-text-faint">{row.crew}</div>
                </div>
              </div>
              <span className="font-mono text-g-text-muted">
                ${row.rate.toFixed(2)}/hr
              </span>
              <span className="font-mono text-g-text">{row.hours.toFixed(1)}h</span>
              <span className={`font-mono ${row.ot > 2 ? "text-g-warning" : "text-g-info"}`}>
                {row.ot.toFixed(1)}h OT
              </span>
              <div className="text-right">
                <span className="font-mono text-g-text">{money(row.gross)}</span>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-[200px_120px_100px_100px_120px] items-center gap-3 py-3 border-t-2 border-g-border-subtle text-[12px]">
            <span className="font-medium text-g-text">Total</span>
            <span></span>
            <span className="font-mono text-g-text">{totalHours.toFixed(1)}h</span>
            <span className="font-mono text-g-info">{totalOtHours.toFixed(1)}h OT</span>
            <div className="text-right font-mono text-[14px] text-g-accent">
              {money(totalGross)}
            </div>
          </div>
        </div>
      </section>

      <section className="g-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-g-accent-faint border border-g-accent/40 flex items-center justify-center text-g-accent">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[13px] text-g-text">Ready to run</div>
            <div className="text-[11px] text-g-text-faint">
              All timesheets approved · 0 disputes pending
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Download className="h-3.5 w-3.5" /> Gusto
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-3.5 w-3.5" /> ADP
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-3.5 w-3.5" /> Paychex
          </Button>
        </div>
      </section>
    </div>
  );
}
