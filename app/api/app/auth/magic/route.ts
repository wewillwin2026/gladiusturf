import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  createTenantMagicToken,
  getTenantBySlug,
  isInvitedEmail,
  tenantInvitationFor,
} from "@/lib/app/tenant-auth";

export const runtime = "nodejs";

/**
 * POST /api/app/auth/magic — request a tenant sign-in magic link.
 *
 * Always returns 200 ok:true to prevent email enumeration. If the email is
 * in the v1 invitation map, we also send a Resend email with the link.
 */
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

  // No allowlist hit → silent ok=true.
  if (!isInvitedEmail(email)) {
    return NextResponse.json({ ok: true });
  }

  const invite = tenantInvitationFor(email)!; // safe — isInvitedEmail just confirmed

  // Confirm the tenant exists in the DB. If it doesn't, skip sending —
  // a 404 error here would tell the caller "this email is allowlisted but
  // the tenant isn't provisioned" which is more info than we want to leak.
  const tenant = await getTenantBySlug(invite.tenantSlug);
  if (!tenant || !tenant.active) {
    console.warn(
      "[app/auth/magic] invitation references missing/inactive tenant",
      invite.tenantSlug,
    );
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[app/auth/magic] RESEND_API_KEY missing");
    return NextResponse.json({ ok: true });
  }

  const token = createTenantMagicToken(email, invite.tenantSlug);
  // Link goes straight to the API verify route — it returns a 302 redirect
  // either to /app (with a session cookie set) or back to /app/login with
  // an error code. No intermediate UI page is needed for v1 (no TOTP).
  const origin = req.headers.get("origin") || "https://gladiusturf.com";
  const link = `${origin}/api/app/auth/verify?token=${encodeURIComponent(token)}`;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "GladiusTurf <app@gladiusturf.com>",
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
  } catch (err) {
    console.warn("[app/auth/magic] Resend send failed", err);
  }

  return NextResponse.json({ ok: true });
}
