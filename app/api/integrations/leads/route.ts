import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  authIntegration,
  unauthorized,
} from "@/lib/integrations/auth";
import { sendInternalAlert } from "@/lib/messaging/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/integrations/leads
 *
 * Public ingestion endpoint for the WordPress plugin (and any future
 * upstream that wants to submit a qualified lead).
 *
 * Auth: Authorization: Bearer <tenants.api_key>
 *
 * Body (all keys optional except phone/email — we need at least one
 *       to do customer matching):
 *   {
 *     name, email, phone, address, service, notes,
 *     source, campaign, medium,
 *     page_url, referrer,
 *     external_id
 *   }
 *
 * Flow:
 *   1. Authenticate via bearer token.
 *   2. Normalize phone (E.164).
 *   3. Upsert customer by (tenant_id, phone) OR (tenant_id, email).
 *   4. Open a web_session tagged with the lead's UTM + referrer,
 *      with customer_id set if we matched.
 *   5. Insert a form_submit web_event.
 *   6. Persist the raw payload to tenant_inbound_leads for replay.
 *   7. Fire-and-forget founder alert (best effort, never blocks).
 *   8. Return { id, lead_id } so the WP plugin can persist the
 *      cross-system reference.
 */

type LeadBody = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  service?: string;
  notes?: string;
  source?: string;
  campaign?: string;
  medium?: string;
  page_url?: string;
  referrer?: string;
  external_id?: string | number;
};

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

function normalizePhone(raw: string | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

function trim(value: unknown, max = 500): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v.length === 0 ? null : v.slice(0, max);
}

