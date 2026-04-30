import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { JobsBoard } from "@/components/app/JobsBoard";
import { demoState } from "@/lib/demo/state";
import { num } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

export default function JobsPage() {
  const state = demoState();

  const todayJobs = state.jobs.filter((j) => {
    const d = new Date(j.scheduledAt);
    const t = new Date();
    return (
      d.getFullYear() === t.getFullYear() &&
      d.getMonth() === t.getMonth() &&
      d.getDate() === t.getDate()
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Cypress Lawn"
        title="Jobs · Today"
        subtitle="Live job board across all crews. Tap any job for photos, signature, materials."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Visits today"
          value={num(todayJobs.length)}
          delta={`${state.crews.length} crews`}
          trend="up"
        />
        <KPICard
          label="Complete"
          value={num(todayJobs.filter((j) => j.status === "Complete").length)}
          delta="on track"
          trend="up"
        />
        <KPICard
          label="On site / en-route"
          value={num(
            todayJobs.filter((j) => j.status === "OnSite" || j.status === "EnRoute").length,
          )}
          delta="live"
          trend="flat"
        />
        <KPICard
          label="Skipped"
          value={num(todayJobs.filter((j) => j.status === "Skipped").length)}
          delta="needs follow-up"
          trend="down"
        />
      </section>

      <JobsBoard
        jobs={state.jobs}
        customers={state.customers}
        crews={state.crews}
      />
    </div>
  );
}
