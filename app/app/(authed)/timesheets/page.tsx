import { Timer } from "lucide-react";
import { TimesheetsBrowser } from "@/components/app/TimesheetsBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Timesheets"
        tenant={session.tenant}
        icon={Timer}
        body="Crew clock-in/clock-out, geofenced job-site time, and weekly hour rollups appear here once your crew installs the Field App."
      />
    );
  }
  return <TimesheetsBrowser product="demo" />;
}
