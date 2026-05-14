import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authIntegration, unauthorized } from "@/lib/integrations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Maps the WordPress plugin's event_type strings to our web_events.kind enum.
 * Unknown types fall back to "custom".
 */
const KIND_MAP: Record<
  string,
  | "phone_click"
  | "email_click"
  | "cta_click"
  | "form_submit"
  | "form_start"
  | "page_view"
  | "custom"
> = {
  phone_click: "phone_click",
  email_click: "email_click",
  cta_click: "cta_click",
  button_click: "cta_click",
  form_submit: "form_submit",
  form_start: "form_start",
  page_view: "page_view",
};

type WebhookBody = {
  event_type?: string;
  path?: string;
  target?: string;
  page_url?: string;
  customer_id?: string;
  [k: string]: unknown;
};

export async function POST(req: Request) {
  const tenant = await authIntegration(req);
  if (!tenant) return unauthorized();

  let body: WebhookBody;
  try {
    body = (await req.json()) as WebhookBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const eventType = (body.event_type ?? "custom").toLowerCase().trim();
  const kind = KIND_MAP[eventType] ?? "custom";
  const path =
    (body.path ?? body.page_url ?? null)?.slice(0, 500) ?? null;
  const target = body.target?.slice(0, 200) ?? null;

  const sb = supabaseAdmin();

  const { data: eventRow, error } = await sb
    .from("web_events")
    .insert({
      tenant_id: tenant.id,
      web_session_id: null, // server-sourced — no browser session
      kind,
      path,
      target,
      meta: { original_event_type: eventType, ...body },
    })
    .select("id")
    .single();

  if (error) {
    console.error("[integrations/webhooks] insert failed", error.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    id: (eventRow as { id: string }).id,
    kind,
  });
}
