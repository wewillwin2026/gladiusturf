import { TodayDashboard } from "@/components/app/TodayDashboard";
import { demoState } from "@/lib/demo/state";
import { rng } from "@/lib/shared/prng";
import type { KPI } from "@/lib/shared/types";

export const dynamic = "force-dynamic";

const STATUSES = ["Dispatched", "OnSite", "Returning", "Off"] as const;

export default function AppHomePage() {
  const state = demoState();
  const r = rng(2031);

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const greeting = `Today, ${dayName} ${monthDay}`;
  const subtitle = `${state.company.crewCount} crews dispatched · ${countToday(state.jobs)} visits scheduled · ${expectedToday(state.jobs)} expected.`;

  const kpis: KPI[] = [
    {
      label: "Revenue · this month",
      value: "$148,420",
      delta: "+18.2%",
      trend: "up",
      spark: spark(r, 14, 100, 168),
    },
    {
      label: "Open quotes",
      value: String(state.quotes.filter((q) => q.stage === "Sent" || q.stage === "Viewed").length),
      delta: "+9 this week",
      trend: "up",
      spark: spark(r, 14, 8, 14),
    },
    {
      label: "Visits remaining",
      value: String(state.jobs.filter((j) => j.status === "Scheduled" && isToday(j.scheduledAt)).length),
      delta: `${countToday(state.jobs)} total`,
      trend: "flat",
      spark: spark(r, 14, 14, 28),
    },
    {
      label: "AR · over 30 days",
      value: "$8,940",
      delta: "−$1,210",
      trend: "down",
      spark: spark(r, 14, 4, 12),
    },
  ];

  const crews = state.crews.map((crew, i) => {
    const jobsForCrew = state.jobs.filter(
      (j) => j.crewId === crew.id && isToday(j.scheduledAt),
    );
    return {
      crew,
      status: STATUSES[i % STATUSES.length]!,
      jobsToday: jobsForCrew.length,
      revenueTodayCents: jobsForCrew.reduce((s, j) => s + j.priceCents, 0),
    };
  });

  const funnel = {
    sent: state.quotes.filter((q) => q.stage === "Sent").length + state.quotes.filter((q) => q.stage === "Viewed").length + state.quotes.filter((q) => q.stage === "Won").length,
    viewed: state.quotes.filter((q) => q.stage === "Viewed").length + state.quotes.filter((q) => q.stage === "Won").length,
    won: state.quotes.filter((q) => q.stage === "Won").length,
    scheduled: state.quotes.filter((q) => q.stage === "Won").length,
  };

  return (
    <TodayDashboard
      product="demo"
      greeting={greeting}
      subtitle={subtitle}
      kpis={kpis}
      crews={crews}
      activity={state.activity}
      funnel={funnel}
    />
  );
}

function spark(r: ReturnType<typeof rng>, n: number, lo: number, hi: number) {
  return Array.from({ length: n }, () => r.int(lo, hi));
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function countToday(jobs: { scheduledAt: string }[]): number {
  return jobs.filter((j) => isToday(j.scheduledAt)).length;
}

function expectedToday(jobs: { scheduledAt: string; priceCents: number }[]): string {
  const total = jobs
    .filter((j) => isToday(j.scheduledAt))
    .reduce((s, j) => s + j.priceCents, 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(total / 100);
}
