import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  FOUNDER_COOKIE_NAME,
  verifyFounderSessionCookieValue,
} from "@/lib/founders/auth";
import { loadLiveRadar } from "@/lib/tracking/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/founders/radar
 *
 * Founder-only live visitor feed polled by the Radar tab every ~5s.
 * Same auth as /api/founders/impersonate — a valid gladius_founder_session
 * cookie. Returns the derived radar (real sessions/visitors/events;
 * founder/own traffic already excluded upstream at /api/track).
 */
export async function GET() {
  const store = await cookies();
  const founder = verifyFounderSessionCookieValue(
    store.get(FOUNDER_COOKIE_NAME)?.value,
  );
  if (!founder) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const radar = await loadLiveRadar();
  return NextResponse.json(radar, {
    headers: { "Cache-Control": "no-store" },
  });
}
