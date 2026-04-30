import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { ScheduleBoard } from "@/components/app/ScheduleBoard";
import { demoState } from "@/lib/demo/state";

export const dynamic = "force-dynamic";

export default function SchedulePage() {
  const state = demoState();

  // Numbers for the KPIs.
  const today = new Date();
  const todayStr = today.toDateString();
  const visitsToday = state.jobs.filter(
    (j) => new Date(j.scheduledAt).toDateString() === todayStr,
  ).length;
  const next7days = state.jobs.filter((j) => {
    const t = new Date(j.scheduledAt).getTime();
    return t >= Date.now() && t < Date.now() + 7 * 86400_000;
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Cypress Lawn"
        title="Schedule"
        subtitle="Week view, 6 crew swimlanes. Drag any job to reschedule. Auto-optimize to recompute the routes."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Visits today"
          value={String(visitsToday)}
          delta={`${next7days} this week`}
          trend="up"
        />
        <KPICard
          label="Crews active"
          value={String(state.crews.length)}
          delta="6 / 6"
          trend="flat"
        />
        <KPICard
          label="Open slots"
          value="11"
          delta="fillable"
          trend="flat"
        />
        <KPICard
          label="Drive-time savings"
          value="47 min"
          delta="auto-optimize"
          trend="down"
        />
      </section>

      <ScheduleBoard
        jobs={state.jobs}
        crews={state.crews}
        customers={state.customers}
      />
    </div>
  );
}
