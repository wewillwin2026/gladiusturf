import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { readAppSession } from "@/lib/app/session";
import { InventoryForm } from "./_components/InventoryForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add inventory item · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function NewInventoryItemPage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/inventory"
        prefetch
        className="inline-flex items-center gap-1.5 text-[12px] text-g-text-muted hover:text-g-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to inventory
      </Link>

      <PageHeader
        eyebrow={`${session.tenant.display_name} · New item`}
        title="Add an inventory item"
        subtitle="Create the SKU now. Receive units, scan QR labels, and age-track stock against it after."
      />

      <InventoryForm />
    </div>
  );
}
