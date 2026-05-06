import { redirect } from "next/navigation";
import { Upload } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { readAppSession } from "@/lib/app/session";
import { CsvImporter } from "./_components/CsvImporter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Import customers · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function ImportCustomersPage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Onboarding`}
        title="Import customers"
        subtitle="Drop a CSV, map the columns, hit import."
      />

      <div className="g-card flex items-start gap-3 p-4">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-g-accent-faint text-g-accent">
          <Upload className="h-4 w-4" />
        </span>
        <div className="text-[13px] text-g-text-muted">
          Works with exports from <strong className="text-g-text">Jobber</strong>,
          <strong className="text-g-text"> ServicePro</strong>,
          <strong className="text-g-text"> LMN</strong>,
          <strong className="text-g-text"> Aspire</strong>, QuickBooks, or any
          spreadsheet. Header row required. Required column: a name. Email,
          phone, address are all optional. Duplicates by name within your
          workspace are skipped automatically.
        </div>
      </div>

      <CsvImporter />
    </div>
  );
}
