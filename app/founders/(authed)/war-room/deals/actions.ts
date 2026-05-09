"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  FOUNDER_COOKIE_NAME,
  verifyFounderSessionCookieValue,
} from "@/lib/founders/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { generateDealToken } from "@/lib/deals/token";

type CreateDealResult =
  | { ok: true; token: string; dealId: string }
  | { error: string };

type SimpleResult = { ok: true } | { error: string };

const ALLOWED_TIERS = ["starter", "growth", "enterprise"] as const;
type Tier = (typeof ALLOWED_TIERS)[number];

async function requireFounderEmail(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(FOUNDER_COOKIE_NAME)?.value;
  return verifyFounderSessionCookieValue(raw)?.email ?? null;
}

function dollarsToCents(raw: string): number | null {
  const trimmed = raw.replace(/[$,]/g, "").trim();
  if (!trimmed) return null;
  const n = Number.parseFloat(trimmed);
  if (!Number.isFinite(n) || n < 0 || n > 10_000) return null;
  return Math.round(n * 100);
}

export async function createDealAction(
  formData: FormData,
): Promise<CreateDealResult> {
  const founderEmail = await requireFounderEmail();
  if (!founderEmail) return { error: "unauthenticated" };

  const email = String(formData.get("prospect_email") ?? "").trim().toLowerCase();
  const company = String(formData.get("prospect_company") ?? "").trim();
  const phone = String(formData.get("prospect_phone") ?? "").trim() || null;
  const tier = String(formData.get("tier") ?? "").trim();
  const customPriceRaw = String(formData.get("custom_price") ?? "").trim();
  const addonBdc = formData.get("addon_bdc") === "on";
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!email || !email.includes("@")) return { error: "invalid_email" };
  if (!company) return { error: "missing_company" };
  if (!(ALLOWED_TIERS as readonly string[]).includes(tier)) {
    return { error: "invalid_tier" };
  }
  const customPriceCents = dollarsToCents(customPriceRaw);
  if (customPriceCents == null) return { error: "invalid_price" };

  const sb = supabaseAdmin();
  const token = generateDealToken();

  const { data, error } = await sb
    .from("deals")
    .insert({
      token,
      status: "draft",
      prospect_email: email,
      prospect_company: company,
      prospect_phone: phone,
      tier: tier as Tier,
      custom_price_cents: customPriceCents,
      addon_bdc: addonBdc,
      notes,
      founder_owner_email: founderEmail,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.warn("createDeal insert error", error);
    return { error: "insert_failed" };
  }

  const dealId = (data as { id: string }).id;

  try {
    await sb.from("deal_events").insert({
      deal_id: dealId,
      from_state: null,
      to_state: "draft",
      actor: "founder",
      actor_email: founderEmail,
      metadata: {
        tier,
        custom_price_cents: customPriceCents,
        addon_bdc: addonBdc,
      },
    });
  } catch {
    /* non-fatal */
  }

  revalidatePath("/founders/war-room/deals");
  return { ok: true, token, dealId };
}

/**
 * Mark a deal "sent" — fired when the founder copies the share link or
 * SMS-es it to the prospect. The status flip is just a signal; the deal
 * stays draft-creatable on /close/[token] regardless.
 */
export async function markDealSentAction(
  formData: FormData,
): Promise<SimpleResult> {
  const founderEmail = await requireFounderEmail();
  if (!founderEmail) return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "missing_id" };

  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("deals")
    .update({ status: "sent", sent_at: now })
    .eq("id", id)
    .eq("status", "draft")
    .select("id")
    .maybeSingle();
  if (error) return { error: "update_failed" };
  if (!data) return { error: "wrong_state" };

  try {
    await sb.from("deal_events").insert({
      deal_id: id,
      from_state: "draft",
      to_state: "sent",
      actor: "founder",
      actor_email: founderEmail,
      metadata: {},
    });
  } catch {
    /* non-fatal */
  }

  revalidatePath("/founders/war-room/deals");
  return { ok: true };
}

/**
 * Void a deal — take it off the board without refunding (for deals
 * that never paid). Refund flow ships in Phase 2.
 */
export async function voidDealAction(
  formData: FormData,
): Promise<SimpleResult> {
  const founderEmail = await requireFounderEmail();
  if (!founderEmail) return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "missing_id" };

  const sb = supabaseAdmin();
  const { data: existing } = await sb
    .from("deals")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { error: "not_found" };

  const prev = (existing as { status: string }).status;
  if (prev === "active" || prev === "signed" || prev === "paid") {
    return { error: "cannot_void_after_payment" };
  }

  const { error } = await sb
    .from("deals")
    .update({ status: "voided" })
    .eq("id", id);
  if (error) return { error: "update_failed" };

  try {
    await sb.from("deal_events").insert({
      deal_id: id,
      from_state: prev,
      to_state: "voided",
      actor: "founder",
      actor_email: founderEmail,
      metadata: {},
    });
  } catch {
    /* non-fatal */
  }

  revalidatePath("/founders/war-room/deals");
  return { ok: true };
}
