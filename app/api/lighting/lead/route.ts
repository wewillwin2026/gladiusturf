import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * POST /api/lighting/lead — capture from app/lighting/components/lead-form.tsx.
 *
 * Security stack applied (per spec §6):
 *   - Honeypot (`website` field) — bots fill, drop silently with 200.
 *   - Manual validation + length caps (matches /api/demo style; this codebase
 *     hasn't pulled in Zod elsewhere — adding a single dep for one route is
 *     not worth it. Validation rules are explicit below.)
 *   - Email-header sanitization on every string that lands in Resend.
 *   - Idempotency: client UUID stored as a unique column. Same UUID → 200 with
 *     the original record's id. Different field values with same UUID still
 *     dedupe; no privilege escalation possible.
 *   - IP-hash dedup window: same IP-hash submitting >5 leads in 1h gets 429.
 *   - Server-side hash of IP — never store raw.
 *
 * Deferred (introduce in a follow-up PR with explicit user sign-off):
 *   - Cloudflare Turnstile / hCaptcha (needs new env vars + script tag).
 *   - Upstash Redis sliding-window rate limit (needs new dep + creds).
 */

type Body = {
  fullName?: string;
  email?: string;
  phone?: string | null;
  businessName?: string;
  serviceArea?: string;
  crewSize?: string;
  qualifying?: string | null;
  website?: string; // honeypot
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

const ALLOWED_CREW_SIZES = ["1", "2–4", "5–10", "10+"];

const FIELD_LIMITS = {
  fullName: 120,
  email: 200,
  phone: 32,
  businessName: 120,
  serviceArea: 120,
  crewSize: 8,
  qualifying: 280,
  idempotencyKey: 64,
} as const;

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5;

/**
 * Strip CR/LF and any header-shaped tokens before letting a string land in
 * an email subject, name, or reply-to. Belt-and-suspenders — Resend
 * already escapes, but we don't want to take a CVE on `name: "Foo\r\nBcc: …"`.
 */
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

  // Honeypot — drop silently with a fake 200 so bots don't learn.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // Required-field validation. Length caps are also a basic abuse mitigation.
  const fullName = clamp(body.fullName, FIELD_LIMITS.fullName);
  const email = clamp(body.email, FIELD_LIMITS.email).toLowerCase();
  const phoneRaw = clamp(body.phone ?? "", FIELD_LIMITS.phone);
  const businessName = clamp(body.businessName, FIELD_LIMITS.businessName);
  const serviceArea = clamp(body.serviceArea, FIELD_LIMITS.serviceArea);
  const crewSize = clamp(body.crewSize, FIELD_LIMITS.crewSize);
  const qualifyingRaw = clamp(body.qualifying ?? "", FIELD_LIMITS.qualifying);
  const idempotencyKey = clamp(
    body.idempotencyKey ?? "",
    FIELD_LIMITS.idempotencyKey,
  );

  if (!fullName || !email || !businessName || !serviceArea || !crewSize) {
    return NextResponse.json(
      { error: "missing_required_field" },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  if (!ALLOWED_CREW_SIZES.includes(crewSize)) {
    return NextResponse.json({ error: "invalid_crew_size" }, { status: 400 });
  }

  // IP hash for rate-limit + storage. Never store raw IP.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";
  const ipHash = ip
    ? createHash("sha256").update(ip).digest("hex").slice(0, 32)
    : null;

  const sb = supabaseAdmin();

  // Idempotency check first — same UUID returns the prior insert's id.
  if (idempotencyKey) {
    const { data: existing } = await sb
      .from("lighting_leads")
      .select("id")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (existing?.id) {
      return NextResponse.json({ ok: true, id: existing.id, deduped: true });
    }
  }

  // Per-IP rate limit — last hour, count rows from this hash.
  if (ipHash) {
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count } = await sb
      .from("lighting_leads")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
  }

  // Insert.
  let leadId: string | null = null;
  try {
    const { data, error } = await sb
      .from("lighting_leads")
      .insert({
        full_name: fullName,
        email,
        phone: phoneRaw || null,
        business_name: businessName,
        service_area: serviceArea,
        crew_size: crewSize,
        qualifying: qualifyingRaw || null,
        idempotency_key: idempotencyKey || null,
        ip_hash: ipHash,
        utm_source: body.utm_source || null,
        utm_medium: body.utm_medium || null,
        utm_campaign: body.utm_campaign || null,
        utm_term: body.utm_term || null,
        utm_content: body.utm_content || null,
        referrer: body.referrer || null,
        source_page: body.source_page || "/lighting",
      })
      .select("id")
      .single();
    if (error) {
      // Unique violation on idempotency_key — race against the check above.
      // Re-resolve and return the existing id.
      if (error.code === "23505" && idempotencyKey) {
        const { data: existing } = await sb
          .from("lighting_leads")
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
      console.warn("lighting_leads insert failed", error);
      return NextResponse.json({ error: "store_failed" }, { status: 500 });
    }
    leadId = data?.id ?? null;
  } catch (err) {
    console.warn("lighting_leads insert errored", err);
    return NextResponse.json({ error: "store_failed" }, { status: 500 });
  }

  // Founder alert. Lead is captured even if email send fails.
  if (process.env.RESEND_API_KEY) {
    try {
      const safeName = sanitizeForEmail(fullName);
      const safeBusiness = sanitizeForEmail(businessName);
      const safeServiceArea = sanitizeForEmail(serviceArea);
      const safeQualifying = qualifyingRaw ? sanitizeForEmail(qualifyingRaw) : "";

      const lines = [
        `Name: ${safeName}`,
        `Email: ${email}`,
        phoneRaw ? `Phone: ${sanitizeForEmail(phoneRaw)}` : null,
        `Business: ${safeBusiness}`,
        `Service area: ${safeServiceArea}`,
        `Crew size: ${crewSize}`,
        ``,
        safeQualifying ? `What would change everything:` : null,
        safeQualifying ? `  ${safeQualifying}` : null,
        safeQualifying ? `` : null,
        `Source: ${body.source_page || "/lighting"}`,
        body.utm_source
          ? `UTM: ${sanitizeForEmail(body.utm_source)} / ${sanitizeForEmail(body.utm_medium || "—")} / ${sanitizeForEmail(body.utm_campaign || "—")}`
          : null,
        body.referrer ? `Referrer: ${sanitizeForEmail(body.referrer)}` : null,
        ``,
        `Open in War Room → https://gladiusturf.com/founders/war-room`,
      ]
        .filter((l) => l !== null)
        .join("\n");

      const subject = sanitizeForEmail(
        `🔆 Lighting lead · ${safeBusiness} · ${crewSize}-crew`,
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
      console.warn("lighting_leads email send failed (non-fatal)", err);
    }
  }

  return NextResponse.json({ ok: true, id: leadId });
}
