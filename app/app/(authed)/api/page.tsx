import { Key } from "lucide-react";
import { ApiBrowser } from "@/components/app/ApiBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="API"
        tenant={session.tenant}
        icon={Key}
        body="API keys, webhook endpoints, and rate-limit dashboards appear here. Generate your first key in Settings → API."
      />
    );
  }
  return <ApiBrowser product="demo" />;
}
