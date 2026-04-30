import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyMagicToken, getFounderSecret } from "@/lib/founders/auth";
import { VerifyForm } from "./VerifyForm";

export const metadata: Metadata = {
  title: "Founders · Verify",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const token = String(sp.token || "");
  const tok = verifyMagicToken(token);
  if (!tok) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-pitch px-6 py-16 text-bone">
        <div className="w-full max-w-md text-center">
          <h1 className="font-serif text-3xl text-bone">Link expired or invalid</h1>
          <p className="mt-3 text-sm text-bone/65">
            Magic links are good for 15 minutes and one redemption. Request a new
            one.
          </p>
          <a
            href="/founders/login"
            className="mt-6 inline-block rounded-full border border-champagne/40 px-5 py-2 text-xs uppercase tracking-[0.18em] text-champagne-bright hover:bg-champagne-bright/10"
          >
            Back to sign-in
          </a>
        </div>
      </main>
    );
  }

  const secret = await getFounderSecret(tok.email);
  // First-time login → /enroll. Otherwise prompt for TOTP.
  if (!secret?.totp_secret) {
    redirect(`/founders/enroll?token=${encodeURIComponent(token)}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-pitch px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne-bright">
            GladiusTurf · Founders
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.02em] text-bone">
            One last step
          </h1>
          <p className="mt-2 text-sm text-bone/60">
            Enter the 6-digit code from your authenticator.
          </p>
        </div>
        <div className="rounded-2xl border border-champagne/30 bg-bone/[0.02] p-7 shadow-pop-champagne">
          <VerifyForm token={token} email={tok.email} />
        </div>
      </div>
    </main>
  );
}
