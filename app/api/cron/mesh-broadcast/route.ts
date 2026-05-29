// ---------------------------------------------------------------------------
// Cron: /api/cron/mesh-broadcast
// ---------------------------------------------------------------------------
// AWAIS Sentinel Mesh — outbound federation broadcast for gladiusturf.
//
//   GET/POST /api/cron/mesh-broadcast
//   Authorization: Bearer ${CRON_SECRET}
//
// Runs every minute (Vercel cron minimum). Calls
// mesh-state.broadcastSelfDelta() which:
//   1. Bootstraps + polls local sentinel_events into the in-process
//      TimeBucketedCMS (idempotent — first call after a cold start
//      hydrates, subsequent calls add only new rows).
//   2. Computes the local outbound CMS delta since the last broadcast.
//   3. gzip + base64 encodes it (typically 5-10x compression).
//   4. POSTs a SKETCH_DELTA FederationEvent to
//      https://gladiuscrm.com/api/hq/federation/event.
//
// Sister verticals pull these rows back via the
// /api/hq/federation/sketches endpoint and merge them into their
// local mesh state — this cron is the OUTBOUND half of that loop for
// gladiusturf.
//
// Failure semantics: empty deltas (no observations since the last
// broadcast) skip the HTTP call. Any transport error is logged and the
// cron returns 200 so Vercel doesn't ring the alarm — the next minute
// retries from the unchanged syncBaseline.
// ---------------------------------------------------------------------------

import { broadcastSelfDelta } from "@/lib/defense/mesh-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request): Promise<Response> {
  return handle(request);
}

export async function POST(request: Request): Promise<Response> {
  return handle(request);
}

async function handle(request: Request): Promise<Response> {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return Response.json({ error: "CRON_SECRET not set" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader !== `Bearer ${expected}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const result = await broadcastSelfDelta();
  const durationMs = Date.now() - startedAt;

  if (!result) {
    return Response.json({
      ok: true,
      status: "broadcast_failed",
      durationMs,
    });
  }

  return Response.json({
    ok: true,
    status: result.skipped ? "skipped" : "ok",
    vertical: "gladiusturf",
    cmsTotalCount: result.cmsTotalCount,
    rawBytes: result.rawBytes,
    compressedBytes: result.compressedBytes,
    compressionRatio: Number(result.compressionRatio.toFixed(3)),
    httpStatus: result.httpStatus,
    durationMs,
  });
}
