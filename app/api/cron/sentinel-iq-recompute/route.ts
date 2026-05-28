// ---------------------------------------------------------------------------
// Cron: /api/cron/sentinel-iq-recompute
// ---------------------------------------------------------------------------
// Runs daily at 06:00 UTC. Computes Sentinel's IQ score (0–200) and writes
// one row to `sentinel_iq_scores`. The founders page reads the latest row
// + plots the 30-day trend.
// ---------------------------------------------------------------------------

import { computeIqScore } from "@/lib/defense/iq";
import { insertIqScore } from "@/lib/defense/store";

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

  const baseUrl =
    process.env.SENTINEL_BASE_URL ?? "https://gladiusturf.com";
  const breakdown = await computeIqScore({ smokeBaseUrl: baseUrl });
  await insertIqScore({
    score: breakdown.total,
    componentBreakdown: {
      corpusDepth: breakdown.corpusDepth,
      recency: breakdown.recency,
      federationHealth: breakdown.federationHealth,
      criticalFlows: breakdown.criticalFlows,
      moduleDensity: breakdown.moduleDensity,
      notes: breakdown.notes,
    },
  });

  return Response.json({
    ok: true,
    score: breakdown.total,
    breakdown,
  });
}
