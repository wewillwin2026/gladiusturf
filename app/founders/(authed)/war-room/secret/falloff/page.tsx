import { AlertTriangle, MousePointerClick, Zap } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { SecretEmptyState } from "@/components/app/SecretEmptyState";
import { loadFalloff } from "@/lib/tracking/queries";
import { num } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

export default async function SecretFalloffPage() {
  const data = await loadFalloff(30);
  const isEmpty =
    data.schemaMissing ||
    (data.exitPages.length === 0 &&
      data.rageClicks === 0 &&
      data.deadClicks === 0);

  const maxExits = Math.max(1, ...data.exitPages.map((p) => p.exits));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Founders Only"
        title="Secret · Falloff"
        subtitle="Where attention dies. Top exit pages, rage-click density, dead-click count."
        actions={
          <StatusPill tone="warning">
            <AlertTriangle className="h-3 w-3" />
            Last 30 days
          </StatusPill>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Exit events"
          value={num(data.exitPages.reduce((s, p) => s + p.exits, 0))}
          delta={`${data.exitPages.length} unique pages`}
          trend="flat"
        />
        <KPICard
          label="Rage clicks"
          value={num(data.rageClicks)}
          delta="3+ clicks <800ms"
          trend={data.rageClicks > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Dead clicks"
          value={num(data.deadClicks)}
          delta="non-interactive elements"
          trend={data.deadClicks > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Top exit page"
          value={data.exitPages[0]?.path?.slice(0, 18) || "—"}
          delta={
            data.exitPages[0] ? `${num(data.exitPages[0].exits)} exits` : "—"
          }
          trend="flat"
        />
      </section>

      {isEmpty ? (
        <SecretEmptyState
          schemaMissing={data.schemaMissing}
          title={
            data.schemaMissing
              ? "Tracking schema not live yet"
              : "No falloff events captured. Either everyone is converting, or no traffic yet."
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3">
          <section className="g-card overflow-hidden">
            <header className="px-5 py-3 border-b border-g-border-subtle">
              <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
                Top exit pages · ranked
              </h2>
            </header>
            <div className="px-5 py-2">
              {data.exitPages.map((p, i) => (
                <div
                  key={p.path + i}
                  className="grid grid-cols-[40px_1fr_2fr_80px] items-center gap-3 py-3 border-b border-g-border-subtle/60 last:border-b-0 text-[12px]"
                >
                  <span className="font-mono text-[10px] text-g-text-faint">
                    #{i + 1}
                  </span>
                  <span className="font-mono text-g-text truncate">{p.path}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-g-surface-2 overflow-hidden">
                      <div
                        className="h-full bg-g-warning"
                        style={{ width: `${(p.exits / maxExits) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-g-text text-right">
                    {num(p.exits)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="g-card p-4">
            <h3 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint mb-3">
              Frustration signal
            </h3>
            <div className="flex flex-col gap-3">
              <div className="rounded-md border border-g-warning/30 bg-g-warning/5 p-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-g-warning" />
                  <span className="text-[12px] text-g-text">Rage clicks</span>
                </div>
                <div className="mt-1 font-mono text-[18px] text-g-warning">
                  {num(data.rageClicks)}
                </div>
                <div className="text-[10px] text-g-text-faint">
                  3+ clicks within 800ms in a 40px radius
                </div>
              </div>
              <div className="rounded-md border border-g-info/30 bg-g-info/5 p-3">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="h-3.5 w-3.5 text-g-info" />
                  <span className="text-[12px] text-g-text">Dead clicks</span>
                </div>
                <div className="mt-1 font-mono text-[18px] text-g-info">
                  {num(data.deadClicks)}
                </div>
                <div className="text-[10px] text-g-text-faint">
                  clicks on something that wasn&rsquo;t a link/button/input
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
