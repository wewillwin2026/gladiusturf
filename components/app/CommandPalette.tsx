"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useCmdK } from "./CommandPaletteContext";
import { ENGINES, hrefForEngine, type ProductKind } from "./engines";

/**
 * Phase 1 stub. Phase 2 expands this with seeded customer/job/quote/invoice
 * search across 9 result groups + page-aware Suggestions.
 */
export function CommandPalette({ product }: { product: ProductKind }) {
  const { isOpen, close } = useCmdK();
  const router = useRouter();

  function go(href: string) {
    close();
    router.push(href);
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/60"
      onClick={close}
    >
      <div
        className="g-card w-full max-w-xl mx-4 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command Palette" loop className="bg-g-surface">
          <div className="border-b border-g-border-subtle px-3 h-11 flex items-center">
            <Command.Input
              autoFocus
              placeholder="Search engines, customers, jobs, settings…"
              className="w-full bg-transparent outline-none text-[14px] text-g-text placeholder:text-g-text-faint"
            />
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto py-2">
            <Command.Empty className="px-3 py-6 text-center text-[12px] text-g-text-muted">
              No matches.
            </Command.Empty>
            <Command.Group
              heading="Navigation"
              className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint [&>[cmdk-group-heading]]:px-3 [&>[cmdk-group-heading]]:py-1.5"
            >
              {ENGINES.map((e) => {
                const href = hrefForEngine(product, e.slug);
                const Icon = e.icon;
                return (
                  <Command.Item
                    key={e.slug}
                    value={e.name}
                    onSelect={() => go(href)}
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-md mx-1 text-[13px] text-g-text-muted data-[selected=true]:bg-g-surface-2 data-[selected=true]:text-g-text"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{e.name}</span>
                    <span className="ml-auto text-[10px] text-g-text-faint font-geist-mono">
                      {href}
                    </span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>
          <div className="flex items-center justify-between px-3 h-9 border-t border-g-border-subtle text-[11px] text-g-text-faint">
            <span className="font-geist-mono">↑↓ navigate · ↵ select · esc close</span>
            <span className="font-geist-mono">{ENGINES.length} engines</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
