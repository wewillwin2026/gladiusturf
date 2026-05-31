/**
 * GET /api/founder/visitors/recent
 *
 * Federation source endpoint — read by the gladiuscrm.com Founders HQ
 * Radar's federation-traffic aggregator.
 *
 * gladiusturf.com is the landscape-ops SaaS; it doesn't track public
 * VisitorSession the way gladiuscrm.com does. Returns 200 with an
 * empty payload so the aggregator marks the source as online;
 * upgrades in place when turf wires up visitor capture.
 *
 * Auth: shared symmetric secret in `x-federation-secret` header,
 * compared against FEDERATION_PULL_SECRET. Fail-closed.
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERSION =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
  process.env.NEXT_PUBLIC_BUILD_SHA?.slice(0, 7) ??
  null;

export async function GET(req: Request) {
  const want = (process.env.FEDERATION_PULL_SECRET ?? "").trim();
  const got = (req.headers.get("x-federation-secret") ?? "").trim();
  if (!want || got.length === 0 || got !== want) {
    return NextResponse.json(
      { error: "Federation pull denied" },
      { status: 401 },
    );
  }

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      slug: "gladiusturf",
      version: VERSION,
      sessions: [],
      counts: { live: 0, hot: 0, identified: 0 },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
