/**
 * POST /api/onyx-proxy — forwards browser requests to the central Onyx brain.
 *
 * The browser never sees ONYX_BRAIN_SECRET. This server route adds it
 * before forwarding. Set ONYX_BRAIN_SECRET in the app's Vercel env vars.
 *
 * Modes:
 *   - Default: buffered JSON via /api/onyx/brain/external.
 *   - Client sends `{ "stream": true }`: forwards to
 *     /api/onyx/brain/external/stream and pipes SSE back to the browser.
 *     First-token latency drops from ~700ms to ~200ms.
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BRAIN_HOST = "https://gladiusbdc.com";
const TENANT = process.env.ONYX_TENANT ?? "external";

export async function POST(req: NextRequest): Promise<Response> {
  const secret = process.env.ONYX_BRAIN_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "ONYX_BRAIN_SECRET not configured" }, { status: 500 });
  }
  const bodyText = await req.text();
  let wantsStream = false;
  try {
    wantsStream = (JSON.parse(bodyText) as { stream?: boolean }).stream === true;
  } catch {
    // ignore — brain will reject bad JSON
  }

  const upstreamUrl = wantsStream
    ? `${BRAIN_HOST}/api/onyx/brain/external/stream`
    : `${BRAIN_HOST}/api/onyx/brain/external`;

  try {
    const res = await fetch(upstreamUrl, {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${secret}`,
        "Content-Type":  "application/json",
        "x-onyx-tenant": TENANT,
      },
      body:   bodyText,
      signal: AbortSignal.timeout(60000),
    });

    if (wantsStream && res.body && res.headers.get("content-type")?.includes("text/event-stream")) {
      return new Response(res.body, {
        status: res.status,
        headers: {
          "Content-Type":      "text/event-stream",
          "Cache-Control":     "no-cache, no-transform",
          "Connection":        "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "proxy failed" },
      { status: 502 },
    );
  }
}
