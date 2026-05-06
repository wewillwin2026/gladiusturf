import { Route } from "lucide-react";
import { RoutesBrowser } from "@/components/app/RoutesBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Routes"
        tenant={session.tenant}
        icon={Route}
        body="Optimized day routes appear here once you have customers + scheduled jobs. The optimizer pulls from service addresses, crew start points, and traffic data."
      />
    );
  }
  return <RoutesBrowser product="demo" />;
}
