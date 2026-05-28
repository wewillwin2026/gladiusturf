// ---------------------------------------------------------------------------
// Cron: /api/cron/sentinel-tenant-isolation
// ---------------------------------------------------------------------------
// Runs daily at 04:30 UTC. Walks every route under app/api/** and flags any
// route that touches a tenant-scoped table without filtering by tenant_id.
// Each finding becomes a sentinel_events row of kind
// TENANT_ISOLATION_BREACH; the route is quarantined in-memory via the
// AUTO_QUARANTINE_ROUTE remediation (callers that check
// `isQuarantined(routePath)` will return 503).
// ---------------------------------------------------------------------------

import { auditTenantIsolation } from "@/lib/defense/tenant-isolation";
import { insertSentinelEvent } from "@/lib/defense/store";
import { remediate } from "@/lib/defense/remediation";
import { fireAndForget } from "@/lib/defense/federation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return Response.json({ error: "CRON_SECRET not set" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader !== `Bearer ${expected}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let findings;
  try {
    findings = await auditTenantIsolation();
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  for (const f of findings) {
    await insertSentinelEvent({
      kind: "TENANT_ISOLATION_BREACH",
      severity: "CRITICAL",
      payload: {
        file: f.file,
        tables: f.tables,
        expectedScopeKey: f.expectedScopeKey,
      },
    });
    fireAndForget({
      kind: "TENANT_ISOLATION_BREACH",
      severity: "CRITICAL",
      payload: {
        file: f.file,
        tables: f.tables,
      },
    });
    await remediate({
      violationKind: "TENANT_ISOLATION_BREACH",
      routePath: f.file,
      routeReason: `References ${f.tables.join(", ")} without tenant_id scope`,
      evidence: f,
    });
  }

  return Response.json({
    ok: true,
    breachesFound: findings.length,
  });
}
