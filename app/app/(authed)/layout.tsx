import { redirect } from "next/navigation";
import { headers } from "next/headers";
import fs from "node:fs";
import path from "node:path";
import { AppShell } from "@/components/app/AppShell";
import { readAppSession } from "@/lib/app/session";
import { isFounderEmail } from "@/lib/founders/auth";
import { isAppPathAllowed } from "@/lib/app/access";

/**
 * Resolve a tenant's brand logo URL.
 *
 * Convention: a file at `public/tenant-logos/<slug>.png` (or .jpg /
 * .svg / .webp) is the tenant's logo. The sidebar renders it in
 * place of the letter-mark when present. Easy onboarding for new
 * tenants — drop the file with the right name, redeploy.
 *
 * Defensive: returns null on any file-system hiccup or unknown
 * extension. The sidebar gracefully falls back to the letter mark.
 */
function tenantLogoUrl(slug: string): string | null {
  const extensions = ["png", "jpg", "jpeg", "svg", "webp"];
  for (const ext of extensions) {
    const rel = `/tenant-logos/${slug}.${ext}`;
    const abs = path.join(process.cwd(), "public", rel);
    try {
      if (fs.existsSync(abs)) return rel;
    } catch {
      // ignore — fall through
    }
  }
  return null;
}

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
    const logoUrl = tenantLogoUrl(session.tenant.slug);
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
        logoUrl={logoUrl}
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
