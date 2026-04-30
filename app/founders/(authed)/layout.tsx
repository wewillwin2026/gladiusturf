import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  FOUNDER_COOKIE_NAME,
  verifyFounderSessionCookieValue,
} from "@/lib/founders/auth";
import { ADMIN_COOKIE_NAME, verifySessionCookieValue } from "@/lib/admin-auth";
import { AppShell } from "@/components/app/AppShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "War Room · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function FoundersAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();

  // Honor the new gladius_founder_session cookie first.
  const founderRaw = store.get(FOUNDER_COOKIE_NAME)?.value;
  const founder = verifyFounderSessionCookieValue(founderRaw);

  // 24-hour grace for the legacy gt_founders_session HMAC cookie so currently
  // signed-in founders aren't kicked out at deploy time.
  const legacyOk = !founder
    ? verifySessionCookieValue(store.get(ADMIN_COOKIE_NAME)?.value)
    : false;

  if (!founder && !legacyOk) redirect("/founders/login");

  const email = founder?.email ?? "founder@gladiusturf.com";
  const name = nameFromEmail(email);

  return (
    <AppShell
      product="founders"
      user={{ name, subtitle: email }}
      logoutHref="/api/founders/logout"
    >
      {children}
    </AppShell>
  );
}

function nameFromEmail(email: string): string {
  if (email.startsWith("ricardo")) return "Ricardo Gamón";
  if (email.startsWith("joshua")) return "Joshua Pyorke";
  return email.split("@")[0]!;
}
