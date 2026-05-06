import { Plug } from "lucide-react";
import { IntegrationsBrowser } from "@/components/app/IntegrationsBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Integrations"
        tenant={session.tenant}
        icon={Plug}
        body="Connect QuickBooks, Stripe, Twilio, Google Calendar, and your DMS. Active integrations appear here with last-sync status and any errors."
      />
    );
  }
  return <IntegrationsBrowser product="demo" />;
}
