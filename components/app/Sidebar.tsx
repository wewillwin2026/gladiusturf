"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  ENGINES,
  ENGINE_GROUPS,
  SECRET_TABS,
  enginesForTenant,
  hrefForEngine,
  type ProductKind,
  type TenantFlags,
  type TenantRole,
} from "./engines";
import { cn } from "@/lib/cn";
import { buildVersion } from "@/lib/shared/format";

export type SidebarVariant = "desktop" | "mobile";

interface SidebarProps {
  product: ProductKind;
  variant?: SidebarVariant;
  onNavigate?: () => void;
  vertical?: string | null;
  /** Tenant display name shown in header. Falls back to "GladiusTurf"
   *  (or "War Room" for founders) when null. */
  tenantName?: string | null;
  /** Per-tenant feature flags. Only used when product === "tenant". */
  flags?: TenantFlags;
  /** Tenant user role. null = show everything (demo/founder behaviour). */
  role?: TenantRole | null;
  /** True only for the founder allow-list (Ricardo/Josh). Reveals the
   *  discreet "Founders Portal" door at the bottom. Absent from the DOM
   *  entirely for everyone else — a tenant owner is NOT a founder. */
  isFounder?: boolean;
  /** Per-tenant brand logo URL. When provided, replaces the letter
   *  mark in the brand header. e.g. "/tenant-logos/bright-lights-encina.png". */
  logoUrl?: string | null;
}

function brandInitial(name: string | null, product: ProductKind): string {
  if (product === "founders") return "F";
  const trimmed = (name ?? "").trim();
  return trimmed ? trimmed.slice(0, 1).toUpperCase() : "G";
}

