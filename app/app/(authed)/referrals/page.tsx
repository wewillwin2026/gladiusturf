import { GitFork } from "lucide-react";
import { ReferralsBrowser } from "@/components/app/ReferralsBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Referrals"
        tenant={session.tenant}
        icon={GitFork}
        body="Referral Radar tracks which customers send you new business and fires next-door outreach after great jobs. Activate it in Automations."
      />
    );
  }
  return <ReferralsBrowser product="demo" />;
}
