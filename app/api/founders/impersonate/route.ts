import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  FOUNDER_COOKIE_NAME,
  verifyFounderSessionCookieValue,
} from "@/lib/founders/auth";
import {
  buildTenantSetCookieHeader,
  createTenantSessionCookieValue,
  getTenantBySlug,
} from "@/lib/app/tenant-auth";

export const runtime = "nodejs";

/**
 * POST /api/founders/impersonate
 * Body: { tenantSlug: string }
 *
 * Requires a valid gladius_founder_session cookie. Issues a
 * gladius_tenant_session scoped to the requested tenant so the founder
 * can open /app and see that tenant's live workspace.
 *
 * No tenant_members row is needed — readAppSession() only calls
 * getTenantBySlug(), so a valid cookie + an active tenant is enough.
 */
export async function POST(req: Request) {
  const store = await cookies();
  const founderRaw = store.get(FOUNDER_COOKIE_NAME)?.value;
  const founder = verifyFounderSessionCookieValue(founderRaw);
  if (!founder) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { tenantSlug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const tenantSlug = String(body.tenantSlug || "").trim().toLowerCase();
  if (!tenantSlug) {
    return NextResponse.json({ error: "tenantSlug required" }, { status: 400 });
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !tenant.active) {
    return NextResponse.json({ error: "tenant_not_found" }, { status: 404 });
  }

  const cookie = createTenantSessionCookieValue(founder.email, tenantSlug);
  const res = NextResponse.json({
    ok: true,
    tenantSlug,
    displayName: tenant.display_name,
  });
  res.headers.set("Set-Cookie", buildTenantSetCookieHeader(cookie));
  return res;
}
