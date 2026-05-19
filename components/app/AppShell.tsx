"use client";

import * as React from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "./ThemeProvider";
import { CommandPaletteProvider } from "./CommandPaletteContext";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "./CommandPalette";
import { FloatingAskGladiusButton } from "./AskGladius";
import { TooltipProvider } from "./ui/Tooltip";
import { GuidedTour } from "./GuidedTour";
import { type ProductKind, type TenantFlags, type TenantRole } from "./engines";

export function AppShell({
  product,
  user,
  logoutHref,
  hideAskGladius = false,
  vertical = null,
  tenantName = null,
  flags = {},
  role,
  isFounder = false,
  children,
}: {
  product: ProductKind;
  user: { name: string; subtitle: string };
  logoutHref: string;
  hideAskGladius?: boolean;
  vertical?: string | null;
  /** Display name shown in the sidebar header. Tenants get their shop
   *  name; demo + founder default to the product label. */
  tenantName?: string | null;
  /** Per-tenant feature flags. Tenant authed layouts pass tenant row
   *  derived flags here; demo + founders shells leave it as `{}`. */
  flags?: TenantFlags;
  /** Tenant user role. Controls ownerOnly engine visibility. Pass null
   *  (or omit) for the demo/founders shells — null means show everything. */
  role?: TenantRole | null;
  /** True only for Ricardo/Josh (founder allow-list). Reveals the
   *  discreet "Founders Portal" door at the bottom of the sidebar.
   *  Independent of `role` — a paying tenant owner is NOT a founder. */
  isFounder?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="gladius-app min-h-screen flex" data-product={product}>
      <ThemeProvider>
        <CommandPaletteProvider>
          <TooltipProvider>
            <Sidebar product={product} vertical={vertical} tenantName={tenantName} flags={flags} role={role ?? null} isFounder={isFounder} />
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar product={product} user={user} logoutHref={logoutHref} vertical={vertical} tenantName={tenantName} flags={flags} role={role ?? null} isFounder={isFounder} />
              <main className="flex-1 px-6 py-6 max-w-[1480px] w-full mx-auto">
                {children}
              </main>
            </div>
            <CommandPalette product={product} />
            {/* First-login interactive walkthrough — tenant shells only.
                The demo + founders shells deliberately never get it. The
                tenantKey is stable per tenant + user so the tour shows
                once and survives navigation. */}
            {product === "tenant" && (
              <>
                <GuidedTour
                  role={role ?? null}
                  isFounder={isFounder}
                  tenantKey={`${tenantName ?? "t"}::${user.name}`}
                />
                {/* Discreet "replay tour" door — low-opacity "?" in the
                    bottom-left, out of the way of the Ask Gladius FAB
                    (bottom-right). Dispatches the global replay event
                    GuidedTour listens for. */}
                <button
                  type="button"
                  title="Replay product tour"
                  aria-label="Replay product tour"
                  onClick={() =>
                    window.dispatchEvent(new Event("gt:replay-tour"))
                  }
                  className="fixed bottom-4 left-4 z-40 h-7 w-7 rounded-full bg-g-surface-2 border border-g-border-subtle text-g-text-faint hover:text-g-accent hover:border-g-accent/40 text-[12px] leading-none opacity-40 hover:opacity-100 transition-all"
                >
                  ?
                </button>
              </>
            )}
            {!hideAskGladius && <FloatingAskGladiusButton product={product} />}
            <Toaster
              position="top-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "var(--g-surface)",
                  color: "var(--g-text)",
                  border: "1px solid var(--g-border)",
                },
              }}
            />
          </TooltipProvider>
        </CommandPaletteProvider>
      </ThemeProvider>
    </div>
  );
}
