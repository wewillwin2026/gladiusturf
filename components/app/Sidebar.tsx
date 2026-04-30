"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ENGINES,
  ENGINE_GROUPS,
  SECRET_TABS,
  hrefForEngine,
  type ProductKind,
} from "./engines";
import { cn } from "@/lib/cn";
import { buildVersion } from "@/lib/shared/format";

export function Sidebar({ product }: { product: ProductKind }) {
  const pathname = usePathname() ?? "/";
  const base = product === "demo" ? "/app" : "/founders/war-room";

  return (
    <nav
      className={cn(
        "flex flex-col gap-4 p-3 border-r border-g-border bg-g-bg",
        "w-[232px] shrink-0 overflow-y-auto h-screen sticky top-0",
        "hidden md:flex",
      )}
    >
      <Link
        href={base}
        prefetch
        className="flex items-center gap-2 px-2 h-10 group"
      >
        <span className="h-6 w-6 rounded-md bg-g-accent-faint border border-g-accent/40 inline-flex items-center justify-center text-g-accent text-[12px] font-medium">
          G
        </span>
        <span className="font-medium text-g-text text-[14px]">
          {product === "demo" ? "GladiusTurf" : "War Room"}
        </span>
        <span
          className={cn(
            "ml-auto text-[10px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded border",
            product === "demo"
              ? "border-g-border-subtle text-g-text-faint"
              : "border-g-accent/40 text-g-accent bg-g-accent-faint",
          )}
        >
          {product === "demo" ? "Demo" : "Live"}
        </span>
      </Link>

      <div className="flex flex-col gap-3 flex-1">
        {ENGINE_GROUPS.map((g) => {
          const items = ENGINES.filter((e) => e.group === g.id);
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
