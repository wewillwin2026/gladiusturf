import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { ProfileForm } from "./_components/ProfileForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop profile · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function ShopProfilePage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") redirect("/app/login");
  if (session.role !== "owner") redirect("/app");

  // Pull the latest tenant row so the form is pre-filled with what's
  // already saved (legal_name, brand colors, zips, language, etc.).
  // Optional columns (review_url, owner_phone, daily_briefing_sms_enabled)
  // are defensive — same pattern as settings/page.tsx.
  const sb = supabaseAdmin();
  let extras: {
    review_url?: string | null;
    owner_phone?: string | null;
    daily_briefing_sms_enabled?: boolean | null;
  } | null = null;
  try {
    const { data } = await sb
      .from("tenants")
      .select("review_url, owner_phone, daily_briefing_sms_enabled")
      .eq("id", session.tenant.id)
      .maybeSingle();
    extras = (data as typeof extras) ?? null;
  } catch {
    extras = null;
  }
  const { data: full } = await sb
    .from("tenants")
    .select("legal_name, brand_primary_hex, brand_accent_hex, service_area_zips, primary_language, bilingual")
    .eq("id", session.tenant.id)
    .maybeSingle();

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
        eyebrow={`${session.tenant.display_name} · Shop profile`}
        title="Tell us about your shop"
        subtitle="Six fields — populates every quote, invoice, customer-facing email, and AI prompt. You can update any time."
      />

      <ProfileForm
        initial={{
          display_name: session.tenant.display_name,
          legal_name: (full as { legal_name?: string | null } | null)?.legal_name ?? null,
          brand_primary_hex:
            (full as { brand_primary_hex?: string | null } | null)?.brand_primary_hex ?? "#0E1628",
          brand_accent_hex:
            (full as { brand_accent_hex?: string | null } | null)?.brand_accent_hex ?? "#F4B860",
          service_area_zips:
            ((full as { service_area_zips?: string[] | null } | null)?.service_area_zips ?? []),
          primary_language:
            ((full as { primary_language?: "en" | "es" } | null)?.primary_language ?? "en"),
          bilingual:
            (full as { bilingual?: boolean } | null)?.bilingual ?? false,
          review_url: (extras as { review_url?: string | null } | null)?.review_url ?? null,
          owner_phone: (extras as { owner_phone?: string | null } | null)?.owner_phone ?? null,
          daily_briefing_sms_enabled:
            (extras as { daily_briefing_sms_enabled?: boolean | null } | null)?.daily_briefing_sms_enabled ?? false,
        }}
      />
    </div>
  );
}
