import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { readAppSession } from "@/lib/app/session";
import { CrewForm } from "./_components/CrewForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add crew member · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function NewCrewMemberPage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/crew"
        prefetch
        className="inline-flex items-center gap-1.5 text-[12px] text-g-text-muted hover:text-g-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to crew
      </Link>

      <PageHeader
        eyebrow={`${session.tenant.display_name} · New crew member`}
        title="Add a crew member"
        subtitle="Just the basics. Hours, scheduling, and per-tech production attach later."
      />

      <CrewForm />
    </div>
  );
}
