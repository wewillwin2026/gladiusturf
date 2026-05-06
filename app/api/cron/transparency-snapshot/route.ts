import { computeDailyRoot } from "@/lib/audit/merkle";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily transparency-root snapshot — Trust Director's v2 ask.
 *
 * Runs Mondays at 12:30 UTC by default (just after the inventory-aging
 * cron at 12:00 UTC). Computes yesterday's UTC-day Merkle root for each
 * active tenant + the all-tenants root, persists into `transparency_
 * roots`. Once persisted, the daily root cannot be silently changed
 * without breaking verification — even by us.
 *
 * Auth: Bearer ${CRON_SECRET}, matching the inventory-aging cron.
 */

function yesterdayUtcIso(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request): Promise<Response> {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader !== `Bearer ${expected}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allow ?date=YYYY-MM-DD override for backfills.
  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
    ? dateParam
    : yesterdayUtcIso();

  try {
    const sb = supabaseAdmin();

    // Build the list of tenants to snapshot — every active tenant
    // + a NULL row for the all-tenants forensics view.
    const { data: tenantRows, error: tenantErr } = await sb
      .from("tenants")
      .select("id")
      .eq("active", true);
    if (tenantErr) {
      console.error("[transparency-snapshot] tenant query", tenantErr);
      return Response.json({ error: tenantErr.message }, { status: 500 });
    }

    const tenants = (tenantRows ?? []) as Array<{ id: string }>;
    const targets: (string | null)[] = [null, ...tenants.map((t) => t.id)];

    let written = 0;
    const summaries: Array<{
      tenantId: string | null;
      rootHex: string;
      counts: ReturnType<typeof computeDailyRoot> extends Promise<infer R>
        ? R extends { counts: infer C }
          ? C
          : never
        : never;
    }> = [];

    for (const tid of targets) {
      const root = await computeDailyRoot(date, tid);
      const { error: upsertErr } = await sb
        .from("transparency_roots")
        .upsert(
          {
            tenant_id: tid,
            date,
            root_hex: root.rootHex,
            ai_runs_count: root.counts.aiRuns,
            audit_events_count: root.counts.auditEvents,
            cross_tenant_reads_count: root.counts.crossTenantReads,
            consent_events_count: root.counts.consentEvents,
          },
          // Tenant_id NULL needs a unique-index handler — the migration
          // uses coalesce(tenant_id::text,'') in the unique index so
          // upsert by (tenant_id, date) works for both cases.
          { onConflict: "tenant_id,date" },
        );
      if (upsertErr) {
        console.warn(
          "[transparency-snapshot] upsert error",
          tid,
          date,
          upsertErr,
        );
        continue;
      }
      written += 1;
      summaries.push({
        tenantId: tid,
        rootHex: root.rootHex,
        counts: root.counts,
      });
    }

    return Response.json({ ok: true, date, written, summaries });
  } catch (err) {
    console.error("[transparency-snapshot] unhandled", err);
    const message = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
