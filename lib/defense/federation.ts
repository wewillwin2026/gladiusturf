// ---------------------------------------------------------------------------
// GladiusSentinel — Cross-fire federation to central HQ (gladiuscrm.com)
// ---------------------------------------------------------------------------
// Every Sentinel event gets POSTed to https://gladiuscrm.com/api/hq/federation/event
// best-effort. The middleware-level cross-fire (lib/defense/wire.ts) already
// hits a different HQ endpoint (defense-events) per-request; this module is
// the SLOW-PATH federation: durable rows in `sentinel_events` get drained
// every hour to HQ, idempotent and retry-safe.
//
// Endpoint shape: POST JSON
//   { vertical, kind, severity, payload, ts, iq }
// Responses are completely ignored; 404 / network errors are silent. The
// only side effect on the local DB is marking the row `federated=true` on
// HTTP 2xx (so we don't re-fire). 5xx + network errors leave `federated`
// false so the next hourly drain retries.
// ---------------------------------------------------------------------------

import {
  listRecentEvents,
  markEventsFederated,
  latestIqScore,
} from "./store";

const HQ_ENDPOINT = "https://gladiuscrm.com/api/hq/federation/event";
const PER_RUN_BATCH = 100;
const PER_REQUEST_TIMEOUT_MS = 2500;

interface FederationResult {
  attempted: number;
  succeeded: number;
  failed: number;
  durationMs: number;
}

export async function drainFederation(): Promise<FederationResult> {
  const startedAt = Date.now();
  const events = await listRecentEvents(PER_RUN_BATCH);
  const pending = events.filter((e) => !e.federated);
  if (pending.length === 0) {
    return { attempted: 0, succeeded: 0, failed: 0, durationMs: 0 };
  }

  const iq = await latestIqScore();
  const iqScore = iq?.score ?? null;

  const succeededIds: string[] = [];
  let failed = 0;

  // Fire all events in parallel with a small concurrency cap (the public
  // gladiuscrm endpoint should be cheap; we keep it polite anyway).
  const CONCURRENCY = 5;
  let cursor = 0;

  async function worker() {
    while (cursor < pending.length) {
      const i = cursor++;
      const ev = pending[i];
      const controller = new AbortController();
      const timer = setTimeout(
        () => controller.abort(),
        PER_REQUEST_TIMEOUT_MS,
      );
      try {
        const res = await fetch(HQ_ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            vertical: "gladiusturf",
            kind: ev.kind,
            severity: ev.severity,
            payload: ev.payload,
            ts: ev.ts,
            iq: iqScore,
            eventId: ev.id,
          }),
          signal: controller.signal,
          keepalive: true,
        });
        if (res.ok) {
          succeededIds.push(ev.id);
        } else if (res.status === 404) {
          // HQ endpoint doesn't exist yet — count as success so we don't
          // wedge the queue. Founder spec: "404 silent if endpoint missing".
          succeededIds.push(ev.id);
        } else {
          failed += 1;
        }
      } catch {
        failed += 1;
      } finally {
        clearTimeout(timer);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, pending.length) }, () =>
      worker(),
    ),
  );

  if (succeededIds.length > 0) {
    await markEventsFederated(succeededIds);
  }

  return {
    attempted: pending.length,
    succeeded: succeededIds.length,
    failed,
    durationMs: Date.now() - startedAt,
  };
}

/**
 * Fire-and-forget single-event cross-fire — used by callers that want to
 * push an event to HQ immediately (in addition to the durable queue
 * drain). Errors swallowed; never throws.
 */
export function fireAndForget(event: {
  kind: string;
  severity: string;
  payload: Record<string, unknown>;
  iq?: number | null;
}): void {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PER_REQUEST_TIMEOUT_MS);
    void fetch(HQ_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        vertical: "gladiusturf",
        kind: event.kind,
        severity: event.severity,
        payload: event.payload,
        ts: new Date().toISOString(),
        iq: event.iq ?? null,
      }),
      signal: controller.signal,
      keepalive: true,
    })
      .catch(() => {})
      .finally(() => clearTimeout(timer));
  } catch {
    /* swallow */
  }
}
