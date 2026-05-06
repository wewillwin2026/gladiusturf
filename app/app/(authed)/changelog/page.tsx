import { FileText } from "lucide-react";
import { ChangelogBrowser } from "@/components/app/ChangelogBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Changelog"
        tenant={session.tenant}
        icon={FileText}
        body="Weekly release notes, new engines shipped, and policy changes appear here. Subscribe in Settings to get them by email."
      />
    );
  }
  return <ChangelogBrowser product="demo" />;
}
