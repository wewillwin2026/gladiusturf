import Link from "next/link";
import { ArrowRight, Boxes, Sparkles, Upload, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/app/ui/Button";
import type { TenantRow } from "@/lib/app/tenant-auth";

/**
 * First-run shell for a tenant whose workspace has no customers yet.
 * Renders instead of TodayDashboard when `customerCount === 0`.
 *
 * Board (2026-05-07): Jobs + Product called the prior 3-CTA fork
 * "indecision wearing a tuxedo" — the hero now has ONE dominant action
 * (drop a list / paste a list) and demotes manual entry + starter
 * inventory to small links. The first emotion should be momentum, not
 * a fork in the road.
 */
export function TenantOnboardingHero({
  tenant,
  starterItemCount,
  starterUnitCount,
}: {
  tenant: TenantRow;
  starterItemCount: number;
  starterUnitCount: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${tenant.display_name} · Day 1`}
        title={`Welcome, ${tenant.display_name}.`}
        subtitle="Drop your customer list — we'll handle the rest."
      />

      <Link
        href="/app/import/customers"
        prefetch
        className="group relative block overflow-hidden rounded-xl border-2 border-dashed border-g-accent/40 bg-g-accent-faint/40 p-10 transition-colors hover:border-g-accent/70 hover:bg-g-accent-faint/60"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(0,210,106,0.15) 0%, rgba(0,210,106,0.04) 50%, transparent 80%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-3 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-g-accent text-black">
            <Upload className="h-6 w-6" />
          </span>
          <div className="text-[20px] font-medium text-g-text">
            Drop your customer list
          </div>
          <p className="max-w-md text-[14px] text-g-text-muted">
            CSV from Jobber, ServicePro, LMN, Aspire, QuickBooks, or any
            spreadsheet. We&apos;ll read it, map the columns, and bring your
            customers in. Two minutes.
          </p>
          <Button variant="primary" size="lg" type="button" className="mt-2">
            Upload CSV
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </Link>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-g-text-muted">
        <span>Or:</span>
        <Link
          href="/app/customers/new"
          prefetch
          className="inline-flex items-center gap-1 hover:text-g-text"
        >
          <UserPlus className="h-3 w-3" />
          Add one customer manually
        </Link>
        <span className="text-g-text-faint">·</span>
        <Link
          href="/app/inventory"
          prefetch
          className="inline-flex items-center gap-1 hover:text-g-text"
        >
          <Boxes className="h-3 w-3" />
          Browse {starterItemCount} starter SKUs ({starterUnitCount} units)
        </Link>
        <span className="text-g-text-faint">·</span>
        <Link
          href="/app/onboarding/profile"
          prefetch
          className="inline-flex items-center gap-1 hover:text-g-text"
        >
          <Sparkles className="h-3 w-3" />
          Tell us about your shop
        </Link>
      </div>

      <div className="g-card flex items-start gap-3 p-4 text-[13px] text-g-text-muted">
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-g-accent-faint text-g-accent text-[11px] font-semibold">
          ✓
        </span>
        <div>
          <strong className="text-g-text">Founder-direct support, your first week.</strong>{" "}
          Reply to any GladiusTurf email and a real person picks it up — usually
          within the hour. We ride along on Mondays during your first month.
        </div>
      </div>
    </div>
  );
}
