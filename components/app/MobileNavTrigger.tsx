"use client";

import * as React from "react";
import * as RD from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import type { ProductKind, TenantFlags } from "./engines";

/**
 * Mobile-only nav trigger. Renders a hamburger button that's hidden ≥ md, and
 * opens a left-side drawer containing the same Sidebar engine list a desktop
 * user sees. The drawer auto-closes when a nav link is clicked.
 */
export function MobileNavTrigger({
  product,
  vertical = null,
  tenantName = null,
  flags = {},
}: {
  product: ProductKind;
  vertical?: string | null;
  tenantName?: string | null;
  flags?: TenantFlags;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <RD.Root open={open} onOpenChange={setOpen}>
      <RD.Trigger asChild>
        <button
          type="button"
          aria-label="Open navigation"
          className="md:hidden inline-flex items-center justify-center h-8 w-8 rounded-md text-g-text-muted hover:text-g-text hover:bg-g-surface-2"
        >
          <Menu className="h-4 w-4" />
        </button>
      </RD.Trigger>
      <RD.Portal>
        <RD.Overlay className="md:hidden fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in fade-in-0" />
        <RD.Content
          aria-describedby={undefined}
          className="md:hidden fixed left-0 top-0 z-50 h-full w-[260px] bg-g-bg border-r border-g-border data-[state=open]:animate-in slide-in-from-left"
        >
          <RD.Title className="sr-only">Navigation</RD.Title>
          <RD.Close
            aria-label="Close navigation"
            className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md text-g-text-muted hover:text-g-text hover:bg-g-surface-2"
          >
            <X className="h-4 w-4" />
          </RD.Close>
          <Sidebar
            product={product}
            variant="mobile"
            vertical={vertical}
            tenantName={tenantName}
            flags={flags}
            onNavigate={() => setOpen(false)}
          />
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  );
}
