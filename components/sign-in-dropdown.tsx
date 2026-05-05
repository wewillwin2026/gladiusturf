"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { VERTICALS, type VerticalDef } from "@/lib/vertical/types";

/**
 * Top-Nav sign-in entry point. Click → dropdown of 8 verticals + status:
 *   - Live (lighting)  → /app/login (existing magic-link flow)
 *   - Waitlist (other 7) → /<vertical> (existing waitlist page)
 *
 * Auth itself is unchanged — this is purely a discoverable front door so a
 * paying tenant operator (e.g. Cristian @ Bright Lights) can find sign-in
 * without having to type /app/login by hand.
 *
 * Already-signed-in users who land at /app/login get redirected to /app
 * by the page itself (see app/app/login/page.tsx).
 */
export function SignInDropdown() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Sign in menu — 8 verticals"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-bone/15 bg-bone/[0.02] px-4 py-2 text-sm font-medium text-bone/85 transition-colors hover:border-honey-bright/50 hover:text-honey-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-bright/40 data-[state=open]:border-honey-bright/60 data-[state=open]:text-honey-bright"
        >
          Sign in
          <ChevronDown className="h-3.5 w-3.5 transition-transform data-[state=open]:rotate-180" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-50 w-[320px] rounded-xl border border-bone/10 bg-obsidian/95 p-2 shadow-2xl backdrop-blur",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          <DropdownMenu.Label className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/45">
            Pick your vertical
          </DropdownMenu.Label>

          {VERTICALS.map((v) => (
            <SignInItem key={v.slug} vertical={v} />
          ))}

          <DropdownMenu.Separator className="mx-2 my-1 h-px bg-bone/10" />

          <p className="px-3 py-2 text-[11px] leading-relaxed text-bone/45">
            Real customer? Pick the live vertical above. New here?{" "}
            <Link
              href="/demo"
              className="text-honey-bright hover:underline"
            >
              Book a demo
            </Link>
            .
          </p>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function SignInItem({ vertical }: { vertical: VerticalDef }) {
  const isLive = vertical.status === "live";
  const Icon = vertical.icon;
  // Live verticals route to /app/login (magic-link form). Waitlist verticals
  // route to the existing waitlist page at /<slug>.
  const href = isLive ? "/app/login" : vertical.href;

  return (
    <DropdownMenu.Item asChild>
      <Link
        href={href}
        prefetch
        data-track={`signin_dropdown_${vertical.slug}`}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] outline-none",
          "transition-colors data-[highlighted]:bg-bone/[0.04] data-[highlighted]:outline-none",
          "focus-visible:bg-bone/[0.04]",
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            isLive ? "text-honey-bright" : "text-bone/55",
          )}
          aria-hidden
        />
        <span className="flex-1 text-bone/85 group-hover:text-bone">
          {vertical.name}
        </span>

        {isLive ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-honey-bright/40 bg-honey/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-honey-bright">
            Live · Sign in
            <ArrowRight className="h-2.5 w-2.5" aria-hidden />
          </span>
        ) : (
          <span className="rounded-full border border-bone/15 bg-bone/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-bone/55">
            Waitlist
          </span>
        )}
      </Link>
    </DropdownMenu.Item>
  );
}
