import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { readAppSession } from "@/lib/app/session";
import { EquipmentForm } from "./_components/EquipmentForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add equipment · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function NewEquipmentPage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/equipment"
        prefetch
        className="inline-flex items-center gap-1.5 text-[12px] text-g-text-muted hover:text-g-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to equipment
      </Link>

      <PageHeader
        eyebrow={`${session.tenant.display_name} · New equipment`}
        title="Add equipment"
        subtitle="Just the basics. Crew assignment and service history attach later."
      />

      <EquipmentForm />
    </div>
  );
}
