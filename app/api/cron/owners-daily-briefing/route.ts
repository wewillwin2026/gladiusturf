import { supabaseAdmin } from "@/lib/supabase";
import { sendSmsToOwner } from "@/lib/messaging/dispatch";
import { buildBriefingForTenant } from "@/lib/briefing/build";
import { pickNextMove } from "@/components/app/OwnersDailyOneLiner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Owner's Daily One-Liner SMS cron — Strategy + Product board mandate.
 *
 * Schedule: daily at 11:00 UTC = 7:00 AM ET. Tenants in Pacific time
 * still get it pre-coffee; the cadence target is "before the first
 * crew meeting", not "wake the owner up."
 *
 * Per tenant, the cron:
 *   1. Skips if `daily_briefing_sms_enabled = false` OR `owner_phone` NULL.
 *   2. Builds the same DailyBriefingInput rendered on /app dashboard.
 *   3. Skips if the tenant has zero customers (briefing isn't meaningful
 *      pre-onboarding — the dashboard shows TenantOnboardingHero instead).
 *   4. Composes a 320-char-ish SMS: headline · short body · "Your one move".
 *   5. Sends via sendSmsToOwner (canSend gate skipped — owner is sender,
 *      not a regulated third-party; TCPA does not apply).
 *
 * Idempotence: per-tenant per-UTC-date dedupe via audit_log
 * (action='owner_briefing.sent' with same date). A retry within the
 * same UTC day is a no-op.
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}`. Same pattern as
 * inventory-aging + auto-review-ask.
 */

function buildSmsBody(args: {
  briefing: ReturnType<typeof pickNextMove>;
  tenantName: string;
  customerCount: number;
  draftQuotesCount: number;
  scheduledTodayCount: number;
}): string {
  const { briefing: move, tenantName, customerCount, draftQuotesCount, scheduledTodayCount } = args;

  const stats: string[] = [`${customerCount} cust`];
  if (scheduledTodayCount > 0) stats.push(`${scheduledTodayCount} on route`);
  if (draftQuotesCount > 0) stats.push(`${draftQuotesCount} draft${draftQuotesCount === 1 ? "" : "s"}`);

  // Trim move text to keep us inside 1 SMS segment when possible.
  const trimmedMove = move.text.length > 110 ? `${move.text.slice(0, 107)}…` : move.text;

  return `Good morning, ${tenantName}. ${stats.join(" · ")}.\n\nYour one move: ${trimmedMove}\n\nReply STOP to disable.`;
}

export async function GET(request: Request): Promise<Response> {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error("[cron/owners-daily-briefing] CRON_SECRET not set");
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader !== `Bearer ${expected}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = supabaseAdmin();

  // Pull every tenant opted in. The new columns ship in
  // 20260509_b_owner_daily_briefing.sql; if the migration isn't applied
  // yet we get a friendly error and dry-run zero tenants.
  const { data: tenants, error: tenantsErr } = await sb
    .from("tenants")
    .select("id, display_name, owner_phone")
    .eq("daily_briefing_sms_enabled", true)
    .eq("active", true)
    .not("owner_phone", "is", null);

  if (tenantsErr) {
    console.error("[cron/owners-daily-briefing] tenant query error", tenantsErr);
    return Response.json(
      { error: tenantsErr.message, hint: "migration_not_applied?" },
      { status: 500 },
    );
  }

  const tenantRows = (tenants ?? []) as Array<{
    id: string;
    display_name: string;
    owner_phone: string;
  }>;
  if (tenantRows.length === 0) {
    return Response.json({
      ok: true,
      scanned_tenants: 0,
      sent: 0,
      skipped_already_sent: 0,
      skipped_no_briefing: 0,
      failed: 0,
    });
  }

  // Dedupe — for each tenant, was an owner_briefing.sent / .dry_run row
  // written in the last 20 hours? If yes, skip (the cron is daily; the
  // window is generous so a partial outage doesn't double-fire).
  const dedupeCutoffIso = new Date(
    Date.now() - 20 * 60 * 60 * 1000,
  ).toISOString();
  const tenantIds = tenantRows.map((t) => t.id);
  const { data: priorRows } = await sb
    .from("audit_log")
    .select("tenant_id, action")
    .in("tenant_id", tenantIds)
    .eq("entity_type", "tenant")
    .gte("created_at", dedupeCutoffIso)
    .in("action", ["owner_briefing.sent", "owner_briefing.dry_run"]);
  const sentRecently = new Set<string>(
    (priorRows ?? []).map((r) => (r as { tenant_id: string }).tenant_id),
  );

  let sent = 0;
  let skippedAlreadySent = 0;
  let skippedNoBriefing = 0;
  let failed = 0;

  for (const tenant of tenantRows) {
    if (sentRecently.has(tenant.id)) {
      skippedAlreadySent += 1;
      continue;
    }

    const briefing = await buildBriefingForTenant({
      tenantId: tenant.id,
      tenantName: tenant.display_name,
    });
    if (!briefing) {
      skippedNoBriefing += 1;
      continue;
    }

    const move = pickNextMove(briefing);
    const body = buildSmsBody({
      briefing: move,
      tenantName: briefing.tenantName,
      customerCount: briefing.customerCount,
      draftQuotesCount: briefing.draftQuotesCount,
      scheduledTodayCount: briefing.scheduledTodayCount ?? 0,
    });

    const result = await sendSmsToOwner({
      tenantId: tenant.id,
      toPhone: tenant.owner_phone,
      body,
      source: "owner_daily_briefing",
      auditAction: "owner_briefing",
    });

    if (result.ok) {
      sent += 1;
    } else {
      failed += 1;
    }
  }

  return Response.json({
    ok: true,
    scanned_tenants: tenantRows.length,
    sent,
    skipped_already_sent: skippedAlreadySent,
    skipped_no_briefing: skippedNoBriefing,
    failed,
  });
}
