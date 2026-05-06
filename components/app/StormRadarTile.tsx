import Link from "next/link";
import { ArrowRight, CloudLightning, Sun } from "lucide-react";

/**
 * Compact storm-watch widget rendered on /app home for tenant sessions.
 * Most days a quiet "no active storms" card; pulses red when a hurricane
 * is in the watched-ZIPs footprint with one-tap "Open Storm Mode."
 *
 * Board (2026-05-07): Product Director ranked this #3 — the demo storm
 * page is the most polished surface in the codebase, but tenants only
 * encounter it from the Automations engine. Bringing the urgency to /app
 * home means every login on a stormy day starts with the right action.
 *
 * v1: deterministic, FL-only. The `inStormZipCount` is computed by the
 * page from a hardcoded Helene+Milton FL hurricane footprint. v2 ships
 * live NOAA active-storm feed.
 */
export function StormRadarTile({
  inStormZipCount,
  totalCustomerCount,
  guardianInStormCount,
}: {
  inStormZipCount: number;
  totalCustomerCount: number;
  guardianInStormCount: number;
}) {
  const armed = inStormZipCount > 0;

  if (!armed) {
    // Calm-day rendering — present but not loud. Reassures the operator
    // that the system is watching even when nothing is happening.
    return (
      <Link
        href="/app/automations/storm"
        prefetch
        className="g-card group flex items-center justify-between gap-4 p-4 transition-colors hover:bg-g-surface-2"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-g-surface-2 text-g-text-muted">
            <Sun className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-g-text">
              Storm Radar — clear
            </div>
            <p className="text-[12px] text-g-text-muted truncate">
              No named storms in your service area. We&apos;re watching{" "}
              {totalCustomerCount} customer
              {totalCustomerCount === 1 ? "" : "s"} across your ZIPs.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-[12px] text-g-text-faint group-hover:text-g-text shrink-0">
          Settings
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/app/automations/storm"
      prefetch
      className="g-card group relative block overflow-hidden p-5 transition-colors hover:bg-g-surface-2"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.04) 50%, transparent 80%)",
        }}
      />
      <div className="relative flex items-center gap-4">
        <span className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-g-danger/15 text-g-danger border border-g-danger/40">
          <CloudLightning className="h-5 w-5" />
          <span className="absolute inset-0 rounded-full border-2 border-g-danger/40 animate-ping" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-danger font-semibold">
              Storm radar — active
            </span>
            {guardianInStormCount > 0 && (
              <span className="text-[10px] uppercase tracking-[0.12em] text-g-accent">
                {guardianInStormCount} top-tier in path
              </span>
            )}
          </div>
          <div className="mt-1 text-[15px] font-medium text-g-text">
            {inStormZipCount} customer
            {inStormZipCount === 1 ? "" : "s"} in storm-watch ZIPs
          </div>
          <p className="mt-0.5 text-[12px] text-g-text-muted">
            Tap to review the playbook and queue bilingual check-ins.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-g-danger shrink-0">
          Open
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
