import { Repeat } from "lucide-react";
import { AutomationsBrowser } from "@/components/app/AutomationsBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Automations"
        tenant={session.tenant}
        icon={Repeat}
        body="Inbox auto-reply and post-job review-ask are the two live workflows. Toggle them on in Settings → Automations once your inbox + jobs feeds are connected."
      />
    );
  }
  return <AutomationsBrowser product="demo" />;
}
