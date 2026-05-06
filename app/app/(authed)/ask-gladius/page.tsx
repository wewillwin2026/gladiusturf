import { Bot } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { AskGladius } from "@/components/app/AskGladius";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function AskGladiusPage() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Ask Gladius"
        tenant={session.tenant}
        icon={Bot}
        body="Natural-language ops queries over your live workspace. Today the model answers from a static demo snapshot — per-tenant retrieval ships behind the prompt-cache + ai_run audit table currently in development."
      />
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Phase 4 · live · Anthropic streaming · demo snapshot"
        title="Ask Gladius"
        subtitle="Natural-language ops queries over a Cypress Lawn demo snapshot. Per-tenant retrieval ships behind the prompt-cache + ai_run audit table currently in development."
      />
      <AskGladius variant="page" product="demo" />
    </div>
  );
}
