import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  APP_COOKIE_NAME,
  LEGACY_APP_COOKIE_NAME,
  verifyAppSessionCookieValue,
} from "@/lib/app-auth";
import {
  TENANT_COOKIE_NAME,
  getTenantBySlug,
  verifyTenantSessionCookieValue,
} from "@/lib/app/tenant-auth";
import { AppShell } from "@/components/app/AppShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function AppAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();

  // Tenant session (real customer) takes precedence over demo session.
  const tenantSessionRaw = store.get(TENANT_COOKIE_NAME)?.value;
  const tenantSession = verifyTenantSessionCookieValue(tenantSessionRaw);
  if (tenantSession) {
    const tenant = await getTenantBySlug(tenantSession.tenantSlug);
    if (!tenant || !tenant.active) {
      // Cookie was valid but tenant is gone or paused — drop straight back
      // to login with a meaningful error.
      redirect("/app/login?error=tenant_inactive");
    }
    return (
      <AppShell
        product="founders"
        user={{
          name: tenantSession.email,
          subtitle: `${tenant.display_name} · ${tenant.plan_tier}`,
        }}
        logoutHref="/api/app/logout"
      >
        {children}
      </AppShell>
    );
  }

  // Fall back to legacy demo session for the existing sales-call flow.
  const demoSession =
    store.get(APP_COOKIE_NAME)?.value ??
    store.get(LEGACY_APP_COOKIE_NAME)?.value;
  if (!verifyAppSessionCookieValue(demoSession)) redirect("/app/login");

  return (
    <AppShell
      product="demo"
      user={{ name: "Marcus Cypress", subtitle: "Owner · Cypress Lawn" }}
      logoutHref="/api/app/logout"
    >
      {children}
    </AppShell>
  );
}
