"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Beaker,
  Calendar,
  ChevronRight,
  HelpCircle,
  LayoutDashboard,
  Leaf,
  LifeBuoy,
  LogOut,
  Map as MapIcon,
  Menu,
  Repeat,
  Settings as SettingsIcon,
  Users,
  X,
} from "lucide-react";
import { BRAND } from "@/lib/demo-data/sterling-lawn";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: (pathname: string) => boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    label: "Operations",
    items: [
      {
        label: "Today",
        href: "/demo/sterling-lawn/dashboard",
        icon: LayoutDashboard,
        match: (p) =>
          p === "/demo/sterling-lawn/dashboard" || p === "/demo/sterling-lawn",
      },
      {
        label: "Customers",
        href: "/demo/sterling-lawn/customers",
        icon: Users,
        match: (p) => p.startsWith("/demo/sterling-lawn/customers"),
      },
      {
        label: "Routes",
        href: "/demo/sterling-lawn/routes",
        icon: MapIcon,
      },
      {
        label: "Applications",
        href: "/demo/sterling-lawn/applications",
        icon: Beaker,
      },
    ],
  },
  {
    label: "Growth",
    items: [
      {
        label: "Maintenance Plans",
        href: "/demo/sterling-lawn/plans",
        icon: Repeat,
      },
    ],
  },
  {
    label: "Business",
    items: [
      {
        label: "Settings",
        href: "/demo/sterling-lawn/settings",
        icon: SettingsIcon,
      },
    ],
  },
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => setMobileOpen(false), [pathname]);

  async function lock() {
    try {
      await fetch("/api/sterling-lawn/lock", { method: "POST" });
    } catch {
      /* network blip — still bounce to gate */
    }
    router.replace("/demo/sterling-lawn");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar — desktop */}
      <aside
        className="hidden md:flex md:flex-col md:px-3 md:py-4"
        style={{
          width: 248,
          background: "rgba(0,0,0,0.18)",
          borderRight: "1px solid var(--sl-border)",
        }}
      >
        <SidebarBrand />

        <nav className="mt-4 flex flex-1 flex-col gap-0.5 overflow-y-auto pr-1">
          {SECTIONS.map((section) => (
            <SidebarSection
              key={section.label}
              section={section}
              pathname={pathname}
            />
          ))}
        </nav>

        <div className="mt-3 flex flex-col gap-1.5 pt-4">
          <button
            type="button"
            onClick={lock}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors"
            style={{
              background: "transparent",
              color: "var(--sl-text-muted)",
              border: "1px solid var(--sl-border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(20,42,28,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            <span className="truncate">Sales contact</span>
          </button>
          <UserAccountWidget onLock={lock} />
        </div>
      </aside>

      {/* Mobile topbar */}
      <header
        className="flex items-center justify-between px-4 py-3 md:hidden"
        style={{
          background: "rgba(0,0,0,0.18)",
          borderBottom: "1px solid var(--sl-border)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{
              background: "rgba(127,226,122,0.18)",
              border: "1px solid rgba(127,226,122,0.45)",
            }}
          >
            <Leaf
              className="h-3.5 w-3.5"
              style={{ color: "var(--sl-accent)" }}
            />
          </span>
          <span className="sl-serif text-[14px]">Sterling Lawn</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
          className="rounded-md p-1.5"
          style={{ color: "var(--sl-text-muted)" }}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {mobileOpen && (
        <nav
          className="flex flex-col gap-1 px-4 py-3 md:hidden"
          style={{
            background: "rgba(0,0,0,0.32)",
            borderBottom: "1px solid var(--sl-border)",
          }}
        >
          {SECTIONS.map((section) => (
            <SidebarSection
              key={section.label}
              section={section}
              pathname={pathname}
            />
          ))}
          <button
            onClick={lock}
            className="sl-btn-ghost mt-2 self-start"
            style={{ justifyContent: "flex-start" }}
          >
            <LogOut className="h-3.5 w-3.5" /> Lock workspace
          </button>
        </nav>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        <DesktopTopbar />
        <main className="sl-fade-in flex flex-1 flex-col px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarBrand() {
  return (
    <div className="flex flex-col items-center gap-2 px-2 pb-1 pt-2">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          background: "rgba(127,226,122,0.14)",
          border: "1px solid rgba(127,226,122,0.45)",
        }}
      >
        <Leaf
          className="h-7 w-7"
          style={{ color: "var(--sl-accent)" }}
        />
      </div>
      <div
        className="sl-serif text-center text-[15px] leading-tight"
        style={{ color: "var(--sl-text)" }}
      >
        Sterling Lawn
      </div>
    </div>
  );
}

function SidebarSection({
  section,
  pathname,
}: {
  section: NavSection;
  pathname: string | null;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div
        className="px-3 pb-1 pt-5"
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(245,241,232,0.55)",
        }}
      >
        {section.label}
      </div>
      {section.items.map((item) => (
        <SidebarLink
          key={item.href}
          label={item.label}
          href={item.href}
          icon={item.icon}
          pathname={pathname}
          match={item.match}
        />
      ))}
    </div>
  );
}

