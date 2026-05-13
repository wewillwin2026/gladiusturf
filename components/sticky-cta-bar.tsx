"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Mail, X } from "lucide-react";
import { track } from "@/lib/tracking/client";

/**
 * StickyCtaBar — mobile-only floating bottom bar.
 *
 * Shows after the visitor scrolls past 600 px on viewports ≤ 768 px wide.
 * Suppressed on app/founders surfaces and on the demo route itself (where
 * a primary CTA already lives). Dismissal persists for the session in
 * sessionStorage so the bar doesn't fight the user mid-scroll.
 *
 * Primary CTA: "Book demo" → /demo
 * Secondary CTA: "Email founder" → mailto:ricardo.gamon99@icloud.com
 */

const DISMISS_KEY = "gladiusturf:sticky-cta-dismissed";
const SHOW_AFTER_PX = 600;

const SUPPRESSED_PREFIXES = ["/app", "/founders", "/demo"];

function isSuppressed(pathname: string | null): boolean {
  if (!pathname) return false;
  return SUPPRESSED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function StickyCtaBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      /* sessionStorage blocked — fail open, bar shows */
    }
  }, []);

  useEffect(() => {
    if (dismissed || isSuppressed(pathname)) return;
    if (typeof window === "undefined") return;

    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed, pathname]);

  if (dismissed || isSuppressed(pathname) || !visible) return null;

  const handleDismiss = () => {
    setDismissed(true);
    track("sticky_cta_dismissed");
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* sessionStorage blocked — fail open */
    }
  };

  return (
    <div
      role="region"
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-bone/15 bg-pitch/95 px-3 py-3 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.6)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-md items-center gap-2">
        <Link
          href="/demo"
          onClick={() => track("sticky_cta_click", { variant: "demo" })}
          className="group inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-lime-bright px-4 py-3 text-sm font-semibold text-forest-deep shadow-cta transition-colors hover:bg-lime"
        >
          Book demo
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <a
          href="mailto:ricardo.gamon99@icloud.com?subject=Demo%20question%20from%20gladiusturf.com"
          onClick={() => track("sticky_cta_click", { variant: "email" })}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-champagne-bright/40 px-4 py-3 text-sm font-medium text-champagne-bright transition-colors hover:border-champagne-bright hover:bg-champagne/10"
        >
          <Mail className="h-3.5 w-3.5" />
          Email
        </a>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={handleDismiss}
          className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full text-bone/70 transition-colors hover:bg-bone/[0.04] hover:text-bone"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
