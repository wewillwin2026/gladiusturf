import { redirect } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/ui/EmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chemicals · GladiusTurf",
  robots: { index: false, follow: false },
};

/**
 * Chemicals engine — temporarily hidden from the sidebar 2026-05-06 per board
 * vote. Pesticide application records are state-regulated (FIFRA + state
 * applicator licensing). The engine returns when the chemical_applications
 * schema lands with applicator license, EPA reg #, target pest, rate, weather,
 * and signature columns. Until then, a deep-link to /app/chemicals shows this
 * honest stub instead of the prior Cypress Lawn demo data.
 */
export default async function ChemicalsPage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Ops`}
        title="Chemicals"
        subtitle="Coming when the regulated record-keeping ships."
      />

      <EmptyState
        icon={FlaskConical}
        title="Pesticide records — coming Q3 2026"
        body="State pesticide-application records have hard requirements (applicator license, EPA reg #, target pest, rate, weather, signature). We're building this against FIFRA + state record-keeping rules so every application you log is audit-ready. Want early access? Email founders@gladiusturf.com."
      />
    </div>
  );
}
