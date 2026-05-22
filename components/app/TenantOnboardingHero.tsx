import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Briefcase,
  HardHat,
  Sparkles,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/app/ui/Button";
import type { TenantRow } from "@/lib/app/tenant-auth";

/**
 * First-run shell for a tenant whose workspace has no customers yet.
 * Renders instead of TodayDashboard when `customerCount === 0`.
 *
 * Dominant action stays the CSV import (one-button to populate the
 * shop). Below it, "Or start anywhere" surfaces every individual
 * create path the operator now has — customers, jobs, crew, inventory,
 * team invites — so a fresh tenant sees the full breadth of the CRM
 * from Day 1 rather than a sea of zeroed KPIs OR a single CSV button
 * that looks like the only option.
 */
export function TenantOnboardingHero({
  tenant,
  isOwner = true,
}: {
  tenant: TenantRow;
  /** Owner-only flows (Invite teammate) are hidden for non-owners. */
  isOwner?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${tenant.display_name} · Day 1`}
        title={`Welcome, ${tenant.display_name}.`}
        subtitle="Drop your customer list to populate the whole CRM — or start anywhere below."
      />

      {/* Dominant CTA — CSV import. Same as before; it's still the
          highest-leverage day-1 action. */}
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
              "radial-gradient(ellipse at top right, rgba(184,101,31,0.15) 0%, rgba(184,101,31,0.04) 50%, transparent 80%)",
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

      {/* "Or start anywhere" — every create flow the operator has,
          surfaced. Replaces the old broken "Browse N starter SKUs" link
          and the cramped inline option row. */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-g-border-subtle" />
          <span className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
            Or start anywhere
          </span>
          <div className="h-px flex-1 bg-g-border-subtle" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            href="/app/customers/new"
            icon={UserPlus}
            title="Add a customer"
            body="One at a time — name, address, contact, language."
          />
          <QuickAction
            href="/app/jobs/new"
            icon={Briefcase}
            title="Schedule a job"
            body="Install, service, warranty, plan visit, storm response."
          />
          <QuickAction
            href="/app/crew/new"
            icon={HardHat}
            title="Add a crew member"
            body="Lead, tech, or helper — hours and rate optional."
          />
          <QuickAction
            href="/app/inventory/new"
            icon={Boxes}
            title="Add an inventory item"
            body="Fixtures, transformers, wire — your real catalog."
          />
          {isOwner && (
            <QuickAction
              href="/app/settings/team/new"
              icon={Users}
              title="Invite a teammate"
              body="Email + password + title + role. They sign in immediately."
            />
          )}
          <QuickAction
            href="/app/onboarding/profile"
            icon={Sparkles}
            title="Tell us about your shop"
            body="Brand, hours, service area — informs every AI prompt."
          />
        </div>
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

function QuickAction({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      prefetch
      className="group flex items-start gap-3 rounded-lg border border-g-border bg-g-surface p-4 transition-colors hover:border-g-accent/50 hover:bg-g-surface-2"
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-g-accent-faint text-g-accent">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-[13px] font-medium text-g-text">
          {title}
          <ArrowRight className="h-3 w-3 text-g-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-g-accent" />
        </div>
        <p className="mt-0.5 text-[12px] text-g-text-muted">{body}</p>
      </div>
    </Link>
  );
}
