import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { CloseForm } from "./CloseForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Welcome to GladiusTurf",
  robots: { index: false, follow: false },
};

/**
 * Prospect-facing close page. Token-gated — anyone with the URL can
 * complete payment. We DO NOT require a session here (the founder
 * shares this URL during a screen-share demo).
 *
 * Server component fetches the deal, hands a minimal summary to the
 * client `<CloseForm>` which orchestrates the in-page Stripe flow.
 *
 * Phases shipped:
 *   Phase 1 (today): order summary + payment via Stripe Elements
 *   Phase 2 (next week): contract sign canvas + PDF persistence
 *   Phase 3: provisioning + magic-link to /app/account/security
 */

export default async function ClosePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token || token.length !== 16) {
    notFound();
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("deals")
    .select(
      "id, status, prospect_email, prospect_company, tier, custom_price_cents, addon_bdc, expires_at, paid_at",
    )
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  type Deal = {
    id: string;
    status: string;
    prospect_email: string;
    prospect_company: string;
    tier: string;
    custom_price_cents: number;
    addon_bdc: boolean;
    expires_at: string;
    paid_at: string | null;
  };
  const deal = data as Deal;

  const expired = new Date(deal.expires_at) < new Date();
  const monthly = deal.custom_price_cents + (deal.addon_bdc ? 49900 : 0);

  return (
    <main className="gladius-app min-h-screen bg-g-bg text-g-text">
      <div className="mx-auto max-w-xl px-4 py-12 md:py-20">
        <header className="mb-8 flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-g-accent-faint text-g-accent border border-g-accent/40 text-[13px] font-medium">
            G
          </span>
          <span className="text-[14px] font-medium text-g-text">GladiusTurf</span>
        </header>

        {expired ? (
          <ExpiredPanel />
        ) : deal.status === "paid" || deal.status === "signed" || deal.status === "active" ? (
          <AlreadyPaidPanel />
        ) : deal.status === "voided" || deal.status === "refunded" ? (
          <VoidedPanel />
        ) : (
          <CloseForm
            token={token}
            deal={{
              prospectCompany: deal.prospect_company,
              prospectEmail: deal.prospect_email,
              tier: deal.tier,
              monthlyCents: monthly,
              addonBdc: deal.addon_bdc,
            }}
          />
        )}

        <footer className="mt-12 flex flex-col gap-1 text-center text-[11px] text-g-text-faint">
          <span>
            Questions? Email{" "}
            <a
              href="mailto:founders@gladiusturf.com"
              className="text-g-accent hover:underline"
            >
              founders@gladiusturf.com
            </a>
          </span>
          <span>Secured by Stripe.</span>
        </footer>
      </div>
    </main>
  );
}

function ExpiredPanel() {
  return (
    <div className="g-card p-6">
      <h2 className="font-serif text-xl text-g-text">This link has expired.</h2>
      <p className="mt-3 text-[13px] leading-[1.55] text-g-text-muted">
        Payment links expire 7 days after creation. Reach out to your founder
        rep — they&apos;ll send a fresh one.
      </p>
    </div>
  );
}

function AlreadyPaidPanel() {
  return (
    <div className="g-card p-6">
      <h2 className="font-serif text-xl text-g-text">
        This deal is already paid.
      </h2>
      <p className="mt-3 text-[13px] leading-[1.55] text-g-text-muted">
        Check your inbox for the sign-in link to your workspace. If you
        can&apos;t find it, email founders@gladiusturf.com.
      </p>
    </div>
  );
}

function VoidedPanel() {
  return (
    <div className="g-card p-6">
      <h2 className="font-serif text-xl text-g-text">This link is no longer active.</h2>
      <p className="mt-3 text-[13px] leading-[1.55] text-g-text-muted">
        If you were expecting to pay here, email founders@gladiusturf.com.
      </p>
    </div>
  );
}