export function Sidebar({
  product,
  variant = "desktop",
  onNavigate,
  vertical = null,
  tenantName = null,
  flags = {},
  role = null,
  isFounder = false,
  logoUrl = null,
}: SidebarProps) {
  const pathname = usePathname() ?? "/";
  const base =
    product === "founders" ? "/founders/war-room" : "/app";
  // Founders Portal is founders-only tooling (Live Radar, traffic
  // intel, Tenants + Impersonate, demo pipeline) — it must NOT mirror
  // the client CRM operator engines. To inspect a tenant's real
  // workspace a founder uses the Impersonate button, which opens /app
  // as that tenant. So: tenant → vertical/role-filtered engines;
  // founders → no client engines (only the SECRET_TABS section below);
  // demo → full list for sales walkthroughs.
  const visibleEngines =
    product === "tenant"
      ? enginesForTenant(vertical, flags, role ?? null, isFounder)
      : product === "founders"
        ? []
        : ENGINES;

  const headerLabel =
    product === "founders"
      ? "War Room"
      : product === "tenant"
        ? (tenantName ?? "GladiusTurf")
        : "GladiusTurf";
  const initial = brandInitial(tenantName, product);

  return (
    <nav
      className={cn(
        "flex flex-col gap-3 px-3 pt-4 pb-3 bg-g-bg",
        variant === "desktop" &&
          "hidden md:flex w-[244px] shrink-0 overflow-y-auto h-screen sticky top-0 border-r border-g-border",
        variant === "mobile" && "h-full w-full overflow-y-auto",
      )}
    >
      {/* Brand header — bigger mark, tenant name in bold, status pill
          inline. Reduces the dead space that surrounded the 24×24 G
          square in the prior layout. */}
      <Link
        href={base}
        prefetch
        onClick={onNavigate}
        className="group flex items-start gap-2.5 px-1.5 py-1.5 rounded-md hover:bg-g-surface-2 transition-colors"
      >
        {logoUrl ? (
          // Tenant brand logo — renders in a white-pad container so dark
          // PNG logos read against the navy sidebar. Falls through to the
          // letter mark if no logoUrl is provided.
          <span className="h-10 w-10 shrink-0 rounded-lg inline-flex items-center justify-center bg-white p-0.5 border border-g-accent/40 overflow-hidden">
            {/* Plain <img> — the file ships from /public so Next will not
                rewrite it through next/image's loader. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt={tenantName ?? "Tenant logo"}
              className="h-full w-full object-contain"
            />
          </span>
        ) : (
          <span
            className={cn(
              "h-10 w-10 shrink-0 rounded-lg inline-flex items-center justify-center font-semibold text-[16px]",
              product === "demo"
                ? "bg-g-surface-2 border border-g-border text-g-text-muted"
                : "bg-g-accent-faint border border-g-accent/40 text-g-accent",
            )}
          >
            {initial}
          </span>
        )}
        <span className="flex min-w-0 flex-col leading-[1.15] pt-0.5">
          <span className="font-medium text-g-text text-[14px] truncate">
            {headerLabel}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]">
            <span
              className={cn(
                product === "demo"
                  ? "text-g-text-faint"
                  : "text-g-accent",
              )}
            >
              {product === "demo"
                ? "Demo"
                : product === "founders"
                  ? "Founders"
                  : "Live"}
            </span>
            {product === "tenant" && vertical && (
              <span className="text-g-text-faint">· {vertical}</span>
            )}
          </span>
        </span>
      </Link>

      {/* IA rebuild 2026-05-21: tenant + demo shells now show 10
          essentials flat at the top, with everything else tucked under
          a single "More tools ▸" disclosure. Founders shell keeps its
          SECRET_TABS-only behaviour. The goal: stupid-simple Jobber-
          beating nav for owners. Engines kept their slugs so URLs are
          unchanged; this is presentation-only. */}
      {product === "founders" ? (
        <div className="flex flex-col gap-0.5 mt-2 flex-1">
          <div className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-[0.14em] text-g-accent">
            Founders only
          </div>
          {SECRET_TABS.map((t) => {
            const href = `/founders/war-room/${t.slug}`;
            const active = pathname === href;
            const Icon = t.icon;
            return (
              <Link
                key={t.slug}
                href={href}
                prefetch
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] transition-colors",
                  active
                    ? "bg-g-surface-2 text-g-text"
                    : "text-g-text-muted hover:text-g-text hover:bg-g-surface-2",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{t.name}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <EssentialsNav
          visibleEngines={visibleEngines}
          product={product}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      )}

      {/* Founders Portal door + version watermark removed from the
          tenant sidebar 2026-05-22 per founder ask. Founders navigate
          to /founders/war-room directly (typed URL or bookmark). The
          founders shell renders its own version watermark inside its
          own SECRET_TABS block. */}
      {product === "founders" && (
        <div className="px-2 pt-2 pb-1 text-[10px] font-geist-mono text-g-text-faint border-t border-g-border-subtle">
          {buildVersion()}
        </div>
      )}
    </nav>
  );
}

/**
 * Tenant + demo flat-essentials nav with a "More tools ▸" disclosure.
 * The 10 essentials are rendered flat (no group headers) — what the
 * shop owner uses daily. Everything else (Sell extras, Routes/Territory/
 * Equipment, Timesheets, the Loop cluster, Trust, Platform tools)
 * collapses behind a single click. Settings is pinned at the bottom.
 */
const ESSENTIAL_SLUGS = new Set<string>([
  "today",
  "leads",
  "customers",
  "schedule",
  "jobs",
  "quotes",
  "crew",
  "inventory",
  "invoices",
  "reports",
]);

function EssentialsNav({
  visibleEngines,
  product,
  pathname,
  onNavigate,
}: {
  visibleEngines: ReadonlyArray<(typeof ENGINES)[number]>;
  product: ProductKind;
  pathname: string;
  onNavigate?: () => void;
}) {
  const [moreOpen, setMoreOpen] = React.useState(false);

  const essentials = visibleEngines.filter((e) => ESSENTIAL_SLUGS.has(e.slug));
  const moreItems = visibleEngines.filter(
    (e) => !ESSENTIAL_SLUGS.has(e.slug) && e.slug !== "settings",
  );
  const settings = visibleEngines.find((e) => e.slug === "settings");

  // Group the More items by their existing ENGINE_GROUPS for legibility
  // inside the disclosure. Empty groups are skipped.
  const moreByGroup = ENGINE_GROUPS.map((g) => ({
    label: g.label,
    items: moreItems.filter((e) => e.group === g.id),
  })).filter((g) => g.items.length > 0);

  function renderLink(e: (typeof ENGINES)[number]) {
    const href = hrefForEngine(product, e.slug);
    const active =
      pathname === href ||
      (e.slug !== "today" && pathname.startsWith(href));
    const Icon = e.icon;
    return (
      <Link
        key={e.slug}
        href={href}
        prefetch
        onClick={onNavigate}
        data-tour={`nav-${e.slug}`}
        className={cn(
          "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] transition-colors",
          active
            ? "bg-g-surface-2 text-g-text"
            : "text-g-text-muted hover:text-g-text hover:bg-g-surface-2",
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{e.name}</span>
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 flex-1">
      {/* Essentials — flat list, no group headers */}
      {essentials.map(renderLink)}

      {/* More tools disclosure */}
      {moreItems.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className="mt-2 mb-1 flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-[10px] uppercase tracking-[0.14em] text-g-text-faint hover:text-g-text hover:bg-g-surface-2 border-y border-g-border-subtle"
          >
            <span>More tools</span>
            <ChevronRight
              className={cn(
                "h-3 w-3 shrink-0 transition-transform",
                moreOpen && "rotate-90",
              )}
            />
          </button>
          {moreOpen && (
            <div className="flex flex-col gap-2 pb-2">
              {moreByGroup.map((g) => (
                <div key={g.label} className="flex flex-col gap-0.5">
                  <div className="px-2 pt-1 pb-0.5 text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                    {g.label}
                  </div>
                  {g.items.map(renderLink)}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Settings pinned at the bottom of the engine area */}
      {settings && <div className="mt-2">{renderLink(settings)}</div>}
    </div>
  );
}
