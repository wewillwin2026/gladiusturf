import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  APP_COOKIE_NAME,
  LEGACY_APP_COOKIE_NAME,
  verifyAppSessionCookieValue,
} from "@/lib/app-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mock satellite-measurement endpoint. Phase 7 stretch could swap this for a
 * real cv pipeline; for the demo, a deterministic measurement keyed off the
 * address is exactly as convincing.
 *
 * POST { address } → { lat, lng, turfSqft, drivewaySqft, bedsSqft, trees, polygon }
 *   polygon: array of [lat, lng] vertices around the lot, used by the
 *   Mapbox client to draw the animated outline.
 */
export async function POST(req: Request) {
  const store = await cookies();
  const session =
    store.get(APP_COOKIE_NAME)?.value ?? store.get(LEGACY_APP_COOKIE_NAME)?.value;
  if (!verifyAppSessionCookieValue(session)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { address?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const address = String(body.address || "").trim();
  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  // Deterministic-from-address fake "measurement". Same address always
  // returns the same polygon — feels real, demos consistently.
  const seed = hash(address);
  const r = seeded(seed);

  const lat = 27.94752 + (r() - 0.5) * 0.06;
  const lng = -82.4584 + (r() - 0.5) * 0.08;
  const turfSqft = 4200 + Math.round(r() * 6800);
  const drivewaySqft = 320 + Math.round(r() * 600);
  const bedsSqft = 280 + Math.round(r() * 1400);
  const trees = 2 + Math.floor(r() * 9);

  // Build a slightly-irregular ~10-vertex polygon around the lot.
  const polygon: [number, number][] = [];
  const baseRadiusLat = 0.00038 + r() * 0.00012;
  const baseRadiusLng = 0.00048 + r() * 0.00018;
  const N = 10;
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2;
    const jitter = 0.85 + r() * 0.3;
    polygon.push([
      lat + Math.sin(angle) * baseRadiusLat * jitter,
      lng + Math.cos(angle) * baseRadiusLng * jitter,
    ]);
  }

  return NextResponse.json({
    address,
    lat,
    lng,
    turfSqft,
    drivewaySqft,
    bedsSqft,
    trees,
    polygon,
  });
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
