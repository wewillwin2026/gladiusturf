import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authIntegration, unauthorized } from "@/lib/integrations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeadBody = {
  // External identifier from the WP plugin row
  lead_id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  service?: string;
  notes?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  page_url?: string;
  referrer?: string;
  [k: string]: unknown;
};

function normalizePhone(raw: string | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

export async function POST(req: Request) {
  const tenant = await authIntegration(req);
  if (!tenant) return unauthorized();

  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const phoneE164 = normalizePhone(body.phone);
  const email = body.email?.toLowerCase().trim().slice(0, 200) ?? null;
  const name = body.name?.trim().slice(0, 200) ?? null;
  const externalId = body.lead_id ? String(body.lead_id).slice(0, 80) : null;

  // Upsert customer by phone or email; create if none found.
  let customerId: string | null = null;
  if (phoneE164 || email) {
    const q = sb
      .from("customers")
      .select("id")
      .eq("tenant_id", tenant.id)
      .limit(1);
    if (phoneE164 && email) {
      q.or(`primary_phone.eq.${phoneE164},primary_email.eq.${email}`);
    } else if (phoneE164) {
      q.eq("primary_phone", phoneE164);
    } else {
      q.eq("primary_email", email!);
    }
    const { data: existing } = await q.maybeSingle();
    if (existing) {
      customerId = (existing as { id: string }).id;
    } else {
      // Create a minimal customer record for the lead.
      const { data: created } = await sb
        .from("customers")
        .insert({
          tenant_id: tenant.id,
          full_name: name,
          primary_phone: phoneE164,
          primary_email: email,
          source: "wp_leads",
        })
        .select("id")
        .single();
      if (created) customerId = (created as { id: string }).id;
    }
  }

  // Record the raw lead provenance regardless of customer match.
  const { data: leadRow, error: leadErr } = await sb
    .from("tenant_inbound_leads")
    .insert({
      tenant_id: tenant.id,
      customer_id: customerId,
      external_id: externalId,
      source_endpoint: "wp_leads",
      name,
      email,
      phone: phoneE164,
      address: body.address?.slice(0, 500) ?? null,
      service: body.service?.slice(0, 200) ?? null,
      notes: body.notes?.slice(0, 2000) ?? null,
      utm_source: body.utm_source?.slice(0, 200) ?? null,
      utm_medium: body.utm_medium?.slice(0, 200) ?? null,
      utm_campaign: body.utm_campaign?.slice(0, 200) ?? null,
      page_url: body.page_url?.slice(0, 500) ?? null,
      referrer: body.referrer?.slice(0, 500) ?? null,
      raw_payload: body,
    })
    .select("id")
    .single();

  if (leadErr) {
    console.error("[integrations/leads] insert failed", leadErr.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // Create a web_session + form_submit event so the marketing tab counts
  // this as a conversion — session has no visitor hash (server-sourced).
  if (customerId) {
    const { data: session } = await sb
      .from("web_sessions")
      .insert({
        tenant_id: tenant.id,
        visitor_hash: `wp_lead_${(leadRow as { id: string }).id}`,
        customer_id: customerId,
        utm_source: body.utm_source ?? null,
        utm_medium: body.utm_medium ?? null,
        utm_campaign: body.utm_campaign ?? null,
        referrer: body.referrer ?? null,
        landing_path: body.page_url ?? null,
        device: "unknown",
      })
      .select("id")
      .single();

    if (session) {
      await sb.from("web_events").insert({
        tenant_id: tenant.id,
        web_session_id: (session as { id: string }).id,
        kind: "form_submit",
        path: body.page_url ?? null,
        target: "wp_leads",
        meta: { lead_id: (leadRow as { id: string }).id },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    id: (leadRow as { id: string }).id,
    customer_id: customerId,
  });
}
