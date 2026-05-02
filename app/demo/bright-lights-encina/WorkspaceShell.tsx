"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  ChevronRight,
  CloudLightning,
  Compass,
  CreditCard,
  FileSpreadsheet as QbIcon,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Megaphone,
  Menu,
  Settings as SettingsIcon,
  Share2 as ReferralsIcon,
  Sparkles,
  Star,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { BRAND } from "@/lib/demo-data/bright-lights";

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
        href: "/demo/bright-lights-encina/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Customers",
        href: "/demo/bright-lights-encina/customers",
        icon: Users,
        match: (p) => p.startsWith("/demo/bright-lights-encina/customers"),
      },
      {
        label: "Routes",
        href: "/demo/bright-lights-encina/routes",
        icon: Compass,
      },
      {
        label: "Storm Mode",
        href: "/demo/bright-lights-encina/storm",
        icon: CloudLightning,
      },
    ],
  },
  {
    label: "Growth",
    items: [
      {
        label: "Maintenance Plans",
        href: "/demo/bright-lights-encina/plans",
        icon: Sparkles,
      },
      {
        label: "Reviews",
        href: "/demo/bright-lights-encina/reviews",
        icon: Star,
      },
      {
        label: "Campaigns",
        href: "/demo/bright-lights-encina/campaigns",
        icon: Megaphone,
      },
      {
        label: "Referrals",
        href: "/demo/bright-lights-encina/referrals",
        icon: ReferralsIcon,
      },
    ],
  },
  {
    label: "Business",
    items: [
      {
        label: "Plans & Pricing",
        href: "/demo/bright-lights-encina/pricing",
        icon: CreditCard,
      },
      {
        label: "Payroll",
        href: "/demo/bright-lights-encina/payroll",
        icon: Wallet,
      },
      {
        label: "QuickBooks Sync",
        href: "/demo/bright-lights-encina/quickbooks",
        icon: QbIcon,
      },
      {
        label: "Settings",
        href: "/demo/bright-lights-encina/settings",
        icon: SettingsIcon,
      },
    ],
  },
];

const HELP_HREF = "/demo/bright-lights-encina/help";

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
        className="hidden md:flex md:flex-col md:px-3 md:py-4"
        style={{
          width: 248,
          background: "rgba(0,0,0,0.18)",
          borderRight: "1px solid var(--bl-border)",
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
          <SidebarLink
            label="Help & Support"
            href={HELP_HREF}
            icon={LifeBuoy}
            pathname={pathname}
          />
          <UserAccountWidget onLock={lock} />
        </div>
      </aside>

      {/* Mobile topbar */}
      <header
        className="flex items-center justify-between px-4 py-3 md:hidden"
        style={{
          background: "rgba(0,0,0,0.18)",
          borderBottom: "1px solid var(--bl-border)",
        }}
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
          style={{
            background: "rgba(0,0,0,0.32)",
            borderBottom: "1px solid var(--bl-border)",
          }}
        >
          {SECTIONS.map((section) => (
            <SidebarSection
              key={section.label}
              section={section}
              pathname={pathname}
            />
          ))}
          <SidebarLink
            label="Help & Support"
            href={HELP_HREF}
            icon={LifeBuoy}
            pathname={pathname}
          />
          <button
            onClick={lock}
            className="bl-btn-ghost mt-2 self-start"
            style={{ justifyContent: "flex-start" }}
          >
            <LogOut className="h-3.5 w-3.5" /> Lock workspace
          </button>
        </nav>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        <DesktopTopbar lang={lang} setLang={setLang} />
        <main className="bl-fade-in flex flex-1 flex-col px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-2.5 px-2 pt-1">
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
          color: "rgba(245,239,230,0.45)",
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
        background: active ? "rgba(244,184,96,0.10)" : "transparent",
        color: active ? "var(--bl-accent)" : "var(--bl-text)",
        borderLeft: active
          ? "2px solid var(--bl-accent)"
          : "2px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(26,36,56,0.6)";
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
          background: menuOpen ? "rgba(26,36,56,0.6)" : "rgba(0,0,0,0.32)",
          border: "1px solid var(--bl-border)",
        }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{
            background: "rgba(244,184,96,0.18)",
            border: "1px solid rgba(244,184,96,0.4)",
          }}
        >
          <Image
            src="/bright-lights/logo.png"
            alt="Bright Lights"
            width={20}
            height={16}
          />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div
            className="truncate text-[12px] leading-tight"
            style={{ color: "var(--bl-text)" }}
          >
            {BRAND.founder}
          </div>
          <div
            className="text-[10px] leading-tight"
            style={{ color: "var(--bl-text-faint)" }}
          >
            Owner · {BRAND.shortName}
          </div>
        </div>
        <ChevronRight
          className="h-3 w-3 shrink-0"
          style={{
            color: "var(--bl-text-faint)",
            transform: menuOpen ? "rotate(90deg)" : "none",
            transition: "transform 160ms ease",
          }}
        />
      </button>

      {menuOpen && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 flex flex-col gap-1 rounded-md p-1.5"
          style={{
            background: "var(--bl-bg-2)",
            border: "1px solid var(--bl-border-strong)",
            boxShadow: "0 12px 30px -8px rgba(0,0,0,0.6)",
          }}
        >
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] transition-colors"
            style={{ color: "var(--bl-text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(26,36,56,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Users className="h-3 w-3" />
            Switch to Felipe (Operator)
          </button>
          <button
            type="button"
            onClick={onLock}
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] transition-colors"
            style={{ color: "var(--bl-text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(26,36,56,0.6)";
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
          <HelpCircle className="h-3.5 w-3.5" /> Help
        </button>
        <button className="bl-btn-ghost" aria-label="Calendar">
          <Calendar className="h-3.5 w-3.5" /> May 2
        </button>
      </div>
    </header>
  );
}

