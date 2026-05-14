import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  geoFromRequest,
  visitorHashFromRequest,
} from "@/lib/tracking/hash";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Per-tenant marketing tracker ingest.
 *
 * The tenant's website (e.g. brightlightsfl.com) ships a tiny JS
 * snippet that POSTs to this endpoint with:
 *   {
 *     tenantSlug: "bright-lights",
 *     sessionId?: "uuid-from-cookie",
 *     fingerprint?: "screen+lang+tz",
 *     events: [{ kind: "page_view", path: "/", meta: {...} }, ...],
 *     utm?: { utm_source, utm_medium, ... },
 *     referrer?: "...",
 *     match?: { phone?: "...", email?: "..." }  // attribute to a customer
 *   }
 *
 * The endpoint is public + CORS-open by design — the trackers run from
 * customer-owned domains. Identity is the tenant slug (not a secret —
 * worst case someone else writes garbage events to a tenant they don't
 * own, which is a noise problem, not a security one).
 */

type TrackKind =
  | "page_view"
  | "form_start"
  | "form_submit"
  | "click"
  | "scroll_depth"
  | "phone_click"
  | "email_click"
  | "cta_click"
  | "exit"
  | "custom";

const KINDS = new Set<TrackKind>([
  "page_view",
  "form_start",
  "form_submit",
  "click",
  "scroll_depth",
  "phone_click",
  "email_click",
  "cta_click",
  "exit",
  "custom",
]);

type TrackEvent = {
  kind: TrackKind;
  path?: string;
  target?: string;
  meta?: Record<string, unknown>;
  ts?: string;
};

type TrackPayload = {
  tenantSlug?: string;
  sessionId?: string;
  fingerprint?: string;
  utm?: Record<string, string | undefined>;
  referrer?: string;
  device?: "mobile" | "tablet" | "desktop" | "bot" | "unknown";
  match?: { phone?: string; email?: string };
  events?: TrackEvent[];
};

function corsHeaders(origin: string | null): Record<string, string> {
  // Tracker calls land cross-origin from the tenant's domain.
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: Request): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

