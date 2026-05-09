import { supabaseAdmin } from "@/lib/supabase";
import { FL_HURRICANE_ZIPS } from "@/lib/storm/zips";
import type { DailyBriefingInput } from "@/components/app/OwnersDailyOneLiner";

/**
 * Builds the DailyBriefingInput used by OwnersDailyOneLiner from a
 * tenant_id + display_name. Used by both the /app dashboard handler and
 * the /api/cron/owners-daily-briefing cron, so the SMS body and the
 * UI card are guaranteed to agree.
 *
 * Returns `null` if the tenant has no customers — the OneLiner is not
 * meaningful before onboarding (the dashboard shows TenantOnboardingHero
 * instead, and the cron skips the tenant).
 */
export async function buildBriefingForTenant(args: {
  tenantId: string;
  tenantName: string;
}): Promise<DailyBriefingInput | null> {
  const sb = supabaseAdmin();

  const startOfMonthIso = (() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  })();
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
    proposalsRes,
    visitsThisMonthRes,
    staleUnitsRes,
    scheduledTodayRes,
    proposalsWithQuestionsRes,
  ] = await Promise.all([
    sb
      .from("customers")
      .select("id, service_address", { count: "exact" })
      .eq("tenant_id", args.tenantId),
    sb
      .from("proposals")
      .select("id, status")
      .eq("tenant_id", args.tenantId),
    sb
      .from("schedule_items")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", args.tenantId)
      .gte("starts_at", startOfMonthIso),
    sb
      .from("inventory_units")
      .select("cost_cents, received_at")
      .eq("tenant_id", args.tenantId)
      .eq("status", "in_stock")
      .lt("received_at", ninetyDaysAgoIso),
    sb
      .from("schedule_items")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", args.tenantId)
      .gte("starts_at", startOfTodayIso)
      .lte("starts_at", endOfTodayIso)
      .in("status", ["scheduled", "en_route", "on_site"]),
    sb
      .from("proposals")
      .select("bom, status")
      .eq("tenant_id", args.tenantId)
      .neq("status", "lost"),
  ]);

  const customers = (customersRes.data ?? []) as Array<{
    service_address?: { zip?: string };
  }>;
  const customerCount = customersRes.count ?? customers.length;
  if (customerCount === 0) return null;

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

  const inStormZipCount = customers.filter((row) => {
    const zip = row.service_address?.zip;
    return zip ? FL_HURRICANE_ZIPS.has(zip) : false;
  }).length;

  const scheduledTodayCount = scheduledTodayRes.count ?? 0;
  const proposalsWithQuestions = (proposalsWithQuestionsRes.data ?? []) as Array<{
    bom: { questions?: Array<{ at: string; text: string }> } | null;
    status: string;
  }>;
  const openQuestionsCount = proposalsWithQuestions.reduce(
    (s, p) => s + (p.bom?.questions?.length ?? 0),
    0,
  );

  return {
    tenantName: args.tenantName,
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
}
