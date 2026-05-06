import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { readAppSession } from "@/lib/app/session";

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
    return (
      <AppShell
        product="founders"
        user={{
          name: session.email,
          subtitle: `${session.tenant.display_name} · ${session.tenant.plan_tier}`,
        }}
        logoutHref="/api/app/logout"
        hideAskGladius
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