function normalizePhone(raw: string | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

export async function POST(req: Request): Promise<Response> {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  let body: TrackPayload;
  try {
    body = (await req.json()) as TrackPayload;
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400, headers: cors },
    );
  }

  const tenantSlug = (body.tenantSlug ?? "").toLowerCase().trim().slice(0, 80);
  if (!tenantSlug) {
    return NextResponse.json(
      { error: "missing_tenant_slug" },
      { status: 400, headers: cors },
    );
  }
  const rawEvents = Array.isArray(body.events) ? body.events.slice(0, 50) : [];
  const events = rawEvents
    .filter((e) => e && KINDS.has(e.kind))
    .map((e) => ({
      kind: e.kind,
      path: typeof e.path === "string" ? e.path.slice(0, 500) : null,
      target: typeof e.target === "string" ? e.target.slice(0, 200) : null,
      meta: e.meta ?? null,
      ts: e.ts ?? new Date().toISOString(),
    }));
  if (events.length === 0) {
    return NextResponse.json(
      { ok: true, ingested: 0 },
      { status: 200, headers: cors },
    );
  }

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json(
      { ok: true, persisted: false, reason: "env_missing" },
      { status: 200, headers: cors },
    );
  }

  const { data: tenant, error: tenantErr } = await sb
    .from("tenants")
    .select("id")
    .eq("slug", tenantSlug)
    .maybeSingle();
  if (tenantErr || !tenant) {
    return NextResponse.json(
      { error: "unknown_tenant" },
      { status: 404, headers: cors },
    );
  }
  const tenantId = (tenant as { id: string }).id;

  const visitorHash = visitorHashFromRequest(req, body.fingerprint);
  const geo = geoFromRequest(req);
  const ua = req.headers.get("user-agent") || "";
  const utm = body.utm ?? {};

  // Optional customer match — by phone or email if supplied.
  let matchedCustomerId: string | null = null;
  if (body.match?.phone || body.match?.email) {
    const phoneE164 = normalizePhone(body.match.phone);
    const email = body.match.email?.toLowerCase().trim().slice(0, 200) ?? null;
    if (phoneE164 || email) {
      const q = sb
        .from("customers")
        .select("id")
        .eq("tenant_id", tenantId)
        .limit(1);
      if (phoneE164 && email) {
        q.or(`primary_phone.eq.${phoneE164},primary_email.eq.${email}`);
      } else if (phoneE164) {
        q.eq("primary_phone", phoneE164);
      } else if (email) {
        q.eq("primary_email", email);
      }
      const { data: cust } = await q.maybeSingle();
      if (cust) matchedCustomerId = (cust as { id: string }).id;
    }
  }

  // Stitch the session: prefer client-supplied sessionId, else look up
  // the most recent open session for this visitor within 30 minutes,
  // else create a new row.
  let sessionId = (body.sessionId ?? "").trim().slice(0, 80) || null;
  let firstEventPath: string | null = events[0]?.path ?? null;

  if (sessionId) {
    // Treat as an external/correlation id we hash into a UUID — easier
    // to skip and just resolve from visitorHash for v1. Drop the
    // client-supplied id here in favor of server stitching.
    sessionId = null;
  }

  if (!sessionId) {
    const thirtyMinAgoIso = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: existing } = await sb
      .from("web_sessions")
      .select("id, page_view_count, form_start_count, form_submit_count")
      .eq("tenant_id", tenantId)
      .eq("visitor_hash", visitorHash)
      .gte("last_seen_at", thirtyMinAgoIso)
      .order("last_seen_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) {
      sessionId = (existing as { id: string }).id;
      // Update rolling counters.
      const inc = (k: TrackKind): number => events.filter((e) => e.kind === k).length;
      const cur = existing as {
        page_view_count: number;
        form_start_count: number;
        form_submit_count: number;
      };
      await sb
        .from("web_sessions")
        .update({
          last_seen_at: new Date().toISOString(),
          page_view_count: cur.page_view_count + inc("page_view"),
          form_start_count: cur.form_start_count + inc("form_start"),
          form_submit_count: cur.form_submit_count + inc("form_submit"),
          ...(matchedCustomerId ? { customer_id: matchedCustomerId } : {}),
        })
        .eq("id", sessionId);
    }
  }

  if (!sessionId) {
    const { data: created, error: createErr } = await sb
      .from("web_sessions")
      .insert({
        tenant_id: tenantId,
        visitor_hash: visitorHash,
        customer_id: matchedCustomerId,
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        utm_source: utm.utm_source ?? null,
        utm_medium: utm.utm_medium ?? null,
        utm_campaign: utm.utm_campaign ?? null,
        utm_content: utm.utm_content ?? null,
        utm_term: utm.utm_term ?? null,
        referrer: body.referrer ?? null,
        landing_path: firstEventPath,
        device: body.device ?? "unknown",
        country: geo.country,
        region: geo.region,
        city: geo.city,
        user_agent: ua.slice(0, 500),
        page_view_count: events.filter((e) => e.kind === "page_view").length,
        form_start_count: events.filter((e) => e.kind === "form_start").length,
        form_submit_count: events.filter((e) => e.kind === "form_submit").length,
      })
      .select("id")
      .single();
    if (createErr || !created) {
      return NextResponse.json(
        { ok: true, persisted: false, reason: "session_insert_failed" },
        { status: 200, headers: cors },
      );
    }
    sessionId = (created as { id: string }).id;
  }

  const rows = events.map((e) => ({
    tenant_id: tenantId,
    web_session_id: sessionId,
    kind: e.kind,
    path: e.path,
    target: e.target,
    meta: e.meta,
    occurred_at: e.ts,
  }));
  const { error: evErr } = await sb.from("web_events").insert(rows);
  if (evErr) {
    return NextResponse.json(
      { ok: true, persisted: false, reason: "events_insert_failed" },
      { status: 200, headers: cors },
    );
  }

  return NextResponse.json(
    { ok: true, ingested: events.length, sessionId },
    { status: 200, headers: cors },
  );
}
