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
import { type ProductKind } from "./engines";

export function AppShell({
  product,
  user,
  logoutHref,
  hideAskGladius = false,
  vertical = null,
  tenantName = null,
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
  children: React.ReactNode;
}) {
  return (
    <div className="gladius-app min-h-screen flex" data-product={product}>
      <ThemeProvider>
        <CommandPaletteProvider>
          <TooltipProvider>
            <Sidebar product={product} vertical={vertical} tenantName={tenantName} />
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar product={product} user={user} logoutHref={logoutHref} vertical={vertical} tenantName={tenantName} />
              <main className="flex-1 px-6 py-6 max-w-[1480px] w-full mx-auto">
                {children}
              </main>
            </div>
            <CommandPalette product={product} />
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
