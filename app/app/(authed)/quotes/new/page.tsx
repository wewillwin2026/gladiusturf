import { redirect } from "next/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { AIQuoteDrafter } from "@/components/app/AIQuoteDrafter";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function AIQuoteDrafterPage() {
  const session = await readAppSession();

  // Tenants: every "Create a quote" link in the app eventually points at
  // /app/quotes/new. The real working drafter lives at /app/quotes/draft
  // (markQuoteSent + emailQuoteToCustomer via Resend behind the consent
  // gate). Redirect here so every entry point lands in the right place
  // without changing 5+ callers. Query string is preserved (customer=...).
  if (session.kind === "tenant") {
    redirect("/app/quotes/draft");
  }

  // Demo session — the AIQuoteDrafter satellite-measure flow (fake send,
  // sales-demo only).
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Phase 3 · live · Anthropic streaming · demo only"
        title="AI Quote Drafter"
        subtitle="Address → satellite measure → quote in 30 seconds. Demo session — tenant Send pipeline lives at /app/quotes/draft."
      />
      <AIQuoteDrafter
        mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? null}
      />
    </div>
  );
}

