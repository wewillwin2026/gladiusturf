import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  ClipboardList,
  Sparkles,
  Upload,
  UserPlus,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/app/ui/Button";
import { KPICard } from "@/components/app/ui/KPICard";
import type { TenantRow } from "@/lib/app/tenant-auth";

/**
 * First-run shell for a tenant whose workspace has no customers yet.
 * Renders instead of TodayDashboard when `customerCount === 0` so a paying
 * tenant on day one sees a clear path to populate the workspace, not a sea
 * of zeroed KPIs that look broken.
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
        title={`Welcome to GladiusTurf, ${tenant.display_name}.`}
        subtitle="Three ways to get rolling — pick whichever feels easiest."
      />

      <section className="grid gap-3 md:grid-cols-3">
        <Link href="/app/import/customers" prefetch className="group">
          <div className="g-card flex h-full flex-col gap-3 p-5 transition-colors group-hover:bg-g-surface-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-g-accent-faint text-g-accent">
                <Upload className="h-4 w-4" />
              </span>
              <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Recommended
              </span>
            </div>
            <div>
              <div className="text-[15px] font-medium text-g-text">
                Import your customer list
              </div>
              <p className="mt-1 text-[13px] text-g-text-muted">
                Upload a CSV from your current tool — Jobber, ServicePro, a
                spreadsheet, anywhere. We&apos;ll map columns and bring them in.
              </p>
            </div>
            <div className="mt-auto inline-flex items-center gap-1 text-[12px] font-medium text-g-accent">
              Start the import
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>

        <Link href="/app/customers" prefetch className="group">
          <div className="g-card flex h-full flex-col gap-3 p-5 transition-colors group-hover:bg-g-surface-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-g-surface-2 text-g-text">
                <UserPlus className="h-4 w-4" />
              </span>
            </div>
            <div>
              <div className="text-[15px] font-medium text-g-text">
                Add your first customer
              </div>
              <p className="mt-1 text-[13px] text-g-text-muted">
                Just type one in. The customer page becomes your hub — fixtures,
                plans, schedule, history all live there.
              </p>
            </div>
            <div className="mt-auto inline-flex items-center gap-1 text-[12px] font-medium text-g-text-muted group-hover:text-g-text">
              Open customers
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>

        <Link href="/app/inventory" prefetch className="group">
          <div className="g-card flex h-full flex-col gap-3 p-5 transition-colors group-hover:bg-g-surface-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-g-surface-2 text-g-text">
                <Boxes className="h-4 w-4" />
              </span>
              <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Already wired
              </span>
            </div>
            <div>
              <div className="text-[15px] font-medium text-g-text">
                Browse starter inventory
              </div>
              <p className="mt-1 text-[13px] text-g-text-muted">
                {starterItemCount} starter SKUs and {starterUnitCount} sample
                units are loaded as a head-start catalog. Customize, replace, or
                clear them when you&apos;re ready.
              </p>
            </div>
            <div className="mt-auto inline-flex items-center gap-1 text-[12px] font-medium text-g-text-muted group-hover:text-g-text">
              Open inventory
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Customers" value="0" delta="add your first" trend="flat" />
        <KPICard
          label="Starter SKUs"
          value={String(starterItemCount)}
          delta="customize or clear"
          trend="flat"
        />
        <KPICard
          label="Starter units"
          value={String(starterUnitCount)}
          delta="ready to scan"
          trend="flat"
        />
        <KPICard label="Plan upsell" value="—" delta="needs customers" trend="flat" />
      </section>

      <div className="g-card flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-g-surface-2 text-g-text">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[14px] font-medium text-g-text">
              Need a hand?
            </div>
            <p className="mt-1 text-[12px] text-g-text-muted">
              Founder-direct support during your first week. Reply to any
              GladiusTurf email and a real person picks it up — usually within
              the hour.
            </p>
          </div>
        </div>
        <Link href="/app/onboarding/profile" prefetch>
          <Button variant="secondary" size="md" type="button">
            <ClipboardList className="h-3.5 w-3.5" />
            Tell us about your shop
          </Button>
        </Link>
      </div>
    </div>
  );
}
