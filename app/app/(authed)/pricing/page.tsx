import { Tag } from "lucide-react";
import { PricingBrowser } from "@/components/app/PricingBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Pricing tables"
        tenant={session.tenant}
        icon={Tag}
        body="Build branded pricing tables you can send to prospects. Quote Drafter pulls from these as the source of truth for line-item amounts."
      />
    );
  }
  return <PricingBrowser product="demo" />;
}
