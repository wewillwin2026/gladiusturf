import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";
import { CREWS, YEARS_IN_BUSINESS } from "@/lib/vertical/copy";
import { VERTICAL_SLUGS, type VerticalSlug } from "@/lib/vertical/types";

export const runtime = "nodejs";

/**
 * POST /api/vertical/lead — shared capture endpoint for all 8 vertical
 * marketing surfaces (the live /lighting page + 7 waitlist pages). Routes the
 * lead into `public.vertical_leads` keyed by `vertical`.
 *
 * Security stack:
 *   - Honeypot drop (silent 200)
 *   - Field-level validation + length caps
 *   - Email-header sanitization for the Resend founder alert
 *   - Idempotency via client UUID + unique column
 *   - IP-hash dedup window (5 / hour per IP-hash, across ALL verticals)
 *   - Server-side IP hash; never persist raw IP
 *
 * Deferred (per ricardo's earlier sign-off): Cloudflare Turnstile, Upstash
 * Redis sliding-window rate limit, Zod schema. Honeypot + idempotency +
 * IP-hash are the v1 floor.
 */

type Body = {
  vertical?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string | null;
  serviceArea?: string;
  yearsInBusiness?: string | null;
  crews?: string | null;
  painPoint?: string | null;
  website?: string;
  idempotencyKey?: string;
  // attribution
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  source_page?: string;
};

const FOUNDER_EMAILS = ["ricardo.gamon99@icloud.com", "joshuapyorke@gmail.com"];
const FROM = "GladiusTurf <demo@gladiusturf.com>";

const FIELD_LIMITS = {
  name: 120,
  company: 160,
  email: 180,
  phone: 40,
  serviceArea: 200,
  yearsInBusiness: 16,
  crews: 16,
  painPoint: 280,
  idempotencyKey: 64,
  vertical: 16,
} as const;

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function sanitizeForEmail(input: string): string {
  return input
    .replace(/[\r\n]+/g, " ")
    .replace(/\b(bcc|cc|to|from|subject|reply-to|content-type):/gi, "")
    .trim();
}