export async function OPTIONS(req: Request): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: Request): Promise<Response> {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  const tenant = await authIntegration(req);
  if (!tenant) {
    const r = unauthorized();
    for (const [k, v] of Object.entries(cors)) r.headers.set(k, v);
    return r;
  }

  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400, headers: cors },
    );
  }

  const name = trim(body.name, 200);
  const email = trim(body.email, 200)?.toLowerCase() ?? null;
  const phoneE164 = normalizePhone(typeof body.phone === "string" ? body.phone : undefined);
  const address = trim(body.address, 500);
  const service = trim(body.service, 200);
  const notes = trim(body.notes, 2000);
  const source = trim(body.source, 100);
  const campaign = trim(body.campaign, 200);
  const medium = trim(body.medium, 100);
  const pageUrl = trim(body.page_url, 1000);
  const referrer = trim(body.referrer, 1000);
  const externalId =
    typeof body.external_id === "number" || typeof body.external_id === "string"
      ? String(body.external_id).slice(0, 80)
      : null;

  if (!email && !phoneE164) {
    return NextResponse.json(
      { error: "missing_identifier", detail: "phone or email required" },
      { status: 400, headers: cors },
    );
  }

  const sb = supabaseAdmin();

  // ---- 1. Match or create the customer ----
  let customerId: string | null = null;
  let customerExisted = false;
  {
    // Try phone first (more reliable identity than email).
    let existing: { id: string } | null = null;
    if (phoneE164) {
      const { data } = await sb
        .from("customers")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("primary_phone", phoneE164)
        .maybeSingle();
      existing = (data as { id: string } | null) ?? null;
    }
    if (!existing && email) {
      const { data } = await sb
        .from("customers")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("primary_email", email)
        .maybeSingle();
      existing = (data as { id: string } | null) ?? null;
    }
    if (existing) {
      customerId = existing.id;
      customerExisted = true;
      // Soft-update missing fields without overwriting existing data.
      const updates: Record<string, string | null> = {};
      if (name) updates.display_name = name;
      if (phoneE164) updates.primary_phone = phoneE164;
      if (email) updates.primary_email = email;
      if (Object.keys(updates).length > 0) {
        await sb
          .from("customers")
          .update(updates)
          .eq("id", existing.id)
          // Defensive: only fill empty fields.
          .or(
            [
              name ? "display_name.is.null" : null,
              email ? "primary_email.is.null" : null,
              phoneE164 ? "primary_phone.is.null" : null,
            ]
              .filter(Boolean)
              .join(","),
          );
      }
    } else {
      const insertPayload: Record<string, unknown> = {
        tenant_id: tenant.id,
        display_name: name ?? email ?? phoneE164 ?? "Unknown",
        primary_email: email,
        primary_phone: phoneE164,
      };
      if (address) {
        insertPayload.service_address = { line1: address };
      }
      const { data: created, error: insertErr } = await sb
        .from("customers")
        .insert(insertPayload)
        .select("id")
        .single();
      if (insertErr || !created) {
        // Soft-fail customer creation but still log the inbound lead so
        // the founder can re-run matching. Better than dropping the lead.
        console.warn("[/api/integrations/leads] customer insert failed", insertErr);
      } else {
        customerId = (created as { id: string }).id;
      }
    }
  }

  // ---- 2. Open a web_session for this lead ----
  let webSessionId: string | null = null;
  {
    const ua = req.headers.get("user-agent") || "";
    const ipHash =
      // Visitor hash here is best-effort — the WP backend hits us from
      // its own server IP, not the visitor's. We use external_id (the
      // WP lead row id) so repeat submissions stitch.
      externalId
        ? `ext:${externalId}`
        : phoneE164 || email || `lead:${Date.now()}`;
    const { data: sessionRow, error: sessionErr } = await sb
      .from("web_sessions")
      .insert({
        tenant_id: tenant.id,
        visitor_hash: ipHash,
        customer_id: customerId,
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        utm_source: source,
        utm_medium: medium,
        utm_campaign: campaign,
        referrer,
        landing_path: pageUrl,
        device: "unknown",
        user_agent: ua.slice(0, 500),
        page_view_count: 0,
        form_start_count: 0,
        form_submit_count: 1,
      })
      .select("id")
      .single();
    if (!sessionErr && sessionRow) {
      webSessionId = (sessionRow as { id: string }).id;
    }
  }

  // ---- 3. Record the form_submit web_event ----
  if (webSessionId) {
    await sb.from("web_events").insert({
      tenant_id: tenant.id,
      web_session_id: webSessionId,
      kind: "form_submit",
      path: pageUrl,
      target: service,
      meta: {
        external_id: externalId,
        service,
        notes,
        page_url: pageUrl,
        referrer,
      },
      occurred_at: new Date().toISOString(),
    });
  }

  // ---- 4. Persist raw provenance ----
  const { data: leadRow } = await sb
    .from("tenant_inbound_leads")
    .insert({
      tenant_id: tenant.id,
      customer_id: customerId,
      external_id: externalId,
      source_endpoint: "wp_leads",
      name,
      email,
      phone: phoneE164,
      address,
      service,
      notes,
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign,
      page_url: pageUrl,
      referrer,
      raw_payload: body as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  // ---- 5. Founder alert — fire-and-forget, never blocks the response ----
  void (async () => {
    try {
      const founderEmail = process.env.FOUNDER_ALERT_EMAIL;
      if (!founderEmail) return;
      const subject = `New lead · ${tenant.display_name} · ${name ?? phoneE164 ?? email ?? "anonymous"}`;
      const lines = [
        `Tenant: ${tenant.display_name} (${tenant.slug})`,
        name ? `Name: ${name}` : null,
        phoneE164 ? `Phone: ${phoneE164}` : null,
        email ? `Email: ${email}` : null,
        address ? `Address: ${address}` : null,
        service ? `Service: ${service}` : null,
        notes ? `Notes: ${notes}` : null,
        source ? `Source: ${source}${campaign ? ` · ${campaign}` : ""}${medium ? ` · ${medium}` : ""}` : null,
        pageUrl ? `Page: ${pageUrl}` : null,
        referrer ? `Referrer: ${referrer}` : null,
        customerExisted ? "(existing customer)" : "(new customer)",
      ].filter(Boolean) as string[];
      const html = lines.map((l) => `<div>${l}</div>`).join("");
      await sendInternalAlert({
        tenantId: tenant.id,
        entityId: customerId ?? undefined,
        entityType: "customer",
        kind: "wp_lead_received",
        recipients: [founderEmail],
        subject,
        html,
        text: lines.join("\n"),
      });
    } catch (e) {
      console.warn("[/api/integrations/leads] founder alert failed", e);
    }
  })();

  return NextResponse.json(
    {
      id: customerId,
      lead_id: leadRow ? (leadRow as { id: string }).id : null,
      customer_existed: customerExisted,
    },
    { status: 200, headers: cors },
  );
}
