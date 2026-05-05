import { NextResponse } from "next/server";
import {
  buildTenantSetCookieHeader,
  createTenantSessionCookieValue,
  ensureAuthUser,
  ensureTenantMembership,
  getTenantBySlug,
  tenantInvitationFor,
  verifyTenantMagicToken,
} from "@/lib/app/tenant-auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * GET /api/app/auth/verify?token=… — completes the magic-link sign-in.
 *
 * Steps:
 *  1. Verify the HMAC magic token (extracts email + tenant slug).
 *  2. Confirm the tenant still exists + is active.
 *  3. Ensure an auth.users row for this email (idempotent — service role).
 *  4. Ensure a tenant_members row for (tenant, user, invited role).
 *  5. Best-effort audit_log insert.
 *  6. Set the gladius_tenant_session cookie + redirect to /app.
 *
 * The route is GET (not POST) because magic links land here directly from
 * an email click. CSRF isn't a concern: the HMAC token is the secret.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || undefined;
  const verified = verifyTenantMagicToken(token);
  if (!verified) {
    return NextResponse.redirect(
      new URL("/app/login?error=invalid_or_expired", url.origin),
    );
  }

  const { email, tenantSlug } = verified;

  // Re-check invitation + tenant existence at verify time (in case either
  // changed between magic-link issue and click — invitations live in
  // public.tenant_invitations and can be revoked by founders without a
  // deploy).
  const invite = await tenantInvitationFor(email);
  if (!invite || invite.tenantSlug !== tenantSlug) {
    return NextResponse.redirect(
      new URL("/app/login?error=no_longer_invited", url.origin),
    );
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !tenant.active) {
    return NextResponse.redirect(
      new URL("/app/login?error=tenant_inactive", url.origin),
    );
  }

  let userId: string;
  try {
    userId = await ensureAuthUser(email);
  } catch (err) {
    console.error("[app/auth/verify] ensureAuthUser failed", err);
    return NextResponse.redirect(
      new URL("/app/login?error=auth_provision_failed", url.origin),
    );
  }

  try {
    await ensureTenantMembership(tenant.id, userId, invite.role);
  } catch (err) {
    console.error("[app/auth/verify] ensureTenantMembership failed", err);
    return NextResponse.redirect(
      new URL("/app/login?error=membership_failed", url.origin),
    );
  }

  // Best-effort audit log — never block sign-in on this.
  try {
    const sb = supabaseAdmin();
    await sb.from("audit_log").insert({
      tenant_id: tenant.id,
      user_id: userId,
      action: "tenant_session_created",
      entity_type: "auth.users",
      entity_id: userId,
      metadata: { email, tenant_slug: tenantSlug },
      // Vercel sets x-vercel-forwarded-for itself; prefer it over the
      // attacker-spoofable x-forwarded-for first hop.
      ip:
        req.headers.get("x-vercel-forwarded-for") ||
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        null,
      user_agent: req.headers.get("user-agent") || null,
    });
  } catch (err) {
    console.warn("[app/auth/verify] audit insert failed (non-fatal)", err);
  }

  const cookie = createTenantSessionCookieValue(email, tenantSlug);
  const res = NextResponse.redirect(new URL("/app", url.origin));
  res.headers.append("Set-Cookie", buildTenantSetCookieHeader(cookie));
  return res;
}
