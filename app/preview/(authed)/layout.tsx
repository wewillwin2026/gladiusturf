import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
} from "lucide-react";
import {
  PREVIEW_COOKIE_NAME,
  verifyPreviewSessionCookieValue,
} from "@/lib/preview-auth";
import { ENGINE_TIERS } from "@/content/engine-tiers";
import { ENGINES } from "@/content/engines";

export const dynamic = "force-dynamic";

export default async function PreviewAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get(PREVIEW_COOKIE_NAME)?.value;
  if (!verifyPreviewSessionCookieValue(session)) redirect("/preview/login");

  return (
    <div className="min-h-screen bg-pitch text-bone">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-bone/10 bg-pitch/95 backdrop-blur supports-[backdrop-filter]:bg-pitch/80">
        <div className="flex items-center gap-6 px-6 py-3">
          <Link href="/preview" className="flex items-center gap-2">
            <span className="font-serif text-lg tracking-tight text-bone">
              GladiusTurf
            </span>
            <span className="rounded-full border border-champagne/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-champagne-bright">
              Riverside Lawn &amp; Landscape
            </span>
          </Link>

          <div className="ml-6 hidden flex-1 md:block">
            <div className="flex h-9 max-w-xl items-center gap-2 rounded-md border border-bone/10 bg-bone/[0.03] px-3 text-sm text-bone/55">
              <Search className="h-4 w-4 text-bone/40" />
              <span>Search jobs, customers, properties…</span>
              <span className="ml-auto rounded border border-bone/10 px-1.5 py-0.5 font-mono text-[10px] text-bone/40">
                ⌘K
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="relative rounded-md p-2 text-bone/60 transition-colors hover:bg-bone/5 hover:text-bone"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-honey-bright" />
            </button>
            <button
              type="button"
              className="rounded-md p-2 text-bone/60 transition-colors hover:bg-bone/5 hover:text-bone"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <div className="ml-2 flex items-center gap-2 rounded-md border border-bone/10 bg-bone/[0.03] px-2 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-champagne-bright/15 text-[11px] font-semibold text-champagne-bright">
                R
              </div>
              <span className="hidden text-xs text-bone/80 sm:inline">
                Reggie · Owner
              </span>
              <ChevronDown className="h-3 w-3 text-bone/50" />
            </div>
            <form action="/api/preview/logout" method="POST">
              <button
                type="submit"
                className="ml-1 flex items-center gap-1.5 rounded-md border border-bone/10 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.16em] text-bone/60 transition-colors hover:bg-bone/5 hover:text-bone"
              >
                <LogOut className="h-3 w-3" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-6 py-6">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="sticky top-[68px] flex flex-col gap-1">
            <Link
              href="/preview"
              className="flex items-center gap-2 rounded-md border border-champagne/30 bg-champagne-bright/10 px-3 py-2 text-sm text-champagne-bright"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-bone/40">
              Engines
            </div>

            {ENGINE_TIERS.map((tier) => {
              const tierEngines = ENGINES.filter((e) => e.tier === tier.slug);
              return (
                <div key={tier.slug} className="mt-3">
                  <div
                    className={`px-3 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                      tier.accent === "moss"
                        ? "text-moss-bright"
                        : "text-honey-bright"
                    }`}
                  >
                    {tier.name}
                    <span className="ml-1.5 text-bone/30">
                      · {tierEngines.length}
                    </span>
                  </div>
                  <ul className="mt-1.5 flex flex-col gap-0.5">
                    {tierEngines.map((engine) => (
                      <li key={engine.slug}>
                        <Link
                          href={`/preview/engines/${engine.slug}`}
                          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] text-bone/70 transition-colors hover:bg-bone/[0.04] hover:text-bone"
                        >
                          <span className="w-6 font-mono text-[10px] text-bone/35">
                            {engine.number}
                          </span>
                          <span className="truncate">{engine.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