function SidebarLink({
  label,
  href,
  icon: Icon,
  pathname,
  match,
}: {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string | null;
  match?: (p: string) => boolean;
}) {
  const active = pathname
    ? match
      ? match(pathname)
      : pathname === href
    : false;
  return (
    <Link
      href={href}
      prefetch
      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors"
      style={{
        background: active ? "rgba(127,226,122,0.10)" : "transparent",
        color: active ? "var(--sl-accent)" : "var(--sl-text)",
        borderLeft: active
          ? "2px solid var(--sl-accent)"
          : "2px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(20,42,28,0.6)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function UserAccountWidget({ onLock }: { onLock: () => void }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors"
        style={{
          background: menuOpen ? "rgba(20,42,28,0.6)" : "rgba(0,0,0,0.32)",
          border: "1px solid var(--sl-border)",
        }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{
            background: "rgba(127,226,122,0.18)",
            border: "1px solid rgba(127,226,122,0.45)",
          }}
        >
          <Leaf className="h-4 w-4" style={{ color: "var(--sl-accent)" }} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div
            className="truncate text-[12px] leading-tight"
            style={{ color: "var(--sl-text)" }}
          >
            {BRAND.founder}
          </div>
          <div
            className="text-[10px] leading-tight"
            style={{ color: "var(--sl-text-faint)" }}
          >
            Owner · {BRAND.shortName}
          </div>
        </div>
        <ChevronRight
          className="h-3 w-3 shrink-0"
          style={{
            color: "var(--sl-text-faint)",
            transform: menuOpen ? "rotate(90deg)" : "none",
            transition: "transform 160ms ease",
          }}
        />
      </button>

      {menuOpen && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 flex flex-col gap-1 rounded-md p-1.5"
          style={{
            background: "var(--sl-bg-2)",
            border: "1px solid var(--sl-border-strong)",
            boxShadow: "0 12px 30px -8px rgba(0,0,0,0.6)",
          }}
        >
          <button
            type="button"
            onClick={onLock}
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] transition-colors"
            style={{ color: "var(--sl-text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(20,42,28,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut className="h-3 w-3" />
            Lock workspace
          </button>
        </div>
      )}
    </div>
  );
}

function DesktopTopbar() {
  return (
    <header
      className="hidden items-center justify-between px-8 py-4 md:flex"
      style={{ borderBottom: "1px solid var(--sl-border)" }}
    >
      <div className="flex items-baseline gap-3">
        <span
          className="sl-serif text-[18px]"
          style={{ color: "var(--sl-text)" }}
        >
          {BRAND.name}
        </span>
        <span className="sl-eyebrow-muted">· Workspace</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="sl-btn-ghost" aria-label="Help">
          <HelpCircle className="h-3.5 w-3.5" /> Help
        </button>
        <button className="sl-btn-ghost" aria-label="Calendar">
          <Calendar className="h-3.5 w-3.5" /> May 12
        </button>
      </div>
    </header>
  );
}
