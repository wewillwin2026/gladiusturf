"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  Flower2,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  Users,
} from "lucide-react";
import { BRAND } from "@/lib/demo-data/heritage-grounds";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: (p: string) => boolean;
};

const NAV: NavItem[] = [
  {
    label: "Today",
    href: "/demo/heritage-grounds/dashboard",
    icon: LayoutDashboard,
    match: (p) =>
      p === "/demo/heritage-grounds/dashboard" ||
      p === "/demo/heritage-grounds",
  },
  {
    label: "Projects",
    href: "/demo/heritage-grounds/projects",
    icon: ClipboardList,
  },
  {
    label: "Customers",
    href: "/demo/heritage-grounds/customers",
    icon: Users,
    match: (p) => p.startsWith("/demo/heritage-grounds/customers"),
  },
  {
    label: "Settings",
    href: "/demo/heritage-grounds/settings",
    icon: SettingsIcon,
  },
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function lock() {
    try {
      await fetch("/api/heritage-grounds/lock", { method: "POST" });
    } catch {
      /* network blip */
    }
    router.replace("/demo/heritage-grounds");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="flex items-center justify-between gap-4 px-4 py-3 md:px-6"
        style={{
          background: "rgba(0,0,0,0.18)",
          borderBottom: "1px solid var(--hg-border)",
        }}
      >
        <Link
          href="/demo/heritage-grounds/dashboard"
          className="flex items-center gap-2"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              background: "rgba(217,131,106,0.14)",
              border: "1px solid rgba(217,131,106,0.45)",
            }}
          >
            <Flower2
              className="h-4 w-4"
              style={{ color: "var(--hg-accent)" }}
            />
          </span>
          <span className="hg-serif text-[15px]" style={{ color: "var(--hg-text)" }}>
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
                    ? "rgba(217,131,106,0.14)"
                    : "transparent",
                  color: active ? "var(--hg-accent)" : "var(--hg-text)",
                }}
              >
                <n.icon className="h-3.5 w-3.5" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={lock}
          className="hg-btn-ghost"
          aria-label="Lock workspace"
        >
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
                background: active ? "rgba(217,131,106,0.14)" : "transparent",
                color: active ? "var(--hg-accent)" : "var(--hg-text)",
              }}
            >
              <n.icon className="h-3.5 w-3.5" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <main className="hg-fade-in flex flex-1 flex-col px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}
