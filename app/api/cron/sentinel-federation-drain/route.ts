// ---------------------------------------------------------------------------
// Cron: /api/cron/sentinel-federation-drain
// ---------------------------------------------------------------------------
// Hourly cron. Drains unfederated `sentinel_events` rows to the central HQ
// endpoint at https://gladiuscrm.com/api/hq/federation/event. Idempotent.
// Each row is marked federated=true on HTTP 2xx (or 404 — endpoint not
// deployed yet); 5xx / network errors leave the row for the next drain.
// ---------------------------------------------------------------------------

import { drainFederation } from "@/lib/defense/federation";

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

  const result = await drainFederation();
  return Response.json({ ok: true, ...result });
}
