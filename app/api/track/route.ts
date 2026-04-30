import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { visitorHashFromRequest, geoFromRequest } from "@/lib/tracking/hash";

export const runtime = "nodejs";
// Tracking is high-volume + asynchronous; never cache the route.
export const dynamic = "force-dynamic";

type ClientEvent = {
  type: string;
  product: string;
  path?: string;
  target?: string;
  meta?: Record<string, unknown>;
  conversionValueCents?: number;
  ts?: string;
};

type ClientPayload = {
  fingerprint?: string;
  sessionId?: string;
  startedAt?: string;
  product?: string;
  utm?: Record<string, string>;
  referrer?: string;
  screen?: { w: number; h: number };
  events: ClientEvent[];
};

type SupabaseError = { code?: string; message?: string };

const PRODUCTS = new Set(["marketing", "demo_crm", "war_room"]);

export async function POST(req: Request) {
  let body: ClientPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const events = Array.isArray(body.events) ? body.events.slice(0, 50) : [];
  if (events.length === 0) {
    return NextResponse.json({ ok: true, ingested: 0 });
  }

  const visitorHash = visitorHashFromRequest(req, body.fingerprint);
  const geo = geoFromRequest(req);
  const ua = req.headers.get("user-agent") || "";
  const utm = body.utm || {};
  const product = PRODUCTS.has(body.product || "")
    ? (body.product as string)
    : "marketing";

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    // Env vars missing; accept silently to keep client tracker happy.
    return NextResponse.json({ ok: true, persisted: false });
  }

  // Upsert visitor by hash. Returns id.
  let visitorId: string | null = null;
  try {
    const { data: vis, error } = await sb
      .from("visitors")
      .upsert(
        {
          visitor_hash: visitorHash,
          last_seen_at: new Date().toISOString(),
          utm_source: utm.utm_source || null,
          utm_medium: utm.utm_medium || null,
          utm_campaign: utm.utm_campaign || null,
          utm_content: utm.utm_content || null,
          utm_term: utm.utm_term || null,
          referrer: body.referrer || null,
          country: geo.country,
          region: geo.region,
          city: geo.city,
          user_agent: ua,
          screen_w: body.screen?.w || null,
          screen_h: body.screen?.h || null,
        },
        { onConflict: "visitor_hash" },
      )
      .select("id")
      .single();
    if (error) throw error;
    visitorId = vis?.id ?? null;
  } catch (err) {
    return softFailure(err);
  }

  // Resolve session — if client passed one we treat as deterministic; otherwise we
  // create a new row keyed off (visitor_id, started_at).
  let sessionId: string | null = body.sessionId || null;
  try {
    if (!sessionId && visitorId) {
      const { data: sess, error } = await sb
        .from("sessions")
        .insert({
          visitor_id: visitorId,
          started_at: body.startedAt || new Date().toISOString(),
          product,
          utm_source: utm.utm_source || null,
          utm_medium: utm.utm_medium || null,
          utm_campaign: utm.utm_campaign || null,
          referrer: body.referrer || null,
          entry_path: events[0]?.path || null,
        })
        .select("id")
        .single();
      if (error) throw error;
      sessionId = sess?.id ?? null;
    }
  } catch (err) {
    return softFailure(err);
  }

  // Bulk-insert events.
  try {
    const rows = events.map((e) => ({
      session_id: sessionId,
      visitor_id: visitorId,
      ts: e.ts || new Date().toISOString(),
      product: e.product || product,
      type: e.type,
      path: e.path || null,
      target: e.target || null,
      meta: e.meta || null,
      conversion_value_cents: e.conversionValueCents ?? null,
    }));
    const { error } = await sb.from("tracking_events").insert(rows);
    if (error) throw error;
  } catch (err) {
    return softFailure(err);
  }

  return NextResponse.json({
    ok: true,
    ingested: events.length,
    sessionId,
  });
}

function softFailure(err: unknown) {
  const e = err as SupabaseError;
  // Migration not run yet — the schema doesn't exist. Don't 500.
  if (
    e?.code === "42P01" ||
    (e?.message || "").includes("does not exist") ||
    (e?.message || "").includes("not found")
  ) {
    return NextResponse.json({
      ok: true,
      persisted: false,
      reason: "schema-missing",
    });
  }
  console.warn("[/api/track] insert failed", e?.code, e?.message);
  return NextResponse.json({ ok: true, persisted: false });
}
