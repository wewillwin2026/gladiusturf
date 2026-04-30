import { PageHeader } from "@/components/app/PageHeader";
import { AIQuoteDrafter } from "@/components/app/AIQuoteDrafter";

export const dynamic = "force-dynamic";

export default function AIQuoteDrafterPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Phase 3 · live · Anthropic streaming"
        title="AI Quote Drafter"
        subtitle="Address → satellite measure → quote in 30 seconds. Bundled, not bolted-on."
      />
      <AIQuoteDrafter
        mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? null}
      />
    </div>
  );
}
