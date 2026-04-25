"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Gift,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type PortalNavKey =
  | "dashboard"
  | "schedule"
  | "pay"
  | "history"
  | "approvals"
  | "refer";

const NAV_ITEMS: {
  key: PortalNavKey;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "schedule", label: "Schedule", icon: <CalendarDays className="h-4 w-4" /> },
  { key: "pay", label: "Pay", icon: <CreditCard className="h-4 w-4" /> },
  { key: "history", label: "History", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "approvals", label: "Approvals", icon: <CheckCircle2 className="h-4 w-4" /> },
  { key: "refer", label: "Refer", icon: <Gift className="h-4 w-4" /> },
];

type PortalShellProps = {
  crewName: string;
  crewInitials: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  active?: PortalNavKey;
  children: React.ReactNode;
};

export function PortalShell({
  crewName,
  crewInitials,
  customerFirstName,
  customerLastName,
  customerEmail,
  active = "dashboard",
  children,
}: PortalShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper text-forest">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-pitch/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-content items-center gap-3 px-4 md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="-ml-1.5 inline-flex h-9 w-9 items-center justify-center rounded-lg text-forest/70 transition-colors hover:bg-bone hover:text-forest md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-pitch font-serif text-xs font-semibold text-parchment"
            >
              {crewInitials}
            </span>
            <div className="leading-tight">
              <div className="font-serif text-[15px] font-semibold tracking-[-0.01em] text-forest">
                {crewName}
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-stone">
                Customer Portal
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <div className="text-sm font-medium text-forest">
                {customerFirstName} {customerLastName}
              </div>
              <div className="text-[11px] text-stone">{customerEmail}</div>
            </div>
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-bone font-serif text-sm font-semibold text-forest"
            >
              {customerFirstName.charAt(0)}
              {customerLastName.charAt(0)}
            </span>
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-full border border-pitch/15 bg-bone px-3 py-1.5 text-xs font-medium text-forest transition-colors hover:bg-paper md:inline-flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              gladiusturf.com
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-content gap-8 px-4 py-6 md:px-6 md:py-8">
        {/* Sidebar — desktop */}
        <aside className="sticky top-20 hidden h-fit w-56 flex-none md:block">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <SidebarItem
                key={item.key}
                navKey={item.key}
                label={item.label}
                icon={item.icon}
                active={item.key === active}
              />
            ))}
          </nav>
          <div className="mt-8 rounded-2xl border border-pitch/10 bg-white p-4 shadow-card">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
              Need help?
            </div>
            <p className="mt-2 text-[13px] leading-[1.55] text-forest/80">
              Text Marcus directly. Replies usually inside an hour.
            </p>
            <a
              href="tel:+19195550188"
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-pitch px-3 py-2 text-xs font-semibold text-parchment transition-colors hover:bg-slate-deep"
            >
              (919) 555-0188
            </a>
          </div>
        </aside>

        {/* Sidebar — mobile drawer */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div className="absolute inset-0 bg-pitch/30" />
            <div
              className="absolute left-0 top-0 h-full w-64 bg-paper p-4 shadow-card"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="mt-2 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <SidebarItem
                    key={item.key}
                    navKey={item.key}
                    label={item.label}
                    icon={item.icon}
                    active={item.key === active}
                  />
                ))}
              </nav>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-pitch/15 bg-bone px-3 py-1.5 text-xs font-medium text-forest"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to gladiusturf.com
              </Link>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function SidebarItem({
  navKey,
  label,
  icon,
  active,
}: {
  navKey: PortalNavKey;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <a
      href={`#${navKey}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
        active
          ? "bg-pitch text-parchment"
          : "text-forest/80 hover:bg-bone hover:text-forest"
      )}
    >
      <span
        className={cn(
          "flex-none",
          active ? "text-parchment" : "text-forest/60"
        )}
      >
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </a>
  );
}
