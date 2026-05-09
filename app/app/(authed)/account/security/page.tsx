import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { readAppSession } from "@/lib/app/session";
import { getTenantUserSecret } from "@/lib/app/tenant-auth";
import { PasswordCard } from "./_components/PasswordCard";
import { TotpCard } from "./_components/TotpCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Security · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function SecurityPage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return (
      <div className="g-card p-6">
        <p className="text-[13px] text-g-text-muted">
          Security settings are tenant-only. Sign in to your workspace to
          manage your password and two-factor.
        </p>
      </div>
    );
  }

  // Defensive read — migration 20260509_c may not be applied yet.
  const secret = await getTenantUserSecret(session.email);
  const hasPassword = secret?.password_set_at != null;
  const totpEnrolled = secret?.totp_secret != null;
  const lastLoginAt = secret?.last_login_at ?? null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Account`}
        title="Security"
        subtitle="Set a password, enable two-factor authentication, and manage recovery codes."
        actions={
          <Link
            href="/app/settings"
            prefetch
            className="inline-flex items-center gap-1 text-[12px] text-g-text-muted hover:text-g-text"
          >
            <ChevronLeft className="h-3 w-3" />
            Back to settings
          </Link>
        }
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="g-card p-5">
          <PasswordCard hasExisting={hasPassword} />
        </div>
        <div className="g-card p-5">
          <TotpCard enrolled={totpEnrolled} enrolledAt={secret?.enrolled_at ?? null} />
        </div>
      </section>

      {lastLoginAt && (
        <section className="g-card flex items-center gap-3 p-4">
          <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Last sign-in
          </span>
          <span className="text-[13px] text-g-text">
            {new Date(lastLoginAt).toLocaleString()}
          </span>
          <span className="ml-auto text-[11px] text-g-text-faint">
            From {session.email}
          </span>
        </section>
      )}

      <section className="g-card flex items-start gap-3 p-4">
        <div className="text-[12px] text-g-text-muted leading-relaxed">
          <strong className="text-g-text">Three ways to sign in.</strong>{" "}
          Password (with optional two-factor) is fastest. Magic-link to your
          email is the fallback if you forget your password. Recovery codes
          are the fallback if you lose your authenticator. Email{" "}
          <a
            href="mailto:founders@gladiusturf.com"
            className="text-g-accent hover:underline"
          >
            founders@gladiusturf.com
          </a>{" "}
          if you&apos;re locked out.
        </div>
      </section>
    </div>
  );
}
