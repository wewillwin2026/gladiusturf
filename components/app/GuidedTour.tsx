"use client";

/**
 * First-login interactive product tour. Dependency-free (pure React +
 * DOM), role-aware, dismissible, resumable, replayable.
 *
 * Mounted ONLY for product === "tenant" (see AppShell). The demo and
 * founders shells never get it.
 *
 * - Steps come from `stepsForRole`, so the walkthrough matches exactly
 *   what the user's sidebar shows (a Field Tech never gets the Invoices
 *   step).
 * - "Done" is persisted in localStorage under
 *   `gt_tour_done::${tenantKey}` — per tenant+user, so it shows once.
 * - A step with an `engineSlug` spotlights the matching sidebar link
 *   (`[data-tour="nav-<slug>"]`). If the target is missing (collapsed
 *   sidebar on mobile, slug not rendered, SSR) the card simply centers —
 *   it never throws.
 * - Replay: any code can `window.dispatchEvent(new Event("gt:replay-tour"))`
 *   to clear the done flag and restart at step 0. AppShell wires a
 *   discreet "?" button to this.
 */

import * as React from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { stepsForRole } from "@/lib/app/tour-steps";
import type { TenantRole } from "@/lib/app/tenant-auth";
import { cn } from "@/lib/cn";

const REPLAY_EVENT = "gt:replay-tour";
const START_DELAY_MS = 600;

/** Padding around the spotlit element, in px. */
const RING_PAD = 6;

type Rect = { top: number; left: number; width: number; height: number };

function doneKey(tenantKey: string): string {
  return `gt_tour_done::${tenantKey}`;
}

function readDone(tenantKey: string): boolean {
  if (typeof window === "undefined") return true; // SSR: never auto-start
  try {
    return window.localStorage.getItem(doneKey(tenantKey)) === "1";
  } catch {
    // Private mode / storage disabled — treat as "done" so we don't
    // nag on every navigation when we can't remember the dismissal.
    return true;
  }
}

function writeDone(tenantKey: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(doneKey(tenantKey), "1");
  } catch {
    /* storage disabled — nothing we can do, fail silent */
  }
}

function clearDone(tenantKey: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(doneKey(tenantKey));
  } catch {
    /* fail silent */
  }
}

