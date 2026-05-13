"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import { BRAND } from "@/lib/demo-data/meridian-grounds";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: (p: string) => boolean;
};

const NAV: NavItem[] = [
  {
    label: "Today",
    href: "/demo/meridian-grounds/dashboard",
    icon: LayoutDashboard,
    match: (p) =>
      p === "/demo/meridian-grounds/dashboard" ||
      p === "/demo/meridian-grounds",
  },
  {
    label: "Properties",
    href: "/demo/meridian-grounds/properties",
    icon: Building2,
    match: (p) => p.startsWith("/demo/meridian-grounds/properties"),
  },
  {
    label: "Work orders",
    href: "/demo/meridian-grounds/work-orders",
    icon: ClipboardList,
  },
  {
    label: "Settings",
    href: "/demo/meridian-grounds/settings",
    icon: SettingsIcon,
  },
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function lock() {
    try {
      await fetch("/api/meridian-grounds/lock", { method: "POST" });
    } catch {
      /* network blip */
    }
    router.replace("/demo/meridian-grounds");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="flex items-center justify-between gap-4 px-4 py-3 md:px-6"
        style={{
          background: "rgba(0,0,0,0.18)",
          borderBottom: "1px solid var(--mg-border)",
        }}
      >
        <Link
          href="/demo/meridian-grounds/dashboard"
          className="flex items-center gap-2"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              background: "rgba(107,148,214,0.14)",
              border: "1px solid rgba(107,148,214,0.45)",
            }}
          >
            <Building2 className="h-4 w-4" style={{ color: "var(--mg-accent)" }} />
          </span>
          <span
            className="mg-serif text-[15px]"
            style={{ color: "var(--mg-text)" }}
          >
            {BRAND.shortName}
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = n.match ? n.match(pathname ?? "") : pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                prefetch
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition-colors"
                style={{
                  background: active
                    ? "rgba(107,148,214,0.14)"
                    : "transparent",
                  color: active ? "var(--mg-accent)" : "var(--mg-text)",
                }}
              >
                <n.icon className="h-3.5 w-3.5" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <button type="button" onClick={lock} className="mg-btn-ghost">
          <LogOut className="h-3.5 w-3.5" /> Lock
        </button>
      </header>
      <nav
        className="flex items-center gap-1 overflow-x-auto px-4 py-2 md:hidden"
        style={{ background: "rgba(0,0,0,0.32)" }}
      >
        {NAV.map((n) => {
          const active = n.match ? n.match(pathname ?? "") : pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              prefetch
              className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition-colors"
              style={{
                background: active
                  ? "rgba(107,148,214,0.14)"
                  : "transparent",
                color: active ? "var(--mg-accent)" : "var(--mg-text)",
              }}
            >
              <n.icon className="h-3.5 w-3.5" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <main className="mg-fade-in flex flex-1 flex-col px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}
