import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { JobForm } from "./_components/JobForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Schedule a job · GladiusTurf",
  robots: { index: false, follow: false },
};

type CustomerOption = { id: string; display_name: string };

export default async function NewJobPage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  let customers: CustomerOption[] = [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("customers")
      .select("id, display_name")
      .eq("tenant_id", session.tenant.id)
      .order("display_name")
      .limit(500);
    if (!error && data) {
      customers = data as CustomerOption[];
    }
  } catch {
    customers = [];
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/jobs"
        prefetch
        className="inline-flex items-center gap-1.5 text-[12px] text-g-text-muted hover:text-g-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to jobs
      </Link>

      <PageHeader
        eyebrow={`${session.tenant.display_name} · New job`}
        title="Schedule a job"
        subtitle="A job is a scheduled visit — install, service, warranty, plan visit, storm response. Attach a customer or leave it open."
      />

      <JobForm customers={customers} />
    </div>
  );
}
