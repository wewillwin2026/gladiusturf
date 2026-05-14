import { TodayDashboard } from "@/components/app/TodayDashboard";
import { TenantOnboardingHero } from "@/components/app/TenantOnboardingHero";
import { OnboardingChecklist } from "@/components/app/OnboardingChecklist";
import { StormRadarTile } from "@/components/app/StormRadarTile";
import { TenantTrendsCard } from "@/components/app/TenantTrendsCard";
import { MarketingTrafficCard } from "@/components/app/MarketingTrafficCard";
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
    // Dashboard greeting — owner-style salutation + the date as a softer
    // eyebrow underneath. Replaces "Today, Monday May 13" which read as a
    // factual restatement of the calendar.
    const greeting = `Dashboard · ${dayName}, ${monthDay}`;
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

    // ---- 30-day vs prior 30-day trends ----
    const now = new Date();
    const thirtyDaysAgoIso = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const sixtyDaysAgoIso = new Date(
      now.getTime() - 60 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [
      quotesSentLast30Res,
      quotesSentPrior30Res,
      proposalsPaidLast30Res,
      proposalsPaidPrior30Res,
      visitsCompletedLast30Res,
      visitsCompletedPrior30Res,
      reviewsLast30Res,
      reviewsPrior30Res,
    ] = await Promise.all([
      sb
        .from("proposals")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", session.tenant.id)
        .gte("sent_at", thirtyDaysAgoIso),
      sb
        .from("proposals")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", session.tenant.id)
        .gte("sent_at", sixtyDaysAgoIso)
        .lt("sent_at", thirtyDaysAgoIso),
      sb
        .from("proposals")
        .select("total_cents")
        .eq("tenant_id", session.tenant.id)
        .in("status", ["sold", "installed"])
        .gte("sold_at", thirtyDaysAgoIso),
      sb
        .from("proposals")
        .select("total_cents")
        .eq("tenant_id", session.tenant.id)
        .in("status", ["sold", "installed"])
        .gte("sold_at", sixtyDaysAgoIso)
        .lt("sold_at", thirtyDaysAgoIso),
      sb
        .from("schedule_items")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", session.tenant.id)
        .eq("status", "completed")
        .gte("starts_at", thirtyDaysAgoIso),
      sb
        .from("schedule_items")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", session.tenant.id)
        .eq("status", "completed")
        .gte("starts_at", sixtyDaysAgoIso)
        .lt("starts_at", thirtyDaysAgoIso),
      sb
        .from("reviews")
        .select("id, rating")
        .eq("tenant_id", session.tenant.id)
        .gte("created_at", thirtyDaysAgoIso),
      sb
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", session.tenant.id)
        .gte("created_at", sixtyDaysAgoIso)
        .lt("created_at", thirtyDaysAgoIso),
    ]);

    const last30PaidRows = (proposalsPaidLast30Res.data ?? []) as Array<{
      total_cents: number | null;
    }>;
    const prior30PaidRows = (proposalsPaidPrior30Res.data ?? []) as Array<{
      total_cents: number | null;
    }>;
    const last30Reviews = (reviewsLast30Res.data ?? []) as Array<{
      id: string;
      rating: number | null;
    }>;
    const last30RevenueCents = last30PaidRows.reduce(
      (s, r) => s + (r.total_cents ?? 0),
      0,
    );
    const prior30RevenueCents = prior30PaidRows.reduce(
      (s, r) => s + (r.total_cents ?? 0),
      0,
    );
    const last30ReviewAvg =
      last30Reviews.length === 0
        ? null
        : last30Reviews.reduce((s, r) => s + (r.rating ?? 0), 0) /
          last30Reviews.length;

    // ---- Marketing traffic summary — 7d vs prior 7d ----
    const sevenDaysAgoIso = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const fourteenDaysAgoIso = new Date(
      now.getTime() - 14 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [
      webSessionsLast7Res,
      webSessionsPrior7Res,
      webSessionsLast7AggRes,
    ] = await Promise.all([
      sb
        .from("web_sessions")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", session.tenant.id)
        .gte("last_seen_at", sevenDaysAgoIso),
      sb
        .from("web_sessions")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", session.tenant.id)
        .gte("last_seen_at", fourteenDaysAgoIso)
        .lt("last_seen_at", sevenDaysAgoIso),
      sb
        .from("web_sessions")
        .select("utm_source, form_start_count, form_submit_count, referrer")
        .eq("tenant_id", session.tenant.id)
        .gte("last_seen_at", sevenDaysAgoIso),
    ]);

    const last7Sessions = (webSessionsLast7AggRes.data ?? []) as Array<{
      utm_source: string | null;
      form_start_count: number;
      form_submit_count: number;
      referrer: string | null;
    }>;
    const formStartsLast7 = last7Sessions.reduce(
      (s, r) => s + (r.form_start_count ?? 0),
      0,
    );
    const formSubmitsLast7 = last7Sessions.reduce(
      (s, r) => s + (r.form_submit_count ?? 0),
      0,
    );
    const sourceCounts = new Map<string, number>();
    for (const s of last7Sessions) {
      const key =
        s.utm_source?.trim() ||
        (s.referrer
          ? (() => {
              try {
                return new URL(s.referrer).hostname;
              } catch {
                return "direct";
              }
            })()
          : "direct");
      sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1);
    }
    const topSources = Array.from(sourceCounts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    const marketingSummary = {
      visitorsLast7: webSessionsLast7Res.count ?? 0,
      visitorsPrior7: webSessionsPrior7Res.count ?? 0,
      formStartsLast7,
      formSubmitsLast7,
      topSources,
      tabEnabled: !!session.tenant.marketing_tab_enabled,
    };

    const trends = [
      {
        label: "Quotes sent",
        thisCount: quotesSentLast30Res.count ?? 0,
        priorCount: quotesSentPrior30Res.count ?? 0,
        format: "count" as const,
        hint: "All proposals moved from draft → sent",
      },
      {
        label: "Quotes paid",
        thisCount: last30PaidRows.length,
        priorCount: prior30PaidRows.length,
        format: "count" as const,
        hint:
          last30PaidRows.length > 0
            ? `${last30Reviews.length > 0 ? "Closed" : "Won"} this window`
            : undefined,
      },
      {
        label: "Revenue (paid)",
        thisCount: last30RevenueCents,
        priorCount: prior30RevenueCents,
        format: "money_cents" as const,
        hint: "Sum of paid proposals · all tiers",
      },
      {
        label: "Visits completed",
        thisCount: visitsCompletedLast30Res.count ?? 0,
        priorCount: visitsCompletedPrior30Res.count ?? 0,
        format: "count" as const,
        hint: "schedule_items marked complete",
      },
      {
        label: "Reviews",
        thisCount: last30Reviews.length,
        priorCount: reviewsPrior30Res.count ?? 0,
        format: "count" as const,
        hint:
          last30ReviewAvg != null
            ? `${last30ReviewAvg.toFixed(1)} ★ average this window`
            : undefined,
      },
    ];

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
          product="tenant"
          eyebrowOverride={`${session.tenant.display_name} · Live`}
          greeting={greeting}
          subtitle={subtitle}
          kpis={kpis}
          crews={[]}
          activity={activity}
          funnel={{ sent: 0, viewed: 0, won: 0, scheduled: 0 }}
        />
        <TenantTrendsCard trends={trends} />
        <MarketingTrafficCard summary={marketingSummary} />
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
