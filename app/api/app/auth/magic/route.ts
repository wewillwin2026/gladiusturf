import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { Resend } from "resend";
import {
  createTenantMagicToken,
  getTenantBySlug,
  tenantInvitationFor,
} from "@/lib/app/tenant-auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * POST /api/app/auth/magic — request a tenant sign-in magic link.
 *
 * Always returns 200 ok:true to prevent email enumeration. If the email is
 * in the v1 invitation map and the per-IP rate limit hasn't fired, we also
 * send a Resend email with the link.
 *
 * Hardening from the Phase 2 review:
 *  - Origin is hard-coded (NEXT_PUBLIC_SITE_URL or fallback) — never trust
 *    the client's `Origin` header, which would let an attacker insert a
 *    phishing domain into the email body.
 *  - Per-IP-hash rate limit (5 / hour) using audit_log as the count store.
 *    Above the limit, the request silently 200s without sending — bots
 *    can't tell they're throttled.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gladiusturf.com";
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // No allowlist hit → silent ok=true. Resend never fires, audit never
  // writes — so anonymous bots can spam any email and learn nothing.
  // The invitation lookup hits the tenant_invitations table (db-backed
  // since Phase 4); founders can revoke or add invitees without a deploy.
  const invite = await tenantInvitationFor(email);
  if (!invite) {
    return NextResponse.json({ ok: true });
  }

  const tenant = await getTenantBySlug(invite.tenantSlug);
  if (!tenant || !tenant.active) {
    console.warn(
      "[app/auth/magic] invitation references missing/inactive tenant",
      invite.tenantSlug,
    );
    return NextResponse.json({ ok: true });
  }

  // Hash the IP for rate-limit keying + audit log. Never store raw IPs.
  // Vercel sets `x-vercel-forwarded-for` itself; trust that over the
  // attacker-spoofable `x-forwarded-for` first hop.
  const ip =
    req.headers.get("x-vercel-forwarded-for") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";
  const ipHash = ip
    ? createHash("sha256").update(ip).digest("hex").slice(0, 32)
    : "no-ip";

  const sb = supabaseAdmin();

  // Count recent magic-link sends from this IP for this tenant. Audit_log
  // stores the IP hash in the `ip` text column.
  try {
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count } = await sb
      .from("audit_log")
      .select("id", { count: "exact", head: true })
      .eq("action", "tenant_magic_requested")
      .eq("tenant_id", tenant.id)
      .eq("ip", ipHash)
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      // Silent rate limit. Same response shape as success — bots can't
      // distinguish throttled from sent.
      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    console.warn("[app/auth/magic] rate-limit check failed (allow-fail)", err);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[app/auth/magic] RESEND_API_KEY missing");
    return NextResponse.json({ ok: true });
  }

  const token = createTenantMagicToken(email, invite.tenantSlug);
  // Origin is hard-coded so the link in the email always points at our
  // domain — never the attacker-controlled `Origin` header.
  const link = `${SITE_URL}/api/app/auth/verify?token=${encodeURIComponent(token)}`;

  // Use the same RESEND_FROM_EMAIL env the rest of the platform reads
  // (lib/messaging/email.ts) so we send from a verified Resend domain.
  // Hardcoding `app@gladiusturf.com` here was a silent-fail bug — if the
  // subdomain wasn't verified, Resend rejected the send and the whole
  // request just returned ok:true with nothing in the inbox. Falls back
  // to founders@ which has been verified since Phase 2.
  const fromAddress =
    process.env.RESEND_FROM_EMAIL ||
    "GladiusTurf <founders@gladiusturf.com>";

  try {
    const resend = new Resend(apiKey);
    const sendRes = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: `Sign in to ${tenant.display_name}`,
      text: [
        `Sign in to your ${tenant.display_name} workspace.`,
        ``,
        `Click here (valid for 15 minutes):`,
        link,
        ``,
        `If you didn't request this, ignore this email.`,
        ``,
        `— Gladius`,
      ].join("\n"),
    });
    if (sendRes.error) {
      // Resend's SDK swallows non-2xx into the result object instead of
      // throwing — log it explicitly so we can see "from address not
      // verified" errors instead of silently returning ok:true.
      console.warn("[app/auth/magic] Resend rejected send", sendRes.error);
    }
  } catch (err) {
    console.warn("[app/auth/magic] Resend send failed", err);
  }

  // Best-effort audit row — both for compliance + as the rate-limit count
  // source. Non-fatal on failure.
  try {
    await sb.from("audit_log").insert({
      tenant_id: tenant.id,
      user_id: null,
      action: "tenant_magic_requested",
      entity_type: "auth.magic",
      entity_id: email,
      metadata: { tenant_slug: invite.tenantSlug },
      ip: ipHash,
      user_agent: req.headers.get("user-agent") || null,
    });
  } catch (err) {
    console.warn("[app/auth/magic] audit insert failed (non-fatal)", err);
  }

  return NextResponse.json({ ok: true });
}
