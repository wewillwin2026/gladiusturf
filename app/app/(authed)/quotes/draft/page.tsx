import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { DraftQuoteForm } from "./_components/DraftQuoteForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Draft a quote · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function DraftQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  const sp = await searchParams;
  const sb = supabaseAdmin();
  const { data: customers } = await sb
    .from("customers")
    .select("id, display_name, primary_email, primary_phone, service_address")
    .eq("tenant_id", session.tenant.id)
    .order("display_name", { ascending: true });

  const customerOptions = (customers ?? []).map((c) => {
    const addr = (c.service_address as { city?: string } | null) ?? null;
    const subtitle = [c.primary_email, c.primary_phone, addr?.city]
      .filter(Boolean)
      .join(" · ");
    return {
      id: c.id as string,
      name: (c.display_name as string) ?? "(unnamed)",
      subtitle,
      phone: (c.primary_phone as string | null) ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/quotes"
        prefetch
        className="inline-flex items-center gap-1.5 text-[12px] text-g-text-muted hover:text-g-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to quotes
      </Link>

      <PageHeader
        eyebrow={`${session.tenant.display_name} · New quote`}
        title="New quote"
        subtitle="1. Pick a customer  ·  2. Name the job  ·  3. Add line items (or just a total)  ·  4. Press Send — we'll email + text them a one-tap quote link. Save as draft if you're not ready to send."
      />

      <DraftQuoteForm
        customers={customerOptions}
        defaultLanguage={
          session.tenant.primary_language === "es" ? "es" : "en"
        }
        tenantBilingual={session.tenant.bilingual}
        defaultCustomerId={sp.customer ?? null}
      />
    </div>
  );
}
