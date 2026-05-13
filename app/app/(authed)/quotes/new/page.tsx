import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { AIQuoteDrafter } from "@/components/app/AIQuoteDrafter";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function AIQuoteDrafterPage() {
  const session = await readAppSession();

  if (session.kind === "tenant") {
    // Tenants never reach this page through normal navigation — the engine
    // sidebar (hrefForEngine in components/app/engines.ts) rewrites
    // /app/quotes/new -> /app/quotes/draft for tenants. This direct-URL
    // landing exists only as a fallback. Send + email are LIVE at
    // /app/quotes/draft (markQuoteSent + emailQuoteToCustomer with Resend
    // behind the consent gate). Send to the right surface.
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow={`${session.tenant.display_name} · Quotes`}
          title="Draft a quote"
          subtitle="The working drafter lives at /quotes/draft — Anthropic-streamed scope-of-work, markQuoteSent on submit, Resend-emailed link to the customer behind the consent gate, clipboard + SMS-share fallback."
        />
        <div className="g-card flex flex-col gap-3 p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-g-accent" />
            <h2 className="text-[14px] text-g-text">
              The satellite-measure flow is currently demo-only
            </h2>
          </div>
          <p className="text-[13px] leading-[1.55] text-g-text-muted">
            The address-to-quote-in-30-seconds UI on this page is wired for
            the sales demo (Cypress Lawn). For your tenant we ship the
            <strong className="text-g-text"> Draft Quote</strong> path
            instead — it persists to <code className="text-g-text">proposals</code>,
            flips status on send, fires the Resend email, copies the public
            link, and offers an SMS share to the customer&rsquo;s phone.
          </p>
          <Link
            href="/app/quotes/draft"
            className="inline-flex items-center gap-1.5 self-start rounded-full bg-g-accent px-4 py-2 text-[12px] font-semibold text-g-bg transition-colors hover:bg-g-accent-bright"
          >
            Open Draft Quote
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

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
