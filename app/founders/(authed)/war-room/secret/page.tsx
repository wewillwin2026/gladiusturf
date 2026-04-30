import { Eye, FileSpreadsheet, LogIn, Sparkles, UserCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { SecretEmptyState } from "@/components/app/SecretEmptyState";
import { loadOverviewCounts } from "@/lib/tracking/queries";
import { num } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

function delta(today: number, yesterday: number): {
  text: string;
  trend: "up" | "down" | "flat";
} {
  if (yesterday === 0) {
    return today > 0
      ? { text: "+∞ vs yesterday", trend: "up" }
      : { text: "—", trend: "flat" };
  }
  const pct = ((today - yesterday) / yesterday) * 100;
  if (pct > 5) return { text: `+${pct.toFixed(0)}% vs yesterday`, trend: "up" };
  if (pct < -5) return { text: `${pct.toFixed(0)}% vs yesterday`, trend: "down" };
  return { text: "± yesterday", trend: "flat" };
}

export default async function SecretOverviewPage() {
  const counts = await loadOverviewCounts();

  const kpis = [
    {
      label: "Visitors today",
      value: num(counts.visitorsToday),
      delta: delta(counts.visitorsToday, counts.visitorsYesterday),
      icon: Users,
      sub: `${num(counts.visitors7d)} unique · last 7 days`,
    },
    {
      label: "Demo bookings today",
      value: num(counts.bookingsToday),
      delta: { text: `${num(counts.bookings7d)} this week`, trend: "up" as const },
      icon: FileSpreadsheet,
      sub: `${num(counts.bookings7d)} bookings · last 7 days`,
    },
    {
      label: "Demo logins today",
      value: num(counts.demoLoginsToday),
      delta: { text: `${num(counts.demoLogins7d)} this week`, trend: "up" as const },
      icon: LogIn,
      sub: `${num(counts.demoLogins7d)} logins · last 7 days`,
    },
    {
      label: "Signed today",
      value: num(counts.signedToday),
      delta: {
        text: `${num(counts.signed7d)} this week`,
        trend: counts.signed7d > 0 ? ("up" as const) : ("flat" as const),
      },
      icon: UserCheck,
      sub: `${num(counts.signed7d)} closed · last 7 days`,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Founders Only"
        title="Secret · Overview"
        subtitle="Bloomberg-grade view of every visit, conversion, and falloff across gladiusturf.com."
        actions={
          <StatusPill tone="accent">
            <Eye className="h-3 w-3" />
            Read-only · Ricardo + Joshua
          </StatusPill>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="g-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                {k.label}
              </span>
              <k.icon className="h-3.5 w-3.5 text-g-text-faint" />
            </div>
            <div className="font-mono text-[28px] text-g-text leading-none">
              {k.value}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span
                className={`text-[11px] font-mono ${
                  k.delta.trend === "up"
                    ? "text-g-success"
                    : k.delta.trend === "down"
                      ? "text-g-danger"
                      : "text-g-text-faint"
                }`}
              >
                {k.delta.text}
              </span>
              <span className="text-[10px] text-g-text-faint truncate">
                {k.sub}
              </span>
            </div>
          </div>
        ))}
      </section>

      {counts.schemaMissing && (
        <SecretEmptyState
          schemaMissing
          title="Tracking schema is not live yet"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <KPICard
          label="Visitors · last 7 days"
          value={num(counts.visitors7d)}
          delta={`${num(counts.visitorsToday)} today`}
          trend="up"
        />
        <KPICard
          label="Conversion this week"
          value={
            counts.bookings7d > 0
              ? `${((counts.signed7d / counts.bookings7d) * 100).toFixed(0)}%`
              : "0%"
          }
          delta={`${num(counts.signed7d)} won / ${num(counts.bookings7d)} booked`}
          trend={counts.signed7d > 0 ? "up" : "flat"}
        />
      </div>

      <section className="g-card p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-g-accent mt-0.5 shrink-0" />
          <div>
            <h3 className="text-g-text">What this tab does</h3>
            <p className="mt-1 text-[12px] text-g-text-muted leading-relaxed">
              The Secret Tab is the marketing intelligence layer founders see and
              the demo CRM does not. Visits, sessions, and every click — including
              rage-clicks and dead-clicks — flow into Supabase via{" "}
              <code className="font-mono text-g-accent">/api/track</code>. Use the
              left rail to drill into Visits, Funnel, Falloff, Attribution,
              Replays, and the Compare battle cards.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
