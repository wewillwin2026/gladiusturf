import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AppShell } from "@/components/app/AppShell";
import { readAppSession } from "@/lib/app/session";
import { isFounderEmail } from "@/lib/founders/auth";
import { isAppPathAllowed } from "@/lib/app/access";

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
  const session = await readAppSession();

  if (session.kind === "unauthenticated") {
    redirect("/app/login");
  }

  if (session.kind === "tenant") {
    const role = session.role;
    // Founder check is independent of tenant role: a future paying
    // customer who is "owner" of their own shop must NOT see the
    // Founders Portal door. Only Ricardo/Josh (founder allow-list) do.
    const isFounder = isFounderEmail(session.email);

    // SERVER-SIDE RBAC ENFORCEMENT. Hiding the sidebar link is not
    // enough — a restricted worker (Crew Lead / Field Tech) could
    // deep-link straight to /app/invoices, /app/reports, /app/settings,
    // etc. The middleware forwards the resolved path as x-gt-path; if
    // this role can't access that engine, bounce to the dashboard.
    // Founders keep god-mode (isFounder bypasses founder-only gates).
    const path = (await headers()).get("x-gt-path") ?? "";
    if (path && !isAppPathAllowed(path, role, isFounder)) {
      redirect("/app");
    }
    return (
      <AppShell
        product="tenant"
        user={{
          name: session.email,
          subtitle: `${session.tenant.display_name} · ${session.tenant.plan_tier}`,
        }}
        logoutHref="/api/app/logout"
        hideAskGladius
        vertical={session.tenant.vertical}
        tenantName={session.tenant.display_name}
        flags={{ marketing: session.tenant.marketing_tab_enabled }}
        role={role}
        isFounder={isFounder}
      >
        {children}
      </AppShell>
    );
  }

  // Demo session — preserve the existing sales-call surface untouched.
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
