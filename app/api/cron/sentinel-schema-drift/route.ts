// ---------------------------------------------------------------------------
// Cron: /api/cron/sentinel-schema-drift
// ---------------------------------------------------------------------------
// Runs once a day (04:00 UTC). Walks supabase/migrations/*.sql + every code
// file under app/ + lib/ and reports columns referenced in code but not in
// schema. One sentinel_events row per drift; AUTO_DRAFT_MIGRATION
// remediation writes a SQL stub.
// ---------------------------------------------------------------------------

import { findSchemaDrift } from "@/lib/defense/schema-drift";
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

  let reports;
  try {
    reports = await findSchemaDrift();
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  let criticalCount = 0;
  for (const r of reports) {
    if (r.codeOnlyFields.length > 0) {
      criticalCount += 1;
      await insertSentinelEvent({
        kind: "SCHEMA_DRIFT_DETECTED",
        severity: "CRITICAL",
        payload: {
          table: r.table,
          codeOnlyFields: r.codeOnlyFields,
          schemaOnlyFields: r.schemaOnlyFields,
        },
      });
      fireAndForget({
        kind: "SCHEMA_DRIFT_DETECTED",
        severity: "CRITICAL",
        payload: {
          table: r.table,
          codeOnlyFields: r.codeOnlyFields,
        },
      });
      // One draft migration per code-only field
      for (const field of r.codeOnlyFields) {
        await remediate({
          violationKind: "SCHEMA_DRIFT_DETECTED",
          driftedField: field,
          driftedTable: r.table,
          evidence: { table: r.table, field },
        });
      }
    } else if (r.schemaOnlyFields.length > 0) {
      await insertSentinelEvent({
        kind: "SCHEMA_HYGIENE",
        severity: "INFO",
        payload: {
          table: r.table,
          schemaOnlyFields: r.schemaOnlyFields,
        },
      });
    }
  }

  return Response.json({
    ok: true,
    tablesScanned: reports.length,
    criticalDrifts: criticalCount,
  });
}
