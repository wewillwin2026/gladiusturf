import * as React from "react";
import { ArrowRight, Award, Gift, Trophy } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { StatusPill } from "./ui/StatusPill";
import { Avatar } from "./ui/Avatar";
import { type ProductKind } from "./engines";
import { demoState } from "@/lib/demo/state";
import { rng } from "@/lib/shared/prng";
import { money, shortDate } from "@/lib/shared/format";

const STATUS_TONE: Record<string, "neutral" | "info" | "success" | "warning"> = {
  Pending: "neutral",
  Booked: "info",
  Won: "success",
  Lost: "warning",
};

export function ReferralsBrowser({ product }: { product: ProductKind }) {
  const { customers } = demoState();
  const r = rng(120);
  const referrals = customers.slice(0, 24).map((c, i) => ({
    id: `ref_${i}`,
    referrer: c,
    referred: customers[(i + 100) % customers.length]!,
    status: ["Pending", "Booked", "Won", "Won", "Won", "Lost"][r.int(0, 5)]!,
    payoutCents: r.int(2500, 12000),
    when: c.joinedAt,
  }));

  // Leaderboard — count Won referrals per referrer
  const counts = new Map<string, { name: string; won: number; payout: number }>();
  referrals.forEach((rf) => {
    const k = rf.referrer.name;
    const cur = counts.get(k) || { name: k, won: 0, payout: 0 };
    if (rf.status === "Won") {
      cur.won += 1;
      cur.payout += rf.payoutCents;
    }
    counts.set(k, cur);
  });
  const leaderboard = Array.from(counts.values())
    .sort((a, b) => b.won - a.won || b.payout - a.payout)
    .filter((l) => l.won > 0)
    .slice(0, 6);

  const wonCount = referrals.filter((rf) => rf.status === "Won").length;
  const totalPayout = referrals
    .filter((rf) => rf.status === "Won")
    .reduce((s, rf) => s + rf.payoutCents, 0);
  const conversion = (wonCount / referrals.length) * 100;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Referrals"
        subtitle="Source attribution & payouts. Promoter chains, who&rsquo;s sending the most lawns."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Active referrers" value={String(counts.size)} delta="+5" trend="up" />
        <KPICard label="Won · 30d" value={String(wonCount)} delta="+4" trend="up" />
        <KPICard label="Conversion" value={`${conversion.toFixed(0)}%`} delta="+6 pts" trend="up" />
        <KPICard label="Payouts · YTD" value={money(totalPayout)} delta="−$60" trend="down" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <section className="g-card overflow-hidden">
          <header className="px-5 py-3 border-b border-g-border-subtle">
            <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
              Recent referrals
            </h2>
          </header>
          <div className="px-2">
            {referrals.slice(0, 14).map((rf) => (
              <div
                key={rf.id}
                className="flex items-center gap-3 px-3 py-3 border-b border-g-border-subtle/60 last:border-b-0"
              >
                <Avatar name={rf.referrer.name} size="sm" />
                <span className="text-[12px] text-g-text-muted truncate min-w-0 max-w-[140px]">
                  {rf.referrer.name}
                </span>
                <ArrowRight className="h-3 w-3 text-g-accent shrink-0" />
                <Avatar name={rf.referred.name} size="sm" tone="accent" />
                <span className="text-[12px] text-g-text truncate min-w-0 max-w-[140px]">
                  {rf.referred.name}
                </span>
                <div className="flex-1" />
                <span className="font-mono text-[11px] text-g-text-muted">
                  {money(rf.payoutCents)}
                </span>
                <StatusPill tone={STATUS_TONE[rf.status] || "neutral"}>
                  {rf.status}
                </StatusPill>
                <span className="font-mono text-[10px] text-g-text-faint hidden md:inline w-[72px] text-right">
                  {shortDate(rf.when)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="g-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-g-warning" />
              <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
                Top referrers
              </h2>
            </div>
            <Gift className="h-3.5 w-3.5 text-g-text-faint" />
          </div>
          <div className="flex flex-col gap-2.5">
            {leaderboard.map((l, i) => (
              <div
                key={l.name}
                className="flex items-center gap-3 rounded-md border border-g-border-subtle bg-g-surface-2/40 px-3 py-2.5"
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
                    i === 0
                      ? "text-g-warning"
                      : i === 1
                        ? "text-g-info"
                        : "text-g-text-faint"
                  }`}
                >
                  {i === 0 && <Award className="inline h-3 w-3 mr-0.5" />}#{i + 1}
                </span>
                <Avatar name={l.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-g-text truncate">{l.name}</div>
                  <div className="text-[10px] text-g-text-faint">
                    {l.won} won · {money(l.payout)}
                  </div>
                </div>
                <span className="font-mono text-[11px] text-g-accent">
                  {l.won}×
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
