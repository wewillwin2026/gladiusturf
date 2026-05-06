import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { AIQuoteDrafter } from "@/components/app/AIQuoteDrafter";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function AIQuoteDrafterPage() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="AI Quote Drafter"
        tenant={session.tenant}
        icon={Sparkles}
        body="The drafter writes scopes-of-work over Anthropic streaming today, but the Send pipeline (Resend + Twilio with delivery confirmation + audit row) ships before tenants get the green button. Need to send a quote now? Email founders@gladiusturf.com — we'll do it manually until the pipeline lands."
      />
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Phase 3 · live · Anthropic streaming · demo only"
        title="AI Quote Drafter"
        subtitle="Address → satellite measure → quote in 30 seconds. Demo session — Send is staged for tenants once the audit chain ships."
      />
      <AIQuoteDrafter
        mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? null}
      />
    </div>
  );
}
