"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

export type UpdateProfileInput = {
  legal_name: string | null;
  owner_phone: string | null;
  brand_primary_hex: string | null;
  brand_accent_hex: string | null;
  service_area_zips: string[];
  primary_language: "en" | "es";
  bilingual: boolean;
  review_url: string | null;
  daily_briefing_sms_enabled: boolean;
};

export type UpdateProfileResult =
  | { ok: true }
  | { error: string };

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;
const ZIP_RE = /^\d{5}$/;
const URL_RE = /^https?:\/\/\S+$/i;

/**
 * Update the shop profile for the authenticated tenant. Owner-only.
 *
 * Writes to existing `tenants` columns — zero schema change. Defensive
 * around columns that may not exist yet in some envs (review_url,
 * owner_phone, daily_briefing_sms_enabled) — the settings page already
 * reads them with the same defensive try/catch pattern.
 */
export async function updateShopProfile(
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };
  if (session.role !== "owner") {
    return { error: "Only the workspace owner can edit the shop profile." };
  }

  // Sanitize.
  const legalName = (input.legal_name ?? "").trim() || null;
  const ownerPhone = (input.owner_phone ?? "").trim() || null;
  const reviewUrl = (input.review_url ?? "").trim() || null;
  if (reviewUrl && !URL_RE.test(reviewUrl)) {
    return { error: "Review URL must start with http:// or https://" };
  }

  // Brand colors — allow null (unset) or valid 6-char hex.
  const primaryHex = (input.brand_primary_hex ?? "").trim() || null;
  const accentHex = (input.brand_accent_hex ?? "").trim() || null;
  if (primaryHex && !HEX_RE.test(primaryHex)) {
    return { error: "Primary color must be a hex like #0E1628." };
  }
  if (accentHex && !HEX_RE.test(accentHex)) {
    return { error: "Accent color must be a hex like #F4B860." };
  }

  // ZIP codes — keep only valid 5-digit ZIPs, dedupe.
  const zips = Array.from(
    new Set((input.service_area_zips ?? []).map((z) => z.trim()).filter((z) => ZIP_RE.test(z))),
  );

  const language: "en" | "es" = input.primary_language === "es" ? "es" : "en";
  const bilingual = !!input.bilingual;
  const dailySms = !!input.daily_briefing_sms_enabled;

  const sb = supabaseAdmin();

  // Update the core columns that always exist.
  const { error } = await sb
    .from("tenants")
    .update({
      legal_name: legalName,
      brand_primary_hex: primaryHex,
      brand_accent_hex: accentHex,
      service_area_zips: zips,
      primary_language: language,
      bilingual,
    })
    .eq("id", session.tenant.id);
  if (error) {
    console.warn("updateShopProfile core error", error);
    return { error: "Could not save shop profile. Try again." };
  }

  // Defensive: review_url + owner_phone + daily_briefing_sms_enabled
  // may not be deployed everywhere; settings/page.tsx wraps these in
  // a try/catch for the same reason. Save them in a separate update
  // so the core save above always succeeds.
  try {
    await sb
      .from("tenants")
      .update({
        review_url: reviewUrl,
        owner_phone: ownerPhone,
        daily_briefing_sms_enabled: dailySms,
      })
      .eq("id", session.tenant.id);
  } catch {
    // optional columns missing — non-fatal
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { ok: true };
}
