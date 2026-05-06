import { TrendingUp } from "lucide-react";
import { AnalyticsBrowser } from "@/components/app/AnalyticsBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Analytics"
        tenant={session.tenant}
        icon={TrendingUp}
        body="Conversion funnels, revenue trends, and per-engine ROI dashboards populate after 30 days of tenant activity."
      />
    );
  }
  return <AnalyticsBrowser product="demo" />;
}
