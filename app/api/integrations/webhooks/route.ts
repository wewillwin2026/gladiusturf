import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authIntegration, unauthorized } from "@/lib/integrations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/integrations/webhooks
 *
 * Single-event ingestion endpoint for the WordPress plugin. Maps the
 * plugin's { event_type, timestamp, data } shape onto a web_events row.
 *
 * Auth: Authorization: Bearer <tenants.api_key>
 *
 * Body:
 *   {
 *     event_type: "phone_click" | "email_click" | "form_submit" |
 *                 "form_start" | "page_view" | "cta_click" |
 *                 "scroll_depth" | "exit" | "custom",
 *     timestamp: "2026-05-14T18:30:00Z",  (ISO 8601, optional)
 *     data: { ... }                        (arbitrary, stored as meta)
 *   }
 *
 * Sessions are not stitched for /webhooks events — they go in with a
 * null web_session_id because the WP plugin emits these from the
 * server side and doesn't carry the visitor's session context.
 * For events that DO carry session context, use /api/marketing/track.
 */

const ALLOWED_KINDS = new Set([
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

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: Request): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

type WebhookBody = {
  event_type?: string;
  timestamp?: string;
  data?: Record<string, unknown>;
};

export async function POST(req: Request): Promise<Response> {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  const tenant = await authIntegration(req);
  if (!tenant) {
    const r = unauthorized();
    for (const [k, v] of Object.entries(cors)) r.headers.set(k, v);
    return r;
  }

  let body: WebhookBody;
  try {
    body = (await req.json()) as WebhookBody;
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400, headers: cors },
    );
  }

  const eventType = (body.event_type ?? "").trim().toLowerCase();
  if (!eventType || !ALLOWED_KINDS.has(eventType)) {
    return NextResponse.json(
      { error: "invalid_event_type", allowed: Array.from(ALLOWED_KINDS) },
      { status: 400, headers: cors },
    );
  }

  // Timestamp: accept ISO 8601; fall back to now() if missing or invalid.
  let occurredAt = new Date().toISOString();
  if (typeof body.timestamp === "string") {
    const t = new Date(body.timestamp);
    if (!Number.isNaN(t.getTime())) occurredAt = t.toISOString();
  }

  const data = (body.data ?? {}) as Record<string, unknown>;
  const path =
    typeof data.page_url === "string"
      ? (data.page_url as string).slice(0, 500)
      : typeof data.path === "string"
        ? (data.path as string).slice(0, 500)
        : null;
  const target =
    typeof data.target === "string"
      ? (data.target as string).slice(0, 200)
      : null;

  const sb = supabaseAdmin();
  const { error } = await sb.from("web_events").insert({
    tenant_id: tenant.id,
    web_session_id: null,
    kind: eventType,
    path,
    target,
    meta: data,
    occurred_at: occurredAt,
  });
  if (error) {
    console.warn("[/api/integrations/webhooks] insert failed", error);
    return NextResponse.json(
      { ok: true, persisted: false, reason: "insert_failed" },
      { status: 200, headers: cors },
    );
  }

  return NextResponse.json(
    { ok: true, persisted: true },
    { status: 200, headers: cors },
  );
}
