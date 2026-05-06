import { Building2 } from "lucide-react";
import { CrewBrowser } from "@/components/app/CrewBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Crew"
        tenant={session.tenant}
        icon={Building2}
        body="Add your crew members to see scheduling, skills, certifications, and per-tech production metrics."
      />
    );
  }
  return <CrewBrowser product="demo" />;
}
