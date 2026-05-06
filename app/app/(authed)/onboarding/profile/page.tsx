import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/ui/EmptyState";
import { Button } from "@/components/app/ui/Button";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tell us about your shop · GladiusTurf",
  robots: { index: false, follow: false },
};

/**
 * Onboarding profile — placeholder. The full one-screen "tell us about your
 * shop" form (service area, crew size, price tier) ships shortly. For Day 1
 * post-signup, this page acknowledges the link from TenantOnboardingHero
 * without 404'ing and offers founder-direct contact instead.
 */
export default async function OnboardingProfilePage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app"
        prefetch
        className="inline-flex items-center gap-1.5 text-[12px] text-g-text-muted hover:text-g-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to dashboard
      </Link>

      <PageHeader
        eyebrow={`${session.tenant.display_name} · Onboarding`}
        title="Tell us about your shop"
        subtitle="The full profile form ships in a few days. Until then, founder-direct support."
      />

      <EmptyState
        icon={ClipboardList}
        title="One-screen profile coming soon"
        body="Service area, crew size, price tier, and integrations — all configurable here. For now, reply to any GladiusTurf email and a founder will help you set this up directly."
      />

      <div className="flex justify-center">
        <a href="mailto:founders@gladiusturf.com">
          <Button variant="secondary" size="md" type="button">
            Email founders@gladiusturf.com
          </Button>
        </a>
      </div>
    </div>
  );
}
