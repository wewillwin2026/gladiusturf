import { TodayDashboard } from "@/components/app/TodayDashboard";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { demoState } from "@/lib/demo/state";
import { rng } from "@/lib/shared/prng";
import type { ActivityEvent, KPI } from "@/lib/shared/types";

export const dynamic = "force-dynamic";

const STATUSES = ["Dispatched", "OnSite", "Returning", "Off"] as const;

export default async function AppHomePage() {
  const session = await readAppSession();

  // Tenant session — render real KPIs from the tenant's data.
  if (session.kind === "tenant") {
    const sb = supabaseAdmin();
    const [customersRes, fixturesRes] = await Promise.all([
      sb
        .from("customers")
        .select("id, customer_tier, preferred_language", { count: "exact" })
        .eq("tenant_id", session.tenant.id),
      sb
        .from("lighting_fixtures")
        .select("id, warranty_status, warranty_end", { count: "exact" })
        .eq("tenant_id", session.tenant.id),
    ]);

    const customers = customersRes.data ?? [];
    const fixtures = fixturesRes.data ?? [];

    const customerCount = customersRes.count ?? customers.length;
    const fixtureCount = fixturesRes.count ?? fixtures.length;
    const activeWarranties = fixtures.filter(
      (f) => f.warranty_status === "active" || f.warranty_status === "lifetime",
    ).length;
    const noPlan = customers.filter((c) => !c.customer_tier).length;

    // Warranties expiring within 90 days — none in seed today, but the math
    // is wired so it lights up the day Cristian backfills more inventory.
    const now = Date.now();
    const expiringSoon = fixtures.filter((f) => {
      if (f.warranty_status !== "active" || !f.warranty_end) return false;
      const ms = new Date(f.warranty_end).getTime() - now;
      return ms > 0 && ms < 90 * 86400_000;
    }).length;

    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
    const monthDay = today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    const greeting = `Today, ${dayName} ${monthDay}`;
    const subtitle =
      `${customerCount} customers · ${fixtureCount} fixtures tracked · ` +
      `${noPlan} on no plan — ${
        noPlan > 0 ? `${dollar(noPlan * 31500)} of plan revenue available` : "all on plans"
      }.`;

    const r = rng(2031);
    const kpis: KPI[] = [
      {
        label: "Customers",
        value: String(customerCount),
        delta: customerCount === 0 ? "no customers yet" : `${session.tenant.display_name}`,
        trend: customerCount > 0 ? "up" : "flat",
        spark: spark(r, 14, 1, Math.max(2, customerCount)),
      },
      {
        label: "Fixtures tracked",
        value: String(fixtureCount),
        delta: fixtureCount === 0 ? "add inventory" : `${activeWarranties} under warranty`,
        trend: fixtureCount > 0 ? "up" : "flat",
        spark: spark(r, 14, 0, Math.max(2, fixtureCount)),
      },
      {
        label: "Plan upsell open",
        value: String(noPlan),
        delta:
          noPlan > 0
            ? `${dollar(noPlan * 31500)} ARR potential`
            : "all on plans",
        trend: noPlan > 0 ? "up" : "flat",
        spark: spark(r, 14, 0, Math.max(2, noPlan)),
      },
      {
        label: "Warranties expiring · 90d",
        value: String(expiringSoon),
        delta: expiringSoon > 0 ? "send Cast outreach" : "no exposure",
        trend: expiringSoon > 0 ? "down" : "flat",
        spark: spark(r, 14, 0, Math.max(2, expiringSoon + 1)),
      },
    ];

    // No crews / activity / funnel data in v1 multi-tenant schema yet.
    // Pass empty arrays — TodayDashboard renders graceful empty states.
    const activity: ActivityEvent[] = [];

    return (
      <TodayDashboard
        product="founders"
        eyebrowOverride={`${session.tenant.display_name} · Live`}
        greeting={greeting}
        subtitle={subtitle}
        kpis={kpis}
        crews={[]}
        activity={activity}
        funnel={{ sent: 0, viewed: 0, won: 0, scheduled: 0 }}
      />
    );
  }

  // Demo session — preserve the existing seeded Cypress Lawn dashboard.
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
  return dollar(
    jobs
      .filter((j) => isToday(j.scheduledAt))
      .reduce((s, j) => s + j.priceCents, 0),
  );
}

function dollar(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
