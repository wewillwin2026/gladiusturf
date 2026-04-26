import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { verifySessionCookieValue, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function FoundersAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionCookieValue(session)) redirect("/founders/login");

  return (
    <div className="min-h-screen bg-pitch text-bone">
      <header className="sticky top-0 z-40 border-b border-bone/10 bg-pitch/95 backdrop-blur supports-[backdrop-filter]:bg-pitch/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/founders/war-room"
            className="font-serif text-lg tracking-tight text-bone"
          >
            GladiusTurf
            <span className="ml-2 text-xs uppercase tracking-crest text-champagne-bright">
              Founders
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/founders/war-room"
              className="rounded-md border border-champagne/30 px-3 py-1.5 text-xs uppercase tracking-tagline text-champagne-bright transition-colors hover:bg-champagne-bright/10"
            >
              War Room
            </Link>
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-md border border-bone/10 px-3 py-1.5 text-xs uppercase tracking-tagline text-bone/70 transition-colors hover:bg-bone/5 hover:text-bone"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
