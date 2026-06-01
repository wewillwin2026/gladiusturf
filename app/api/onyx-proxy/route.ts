/**
 * POST /api/onyx-proxy — forwards browser requests to the central Onyx brain.
 *
 * The browser never sees ONYX_BRAIN_SECRET. This server route adds it
 * before forwarding. Set ONYX_BRAIN_SECRET in the app's Vercel env vars.
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TENANT = process.env.ONYX_TENANT ?? "external";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.ONYX_BRAIN_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "ONYX_BRAIN_SECRET not configured" }, { status: 500 });
  }
  const body = await req.text();
  try {
    const res = await fetch("https://gladiusbdc.com/api/onyx/brain/external", {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${secret}`,
        "Content-Type":  "application/json",
        "x-onyx-tenant": TENANT,
      },
      body,
      signal: AbortSignal.timeout(25000),
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "proxy failed" },
      { status: 502 },
    );
  }
}
