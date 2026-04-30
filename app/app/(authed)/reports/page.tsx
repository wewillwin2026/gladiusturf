import { PageHeader } from "@/components/app/PageHeader";
import { ReportsBrowser } from "@/components/app/ReportsBrowser";
import { demoState } from "@/lib/demo/state";

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  const state = demoState();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Cypress Lawn"
        title="Reports"
        subtitle="Revenue · Margin · Churn · NPS · Routes. Five tabs, real charts, live data."
      />
      <ReportsBrowser
        customers={state.customers}
        jobs={state.jobs}
        quotes={state.quotes}
        invoices={state.invoices}
      />
    </div>
  );
}
