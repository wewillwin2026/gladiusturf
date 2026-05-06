import { Newspaper } from "lucide-react";
import { CampaignsBrowser } from "@/components/app/CampaignsBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Campaigns"
        tenant={session.tenant}
        icon={Newspaper}
        body="Email + SMS campaigns to your customer list — seasonal pushes, win-back sequences, and plan-conversion drips. Build your first campaign once your customer list is loaded."
      />
    );
  }
  return <CampaignsBrowser product="demo" />;
}
