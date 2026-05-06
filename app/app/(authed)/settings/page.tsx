import { Cog } from "lucide-react";
import { SettingsBrowser } from "@/components/app/SettingsBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Settings"
        tenant={session.tenant}
        icon={Cog}
        body="Workspace settings, billing, team members, branding, and per-engine toggles. Full settings UI ships before vertical #2."
      />
    );
  }
  return <SettingsBrowser product="demo" />;
}
