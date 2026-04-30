import { PageHeader } from "@/components/app/PageHeader";
import { AskGladius } from "@/components/app/AskGladius";

export const dynamic = "force-dynamic";

export default function AskGladiusPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Phase 4 · live · Anthropic streaming"
        title="Ask Gladius"
        subtitle="Natural-language ops queries over your live Cypress Lawn snapshot. Same model, same data, same surface as the floating widget bottom-right."
      />
      <AskGladius variant="page" product="demo" />
    </div>
  );
}
