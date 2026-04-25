"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

type RescheduleFormProps = {
  open: boolean;
  visitLabel: string;
  serviceLabel: string;
  blockedDates?: Set<string>;
  /** Anchor date used to render the 3-week window (YYYY-MM-DD). */
  anchorDate: string;
  onClose: () => void;
};

/**
 * Modal calendar picker. Renders three weeks beginning on the anchor's
 * Sunday. Selecting an open date moves the form into a confirmed state with
 * the new visit window. Pure visual — no real schedule mutation.
 */
export function RescheduleForm({
  open,
  visitLabel,
  serviceLabel,
  blockedDates,
  anchorDate,
  onClose,
}: RescheduleFormProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  // Reset state whenever the modal closes/opens for a different visit.
  useEffect(() => {
    if (!open) {
      setPicked(null);
      setConfirmed(null);
    }
  }, [open, visitLabel]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const days = useMemo(() => buildThreeWeekGrid(anchorDate), [anchorDate]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-pitch/40 px-3 py-6 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Reschedule visit"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-paper shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-pitch/10 bg-white px-5 py-3.5">
          <div className="flex items-center gap-2 text-[13px] font-medium text-forest">
            <CalendarDays className="h-4 w-4 text-forest/70" />
            Reschedule visit
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-forest/70 transition-colors hover:bg-bone hover:text-forest"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {confirmed ? (
          <div className="px-5 py-7 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-champagne/20 text-champagne">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-semibold text-forest">
              Visit moved
            </h3>
            <p className="mt-2 text-[13px] text-stone">
              {serviceLabel} is now scheduled for{" "}
              <span className="font-medium text-forest">{confirmed}</span>.
              Marcus will text you a confirmation shortly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-pitch px-4 py-2.5 text-sm font-semibold text-parchment transition-colors hover:bg-slate-deep"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="px-5 py-5">
            <div className="rounded-xl bg-bone p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
                Currently scheduled
              </div>
              <div className="mt-1 font-serif text-base font-semibold text-forest">
                {visitLabel}
              </div>
              <div className="text-[12px] text-stone">{serviceLabel}</div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-forest/40"
                  aria-label="Previous month"
                  disabled
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-[13px] font-medium text-forest">
                  {formatMonthRange(days)}
                </div>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-forest/40"
                  aria-label="Next month"
                  disabled
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1.5 text-center text-[10px] uppercase tracking-[0.16em] text-stone">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="mt-1.5 grid grid-cols-7 gap-1.5">
                {days.map((d) => {
                  const blocked = d.muted || blockedDates?.has(d.iso);
                  const isPicked = picked === d.iso;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => !blocked && setPicked(d.iso)}
                      disabled={blocked}
                      aria-label={d.label}
                      className={cn(
                        "aspect-square rounded-lg text-sm transition-colors",
                        blocked &&
                          "cursor-not-allowed bg-bone/60 text-stone/40 line-through",
                        !blocked &&
                          !isPicked &&
                          "bg-white text-forest hover:bg-bone",
                        isPicked && "bg-pitch text-parchment shadow-card"
                      )}
                    >
                      {d.day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-stone">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-bone" /> Available
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-stone/40" /> Booked /
                  weather hold
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={!picked}
              onClick={() => picked && setConfirmed(formatLong(picked))}
              className={cn(
                "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors",
                picked
                  ? "bg-pitch text-parchment hover:bg-slate-deep"
                  : "cursor-not-allowed bg-bone text-stone"
              )}
            >
              {picked
                ? `Confirm new date · ${formatLong(picked)}`
                : "Pick an open date"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

type GridDay = { iso: string; day: number; label: string; muted: boolean };

function buildThreeWeekGrid(anchor: string): GridDay[] {
  const [yr, mo, da] = anchor.split("-").map(Number);
  const start = new Date(Date.UTC(yr, mo - 1, da));
  // Snap to the Sunday on or before anchor.
  const dow = start.getUTCDay();
  start.setUTCDate(start.getUTCDate() - dow);

  const out: GridDay[] = [];
  for (let i = 0; i < 21; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const iso = d.toISOString().slice(0, 10);
    out.push({
      iso,
      day: d.getUTCDate(),
      label: d.toUTCString().slice(0, 16),
      // Mute past relative to anchor and Sundays (non-service day).
      muted: d.getTime() < Date.UTC(yr, mo - 1, da) || d.getUTCDay() === 0,
    });
  }
  return out;
}

function formatMonthRange(days: GridDay[]): string {
  if (!days.length) return "";
  const first = new Date(days[0].iso + "T00:00:00Z");
  const last = new Date(days[days.length - 1].iso + "T00:00:00Z");
  const fm = first.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const lm = last.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const yr = last.getUTCFullYear();
  return fm === lm ? `${fm} ${yr}` : `${fm} – ${lm} ${yr}`;
}

function formatLong(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
