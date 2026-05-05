import { cookies } from "next/headers";
import {
  APP_COOKIE_NAME,
  LEGACY_APP_COOKIE_NAME,
  verifyAppSessionCookieValue,
} from "@/lib/app-auth";
import {
  TENANT_COOKIE_NAME,
  getTenantBySlug,
  type TenantRow,
  verifyTenantSessionCookieValue,
} from "@/lib/app/tenant-auth";

/**
 * Server-side helper that reads /app session cookies and returns a
 * discriminated union of who's signed in. Use this from any server
 * component or server action under /app/(authed) that needs to either:
 *   - render the demo seed (Cypress Lawn) for sales-call sessions, or
 *   - query tenant-scoped real data for paying customers.
 *
 * Tenant cookie takes precedence — if both cookies are present (e.g. a
 * sales call left the demo cookie in the browser, then the user clicked
 * a magic link), the tenant identity wins.
 */

export type AppSession =
  | { kind: "tenant"; email: string; tenantSlug: string; tenant: TenantRow }
  | { kind: "demo" }
  | { kind: "unauthenticated" };

export async function readAppSession(): Promise<AppSession> {
  const store = await cookies();

  const tenantRaw = store.get(TENANT_COOKIE_NAME)?.value;
  const tenantSession = verifyTenantSessionCookieValue(tenantRaw);
  if (tenantSession) {
    const tenant = await getTenantBySlug(tenantSession.tenantSlug);
    if (tenant && tenant.active) {
      return {
        kind: "tenant",
        email: tenantSession.email,
        tenantSlug: tenantSession.tenantSlug,
        tenant,
      };
    }
  }

  const demoRaw =
    store.get(APP_COOKIE_NAME)?.value ?? store.get(LEGACY_APP_COOKIE_NAME)?.value;
  if (verifyAppSessionCookieValue(demoRaw)) {
    return { kind: "demo" };
  }

  return { kind: "unauthenticated" };
}
