import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/ui/EmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payroll · GladiusTurf",
  robots: { index: false, follow: false },
};

/**
 * Payroll engine — temporarily hidden from the sidebar 2026-05-06 per board
 * vote. Payroll touches encrypted employee data (SSN, bank routing) and tax
 * compliance, both of which require a real schema and a vendor partnership
 * (Gusto/ADP/Paychex), not the current demo-only buttons. Engine returns when
 * the encrypted employees table + tax-compliant export pipeline ship.
 */
export default async function PayrollPage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Money`}
        title="Payroll"
        subtitle="Coming when the encrypted employee schema + tax-export pipeline ship."
      />

      <EmptyState
        icon={Wallet}
        title="Payroll — coming Q3 2026"
        body="Running payroll the right way means encrypted SSN/bank fields, payroll-tax compliance, and a real export to Gusto/ADP/Paychex. We're building this with field-level encryption + a vendor partnership instead of shipping a button that creates compliance risk. Want early access? Email founders@gladiusturf.com."
      />
    </div>
  );
}