export function GuidedTour({
  role,
  isFounder,
  tenantKey,
}: {
  role: TenantRole | null;
  isFounder: boolean;
  tenantKey: string;
}) {
  const steps = React.useMemo(
    () => stepsForRole(role, isFounder),
    [role, isFounder],
  );

  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [rect, setRect] = React.useState<Rect | null>(null);

  const step = steps[index];

  const finish = React.useCallback(() => {
    setOpen(false);
    writeDone(tenantKey);
  }, [tenantKey]);

  // Auto-start on first login (after a short delay so the sidebar has
  // painted and the spotlight target exists).
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (steps.length === 0) return;
    if (readDone(tenantKey)) return;
    const t = window.setTimeout(() => {
      setIndex(0);
      setOpen(true);
    }, START_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [steps.length, tenantKey]);

  // Replay hook — clear the flag and restart at step 0.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    function onReplay() {
      clearDone(tenantKey);
      setIndex(0);
      setOpen(true);
    }
    window.addEventListener(REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_EVENT, onReplay);
  }, [tenantKey]);

  // Measure the spotlight target for the current step. Recompute on
  // step change, resize, and scroll. Never throws if the element is
  // missing — falls back to a centered card.
  React.useEffect(() => {
    if (!open || !step) return;
    if (typeof document === "undefined") return;

    let raf = 0;

    function measure() {
      const slug = step?.engineSlug;
      if (!slug) {
        setRect(null);
        return;
      }
      let el: Element | null = null;
      try {
        el = document.querySelector(`[data-tour="nav-${slug}"]`);
      } catch {
        el = null;
      }
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        // Hidden (e.g. desktop sidebar on a mobile viewport) — center.
        setRect(null);
        return;
      }
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    }

    function schedule() {
      if (typeof window === "undefined") return;
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(measure);
    }

    schedule();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [open, step]);

  const goNext = React.useCallback(() => {
    setIndex((i) => {
      if (i >= steps.length - 1) {
        finish();
        return i;
      }
      return i + 1;
    });
  }, [steps.length, finish]);

  const goBack = React.useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : 0));
  }, []);

  // Keyboard: Esc = skip, ArrowRight = next, ArrowLeft = back.
  React.useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish, goNext, goBack]);

  if (!open || !step) return null;

  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  // Card placement: if we have a target rect, sit just to the right of
  // the spotlit nav link; otherwise center it. The sidebar is ~244px so
  // a card at left ≈ rect.right + gap reads naturally.
  const cardWidth = 360;
  let cardStyle: React.CSSProperties;
  if (rect) {
    const gap = 16;
    const desiredLeft = rect.left + rect.width + gap;
    const maxLeft =
      (typeof window !== "undefined" ? window.innerWidth : 1280) -
      cardWidth -
      16;
    const left = Math.max(16, Math.min(desiredLeft, maxLeft));
    const top = Math.max(16, rect.top - 8);
    cardStyle = { position: "fixed", top, left, width: cardWidth };
  } else {
    cardStyle = {
      position: "fixed",
      top: "50%",
      left: "50%",
      width: cardWidth,
      transform: "translate(-50%, -50%)",
    };
  }

  return (
    <div
      className="fixed inset-0 z-[9999]"
      role="dialog"
      aria-modal="true"
      aria-label="Product tour"
    >
      {/* Dimmer. Clicking the backdrop does nothing (avoids accidental
          dismissal mid-tour); use Skip / Esc to leave. */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

      {/* Spotlight ring around the current nav target (when found). */}
      {rect && (
        <div
          aria-hidden
          className="absolute rounded-md ring-2 ring-g-accent shadow-[0_0_0_4px_rgba(0,0,0,0.45)] transition-all duration-200"
          style={{
            top: rect.top - RING_PAD,
            left: rect.left - RING_PAD,
            width: rect.width + RING_PAD * 2,
            height: rect.height + RING_PAD * 2,
            background: "rgba(255,255,255,0.06)",
          }}
        />
      )}

      {/* Tooltip / step card. */}
      <div
        style={cardStyle}
        className={cn(
          "g-card border border-g-border bg-g-surface-2 rounded-md",
          "shadow-2xl p-4 flex flex-col gap-3",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-accent">
              Step {index + 1} of {steps.length}
            </span>
            <h2 className="text-g-text font-medium text-[15px] leading-tight">
              {step.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={finish}
            title="Skip tour (Esc)"
            aria-label="Skip tour"
            className="shrink-0 -mr-1 -mt-1 p-1 rounded-md text-g-text-faint hover:text-g-text hover:bg-g-surface-2 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-g-text-muted text-[13px] leading-relaxed">
          {step.body}
        </p>

        {/* Progress dots. */}
        <div className="flex items-center gap-1.5 pt-0.5">
          {steps.map((s, i) => (
            <span
              key={s.id}
              aria-hidden
              className={cn(
                "h-1 rounded-full transition-all duration-200",
                i === index
                  ? "w-4 bg-g-accent"
                  : i < index
                    ? "w-1.5 bg-g-accent/40"
                    : "w-1.5 bg-g-border",
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={finish}
            className="text-[12px] text-g-text-faint hover:text-g-text transition-colors"
          >
            Skip tour
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              disabled={isFirst}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[12px] transition-colors",
                isFirst
                  ? "text-g-text-faint/40 cursor-not-allowed"
                  : "text-g-text-muted hover:text-g-text hover:bg-g-surface-2 border border-g-border-subtle",
              )}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[12px] font-medium bg-g-accent text-g-bg hover:opacity-90 transition-opacity"
            >
              {isLast ? "Done" : "Next"}
              {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
