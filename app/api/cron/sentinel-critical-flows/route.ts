// ---------------------------------------------------------------------------
// Cron: /api/cron/sentinel-critical-flows
// ---------------------------------------------------------------------------
// Runs every minute. Executes every smokeTest declared on a LockedPath via
// curl + grep and writes one `sentinel_events` row per failure. Failures
// trigger the AUTO_ROLLBACK_DEPLOY remediation (env-gated — defaults to
// detection-only). Cross-fired to HQ on each failure via fire-and-forget.
//
// Auth: `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron injects this).
// ---------------------------------------------------------------------------

import { runCriticalFlowSmokes } from "@/lib/defense/critical-flow-smoke";
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

  const baseUrl =
    process.env.SENTINEL_BASE_URL ?? "https://gladiusturf.com";

  const report = await runCriticalFlowSmokes(baseUrl);

  // Emit per-failure events + try remediation
  for (const result of report.results) {
    if (result.passed) continue;
    await insertSentinelEvent({
      kind: "CRITICAL_FLOW_FAILED",
      severity: "CRITICAL",
      payload: {
        lock: result.lock.label,
        glob: result.lock.glob,
        command: result.command,
        stdout: result.stdout?.slice(0, 200),
        stderr: result.stderr?.slice(0, 200),
        error: result.error,
        durationMs: result.durationMs,
        vertical: result.lock.vertical ?? "gladiusturf",
        category: result.lock.category ?? "internal",
      },
    });
    fireAndForget({
      kind: "CRITICAL_FLOW_FAILED",
      severity: "CRITICAL",
      payload: {
        lock: result.lock.label,
        command: result.command,
        vertical: result.lock.vertical ?? "gladiusturf",
      },
    });
    await remediate({
      violationKind: "CRITICAL_FLOW_FAILED",
      failingSmoke: result.lock.label,
      evidence: {
        command: result.command,
        stderr: result.stderr,
        error: result.error,
      },
    });
  }

  return Response.json({
    ok: true,
    totalSmokes: report.totalSmokes,
    passedSmokes: report.passedSmokes,
    failedSmokes: report.failedSmokes,
    totalMs: report.totalMs,
  });
}
