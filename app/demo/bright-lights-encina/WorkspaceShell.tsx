"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  CloudLightning,
  Compass,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { BRAND } from "@/lib/demo-data/bright-lights";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV: NavItem[] = [
  { label: "Today", href: "/demo/bright-lights-encina/dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/demo/bright-lights-encina/customers/BL-MJ", icon: Users },
  { label: "Maintenance Plans", href: "/demo/bright-lights-encina/plans", icon: Sparkles },
  { label: "Routes", href: "/demo/bright-lights-encina/routes", icon: Compass },
  { label: "Reviews", href: "/demo/bright-lights-encina/reviews", icon: Star },
  { label: "Storm Mode", href: "/demo/bright-lights-encina/storm", icon: CloudLightning },
  { label: "Plans & Pricing", href: "/demo/bright-lights-encina/pricing", icon: CreditCard },
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [lang, setLang] = React.useState<"EN" | "ES">("EN");
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => setMobileOpen(false), [pathname]);

  async function lock() {
    try {
      await fetch("/api/bright-lights/lock", { method: "POST" });
    } catch {}
    router.replace("/demo/bright-lights-encina");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar — desktop */}
      <aside
        className="hidden md:flex md:flex-col md:gap-1 md:px-3 md:py-5"
        style={{
          width: 232,
          background: "rgba(0,0,0,0.18)",
          borderRight: "1px solid var(--bl-border)",
        }}
      >
        <div className="flex items-center gap-2.5 px-2 pb-5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-md"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <Image
              src="/bright-lights/logo.png"
              alt="Bright Lights"
              width={28}
              height={22}
            />
          </div>
          <div className="min-w-0">
            <div
              className="bl-serif truncate text-[14px] leading-tight"
              style={{ color: "var(--bl-text)" }}
            >
              Bright Lights
            </div>
            <div
              className="text-[10px] leading-tight"
              style={{ color: "var(--bl-text-faint)" }}
            >
              Command Center
            </div>
          </div>
        </div>

        <NavList items={NAV} pathname={pathname} />

        <div className="mt-auto flex flex-col gap-2 pt-4">
          <UserCard />
          <button
            onClick={lock}
            className="bl-btn-ghost"
            style={{ justifyContent: "flex-start" }}
          >
            <LogOut className="h-3.5 w-3.5" /> Lock workspace
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <header
        className="flex items-center justify-between px-4 py-3 md:hidden"
        style={{ background: "rgba(0,0,0,0.18)", borderBottom: "1px solid var(--bl-border)" }}
      >
        <div className="flex items-center gap-2">
          <Image
            src="/bright-lights/logo.png"
            alt="Bright Lights"
            width={28}
            height={22}
          />
          <span className="bl-serif text-[14px]">Bright Lights</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
          className="rounded-md p-1.5"
          style={{ color: "var(--bl-text-muted)" }}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {mobileOpen && (
        <nav
          className="flex flex-col gap-1 px-4 py-3 md:hidden"
          style={{ background: "rgba(0,0,0,0.32)", borderBottom: "1px solid var(--bl-border)" }}
        >
          <NavList items={NAV} pathname={pathname} />
          <button onClick={lock} className="bl-btn-ghost mt-2 self-start">
            <LogOut className="h-3.5 w-3.5" /> Lock workspace
          </button>
        </nav>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        <DesktopTopbar lang={lang} setLang={setLang} />
        <main className="bl-fade-in flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavList({
  items,
  pathname,
}: {
  items: NavItem[];
  pathname: string | null;
}) {
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((it) => {
        const Icon = it.icon;
        const active =
          pathname === it.href ||
          (it.label === "Customers" && pathname?.startsWith("/demo/bright-lights-encina/customers"));
        return (
          <Link
            key={it.href}
            href={it.href}
            prefetch
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors"
            style={{
              background: active ? "rgba(244,184,96,0.12)" : "transparent",
              color: active ? "var(--bl-text)" : "var(--bl-text-muted)",
              borderLeft: active
                ? "2px solid var(--bl-accent)"
                : "2px solid transparent",
            }}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function UserCard() {
  return (
    <div
      className="rounded-md px-3 py-2.5"
      style={{ background: "rgba(0,0,0,0.32)", border: "1px solid var(--bl-border)" }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-medium"
          style={{
            background: "rgba(244,184,96,0.18)",
            color: "var(--bl-accent)",
            border: "1px solid rgba(244,184,96,0.4)",
          }}
        >
          FE
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-[12px] leading-tight"
            style={{ color: "var(--bl-text)" }}
          >
            {BRAND.operator}
          </div>
          <div
            className="text-[10px] leading-tight"
            style={{ color: "var(--bl-text-faint)" }}
          >
            Operator
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopTopbar({
  lang,
  setLang,
}: {
  lang: "EN" | "ES";
  setLang: (v: "EN" | "ES") => void;
}) {
  return (
    <header
      className="hidden items-center justify-between px-8 py-4 md:flex"
      style={{ borderBottom: "1px solid var(--bl-border)" }}
    >
      <div className="flex items-baseline gap-3">
        <span className="bl-eyebrow-muted">Workspace</span>
        <span
          className="bl-serif text-[18px]"
          style={{ color: "var(--bl-text)" }}
        >
          {BRAND.name}
        </span>
        <span className="bl-eyebrow-muted">· Sarasota, FL</span>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="flex overflow-hidden rounded-full text-[11px]"
          style={{ border: "1px solid var(--bl-border-strong)" }}
        >
          {(["EN", "ES"] as const).map((opt) => {
            const active = lang === opt;
            return (
              <button
                key={opt}
                onClick={() => setLang(opt)}
                className="px-3 py-1.5 transition-colors"
                style={{
                  background: active ? "var(--bl-accent)" : "transparent",
                  color: active ? "#1a1208" : "var(--bl-text-muted)",
                  fontWeight: active ? 600 : 400,
                }}
                aria-pressed={active}
              >
                {opt === "EN" ? "🇺🇸 EN" : "🇪🇸 ES"}
              </button>
            );
          })}
        </div>
        <button className="bl-btn-ghost" aria-label="Help">
          <MessageSquare className="h-3.5 w-3.5" /> Help
        </button>
        <button className="bl-btn-ghost" aria-label="Calendar">
          <CalendarDays className="h-3.5 w-3.5" /> May 1
        </button>
      </div>
    </header>
  );
}
