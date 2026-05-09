import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { NewDealForm } from "../_components/NewDealForm";
import { getStripeMode } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Deal · GladiusTurf",
  robots: { index: false, follow: false },
};

const TIER_DEFAULTS = [
  { id: "starter", label: "Starter", monthly: 597 },
  { id: "growth", label: "Professional", monthly: 1497 },
  { id: "enterprise", label: "Enterprise", monthly: 3997 },
];

export default async function NewDealPage() {
  const mode = getStripeMode();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="War Room · Deals"
        title="New deal"
        subtitle="Build a /close/[token] URL during the demo. Prospect opens it, pays, signs (Phase 2), and lands in their workspace."
        actions={
          <Link
            href="/founders/war-room/deals"
            prefetch
            className="inline-flex items-center gap-1 text-[12px] text-g-text-muted hover:text-g-text"
          >
            <ChevronLeft className="h-3 w-3" />
            All deals
          </Link>
        }
      />

      {mode === "unset" && (
        <section className="rounded-md border border-g-danger/40 bg-g-danger/10 p-4 text-[13px] text-g-danger">
          STRIPE_SECRET_KEY is not set on Vercel. The form will save the
          deal row but Stripe Customer + Subscription creation will fail
          on the prospect&apos;s side.
        </section>
      )}
      {mode === "test" && (
        <section className="rounded-md border border-amber-400/30 bg-amber-400/10 p-3 text-[12px] text-amber-300">
          Stripe is in TEST MODE. Use card{" "}
          <code className="font-geist-mono">4242 4242 4242 4242</code> to
          dogfood. Switch to live keys before sharing a /close/[token] URL
          with a real prospect.
        </section>
      )}
      {mode === "live" && (
        <section className="rounded-md border border-g-accent/30 bg-g-accent-faint/30 p-3 text-[12px] text-g-accent">
          Stripe is in LIVE MODE. Real cards, real money. Test by sending
          yourself a deal at $1 first — refund yourself in the Stripe
          dashboard.
        </section>
      )}

      <NewDealForm tierDefaults={TIER_DEFAULTS} />
    </div>
  );
}
