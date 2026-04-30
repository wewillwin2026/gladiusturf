import { ArrowDown, Activity } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { SecretEmptyState } from "@/components/app/SecretEmptyState";
import { loadFunnelCounts } from "@/lib/tracking/queries";
import { num } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

export default async function SecretFunnelPage() {
  const counts = await loadFunnelCounts(30);

  const stages = [
    {
      label: "Marketing visit",
      key: "marketingVisits" as const,
      blurb: "pageview anywhere on gladiusturf.com",
    },
    {
      label: "/demo form focus",
      key: "demoFormFocus" as const,
      blurb: "first interaction with any field",
    },
    {
      label: "/demo form submit",
      key: "demoFormSubmit" as const,
      blurb: "completed booking",
    },
    {
      label: "Demo CRM login",
      key: "demoLogins" as const,
      blurb: "they actually opened /app",
    },
    {
      label: "AI Quote drafted",
      key: "quoteDrafted" as const,
      blurb: "they used the highest-impact engine",
    },
    {
      label: "Settings → Billing view",
      key: "settingsBilling" as const,
      blurb: "they read the competitive comparison",
    },
  ];

  const total = counts.marketingVisits || 1;
  const totalForDisplay = stages.reduce((s, st) => Math.max(s, counts[st.key]), 0);

  const isEmpty =
    counts.schemaMissing ||
    stages.every((s) => counts[s.key] === 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Founders Only"
        title="Secret · Funnel"
        subtitle="Quote-to-cash waterfall. Marketing visit → demo CRM → AI Quote → Settings/Billing → signed."
        actions={
          <StatusPill tone="accent">
            <Activity className="h-3 w-3" />
            Last 30 days
          </StatusPill>
        }
      />

      {isEmpty ? (
        <SecretEmptyState
          schemaMissing={counts.schemaMissing}
          title={
            counts.schemaMissing
              ? "Tracking schema not live yet"
              : "No funnel events yet — drive some traffic and refresh."
          }
        />
      ) : (
        <section className="g-card p-5">
          <div className="flex flex-col gap-3">
            {stages.map((s, i) => {
              const v = counts[s.key];
              const widthPct = totalForDisplay > 0 ? (v / totalForDisplay) * 100 : 0;
              const conversionFromTop = total > 0 ? (v / total) * 100 : 0;
              const dropFromPrev =
                i > 0 ? counts[stages[i - 1]!.key] - v : 0;
              return (
                <div key={s.key}>
                  <div className="flex items-baseline justify-between text-[12px] mb-1">
                    <div>
                      <span className="text-g-text">{s.label}</span>
                      <span className="ml-2 text-g-text-faint text-[11px]">{s.blurb}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-g-text">{num(v)}</span>
                      <span className="font-mono text-[11px] text-g-text-faint w-[64px] text-right">
                        {conversionFromTop.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div
                    className="h-7 rounded-md bg-g-accent flex items-center justify-end pr-3 text-[10px] font-mono text-obsidian/80"
                    style={{ width: `${widthPct}%`, opacity: 1 - i * 0.13 }}
                  >
                    {widthPct > 14 ? num(v) : ""}
                  </div>
                  {i < stages.length - 1 && dropFromPrev > 0 && (
                    <div className="mt-1 ml-1 inline-flex items-center gap-1 text-[10px] text-g-text-faint">
                      <ArrowDown className="h-2.5 w-2.5" />
                      {num(dropFromPrev)} dropped
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-g-border-subtle grid grid-cols-3 gap-3 text-[12px]">
            <div>
              <div className="text-g-text-faint uppercase tracking-[0.14em] text-[10px]">
                Visit → Booking
              </div>
              <div className="mt-1 font-mono text-g-text">
                {counts.marketingVisits > 0
                  ? ((counts.demoFormSubmit / counts.marketingVisits) * 100).toFixed(2)
                  : "0.00"}
                %
              </div>
            </div>
            <div>
              <div className="text-g-text-faint uppercase tracking-[0.14em] text-[10px]">
                Booking → Login
              </div>
              <div className="mt-1 font-mono text-g-text">
                {counts.demoFormSubmit > 0
                  ? ((counts.demoLogins / counts.demoFormSubmit) * 100).toFixed(0)
                  : "0"}
                %
              </div>
            </div>
            <div>
              <div className="text-g-text-faint uppercase tracking-[0.14em] text-[10px]">
                Login → Engaged
              </div>
              <div className="mt-1 font-mono text-g-text">
                {counts.demoLogins > 0
                  ? ((counts.quoteDrafted / counts.demoLogins) * 100).toFixed(0)
                  : "0"}
                %
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
