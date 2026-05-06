import { Star } from "lucide-react";
import { ReviewsBrowser } from "@/components/app/ReviewsBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Reviews"
        tenant={session.tenant}
        icon={Star}
        body="Google + Facebook reviews aggregated here, plus the post-job review-ask cadence. Connect your Google Business Profile in Integrations to start."
      />
    );
  }
  return <ReviewsBrowser product="demo" />;
}
