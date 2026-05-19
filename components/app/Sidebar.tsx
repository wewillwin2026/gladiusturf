"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
}: SidebarProps) {
  const pathname = usePathname() ?? "/";
  const base =
    product === "founders" ? "/founders/war-room" : "/app";
  const visibleEngines =
    product === "tenant"
      ? enginesForTenant(vertical, flags, role ?? null)
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

      <div className="flex flex-col gap-3 flex-1">
        {ENGINE_GROUPS.map((g) => {
          const items = visibleEngines.filter((e) => e.group === g.id);
          if (!items.length) return null;
          return (
            <div key={g.id} className="flex flex-col gap-0.5">
              <div className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                {g.label}
              </div>
              {items.map((e) => {
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
              })}
            </div>
          );
        })}

        {product === "founders" && (
          <div className="flex flex-col gap-0.5 mt-2">
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
        )}
      </div>

      <div className="px-2 pt-2 pb-1 text-[10px] font-geist-mono text-g-text-faint border-t border-g-border-subtle">
        {buildVersion()}
      </div>
    </nav>
  );
}
