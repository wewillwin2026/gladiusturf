import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { ReportsBrowser } from "@/components/app/ReportsBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";
import { demoState } from "@/lib/demo/state";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Reports"
        tenant={session.tenant}
        icon={BarChart3}
        body="Revenue, fixture replacement, plan-conversion, and storm-response rollups appear here once you have 30 days of activity."
      />
    );
  }
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
