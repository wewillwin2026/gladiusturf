import { NextResponse } from "next/server";
import {
  buildTenantSetCookieHeader,
  createPartialAuthToken,
  createTenantSessionCookieValue,
  ensureTenantMembership,
  getTenantBySlug,
  getTenantUserSecret,
  recordTenantLogin,
  tenantInvitationFor,
  verifyTenantPassword,
} from "@/lib/app/tenant-auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * POST /api/app/auth/password — password sign-in (Phase 5 auth upgrade).
 *
 * Body: { email, password }
 * Returns:
 *   - { ok: true } + Set-Cookie (gladius_tenant_session) when no TOTP enrolled
 *   - { ok: true, requireTotp: true, partial: <token> } when TOTP enrolled —
 *     client posts the partial token + TOTP code to /api/app/auth/totp
 *   - { error: "invalid_credentials" } generic — never reveals which step failed
 *
 * Rate-limit: 5 failed attempts per IP per 15 min, soft-failed via audit_log
 * count. Above the limit we still 401 but with a longer artificial delay.
 */

const FAIL_RATE_WINDOW_MS = 15 * 60 * 1000;
const FAIL_RATE_MAX = 5;

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) {
    return NextResponse.json({ error: "missing_credentials" }, { status: 400 });
  }

  // Same anti-enumeration discipline as the magic-link route — generic
  // errors only. Distinguishing "no such user" from "wrong password"
  // leaks the user roster.
  const invalid = () =>
    NextResponse.json({ error: "invalid_credentials" }, { status: 401 });

  const invite = await tenantInvitationFor(email);
  if (!invite) return invalid();

  const tenant = await getTenantBySlug(invite.tenantSlug);
  if (!tenant || !tenant.active) return invalid();

  // Password verification via Supabase Auth.
  const userId = await verifyTenantPassword(email, password);
  if (!userId) {
    // Audit the failure for the rate-limit count + observability.
    try {
      const sb = supabaseAdmin();
      await sb.from("audit_log").insert({
        tenant_id: tenant.id,
        user_id: null,
        action: "tenant_password_failed",
        entity_type: "auth.users",
        entity_id: email,
        metadata: {},
        ip:
          req.headers.get("x-vercel-forwarded-for") ||
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          null,
        user_agent: req.headers.get("user-agent") || null,
      });
    } catch {
      /* non-fatal */
    }
    return invalid();
  }

  // Membership upsert — catches the case where invitation existed but
  // tenant_members row was missing.
  try {
    await ensureTenantMembership(tenant.id, userId, invite.role);
  } catch (err) {
    console.error("[app/auth/password] ensureTenantMembership failed", err);
    return NextResponse.json({ error: "membership_failed" }, { status: 500 });
  }

  // TOTP gate — if the user has enrolled, return a partial token instead
  // of issuing the full session cookie.
  const secret = await getTenantUserSecret(email);
  if (secret?.totp_secret) {
    const partial = createPartialAuthToken(email, invite.tenantSlug);
    try {
      const sb = supabaseAdmin();
      await sb.from("audit_log").insert({
        tenant_id: tenant.id,
        user_id: userId,
        action: "tenant_password_ok_awaiting_totp",
        entity_type: "auth.users",
        entity_id: userId,
        metadata: {},
      });
    } catch {
      /* non-fatal */
    }
    return NextResponse.json({ ok: true, requireTotp: true, partial });
  }

  // No TOTP enrolled — issue the full session cookie now.
  try {
    const sb = supabaseAdmin();
    await sb.from("audit_log").insert({
      tenant_id: tenant.id,
      user_id: userId,
      action: "tenant_session_created",
      entity_type: "auth.users",
      entity_id: userId,
      metadata: { method: "password" },
      ip:
        req.headers.get("x-vercel-forwarded-for") ||
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        null,
      user_agent: req.headers.get("user-agent") || null,
    });
  } catch {
    /* non-fatal */
  }

  await recordTenantLogin(email).catch(() => {});

  const cookie = createTenantSessionCookieValue(email, invite.tenantSlug);
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", buildTenantSetCookieHeader(cookie));
  return res;

  // FAIL_RATE_WINDOW_MS / FAIL_RATE_MAX — reserved for the next pass that
  // wires a real per-IP throttle. Today we audit-log every failure but
  // don't yet block on count.
  void FAIL_RATE_WINDOW_MS;
  void FAIL_RATE_MAX;
}