function clamp(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.slice(0, max).trim();
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot — bots fill, drop silently with 200.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const vertical = clamp(body.vertical, FIELD_LIMITS.vertical) as VerticalSlug;
  if (!VERTICAL_SLUGS.includes(vertical)) {
    return NextResponse.json({ error: "invalid_vertical" }, { status: 400 });
  }

  const name = clamp(body.name, FIELD_LIMITS.name);
  const company = clamp(body.company, FIELD_LIMITS.company);
  const email = clamp(body.email, FIELD_LIMITS.email).toLowerCase();
  const phoneRaw = clamp(body.phone ?? "", FIELD_LIMITS.phone);
  const serviceArea = clamp(body.serviceArea, FIELD_LIMITS.serviceArea);
  const years = clamp(body.yearsInBusiness ?? "", FIELD_LIMITS.yearsInBusiness);
  const crews = clamp(body.crews ?? "", FIELD_LIMITS.crews);
  const painPointRaw = clamp(body.painPoint ?? "", FIELD_LIMITS.painPoint);
  const idempotencyKey = clamp(body.idempotencyKey ?? "", FIELD_LIMITS.idempotencyKey);

  if (!name || !company || !email || !serviceArea) {
    return NextResponse.json({ error: "missing_required_field" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (years && !YEARS_IN_BUSINESS.includes(years as (typeof YEARS_IN_BUSINESS)[number])) {
    return NextResponse.json({ error: "invalid_years_in_business" }, { status: 400 });
  }
  if (crews && !CREWS.includes(crews as (typeof CREWS)[number])) {
    return NextResponse.json({ error: "invalid_crews" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";
  const ipHash = ip
    ? createHash("sha256").update(ip).digest("hex").slice(0, 32)
    : null;

  const sb = supabaseAdmin();

  // Idempotency lookup — same UUID returns the prior insert's id.
  if (idempotencyKey) {
    const { data: existing } = await sb
      .from("vertical_leads")
      .select("id")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (existing?.id) {
      return NextResponse.json({ ok: true, id: existing.id, deduped: true });
    }
  }

  // Per-IP rate limit — across ALL verticals from same hash.
  if (ipHash) {
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count } = await sb
      .from("vertical_leads")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
  }

  let leadId: string | null = null;
  try {
    const { data, error } = await sb
      .from("vertical_leads")
      .insert({
        vertical,
        name,
        email,
        phone: phoneRaw || null,
        company,
        service_area: serviceArea,
        crew_size: crews || null, // legacy column from lighting_leads era
        crews: crews || null,
        years_in_business: years || null,
        pain_point: painPointRaw || null,
        idempotency_key: idempotencyKey || null,
        ip_hash: ipHash,
        source_ip: ip || null,
        ua: req.headers.get("user-agent") || null,
        utm_source: body.utm_source || null,
        utm_medium: body.utm_medium || null,
        utm_campaign: body.utm_campaign || null,
        utm_term: body.utm_term || null,
        utm_content: body.utm_content || null,
        referrer: body.referrer || null,
        source_page: body.source_page || `/${vertical}`,
      })
      .select("id")
      .single();
    if (error) {
      // Idempotency-key race — re-resolve and return existing id.
      if (error.code === "23505" && idempotencyKey) {
        const { data: existing } = await sb
          .from("vertical_leads")
          .select("id")
          .eq("idempotency_key", idempotencyKey)
          .maybeSingle();
        if (existing?.id) {
          return NextResponse.json({
            ok: true,
            id: existing.id,
            deduped: true,
          });
        }
      }
      console.warn("vertical_leads insert failed", error);
      return NextResponse.json({ error: "store_failed" }, { status: 500 });
    }
    leadId = data?.id ?? null;
  } catch (err) {
    console.warn("vertical_leads insert errored", err);
    return NextResponse.json({ error: "store_failed" }, { status: 500 });
  }

  // Founder alert — lead is captured even if email send fails.
  if (process.env.RESEND_API_KEY) {
    try {
      const safeName = sanitizeForEmail(name);
      const safeCompany = sanitizeForEmail(company);
      const safeServiceArea = sanitizeForEmail(serviceArea);
      const safePain = painPointRaw ? sanitizeForEmail(painPointRaw) : "";

      const lines = [
        `Vertical: ${vertical}`,
        ``,
        `Name: ${safeName}`,
        `Email: ${email}`,
        phoneRaw ? `Phone: ${sanitizeForEmail(phoneRaw)}` : null,
        `Company: ${safeCompany}`,
        `Service area: ${safeServiceArea}`,
        years ? `Years in business: ${years}` : null,
        crews ? `Crews: ${crews}` : null,
        ``,
        safePain ? `What's breaking right now:` : null,
        safePain ? `  ${safePain}` : null,
        safePain ? `` : null,
        `Source: ${body.source_page || `/${vertical}`}`,
        body.utm_source
          ? `UTM: ${sanitizeForEmail(body.utm_source)} / ${sanitizeForEmail(body.utm_medium || "—")} / ${sanitizeForEmail(body.utm_campaign || "—")}`
          : null,
        body.referrer ? `Referrer: ${sanitizeForEmail(body.referrer)}` : null,
        ``,
        `Open in War Room → https://gladiusturf.com/founders/war-room/vertical-leads`,
      ]
        .filter((l) => l !== null)
        .join("\n");

      const verticalLabel = vertical === "lighting" ? "Lighting lead" : `${vertical} waitlist`;
      const subject = sanitizeForEmail(
        `🔆 ${verticalLabel} · ${safeCompany}${crews ? ` · ${crews}` : ""}`,
      );

      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM,
        to: FOUNDER_EMAILS,
        replyTo: email,
        subject,
        text: lines,
      });
    } catch (err) {
      console.warn("vertical_leads email send failed (non-fatal)", err);
    }
  }

  return NextResponse.json({ ok: true, id: leadId });
}
