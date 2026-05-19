import { cookies } from "next/headers";
import {
  APP_COOKIE_NAME,
  LEGACY_APP_COOKIE_NAME,
  verifyAppSessionCookieValue,
} from "@/lib/app-auth";
import {
  TENANT_COOKIE_NAME,
  getTenantBySlug,
  type TenantRole,
  type TenantRow,
  verifyTenantSessionCookieValue,
} from "@/lib/app/tenant-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { isFounderEmail } from "@/lib/founders/auth";

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
  | { kind: "tenant"; email: string; tenantSlug: string; tenant: TenantRow; role: TenantRole }
  | { kind: "demo" }
  | { kind: "unauthenticated" };

export async function readAppSession(): Promise<AppSession> {
  const store = await cookies();

  const tenantRaw = store.get(TENANT_COOKIE_NAME)?.value;
  const tenantSession = verifyTenantSessionCookieValue(tenantRaw);
  if (tenantSession) {
    const tenant = await getTenantBySlug(tenantSession.tenantSlug);
    if (tenant && tenant.active) {
      // Determine role. Founder god-mode: any email in the founder
      // allow-list (GLADIUS_FOUNDER_EMAILS env OR the hardcoded
      // fallback in lib/founders/auth) always resolves to "owner" on
      // EVERY tenant — current and future — so Ricardo/Josh can
      // impersonate any workspace and see everything (API keys
      // included) to catch and fix bugs. This stays correct even if
      // GLADIUS_FOUNDER_EMAILS is never set on Vercel.
      let role: TenantRole = "viewer";
      if (isFounderEmail(tenantSession.email)) {
        role = "owner";
      } else {
        // Look up active invitation to get the assigned role.
        try {
          const sb = supabaseAdmin();
          const { data } = await sb
            .from("tenant_invitations")
            .select("role")
            .eq("email", tenantSession.email.toLowerCase().trim())
            .eq("tenant_id", tenant.id)
            .eq("status", "active")
            .maybeSingle();
          if (data && (data as { role: TenantRole }).role) {
            role = (data as { role: TenantRole }).role;
          }
        } catch {
          // Non-fatal: default to "viewer" if lookup fails.
        }
      }

      return {
        kind: "tenant",
        email: tenantSession.email,
        tenantSlug: tenantSession.tenantSlug,
        tenant,
        role,
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
