import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";

export const dynamic = "force-dynamic";

export default function WarRoomTodayPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Foundation shipped · Phase 1"
        title="War Room"
        subtitle="Today dashboard, real-data wiring, and Secret tab land in Phase 2 + Phase 6. The 505-LOC demo-pipeline page is preserved at /demo-pipeline."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/founders/war-room/demo-pipeline"
          prefetch
          className="g-card p-5 transition-colors hover:border-g-accent/40"
        >
          <div className="text-[11px] uppercase tracking-[0.14em] text-g-accent">
            Demo Pipeline
          </div>
          <div className="mt-2 text-[15px] font-medium text-g-text">
            Inbound demo bookings →
          </div>
          <div className="mt-1 text-[13px] text-g-text-muted">
            Status, assignee, pipeline value, founder activity log.
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-[12px] text-g-text-muted">
            Open <ArrowRight className="h-3 w-3" />
          </div>
        </Link>

        <div className="g-card p-5">
          <div className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
            Coming in Phase 2
          </div>
          <div className="mt-2 text-[15px] font-medium text-g-text">
            Real KPIs · Activity feed · Crew status
          </div>
          <div className="mt-1 text-[13px] text-g-text-muted">
            Same Linear-grade UI as /app, pointed at your own real Supabase data.
          </div>
        </div>
      </div>

      <p className="text-[12px] text-g-text-faint">
        Press{" "}
        <span className="font-geist-mono px-1 py-0.5 rounded bg-g-surface-2 text-g-text">
          ⌘K
        </span>{" "}
        to navigate.
      </p>
    </div>
  );
}
