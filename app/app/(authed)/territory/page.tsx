import { Map } from "lucide-react";
import { TerritoryBrowser } from "@/components/app/TerritoryBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Territory"
        tenant={session.tenant}
        icon={Map}
        body="Service territory zones, density heatmaps, and route-cluster recommendations appear here once you have 50+ customers mapped."
      />
    );
  }
  return <TerritoryBrowser product="demo" />;
}
