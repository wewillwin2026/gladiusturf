import { TodayDashboard } from "@/components/app/TodayDashboard";
import { TenantOnboardingHero } from "@/components/app/TenantOnboardingHero";
import { OnboardingChecklist } from "@/components/app/OnboardingChecklist";
import { StormRadarTile } from "@/components/app/StormRadarTile";
import {
  OwnersDailyOneLiner,
  pickNextMove,
} from "@/components/app/OwnersDailyOneLiner";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { demoState } from "@/lib/demo/state";
import { rng } from "@/lib/shared/prng";
import { registryFor } from "@/lib/vertical/registry";
import { FL_HURRICANE_ZIPS } from "@/lib/storm/zips";
import type { ActivityEvent, KPI } from "@/lib/shared/types";

export const dynamic = "force-dynamic";

const STATUSES = ["Dispatched", "OnSite", "Returning", "Off"] as const;

export default async function AppHomePage() {
  const session = await readAppSession();

  // Tenant session — render real KPIs from the tenant's data.
  if (session.kind === "tenant") {
    const sb = supabaseAdmin();
    const reg = registryFor(session.tenant.vertical);
    // Vertical-aware asset query. Skip if the vertical's asset table isn't
    // wired yet (placeholder entries) — buildAssetKpis handles empty rows.
    const assetQuery =
      reg.assetTable === "__placeholder__"
        ? Promise.resolve({ data: [], error: null, count: 0 })
        : sb
            .from(reg.assetTable)
            .select(reg.countSelect, { count: "exact" })
            .eq("tenant_id", session.tenant.id);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthIso = startOfMonth.toISOString();
    const ninetyDaysAgoIso = new Date(
      Date.now() - 90 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const startOfTodayIso = new Date(
      new Date().setHours(0, 0, 0, 0),
    ).toISOString();
    const endOfTodayIso = new Date(
      new Date().setHours(23, 59, 59, 999),
    ).toISOString();

    const [
      customersRes,
      assetsRes,
      starterItemsRes,
      starterUnitsRes,
      proposalsRes,
      visitsThisMonthRes,
      staleUnitsRes,
      scheduledTodayRes,
      proposalsWithQuestionsRes,
    ] = await Promise.all([
      sb
        .from("customers")
        .select(
          "id, customer_tier, preferred_language, service_address",
          { count: "exact" },
        )
        .eq("tenant_id", session.tenant.id),
      assetQuery,
      sb
        .from("inventory_items")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", session.tenant.id)
        .eq("is_starter", true),
      sb
        .from("inventory_units")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", session.tenant.id)
        .eq("is_starter", true),
      sb
        .from("proposals")
        .select("id, status")
        .eq("tenant_id", session.tenant.id),
      sb
        .from("schedule_items")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", session.tenant.id)
        .gte("starts_at", startOfMonthIso),
      sb
        .from("inventory_units")
        .select("cost_cents, received_at")
        .eq("tenant_id", session.tenant.id)
        .eq("status", "in_stock")
        .lt("received_at", ninetyDaysAgoIso),
      sb
        .from("schedule_items")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", session.tenant.id)
        .gte("starts_at", startOfTodayIso)
        .lte("starts_at", endOfTodayIso)
        .in("status", ["scheduled", "en_route", "on_site"]),
      sb
        .from("proposals")
        .select("bom, status")
        .eq("tenant_id", session.tenant.id)
        .neq("status", "lost"),
    ]);

    const customers = customersRes.data ?? [];
    const assets = (
      Array.isArray(assetsRes.data) ? assetsRes.data : []
    ) as unknown as Array<Record<string, unknown>>;

    const customerCount = customersRes.count ?? customers.length;

    // Day-1 onboarding: tenant has no customers yet. Show the welcome hero
    // instead of a sea of zeroed KPIs that look broken.
    if (customerCount === 0) {
      return (
        <TenantOnboardingHero
          tenant={session.tenant}
          starterItemCount={starterItemsRes.count ?? 0}
          starterUnitCount={starterUnitsRes.count ?? 0}
        />
      );
    }
    const fixtureCount = assets.length;
    const noPlan = customers.filter((c) => !c.customer_tier).length;

    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
    const monthDay = today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    const greeting = `Today, ${dayName} ${monthDay}`;
    const subtitle =
      `${customerCount} customers · ${fixtureCount} ${reg.assetLabelPlural} tracked · ` +
      `${noPlan} on no plan — ${
        noPlan > 0 ? `${dollar(noPlan * 31500)} of plan revenue available` : "all on plans"
      }.`;

    const r = rng(2031);
    const verticalKpis = reg.buildAssetKpis(assets, {
      customerCount,
      tenantName: session.tenant.display_name,
    });
    // Inject sparkline data the registry doesn't generate (it's purely a
    // visual flourish, not part of the vertical's domain math).
    for (const k of verticalKpis) {
      if (!k.spark || k.spark.length === 0) {
        const ceil = Number.isFinite(Number(k.value))
          ? Math.max(2, Number(k.value) + 1)
          : 2;
        k.spark = spark(r, 14, 0, ceil);
      }
    }
    // Pad the universal "Plan upsell open" KPI on the end if the vertical
    // builder returned fewer than 4 cards.
    const planUpsellKpi: KPI = {
      label: "Plan upsell open",
      value: String(noPlan),
      delta:
        noPlan > 0
          ? `${dollar(noPlan * 31500)} ARR potential`
          : "all on plans",
      trend: noPlan > 0 ? "up" : "flat",
      spark: spark(r, 14, 0, Math.max(2, noPlan)),
    };
    const kpis: KPI[] = [...verticalKpis, planUpsellKpi].slice(0, 4);

    // No crews / activity / funnel data in v1 multi-tenant schema yet.
    // Pass empty arrays — TodayDashboard renders graceful empty states.
    const activity: ActivityEvent[] = [];

    // Storm Radar — count customers in watched FL hurricane ZIPs. Calm
    // most days; pulses red when even one customer falls in the watched
    // footprint. v2 will pull live NOAA active-storm reports.
    const inStormZipCount = customers.filter((row) => {
      const zip = (row as { service_address?: { zip?: string } })
        .service_address?.zip;
      return zip ? FL_HURRICANE_ZIPS.has(zip) : false;
    }).length;
    const guardianInStormCount = customers.filter((row) => {
      const r = row as {
        service_address?: { zip?: string };
        customer_tier?: string | null;
      };
      const zip = r.service_address?.zip;
      const tier = (r.customer_tier ?? "").toLowerCase();
      return (
        zip != null &&
        FL_HURRICANE_ZIPS.has(zip) &&
        tier.includes("guardian")
      );
    }).length;

    // Owner's Daily One-Liner inputs — Strategy + Product mandate
    const proposals = (proposalsRes.data ?? []) as Array<{
      id: string;
      status: string;
    }>;
    const draftQuotesCount = proposals.filter((p) => p.status === "draft").length;
    const inFlightQuotesCount = proposals.filter(
      (p) => p.status === "sent" || p.status === "viewed",
    ).length;
    const recentVisitsCount = visitsThisMonthRes.count ?? 0;
    const staleUnits = (staleUnitsRes.data ?? []) as Array<{
      cost_cents: number | null;
      received_at: string;
    }>;
    const staleInventoryCount = staleUnits.length;
    const staleInventoryDollarsCents = staleUnits.reduce(
      (s, u) => s + (u.cost_cents ?? 0),
      0,
    );
    const oldestStaleAgeDays =
      staleUnits.length > 0
        ? Math.max(
            ...staleUnits.map((u) =>
              Math.floor(
                (Date.now() - new Date(u.received_at).getTime()) /
                  (24 * 60 * 60 * 1000),
              ),
            ),
          )
        : null;
    const scheduledTodayCount = scheduledTodayRes.count ?? 0;
    const proposalsWithQuestions = (proposalsWithQuestionsRes.data ?? []) as Array<{
      bom: { questions?: Array<{ at: string; text: string }> } | null;
      status: string;
    }>;
    const openQuestionsCount = proposalsWithQuestions.reduce(
      (s, p) => s + (p.bom?.questions?.length ?? 0),
      0,
    );

    const briefingInputs = {
      tenantName: session.tenant.display_name,
      customerCount,
      draftQuotesCount,
      inFlightQuotesCount,
      recentVisitsCount,
      staleInventoryCount,
      staleInventoryDollarsCents,
      inStormZipCount,
      oldestStaleAgeDays,
      scheduledTodayCount,
      openQuestionsCount,
    };

    // Compute pickNextMove ONCE so the audit row and the rendered CTA
    // are guaranteed to agree. Calling it twice creates a clock-straddle
    // bug at midnight UTC where the audit and the CTA disagree.
    const move = pickNextMove(briefingInputs);

    // Record the priority decision for AI Director's audit substrate —
    // one row per (tenant, UTC date, choice). Refreshes within the same
    // day are no-ops via the unique index. Best-effort; a write failure
    // never blocks the dashboard render. Catches missing-table errors
    // gracefully so the action survives the deploy-before-migration
    // window for 20260507_h_priority_decision.sql.
    try {
      const inputsForAudit = {
        customerCount,
        draftQuotesCount,
        inFlightQuotesCount,
        recentVisitsCount,
        staleInventoryCount,
        staleInventoryDollarsCents,
        inStormZipCount,
        oldestStaleAgeDays,
        scheduledTodayCount,
        openQuestionsCount,
      };
      await sb.from("priority_decision").insert({
        tenant_id: session.tenant.id,
        shown_choice: move.choice,
        inputs: inputsForAudit,
        href: move.href,
        cta: move.cta,
      });
    } catch {
      // Migration not yet applied or duplicate-by-design; both ignored.
    }

    return (
      <div className="flex flex-col gap-4">
        <OwnersDailyOneLiner
          briefing={briefingInputs}
          move={move}
        />
        <OnboardingChecklist tenantId={session.tenant.id} />
        <StormRadarTile
          inStormZipCount={inStormZipCount}
          totalCustomerCount={customerCount}
          guardianInStormCount={guardianInStormCount}
        />
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
      </div>
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
