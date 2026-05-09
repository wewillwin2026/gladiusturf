import { NextResponse } from "next/server";
import {
  buildTenantSetCookieHeader,
  consumeRecoveryCode,
  createTenantSessionCookieValue,
  getTenantBySlug,
  getTenantUserSecret,
  recordTenantLogin,
  verifyPartialAuthToken,
} from "@/lib/app/tenant-auth";
import { verifyTotpCode } from "@/lib/app/totp";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * POST /api/app/auth/totp — second-factor verification.
 *
 * Body: { partial, code }
 * - `partial` is the short-lived token issued by /api/app/auth/password
 *   AFTER successful password verification.
 * - `code` is either the 6-digit TOTP from the authenticator app OR a
 *   recovery code in the form "abcd-1234".
 *
 * Returns { ok: true } + Set-Cookie on success, { error } otherwise.
 *
 * Recovery-code consumption is one-time: the matching hash is removed
 * from `tenant_user_secrets.recovery_codes_hashed` before the cookie is
 * issued, so a code can never be replayed.
 */
export async function POST(req: Request) {
  let body: { partial?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const partial = String(body.partial || "");
  const code = String(body.code || "").trim();
  if (!partial || !code) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const claim = verifyPartialAuthToken(partial);
  if (!claim) {
    return NextResponse.json({ error: "expired_partial" }, { status: 401 });
  }

  const tenant = await getTenantBySlug(claim.tenantSlug);
  if (!tenant || !tenant.active) {
    return NextResponse.json({ error: "tenant_inactive" }, { status: 401 });
  }

  const secret = await getTenantUserSecret(claim.email);
  if (!secret?.totp_secret) {
    // Defensive — partial issued but secret was cleared between steps.
    return NextResponse.json({ error: "totp_not_enrolled" }, { status: 401 });
  }

  // Try TOTP first (the common case).
  let factor: "totp" | "recovery" | null = null;
  if (verifyTotpCode(secret.totp_secret, code)) {
    factor = "totp";
  } else if (code.length >= 8) {
    // Try recovery code — only if the input looks like a code, not a
    // mistyped TOTP digit. Recovery codes are hex pairs joined by `-`.
    const consumed = await consumeRecoveryCode(claim.email, code);
    if (consumed) factor = "recovery";
  }

  if (!factor) {
    try {
      const sb = supabaseAdmin();
      await sb.from("audit_log").insert({
        tenant_id: tenant.id,
        user_id: null,
        action: "tenant_totp_failed",
        entity_type: "auth.users",
        entity_id: claim.email,
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
    return NextResponse.json({ error: "invalid_code" }, { status: 401 });
  }

  await recordTenantLogin(claim.email).catch(() => {});

  try {
    const sb = supabaseAdmin();
    await sb.from("audit_log").insert({
      tenant_id: tenant.id,
      user_id: null,
      action: "tenant_session_created",
      entity_type: "auth.users",
      entity_id: claim.email,
      metadata: { method: "password+totp", factor },
      ip:
        req.headers.get("x-vercel-forwarded-for") ||
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        null,
      user_agent: req.headers.get("user-agent") || null,
    });
  } catch {
    /* non-fatal */
  }

  const cookie = createTenantSessionCookieValue(claim.email, claim.tenantSlug);
  const res = NextResponse.json({ ok: true, factor });
  res.headers.append("Set-Cookie", buildTenantSetCookieHeader(cookie));
  return res;
}
