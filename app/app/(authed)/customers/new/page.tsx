import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { readAppSession } from "@/lib/app/session";
import { CustomerForm } from "./_components/CustomerForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add customer · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function NewCustomerPage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/customers"
        prefetch
        className="inline-flex items-center gap-1.5 text-[12px] text-g-text-muted hover:text-g-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to customers
      </Link>

      <PageHeader
        eyebrow={`${session.tenant.display_name} · New customer`}
        title="Add a customer"
        subtitle="Just the basics. Fixtures, plans, and visit history attach later."
      />

      <CustomerForm
        tenantBilingual={session.tenant.bilingual}
        defaultLanguage={
          session.tenant.primary_language === "es" ? "es" : "en"
        }
      />
    </div>
  );
}
